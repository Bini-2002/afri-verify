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
    va_percentage: Optional[float] = None
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


class OcrExtractionFields(BaseModel):
    item_name: Optional[str] = None
    price: Optional[float] = None
    country: Optional[str] = None
    ex_works_price: Optional[float] = None
    nom_value: Optional[float] = None
    materials_cost: Optional[float] = None
    labor_cost: Optional[float] = None
    overhead_cost: Optional[float] = None


class OcrResponse(BaseModel):
    document_id: str
    extracted_text: str
    fields: OcrExtractionFields


class ProcessedDocumentResult(BaseModel):
    doc_type: str
    document_id: Optional[str] = None
    file_name: Optional[str] = None
    status: str
    ocr_provider: Optional[str] = None
    extracted_fields: Optional[dict] = None
    note: Optional[str] = None


class AssessmentProcessResponse(BaseModel):
    assessment: AssessmentResponse
    results: List[ProcessedDocumentResult] = []


class ShipmentStatusOverview(BaseModel):
    eligible_percent: float = 0.0
    pending_percent: float = 0.0
    action_required_percent: float = 0.0


class DashboardRecentActivity(BaseModel):
    assessment_id: str
    shipment_reference: str
    route: str
    protocol_used: str
    value_added_percent: float
    data_added_at: datetime
    application_status: str


class DashboardSummaryResponse(BaseModel):
    total_active_shipments: int
    pending_application_checks: int
    certified_trade_value: float
    documents_awaiting_action: int
    status_overview: ShipmentStatusOverview
    recent_activities: List[DashboardRecentActivity] = []