from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime

# --- USER ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    business_name: Optional[str] = None
    sector: Optional[str] = None
    home_country: Optional[str] = None
    target_market: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    sector: Optional[str] = None
    registration_number: Optional[str] = None
    home_country: Optional[str] = None
    target_market: Optional[str] = None

# --- TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- ASSESSMENT ---
class AssessmentCreate(BaseModel):
    product_name: str
    hs_code: str
    destination_country: str
    ex_works_price: float
    nom_value: float
    materials_cost: Optional[float] = None
    labor_cost: Optional[float] = None
    overhead_cost: Optional[float] = None

class AssessmentResponse(AssessmentCreate):
    id: str
    va_percentage: float
    status: str
    docs_supplier_declaration_status: str
    docs_invoice_status: str
    docs_direct_transport_status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class AssessmentTrackerUpdate(BaseModel):
    docs_supplier_declaration_status: Optional[str] = None
    docs_invoice_status: Optional[str] = None
    docs_direct_transport_status: Optional[str] = None

# --- DOCUMENT ---
class DocumentResponse(BaseModel):
    id: str
    file_name: str
    file_path: str
    doc_type: str
    status: str
    uploaded_at: datetime
    assessment_id: Optional[str] = None
    ai_metadata: Optional[str] = None
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class ChatRequest(BaseModel):
    message: str


class RagCitation(BaseModel):
    document_id: str
    file_name: str
    page_number: Optional[int] = None
    chunk_id: str
    snippet: str


class RagChatResponse(BaseModel):
    answer: str
    citations: List[RagCitation] = []