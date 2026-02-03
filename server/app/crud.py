from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import models, schemas


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


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
    # THE LOGIC GATE: Calculate Value Added
    # Formula: ((ExWorks - NOM) / ExWorks) * 100
    va = 0.0
    if assessment.ex_works_price > 0:
        va = ((assessment.ex_works_price - assessment.nom_value) / assessment.ex_works_price) * 100

    # Threshold check (AfCFTA default is often 40%)
    status = models.AssessmentStatus.ELIGIBLE if va >= 40 else models.AssessmentStatus.INELIGIBLE

    db_assessment = models.ComplianceAssessment(
        **assessment.dict(),
        user_id=user_id,
        va_percentage=va,
        status=status,
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


def get_user_assessments(db: Session, user_id: str):
    return db.query(models.ComplianceAssessment).filter(models.ComplianceAssessment.user_id == user_id).all()


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
