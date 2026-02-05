import os
from typing import Optional

from sqlalchemy.orm import Session

from pypdf import PdfReader

from .. import crud, models
from .rag import chunk_text


def _truthy(value: Optional[str]) -> bool:
    return str(value or "").strip().lower() in ("1", "true", "yes", "y", "on")


def ensure_global_roo_reference_index(db: Session) -> None:
    """Ensure a global (system-owned) RoO reference PDF is present and indexed.

    Goal: for demos, users only upload shipment documents (invoice/supplier_declaration/direct_transport),
    while the AfCFTA RoO reference is preloaded and always available to RAG.

    Controlled by env:
      - ENABLE_GLOBAL_ROO_REFERENCE (default true)
      - RAG_GLOBAL_USER_EMAIL (default system@afri-verify.local)
      - RAG_GLOBAL_ROO_PDF_PATH (default uploads/36437-ax-AfCFTA_RULES_OF_ORIGIN_MANUAL.pdf)
    """

    if not _truthy(os.getenv("ENABLE_GLOBAL_ROO_REFERENCE", "true")):
        return

    user_email = os.getenv("RAG_GLOBAL_USER_EMAIL", "system@afri-verify.local").strip()
    pdf_path = os.getenv(
        "RAG_GLOBAL_ROO_PDF_PATH",
        os.path.join(os.getenv("UPLOAD_DIR", "uploads"), "36437-ax-AfCFTA_RULES_OF_ORIGIN_MANUAL.pdf"),
    ).strip()

    if not user_email:
        return

    if not pdf_path or not os.path.exists(pdf_path):
        # Nothing to seed from.
        return

    system_user = crud.upsert_google_user(db, email=user_email, full_name="System RAG")

    # Reuse an existing document record if present.
    file_name = os.path.basename(pdf_path)
    doc = (
        db.query(models.Document)
        .filter(models.Document.user_id == system_user.id)
        .filter(models.Document.file_name == file_name)
        .first()
    )

    if not doc:
        doc = crud.create_document(
            db,
            file_name=file_name,
            file_path=pdf_path,
            doc_type="roo_reference",
            user_id=system_user.id,
            assessment_id=None,
        )
        doc.status = models.DocStatus.VERIFIED
        db.add(doc)
        db.commit()
        db.refresh(doc)

    # If already indexed, do nothing.
    existing = (
        db.query(models.KnowledgeChunk)
        .filter(models.KnowledgeChunk.user_id == system_user.id)
        .filter(models.KnowledgeChunk.document_id == doc.id)
        .count()
    )
    if existing > 0:
        return

    rows = []
    chunk_index = 0
    reader = PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = " ".join(text.split())
        for chunk in chunk_text(text):
            rows.append((i + 1, chunk_index, chunk))
            chunk_index += 1

    if rows:
        crud.replace_knowledge_chunks_for_document(
            db,
            user_id=system_user.id,
            document_id=doc.id,
            chunks=rows,
        )
