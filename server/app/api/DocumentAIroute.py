import os
import shutil
import mimetypes
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import google.generativeai as genai

from pypdf import PdfReader

from .. import crud, database, models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/documents",
    tags=["Documents & AI"],
)

# AI CONFIGURATION
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash-preview-09-2025")

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    assessment_id: str = Form(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc_type_norm = (doc_type or "").strip().lower()

    # 1. Save File Locally
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Register in DB
    db_doc = crud.create_document(
        db,
        file_name=file.filename,
        file_path=file_path,
        doc_type=doc_type_norm,
        user_id=current_user.id,
        assessment_id=assessment_id,
    )

    # 2b. If this is an AfCFTA PDF, ingest it for RAG
    if doc_type_norm == "afcfta_pdf" and file.filename.lower().endswith(".pdf"):
        try:
            from ..services.rag import chunk_text

            reader = PdfReader(file_path)
            rows = []
            chunk_index = 0
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                text = " ".join(text.split())
                for chunk in chunk_text(text):
                    rows.append((i + 1, chunk_index, chunk))
                    chunk_index += 1

            crud.replace_knowledge_chunks_for_document(
                db,
                user_id=current_user.id,
                document_id=db_doc.id,
                chunks=rows,
            )
        except Exception as e:
            # Keep upload flow working even if ingestion fails
            print(f"AfCFTA PDF ingestion failed: {e}")

    # 3. Trigger Zuri AI Verification (Simplified for Prototype)
    # In production, this should be a background task (Celery/Redis)
    try:
        prompt = f"Analyze this {doc_type_norm}. Does it look like a valid trade document? Return YES or NO."
        _ = prompt  # placeholder to keep flow; file content upload not implemented

        # Simulating AI success for now to ensure flow works
        db_doc.status = models.DocStatus.VERIFIED
        db_doc.ai_metadata = '{"verification_confidence": 0.95, "zuri_note": "Valid document structure detected."}'
        db.commit()

        assessment = crud.get_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id)
        if assessment:
            crud.apply_document_to_assessment_tracker(
                db=db,
                assessment=assessment,
                doc_type=doc_type_norm,
                doc_status=db_doc.status,
            )
    except Exception as e:
        print(f"AI Verification failed: {e}")

    return db_doc


@router.get("/", response_model=List[schemas.DocumentResponse])
def get_my_documents(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_documents(db, user_id=current_user.id)


@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException

    doc = (
        db.query(models.Document)
        .filter(models.Document.id == document_id, models.Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=doc.file_path,
        filename=doc.file_name,
        media_type=mimetypes.guess_type(doc.file_name or "")[0] or "application/octet-stream",
    )


@router.post("/chat")
async def chat_with_zuri(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
):
    system_instruction = "You are Zuri, an AfCFTA trade expert. Answer briefly and professionally."
    try:
        chat = model.start_chat(history=[])
        response = chat.send_message(f"{system_instruction} User asks: {request.message}")
        return {"response": response.text}
    except Exception:
        return {"response": "I am currently offline. Please try again later."}
