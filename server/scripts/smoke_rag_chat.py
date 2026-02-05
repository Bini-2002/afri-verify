import os
import traceback
import sys
from pathlib import Path

from dotenv import load_dotenv


SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))


def main() -> int:
    load_dotenv()

    from app.database import SessionLocal
    from app import crud, schemas
    from app.services.langchain_rag import rag_chat_langchain

    db = SessionLocal()
    try:
        user = crud.get_user_by_email(db, email=os.getenv("SMOKE_EMAIL", "demo-langchain@example.com"))
        if not user:
            print("ERROR: demo user not found")
            return 2

        req = schemas.ChatRequest(
            message=os.getenv(
                "SMOKE_MESSAGE",
                "From the AfCFTA Rules of Origin reference, explain what counts as wholly obtained and give 3 agriculture examples. Cite sources.",
            )
        )
        resp = rag_chat_langchain(
            db=db,
            current_user=user,
            request=req,
            mode=str(os.getenv("LANGCHAIN_RAG_MODE") or "chain"),
        )

        print(f"answer_len={len(resp.answer or '')}")
        print(f"citations_count={len(resp.citations or [])}")
        for i, c in enumerate((resp.citations or [])[:3], start=1):
            print(f"C{i}: file={c.file_name} page={c.page_number} chunk={c.chunk_id}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as e:
        print(f"EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise
