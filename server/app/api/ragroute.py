import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import database, models, schemas
from .auth import get_current_user


router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/chat", response_model=schemas.RagChatResponse)
def rag_chat(
    request: schemas.ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Local-demo LangChain backend. Enable it explicitly.
    if str(os.getenv("RAG_BACKEND") or "").strip().lower() != "langchain":
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="RAG endpoint is disabled (set RAG_BACKEND=langchain to enable for local demo)")

    from ..services.langchain_rag import rag_chat_langchain

    return rag_chat_langchain(
        db=db,
        current_user=current_user,
        request=request,
        mode=str(os.getenv("LANGCHAIN_RAG_MODE") or "chain"),
    )
