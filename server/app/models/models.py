from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid
import datetime
import enum

Base = declarative_base()

class DocStatus(enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class AssessmentStatus(enum.Enum):
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    ACTION_REQUIRED = "action_required"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    business_name = Column(String(255))
    sector = Column(String(255))
    registration_number = Column(String(100))
    home_country = Column(String(100))
    target_market = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessments = relationship("ComplianceAssessment", back_populates="owner")
    documents = relationship("Document", back_populates="owner")

class ComplianceAssessment(Base):
    __tablename__ = "compliance_assessments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    
    # Shipment Details
    product_name = Column(String(255), nullable=False)
    hs_code = Column(String(20), nullable=False)
    destination_country = Column(String(100), nullable=False)
    
    # Financials for Ad Valorem (RoO Manual Logic)
    ex_works_price = Column(Float, nullable=False)
    nom_value = Column(Float, nullable=False) # Non-Originating Materials
    # Optional breakdown for UI (not required for the VA formula)
    materials_cost = Column(Float, nullable=True)
    labor_cost = Column(Float, nullable=True)
    overhead_cost = Column(Float, nullable=True)
    va_percentage = Column(Float) # Calculated: ((EXW - NOM) / EXW) * 100

    # Compliance tracker (document readiness)
    docs_supplier_declaration_status = Column(Enum(DocStatus), default=DocStatus.PENDING)
    docs_invoice_status = Column(Enum(DocStatus), default=DocStatus.PENDING)
    docs_direct_transport_status = Column(Enum(DocStatus), default=DocStatus.PENDING)
    
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.ACTION_REQUIRED)
    protocol_used = Column(String(50), default="AfCFTA Annex 2")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="assessments")
    documents = relationship("Document", back_populates="assessment")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    assessment_id = Column(String(36), ForeignKey("compliance_assessments.id"), nullable=True)
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    doc_type = Column(String(100)) # e.g., "Supplier Declaration", "Invoice"
    
    status = Column(Enum(DocStatus), default=DocStatus.PENDING)
    ai_metadata = Column(Text, nullable=True) # JSON storage for Zuri's OCR/Verification results
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    assessment = relationship("ComplianceAssessment", back_populates="documents")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)

    page_number = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)