import os
import threading
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import crud, models, schemas


# Local-only in-process cache so we don't re-embed on every request during demo.
# Keyed by user_id and a cheap DB signature (count + max created_at).
_CACHE_LOCK = threading.Lock()
_CACHE: Dict[str, Tuple[Tuple[int, Optional[datetime]], Any]] = {}
_CACHE_TTL: Dict[str, datetime] = {}
_CACHE_TTL_SECONDS = 10 * 60


def _truthy(value: Optional[str]) -> bool:
    return str(value or "").strip().lower() in ("1", "true", "yes", "y", "on")


def _ensure_google_api_key_from_gemini() -> None:
    # LangChain's Google GenAI integration expects GOOGLE_API_KEY.
    if os.getenv("GOOGLE_API_KEY"):
        return
    gemini = os.getenv("GEMINI_API_KEY")
    if gemini:
        os.environ["GOOGLE_API_KEY"] = gemini


def _get_signature(db: Session, *, user_id: str) -> Tuple[int, Optional[datetime]]:
    count, max_created_at = (
        db.query(func.count(models.KnowledgeChunk.id), func.max(models.KnowledgeChunk.created_at))
        .filter(models.KnowledgeChunk.user_id == user_id)
        .one()
    )
    return int(count or 0), max_created_at


def _build_langchain_documents(
    db: Session,
    *,
    user_id: str,
    doc_types: List[str],
) -> List[Any]:
    from langchain_core.documents import Document as LCDocument

    rows = crud.get_rag_knowledge_chunks_for_user(db, user_id=user_id, doc_types=doc_types)
    docs: List[LCDocument] = []
    for chunk, doc in rows:
        docs.append(
            LCDocument(
                page_content=chunk.content,
                metadata={
                    "chunk_id": chunk.id,
                    "document_id": doc.id,
                    "file_name": doc.file_name,
                    "doc_type": doc.doc_type,
                    "page_number": chunk.page_number,
                },
            )
        )
    return docs


def _get_vector_store(
    db: Session,
    *,
    user_id: str,
    doc_types: List[str],
):
    _ensure_google_api_key_from_gemini()

    signature = _get_signature(db, user_id=user_id)

    now = datetime.utcnow()
    with _CACHE_LOCK:
        cached = _CACHE.get(user_id)
        ttl = _CACHE_TTL.get(user_id)
        if cached and ttl and ttl > now and cached[0] == signature:
            return cached[1]

    docs = _build_langchain_documents(db, user_id=user_id, doc_types=doc_types)
    if not docs:
        return None

    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "LangChain Google embeddings are not available. "
                "Install langchain-google-genai and set GOOGLE_API_KEY (or GEMINI_API_KEY). "
                f"Root error: {type(e).__name__}"
            ),
        )

    try:
        from langchain_core.vectorstores import InMemoryVectorStore
    except Exception:
        # Back-compat fallback
        from langchain_community.vectorstores import InMemoryVectorStore  # type: ignore

    vector_store = InMemoryVectorStore(embeddings)
    vector_store.add_documents(docs)

    with _CACHE_LOCK:
        _CACHE[user_id] = (signature, vector_store)
        _CACHE_TTL[user_id] = datetime.utcnow() + timedelta(seconds=_CACHE_TTL_SECONDS)

    return vector_store


def _citations_from_docs(retrieved_docs, *, limit: int = 6) -> List[schemas.RagCitation]:
    citations: List[schemas.RagCitation] = []
    for doc in (retrieved_docs or [])[:limit]:
        md = getattr(doc, "metadata", {}) or {}
        snippet = (doc.page_content or "").strip().replace("\n", " ")
        if len(snippet) > 280:
            snippet = snippet[:277] + "…"
        citations.append(
            schemas.RagCitation(
                document_id=str(md.get("document_id") or ""),
                file_name=str(md.get("file_name") or ""),
                page_number=md.get("page_number"),
                chunk_id=str(md.get("chunk_id") or ""),
                snippet=snippet,
            )
        )
    return citations


def _sources_block(retrieved_docs, *, limit: int = 6) -> str:
    lines: List[str] = []
    for i, doc in enumerate((retrieved_docs or [])[:limit], start=1):
        md = getattr(doc, "metadata", {}) or {}
        label = f"S{i}"
        file_name = md.get("file_name")
        doc_type = md.get("doc_type")
        page = md.get("page_number")
        header = f"[{label}] file={file_name} type={doc_type} page={page}"
        content = (doc.page_content or "").strip()
        lines.append(f"{header}\n{content}")
    return "\n\n".join(lines)


def rag_chat_langchain(
    *,
    db: Session,
    current_user: models.User,
    request: schemas.ChatRequest,
    mode: str = "chain",
) -> schemas.RagChatResponse:
    if not _truthy(os.getenv("ENABLE_LANGCHAIN_RAG", "")):
        raise HTTPException(status_code=404, detail="LangChain RAG is disabled")

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Set GOOGLE_API_KEY (or GEMINI_API_KEY) to use LangChain RAG",
        )

    doc_types = [
        "afcfta_pdf",
        "roo_reference",
        "invoice",
        "commercial_invoice",
        "supplier_declaration",
        "direct_transport",
    ]

    vector_store = _get_vector_store(db, user_id=current_user.id, doc_types=doc_types)
    if vector_store is None:
        return schemas.RagChatResponse(
            answer=(
                "No documents indexed for chat yet. Upload your shipment documents (invoice, supplier declaration, direct transport) "
                "and/or a RoO reference PDF (doc_type=afcfta_pdf or roo_reference), then click 'Index for Chat' and ask again."
            ),
            citations=[],
        )

    question = (request.message or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="message is required")

    retrieved_docs = vector_store.similarity_search(question, k=6)
    citations = _citations_from_docs(retrieved_docs)
    sources = _sources_block(retrieved_docs)

    system_instruction = (
        "You are Zuri, an AfCFTA Rules of Origin (RoO) compliance assistant. "
        "Answer using ONLY the provided sources (user shipment documents and RoO reference PDFs). "
        "If the sources do not contain the answer, say: 'Not found in provided documents.' "
        "When asked what to do next, provide a short actionable checklist. "
        "Include source labels like [S1], [S2] where relevant."
    )

    if mode == "agent":
        # Best-effort agent mode (API varies by LangChain version).
        try:
            from langchain.tools import tool
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain.agents import create_agent

            model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")

            @tool(response_format="content_and_artifact")
            def retrieve_context(query: str):
                """Retrieve information to help answer a query."""
                docs = vector_store.similarity_search(query, k=4)
                serialized = _sources_block(docs, limit=4)
                return serialized, docs

            prompt = (
                "You have access to a tool that retrieves context from the user's uploaded trade documents. "
                "Use the tool when needed to answer questions. "
                "Cite sources as [S1], [S2] from the tool output."
            )

            agent = create_agent(model, [retrieve_context], system_prompt=prompt)
            result = agent.invoke({"messages": [{"role": "user", "content": question}]})
            answer = (result["messages"][-1].content or "").strip()

            # We already computed citations from the initial retrieval. Keep them.
            return schemas.RagChatResponse(answer=answer or "Not found in provided documents.", citations=citations)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"LangChain agent mode failed: {type(e).__name__}. Use mode=chain.",
            )

    # Default: fast 2-step RAG chain (retrieve -> single model call)
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.prompts import ChatPromptTemplate

        model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_instruction),
                (
                    "human",
                    "User question: {question}\n\nSources:\n{sources}",
                ),
            ]
        )

        chain = prompt | model | StrOutputParser()
        answer = (chain.invoke({"question": question, "sources": sources}) or "").strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LangChain model request failed: {type(e).__name__}")

    if not answer:
        answer = "Not found in provided documents."

    return schemas.RagChatResponse(answer=answer, citations=citations)
