"""Add assessment tracker fields

Revision ID: 20260204_01
Revises: 
Create Date: 2026-02-04

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260204_01"
down_revision = None
branch_labels = None
depends_on = None


def _existing_columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    if bind.dialect.name != "sqlite":
        # Best-effort fallback for non-sqlite
        insp = sa.inspect(bind)
        return {c["name"] for c in insp.get_columns(table_name)}

    rows = bind.exec_driver_sql(f"PRAGMA table_info('{table_name}')").fetchall()
    # row[1] is column name
    return {row[1] for row in rows}


def upgrade() -> None:
    cols = _existing_columns("compliance_assessments")

    def add_if_missing(name: str, column: sa.Column) -> None:
        nonlocal cols
        if name in cols:
            return
        op.add_column("compliance_assessments", column)
        cols.add(name)

    add_if_missing("materials_cost", sa.Column("materials_cost", sa.Float(), nullable=True))
    add_if_missing("labor_cost", sa.Column("labor_cost", sa.Float(), nullable=True))
    add_if_missing("overhead_cost", sa.Column("overhead_cost", sa.Float(), nullable=True))

    # Store as strings for SQLite compatibility; app maps them to DocStatus enum values.
    add_if_missing(
        "docs_supplier_declaration_status",
        sa.Column(
            "docs_supplier_declaration_status",
            sa.String(length=50),
            nullable=False,
            server_default="pending",
        ),
    )
    add_if_missing(
        "docs_invoice_status",
        sa.Column(
            "docs_invoice_status",
            sa.String(length=50),
            nullable=False,
            server_default="pending",
        ),
    )
    add_if_missing(
        "docs_direct_transport_status",
        sa.Column(
            "docs_direct_transport_status",
            sa.String(length=50),
            nullable=False,
            server_default="pending",
        ),
    )


def downgrade() -> None:
    # SQLite doesn't support DROP COLUMN reliably in older versions.
    # For this demo, we intentionally no-op.
    pass
