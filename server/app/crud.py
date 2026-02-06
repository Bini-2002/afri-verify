from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException

from . import models, schemas


# NOTE: chromadb requires bcrypt>=4, but passlib 1.7.4 isn't compatible with bcrypt>=4.
# For the demo, we use PBKDF2-SHA256 to avoid bcrypt backend issues.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def upsert_google_user(db: Session, email: str, full_name: str):
    user = get_user_by_email(db, email=email)
    if user:
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    user = models.User(
        email=email,
        full_name=full_name or "Google User",
        hashed_password=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        business_name=user.business_name,
        sector=user.sector,
        home_country=user.home_country,
        target_market=user.target_market,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_profile(db: Session, user_id: str, payload: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_assessment(db: Session, assessment: schemas.AssessmentCreate, user_id: str):
    # RoO Engine (AfCFTA VA): VA = ((EXW - NOM) / EXW) * 100
    if assessment.ex_works_price <= 0:
        raise HTTPException(status_code=400, detail="ex_works_price must be > 0")
    if assessment.nom_value < 0:
        raise HTTPException(status_code=400, detail="nom_value must be >= 0")

    va = ((assessment.ex_works_price - assessment.nom_value) / assessment.ex_works_price) * 100
    va = max(0.0, min(100.0, va))

    # Status logic: ineligible if VA < 40; otherwise action_required until required docs verified.
    status = models.AssessmentStatus.INELIGIBLE if va < 40 else models.AssessmentStatus.ACTION_REQUIRED

    db_assessment = models.ComplianceAssessment(
        **assessment.model_dump(),
        user_id=user_id,
        va_percentage=va,
        status=status,
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


def get_user_assessments(db: Session, user_id: str):
    return (
        db.query(models.ComplianceAssessment)
        .filter(models.ComplianceAssessment.user_id == user_id)
        .order_by(models.ComplianceAssessment.created_at.desc())
        .all()
    )


def get_assessment(db: Session, user_id: str, assessment_id: str):
    return (
        db.query(models.ComplianceAssessment)
        .filter(
            models.ComplianceAssessment.user_id == user_id,
            models.ComplianceAssessment.id == assessment_id,
        )
        .first()
    )


def _recompute_assessment_status(assessment: models.ComplianceAssessment) -> None:
    # Keep VA-based ineligible as terminal in MVP.
    if (assessment.va_percentage or 0.0) < 40:
        assessment.status = models.AssessmentStatus.INELIGIBLE
        return

    required = [
        assessment.docs_supplier_declaration_status,
        assessment.docs_invoice_status,
        assessment.docs_direct_transport_status,
    ]
    if all(s == models.DocStatus.VERIFIED for s in required):
        assessment.status = models.AssessmentStatus.ELIGIBLE
    else:
        assessment.status = models.AssessmentStatus.ACTION_REQUIRED


def update_assessment_tracker(
    db: Session,
    user_id: str,
    assessment_id: str,
    payload: schemas.AssessmentTrackerUpdate,
):
    assessment = get_assessment(db=db, user_id=user_id, assessment_id=assessment_id)
    if not assessment:
        return None

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if value is None:
            continue
        normalized = str(value).lower().strip()
        if normalized not in ("pending", "verified", "rejected"):
            raise HTTPException(status_code=400, detail=f"Invalid status for {field}")
        setattr(assessment, field, models.DocStatus(normalized))

    _recompute_assessment_status(assessment)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def apply_document_to_assessment_tracker(
    db: Session,
    assessment: models.ComplianceAssessment,
    doc_type: str,
    doc_status: models.DocStatus,
):
    key = (doc_type or "").strip().lower().replace("-", "_")
    mapping = {
        "supplier_declaration": "docs_supplier_declaration_status",
        "supplier declaration": "docs_supplier_declaration_status",
        "invoice": "docs_invoice_status",
        "commercial_invoice": "docs_invoice_status",
        "commercial invoice": "docs_invoice_status",
        "direct_transport": "docs_direct_transport_status",
        "direct transport": "docs_direct_transport_status",
        "bill_of_lading": "docs_direct_transport_status",
        "bill of lading": "docs_direct_transport_status",
    }
    field = mapping.get(key)
    if not field:
        return

    setattr(assessment, field, doc_status)
    _recompute_assessment_status(assessment)
    db.add(assessment)
    db.commit()


def finalize_assessment(db: Session, *, user_id: str, assessment_id: str):
    assessment = get_assessment(db=db, user_id=user_id, assessment_id=assessment_id)
    if not assessment:
        return None

    _recompute_assessment_status(assessment)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def create_document(
    db: Session,
    file_name: str,
    file_path: str,
    doc_type: str,
    user_id: str,
    assessment_id: str,
):
    db_doc = models.Document(
        file_name=file_name,
        file_path=file_path,
        doc_type=doc_type,
        user_id=user_id,
        assessment_id=assessment_id,
        status=models.DocStatus.PENDING,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def get_documents(db: Session, user_id: str):
    return db.query(models.Document).filter(models.Document.user_id == user_id).all()


def replace_knowledge_chunks_for_document(
    db: Session,
    *,
    user_id: str,
    document_id: str,
    chunks,
):
    db.query(models.KnowledgeChunk).filter(
        models.KnowledgeChunk.user_id == user_id,
        models.KnowledgeChunk.document_id == document_id,
    ).delete(synchronize_session=False)

    for page_number, chunk_index, content in chunks:
        db.add(
            models.KnowledgeChunk(
                user_id=user_id,
                document_id=document_id,
                page_number=page_number,
                chunk_index=chunk_index,
                content=content,
            )
        )
    db.commit()


def get_afcfta_knowledge_chunks_for_user(db: Session, *, user_id: str):
    from sqlalchemy import func

    return (
        db.query(models.KnowledgeChunk, models.Document)
        .join(models.Document, models.Document.id == models.KnowledgeChunk.document_id)
        .filter(models.KnowledgeChunk.user_id == user_id)
        .filter(models.Document.user_id == user_id)
        .filter(func.lower(models.Document.doc_type) == "afcfta_pdf")
        .all()
    )


def get_rag_knowledge_chunks_for_user(db: Session, *, user_id: str, doc_types):
    from sqlalchemy import func

    normalized = [str(t).lower().strip() for t in (doc_types or []) if str(t).strip()]
    if not normalized:
        return []

    return (
        db.query(models.KnowledgeChunk, models.Document)
        .join(models.Document, models.Document.id == models.KnowledgeChunk.document_id)
        .filter(models.KnowledgeChunk.user_id == user_id)
        .filter(models.Document.user_id == user_id)
        .filter(func.lower(models.Document.doc_type).in_(normalized))
        .all()
    )


def get_rag_knowledge_chunks_for_users(db: Session, *, user_ids, doc_types):
    """Fetch (KnowledgeChunk, Document) rows for multiple owners.

    Useful for combining a user's uploaded docs with a global/system knowledge base.
    """

    from sqlalchemy import func

    ids = [str(u).strip() for u in (user_ids or []) if str(u).strip()]
    normalized = [str(t).lower().strip() for t in (doc_types or []) if str(t).strip()]
    if not ids or not normalized:
        return []

    return (
        db.query(models.KnowledgeChunk, models.Document)
        .join(models.Document, models.Document.id == models.KnowledgeChunk.document_id)
        .filter(models.KnowledgeChunk.user_id.in_(ids))
        .filter(models.Document.user_id == models.KnowledgeChunk.user_id)
        .filter(func.lower(models.Document.doc_type).in_(normalized))
        .order_by(
            models.Document.file_name.asc(),
            models.KnowledgeChunk.page_number.asc().nullsfirst(),
            models.KnowledgeChunk.chunk_index.asc(),
        )
        .all()
    )
