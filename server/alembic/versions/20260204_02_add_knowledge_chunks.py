"""Add knowledge chunks for RAG

Revision ID: 20260204_02
Revises: 20260204_01
Create Date: 2026-02-04

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260204_02"
down_revision = "20260204_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "document_id",
            sa.String(length=36),
            sa.ForeignKey("documents.id"),
            nullable=False,
        ),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_index("ix_knowledge_chunks_user_id", "knowledge_chunks", ["user_id"])
    op.create_index("ix_knowledge_chunks_document_id", "knowledge_chunks", ["document_id"])


def downgrade() -> None:
    op.drop_index("ix_knowledge_chunks_document_id", table_name="knowledge_chunks")
    op.drop_index("ix_knowledge_chunks_user_id", table_name="knowledge_chunks")
    op.drop_table("knowledge_chunks")
