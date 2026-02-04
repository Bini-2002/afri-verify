import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./afriverify.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def _ensure_sqlite_columns() -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return

    # SQLite has no migrations in this demo project; we auto-add new columns used by the MVP.
    with engine.begin() as conn:
        cols = conn.exec_driver_sql("PRAGMA table_info('compliance_assessments')").fetchall()
        existing = {row[1] for row in cols}  # row[1] = name

        def add_col(name: str, ddl: str) -> None:
            if name in existing:
                return
            conn.exec_driver_sql(f"ALTER TABLE compliance_assessments ADD COLUMN {ddl}")

        add_col("materials_cost", "materials_cost REAL")
        add_col("labor_cost", "labor_cost REAL")
        add_col("overhead_cost", "overhead_cost REAL")
        add_col(
            "docs_supplier_declaration_status",
            "docs_supplier_declaration_status VARCHAR(50) DEFAULT 'pending'",
        )
        add_col(
            "docs_invoice_status",
            "docs_invoice_status VARCHAR(50) DEFAULT 'pending'",
        )
        add_col(
            "docs_direct_transport_status",
            "docs_direct_transport_status VARCHAR(50) DEFAULT 'pending'",
        )


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
