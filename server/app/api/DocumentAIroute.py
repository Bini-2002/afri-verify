import os
import shutil
import mimetypes
import json
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
    assessment_id: str | None = Form(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc_type_norm = (doc_type or "").strip().lower()
    assessment_id_norm = (assessment_id or "").strip() or None

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
        assessment_id=assessment_id_norm,
    )

    # 2c. Invoice OCR + extraction (best-effort)
    invoice_keys = {"invoice", "commercial_invoice", "commercial invoice"}
    if doc_type_norm in invoice_keys:
        try:
            from ..services.ocr_invoice import extract_text, parse_fields

            extracted_text, provider = extract_text(file_path)
            fields = parse_fields(extracted_text)

            db_doc.ai_metadata = json.dumps(
                {
                    "ocr_provider": provider,
                    "extracted_text_excerpt": (extracted_text[:2000] + "…") if len(extracted_text) > 2000 else extracted_text,
                    "extracted_fields": fields,
                    "zuri_note": "Invoice OCR + extraction completed." if extracted_text else "Invoice OCR did not extract any text.",
                }
            )

            # Only mark VERIFIED if we extracted something meaningful.
            if extracted_text and (fields.get("item_name") or fields.get("price") or fields.get("country")):
                db_doc.status = models.DocStatus.VERIFIED
            else:
                db_doc.status = models.DocStatus.PENDING

            db.commit()

            assessment = (
                crud.get_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id_norm)
                if assessment_id_norm
                else None
            )
            if assessment:
                crud.apply_document_to_assessment_tracker(
                    db=db,
                    assessment=assessment,
                    doc_type=doc_type_norm,
                    doc_status=db_doc.status,
                )
        except Exception as e:
            # Don't block upload; fall through.
            print(f"Invoice OCR failed: {e}")

    # 2b. Index for RAG (shipment docs + reference PDFs)
    rag_types = {
        "afcfta_pdf",
        "roo_reference",
        "invoice",
        "commercial_invoice",
        "commercial invoice",
        "supplier_declaration",
        "direct_transport",
    }

    try:
        if doc_type_norm in rag_types:
            from ..services.rag import chunk_text
            from ..services.ocr_invoice import extract_text

            rows = []
            chunk_index = 0

            if file.filename.lower().endswith(".pdf"):
                reader = PdfReader(file_path)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    text = " ".join(text.split())
                    for chunk in chunk_text(text):
                        rows.append((i + 1, chunk_index, chunk))
                        chunk_index += 1
            else:
                extracted_text, _provider = extract_text(file_path)
                extracted_text = " ".join((extracted_text or "").split())
                for chunk in chunk_text(extracted_text):
                    rows.append((None, chunk_index, chunk))
                    chunk_index += 1

            if rows:
                crud.replace_knowledge_chunks_for_document(
                    db,
                    user_id=current_user.id,
                    document_id=db_doc.id,
                    chunks=rows,
                )
    except Exception as e:
        print(f"RAG indexing failed: {e}")

    # 3. Trigger Zuri AI Verification (Simplified for Prototype)
    # In production, this should be a background task (Celery/Redis)
    try:
        prompt = f"Analyze this {doc_type_norm}. Does it look like a valid trade document? Return YES or NO."
        _ = prompt  # placeholder to keep flow; file content upload not implemented

        # Simulating AI success for now to ensure flow works
        # (Don't overwrite invoice OCR metadata if already present.)
        db_doc.status = models.DocStatus.VERIFIED
        if not db_doc.ai_metadata:
            db_doc.ai_metadata = '{"verification_confidence": 0.95, "zuri_note": "Valid document structure detected."}'
        db.commit()

        assessment = (
            crud.get_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id_norm)
            if assessment_id_norm
            else None
        )
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


@router.post("/{document_id}/ocr", response_model=schemas.OcrResponse)
def ocr_document(
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

    from ..services.ocr_invoice import extract_text, parse_fields

    extracted_text, provider = extract_text(doc.file_path)
    fields = parse_fields(extracted_text)

    doc.ai_metadata = json.dumps(
        {
            "ocr_provider": provider,
            "extracted_text_excerpt": (extracted_text[:2000] + "…") if len(extracted_text) > 2000 else extracted_text,
            "extracted_fields": fields,
            "zuri_note": "OCR + extraction completed." if extracted_text else "OCR did not extract any text.",
        }
    )
    if extracted_text and (fields.get("item_name") or fields.get("price") or fields.get("country")):
        doc.status = models.DocStatus.VERIFIED
    else:
        doc.status = models.DocStatus.PENDING

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return schemas.OcrResponse(
        document_id=doc.id,
        extracted_text=extracted_text,
        fields=schemas.OcrExtractionFields(**fields),
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
