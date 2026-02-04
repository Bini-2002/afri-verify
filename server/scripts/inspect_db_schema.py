import os
import sqlite3


def main() -> None:
    db_path = os.getenv("DATABASE_URL", "sqlite:///./afriverify.db")
    if db_path.startswith("sqlite:///"):
        db_file = db_path.replace("sqlite:///", "", 1)
    else:
        # Fallback to project root db
        db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "afriverify.db"))

    if not os.path.isabs(db_file):
        db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_file))

    print("DB:", db_file)
    con = sqlite3.connect(db_file)
    cur = con.cursor()

    for table in ["users", "compliance_assessments", "documents", "alembic_version"]:
        try:
            cur.execute(f"PRAGMA table_info('{table}')")
            cols = [r[1] for r in cur.fetchall()]
            print(f"{table}: {cols}")
        except Exception as e:
            print(f"{table}: ERROR {e}")


if __name__ == "__main__":
    main()
