# GitHub Copilot Instructions for Afri-Verify

## Project Overview
Afri-Verify is a full-stack application for simplifying AfCFTA Rules of Origin compliance.
It features a **FastAPI** backend with a custom RAG (Retrieval-Augmented Generation) pipeline using **Google Gemini**, and a **React 19** frontend built with **Vite** and **Tailwind CSS 4**.

## Architecture & Core Concepts

### Backend (`server/`)
- **Framework**: FastAPI + Uvicorn.
- **Database**: SQLite (`afriverify.db`) managed via SQLAlchemy ORM (`app/models`, `app/crud.py`).
- **RAG Engine** (`app/services/langchain_rag.py`):
  - Uses `GoogleGenerativeAIEmbeddings` with a custom `_BatchedEmbeddings` wrapper for reliability.
  - **Vector Store**: `InMemoryVectorStore` (re-built on demand with caching `_CACHE`).
  - **Global Knowledge**: A "System User" (`system@afri-verify.local`) holds the RoO manual chunks; RAG queries merge User docs + System docs.
  - **Fallback**: Implements a BM25 lexical search fallback if Gemini embeddings fail (504/429 errors).

### Frontend (`client/`)
- **Framework**: React 19 + React Router 7 (`client/src/App.jsx`).
- **Styling**: Tailwind CSS 4.
- **State**: Local component state (mostly); Auth handled via context/localStorage.

## Developer Workflows

### Running the Application
- **Server**: 
  ```powershell
  cd server
  . .venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --reload
  ```
  *(Or use VS Code Task: "Server: Run API (uvicorn)")*

- **Client**:
  ```bash
  cd client
  npm install
  npm run dev
  ```

### Testing & Verification
- **RAG Smoke Test** (Critical for checking Gemini/LangChain integration):
  ```powershell
  python server/scripts/smoke_rag_chat.py
  ```
- **Auth Smoke Test**:
  ```powershell
  server/scripts/smoke_auth.ps1
  ```

## Coding Conventions

### Python (Backend)
- **Environment**: heavily relies on `.env` (e.g., `GOOGLE_API_KEY`, `RAG_EMBED_BATCH_SIZE`).
- **Helpers**: Use `_truthy(val)` for boolean env vars.
- **Imports**: Absolute imports from `app.` preferred (e.g., `from app import models, crud`).
- **Error Handling**: Raise `HTTPException` with specific status codes.

### React (Frontend)
- **Components**: Functional components in `src/Components/` or `src/Pages/`.
- **Layout**: Uses `AppLayout` wrapper for Dashboard pages.

## Common Pitfalls
- **RAG Timeouts**: The in-memory vector store can timeout if `RAG_MAX_EMBED_CHUNKS` is too high. Default is 160.
- **System User**: Do not delete the "System User" or its documents; they are seeded via `services/rag_global_seed.py`.
