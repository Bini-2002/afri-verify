# AfriVerify — 2-day Demo Runbook

## Prereqs
- Node 18+
- Python 3.11+

## Server
From `server/`:
1) Create a venv and install deps
- `python -m venv .venv`
- Activate
- `pip install -r requirements.txt`

2) Create env file
- Copy `server/.env.example` to `server/.env` and fill in `GEMINI_API_KEY` and `ENCRYPTION_KEY`

3) Run API
- `uvicorn app.main:app --reload --port 8000`

## Client
From `client/`:
- `npm install`
- `npm run dev`

## Demo flow
1) Register user (email/password)
2) Update profile (home country + target market)
3) Create assessment and verify VA result
4) Upload invoice image to link to assessment and run OCR extraction
5) Upload AfCFTA PDFs and ask Zuri questions; verify citations present
6) Compare tariffs for a sample HS code
7) Generate CoO PDF
