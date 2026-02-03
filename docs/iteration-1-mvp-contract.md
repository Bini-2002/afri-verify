# AfriVerify — Iteration 1 (2-day demo) Contract

This document maps the MVP requirements to concrete database entities, API endpoints, and UI screens.

## 1) Data Model (DB)

> Implementation note: current backend uses SQLAlchemy + `Base.metadata.create_all()` (no migrations). Any schema change requires deleting `afriverify.db` for a clean demo run.

### 1.1 `users`
- `id` (uuid str)
- `full_name`
- `email` (unique)
- `hashed_password` (nullable for Google-only accounts)
- `home_country` (required for MVP personalization)
- `target_market` (required for MVP personalization)
- Optional business metadata: `business_name`, `sector`, `registration_number`
- `created_at`

### 1.2 `compliance_assessments`
- `id`, `user_id`
- Shipment: `product_name`, `hs_code`, `destination_country`
- RoO inputs (AfCFTA VA):
  - `ex_works_price`
  - `nom_value` (value of non-originating materials)
  - Optional breakdown (for UI): `materials_cost`, `labor_cost`, `overhead_cost`
- Computed:
  - `va_percentage`
  - `status` in {`eligible`,`ineligible`,`action_required`}
- Tracker:
  - `docs_supplier_declaration_status`
  - `docs_invoice_status`
  - `docs_direct_transport_status`
- `protocol_used` (default `AfCFTA Annex 2`)
- `created_at`

### 1.3 `documents`
- `id`, `user_id`, `assessment_id` (nullable)
- Metadata: `file_name`, `mime_type`, `doc_type`, `uploaded_at`, `status`
- Storage:
  - `storage_key` (path/identifier for encrypted blob)
  - `sha256` (dedupe + integrity)
- AI fields (encrypted at rest):
  - `ai_metadata_enc` (encrypted JSON)
  - `extracted_text_enc` (encrypted OCR output)

### 1.4 `knowledge_chunks` (RAG index)
Stores AfCFTA PDF chunks only.
- `id`
- `source_document_id` (FK -> `documents.id`)
- `chunk_text` (stored encrypted or plaintext; MVP prefers plaintext + encrypted DB optional)
- `embedding` (vector serialized)
- `source_ref` (page/section for citations)

### 1.5 `hs_tariffs`
- `id`
- `hs_code` (6-digit preferred)
- `country` or `market` dimension (MVP can be global)
- `mfn_duty_rate` (e.g. 0.10)
- `afcfta_duty_rate` (0.0)

## 2) API Endpoints (FastAPI)

### 2.1 Auth
- `POST /auth/register` → create user (email/password)
- `POST /auth/token` → JWT access token (password grant)
- `GET /auth/google/login` → start OAuth2 (redirect URL)
- `GET /auth/google/callback` → exchange code, upsert user, return token

**JWT claims**
- `sub`: user email
- `exp`: expiry

### 2.2 User profile
- `GET /users/me` → current user profile
- `PATCH /users/me` → update `home_country`, `target_market`, optional business fields

### 2.3 RoO / Assessments
- `POST /assessments` (or existing `POST /assessments/calculate`) → creates assessment + computes VA
- `GET /assessments` (or existing `/assessments/my-assessments`) → list my assessments
- `GET /assessments/{id}` → detail (includes tracker state)

**VA formula**

$$VA = \frac{(EXW - NOM)}{EXW} \times 100$$

MVP threshold: default `40%` (configurable).

### 2.4 Documents
- `POST /documents/upload` (multipart) → uploads encrypted blob, links to assessment, optionally triggers OCR
- `GET /documents` → list my docs
- `GET /documents/{id}/download` → streams decrypted file (auth required)

**Document types**
- `invoice`
- `supplier_declaration`
- `direct_transport`
- `afcfta_pdf` (allowed sources for RAG)

### 2.5 OCR
- `POST /documents/{id}/ocr` → runs OCR extraction (image invoices only) and stores extracted fields

Output fields (minimum): `item_name`, `price`, `country`, plus raw `extracted_text`.

### 2.6 RAG Chat (Zuri)
- `POST /rag/chat` → {message} → {answer, citations[]}

Rules:
- Retrieval context must come only from documents of type `afcfta_pdf` uploaded to the platform.
- If no relevant context found, respond with an abstention: “Not found in provided AfCFTA PDFs.”

### 2.7 Tariff comparison
- `GET /tariffs/compare?hs_code=...&origin=...&destination=...&customs_value=...` → returns MFN vs AfCFTA duties and delta.

## 3) UI Screen → API Mapping

### 3.1 Signup/Login
- Signup calls `POST /auth/register`
- Login calls `POST /auth/token`
- Google button hits `/auth/google/login` (browser redirect)

### 3.2 Settings
- Load `GET /users/me`
- Save `PATCH /users/me` (home_country, target_market)

### 3.3 RoO Calculator
- “Run official assessment” calls `POST /assessments` (or `/assessments/calculate`)
- After result, navigate to tracker view (TradeActionPage)

### 3.4 Document Repository
- List uses `GET /documents`
- Upload uses `POST /documents/upload`

### 3.5 Trade Chat
- Send calls `POST /rag/chat`
- Render citations in the response

## 4) Secrets / Environment

Server env vars:
- `SECRET_KEY` (JWT signing)
- `GEMINI_API_KEY` (LLM + embeddings/OCR)
- `UPLOAD_DIR` (encrypted blob storage directory)
- `ENCRYPTION_KEY` (base64 key for app-layer encryption)
- `DATABASE_URL` (sqlite for demo)

## 5) Demo Definition of Done

A user can:
1) Register/login
2) Set home/target countries
3) Create an assessment and get correct VA + status
4) Upload an invoice image and see extracted fields
5) Upload AfCFTA PDFs and ask Zuri questions with citations
6) View tariff comparison for a sample HS code
7) Download a generated CoO PDF (if tracker complete)
