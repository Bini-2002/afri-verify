import secrets
import traceback
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import crud, database, schemas


def main() -> None:
    email = f"debug_{secrets.token_hex(4)}@example.com"
    payload = schemas.UserCreate(email=email, full_name="Debug User", password="DemoPass123!", sector="Test")

    db = next(database.get_db())
    try:
        user = crud.create_user(db=db, user=payload)
        print("Created user:", user.id, user.email)
    except Exception:
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
