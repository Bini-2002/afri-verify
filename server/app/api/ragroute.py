import os
from typing import List

from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

import google.generativeai as genai

from .. import crud, database, models, schemas
from ..services.rag import bm25_rank
from .auth import get_current_user


router = APIRouter(prefix="/rag", tags=["RAG"])


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash-preview-09-2025")


@router.post("/chat", response_model=schemas.RagChatResponse)
def rag_chat(
    request: schemas.ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set on the server")

    genai.configure(api_key=api_key)

    rows = crud.get_rag_knowledge_chunks_for_user(
        db,
        user_id=current_user.id,
        doc_types=[
            "afcfta_pdf",
            "roo_reference",
            "invoice",
            "commercial_invoice",
            "supplier_declaration",
            "direct_transport",
        ],
    )
    if not rows:
        return schemas.RagChatResponse(
            answer=(
                "No documents indexed for chat yet. Upload your shipment documents (invoice, supplier declaration, direct transport) "
                "and/or a RoO reference PDF (doc_type=afcfta_pdf or roo_reference), then ask again."
            ),
            citations=[],
        )

    docs_for_rank: List[tuple[str, str]] = []
    chunk_by_id = {}
    doc_by_chunk_id = {}

    for chunk, doc in rows:
        docs_for_rank.append((chunk.id, chunk.content))
        chunk_by_id[chunk.id] = chunk
        doc_by_chunk_id[chunk.id] = doc

    ranked = bm25_rank(request.message, docs_for_rank)
    top_ids = [r.chunk_id for r in ranked[:6]]

    if not top_ids:
        return schemas.RagChatResponse(
            answer="Not found in provided AfCFTA PDFs.",
            citations=[],
        )

    sources = []
    citations: List[schemas.RagCitation] = []
    for idx, chunk_id in enumerate(top_ids, start=1):
        chunk = chunk_by_id[chunk_id]
        doc = doc_by_chunk_id[chunk_id]
        label = f"S{idx}"
        sources.append(
            f"[{label}] file={doc.file_name} type={doc.doc_type} page={chunk.page_number}\n{chunk.content}"
        )
        snippet = chunk.content
        if len(snippet) > 280:
            snippet = snippet[:277] + "…"
        citations.append(
            schemas.RagCitation(
                document_id=doc.id,
                file_name=doc.file_name,
                page_number=chunk.page_number,
                chunk_id=chunk.id,
                snippet=snippet,
            )
        )

    system_instruction = (
        "You are Zuri, an AfCFTA Rules of Origin (RoO) compliance assistant. "
        "Answer using ONLY the provided sources (user shipment documents and RoO reference PDFs). "
        "If the sources do not contain the answer, say: 'Not found in provided documents.' "
        "When asked what to do next, provide a short actionable checklist. "
        "Include source labels like [S1], [S2] where relevant."
    )

    prompt = (
        f"{system_instruction}\n\n"
        f"User question: {request.message}\n\n"
        "Sources:\n" + "\n\n".join(sources)
    )

    try:
        chat = _model.start_chat(history=[])
        resp = chat.send_message(prompt)
        answer = (resp.text or "").strip() or "Not found in provided documents."
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {type(e).__name__}")

    return schemas.RagChatResponse(answer=answer, citations=citations)
