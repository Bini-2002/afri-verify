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

class AssessmentResponse(AssessmentCreate):
    id: str
    va_percentage: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

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