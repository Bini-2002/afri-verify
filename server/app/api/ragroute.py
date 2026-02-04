import os
from typing import List

from fastapi import APIRouter, Depends
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
    rows = crud.get_afcfta_knowledge_chunks_for_user(db, user_id=current_user.id)
    if not rows:
        return schemas.RagChatResponse(
            answer="No AfCFTA PDFs indexed yet. Upload an 'AfCFTA PDF (RAG)' document first.",
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
            f"[{label}] file={doc.file_name} page={chunk.page_number}\n{chunk.content}"
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
        "You are Zuri, an AfCFTA trade expert. "
        "Answer using ONLY the provided sources. "
        "If the sources do not contain the answer, say: 'Not found in provided AfCFTA PDFs.' "
        "Keep the answer brief and include source labels like [S1], [S2] where relevant."
    )

    prompt = (
        f"{system_instruction}\n\n"
        f"User question: {request.message}\n\n"
        "Sources:\n" + "\n\n".join(sources)
    )

    try:
        chat = _model.start_chat(history=[])
        resp = chat.send_message(prompt)
        answer = (resp.text or "").strip() or "Not found in provided AfCFTA PDFs."
    except Exception:
        answer = "I am currently offline. Please try again later."

    return schemas.RagChatResponse(answer=answer, citations=citations)
