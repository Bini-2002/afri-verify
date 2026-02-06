import os
import shutil
import mimetypes
import json
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from pypdf import PdfReader

from .. import crud, database, models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/documents",
    tags=["Documents & AI"],
)

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
    # Only allow the 3 evidence doc types for end-users.
    # Normalize common invoice labels to "invoice".
    if doc_type_norm in ("commercial_invoice", "commercial invoice"):
        doc_type_norm = "invoice"

    allowed_user_types = {"supplier_declaration", "direct_transport", "invoice"}
    if doc_type_norm not in allowed_user_types:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail="Only these document types are supported: supplier_declaration, direct_transport, invoice.",
        )
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
    invoice_processed = False
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

            # Mark VERIFIED only if we extracted something meaningful AND the
            # compliance-critical fields are present (origin + total + cost breakdown).
            extracted_any = bool(extracted_text and extracted_text.strip())
            extracted_origin_and_total = bool(fields.get("country")) and (fields.get("price") is not None)
            extracted_cost_breakdown = (
                (fields.get("ex_works_price") is not None)
                and (fields.get("nom_value") is not None)
                and (float(fields.get("ex_works_price") or 0) > 0)
            )

            if extracted_any and extracted_origin_and_total and extracted_cost_breakdown:
                db_doc.status = models.DocStatus.VERIFIED
            else:
                db_doc.status = models.DocStatus.PENDING

            db.commit()
            # Always short-circuit for invoices.
            # We never want the prototype verification step to overwrite invoice status.
            invoice_processed = True

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
            # Don't block upload, but keep invoice in PENDING state and prevent the
            # prototype verification step from incorrectly marking it VERIFIED.
            print(f"Invoice OCR failed: {e}")
            db_doc.status = models.DocStatus.PENDING
            if not db_doc.ai_metadata:
                db_doc.ai_metadata = json.dumps(
                    {
                        "ocr_provider": None,
                        "extracted_text_excerpt": "",
                        "extracted_fields": {},
                        "zuri_note": "Invoice extraction failed; please upload a clearer invoice.",
                    }
                )
            db.add(db_doc)
            db.commit()
            invoice_processed = True

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

    try:
        if invoice_processed:
            return db_doc

        db_doc.status = models.DocStatus.PENDING
        if not db_doc.ai_metadata:
            db_doc.ai_metadata = '{"zuri_note": "Uploaded. Awaiting final document processing."}'
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
        print(f"Document upload post-processing failed: {e}")

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
    extracted_key_fields = bool(fields.get("country")) and (fields.get("price") is not None)
    if extracted_text and extracted_text.strip() and extracted_key_fields:
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


@router.post("/{document_id}/index")
def index_document_for_chat(
    document_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """(Re)index a document into knowledge_chunks for RAG chat."""

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

    rag_types = {
        "afcfta_pdf",
        "roo_reference",
        "invoice",
        "commercial_invoice",
        "commercial invoice",
        "supplier_declaration",
        "direct_transport",
        "bill_of_lading",
    }
    if (doc.doc_type or "").strip().lower() not in rag_types:
        raise HTTPException(status_code=400, detail="This document type is not indexed for chat")

    from ..services.rag import chunk_text
    from ..services.ocr_invoice import extract_text

    rows = []
    chunk_index = 0
    if (doc.file_name or "").lower().endswith(".pdf"):
        reader = PdfReader(doc.file_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = " ".join(text.split())
            for chunk in chunk_text(text):
                rows.append((i + 1, chunk_index, chunk))
                chunk_index += 1
    else:
        extracted_text, _provider = extract_text(doc.file_path)
        extracted_text = " ".join((extracted_text or "").split())
        for chunk in chunk_text(extracted_text):
            rows.append((None, chunk_index, chunk))
            chunk_index += 1

    crud.replace_knowledge_chunks_for_document(
        db,
        user_id=current_user.id,
        document_id=doc.id,
        chunks=rows,
    )

    return {"document_id": doc.id, "chunks_indexed": len(rows)}


@router.post("/chat")
async def chat_with_zuri(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
):
    system_instruction = "You are Zuri, an AfCFTA trade expert. Answer briefly and professionally."
    try:
        # Local-demo safe: use LangChain's Gemini integration if a key is configured.
        if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
            os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY") or ""

        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import SystemMessage, HumanMessage

        llm = ChatGoogleGenerativeAI(model=os.getenv("GEMINI_CHAT_MODEL", "gemini-2.5-flash-lite"))
        msg = llm.invoke([
            SystemMessage(content=system_instruction),
            HumanMessage(content=request.message),
        ])
        return {"response": getattr(msg, "content", str(msg))}
    except Exception:
        return {"response": "I am currently offline. Please try again later."}
