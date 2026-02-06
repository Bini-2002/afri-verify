from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, database, models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/assessments",
    tags=["RoO Calculator"],
)


@router.post("/calculate", response_model=schemas.AssessmentResponse)
def calculate_compliance(
    assessment: schemas.AssessmentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # This triggers the Logic Gate in crud.py
    return crud.create_assessment(db=db, assessment=assessment, user_id=current_user.id)


@router.get("/my-assessments", response_model=List[schemas.AssessmentResponse])
def read_assessments(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_user_assessments(db, user_id=current_user.id)


@router.get("/{assessment_id}", response_model=schemas.AssessmentResponse)
def read_assessment(
    assessment_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException

    assessment = crud.get_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.patch("/{assessment_id}/tracker", response_model=schemas.AssessmentResponse)
def update_tracker(
    assessment_id: str,
    payload: schemas.AssessmentTrackerUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException

    updated = crud.update_assessment_tracker(
        db=db,
        user_id=current_user.id,
        assessment_id=assessment_id,
        payload=payload,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return updated


@router.post("/{assessment_id}/finalize", response_model=schemas.AssessmentResponse)
def finalize_assessment(
    assessment_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException

    updated = crud.finalize_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return updated


@router.post("/{assessment_id}/process-documents", response_model=schemas.AssessmentProcessResponse)
def process_documents(
    assessment_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException

    assessment = crud.get_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    from app.services.ocr_invoice import extract_text
    from app.services.document_processing import (
        build_ai_metadata,
        verify_direct_transport_text,
        verify_invoice,
        verify_supplier_declaration_text,
    )

    results: list[schemas.ProcessedDocumentResult] = []

    # Supplier declaration
    supplier_doc = crud.get_latest_document_for_assessment(
        db=db,
        user_id=current_user.id,
        assessment_id=assessment_id,
        doc_types=["supplier_declaration", "supplier declaration"],
    )
    if supplier_doc:
        text, provider = extract_text(supplier_doc.file_path)
        status, fields, note = verify_supplier_declaration_text(text)
        supplier_doc.status = status
        supplier_doc.ai_metadata = build_ai_metadata(provider=provider, fields=fields, note=note, extracted_text=text)
        db.add(supplier_doc)
        crud.apply_document_to_assessment_tracker(db=db, assessment=assessment, doc_type="supplier_declaration", doc_status=status)
        results.append(
            schemas.ProcessedDocumentResult(
                doc_type="supplier_declaration",
                document_id=supplier_doc.id,
                file_name=supplier_doc.file_name,
                status=status.value,
                ocr_provider=provider,
                extracted_fields=fields,
                note=note,
            )
        )
    else:
        results.append(schemas.ProcessedDocumentResult(doc_type="supplier_declaration", status=models.DocStatus.PENDING.value, note="No supplier declaration uploaded."))

    # Direct transport
    transport_doc = crud.get_latest_document_for_assessment(
        db=db,
        user_id=current_user.id,
        assessment_id=assessment_id,
        doc_types=["direct_transport", "direct transport", "bill_of_lading", "bill of lading"],
    )
    if transport_doc:
        text, provider = extract_text(transport_doc.file_path)
        status, fields, note = verify_direct_transport_text(text)
        transport_doc.status = status
        transport_doc.ai_metadata = build_ai_metadata(provider=provider, fields=fields, note=note, extracted_text=text)
        db.add(transport_doc)
        crud.apply_document_to_assessment_tracker(db=db, assessment=assessment, doc_type="direct_transport", doc_status=status)
        results.append(
            schemas.ProcessedDocumentResult(
                doc_type="direct_transport",
                document_id=transport_doc.id,
                file_name=transport_doc.file_name,
                status=status.value,
                ocr_provider=provider,
                extracted_fields=fields,
                note=note,
            )
        )
    else:
        results.append(schemas.ProcessedDocumentResult(doc_type="direct_transport", status=models.DocStatus.PENDING.value, note="No direct transport evidence uploaded."))

    # Invoice
    invoice_doc = crud.get_latest_document_for_assessment(
        db=db,
        user_id=current_user.id,
        assessment_id=assessment_id,
        doc_types=["invoice", "commercial_invoice", "commercial invoice"],
    )
    if invoice_doc:
        status, fields, provider, note = verify_invoice(invoice_doc.file_path)
        # Also store a consistent excerpt
        text, _p2 = extract_text(invoice_doc.file_path)
        invoice_doc.status = status
        invoice_doc.ai_metadata = build_ai_metadata(provider=provider, fields=fields, note=note, extracted_text=text)
        db.add(invoice_doc)
        crud.apply_document_to_assessment_tracker(db=db, assessment=assessment, doc_type="invoice", doc_status=status)
        results.append(
            schemas.ProcessedDocumentResult(
                doc_type="invoice",
                document_id=invoice_doc.id,
                file_name=invoice_doc.file_name,
                status=status.value,
                ocr_provider=provider,
                extracted_fields=fields,
                note=note,
            )
        )
    else:
        results.append(schemas.ProcessedDocumentResult(doc_type="invoice", status=models.DocStatus.PENDING.value, note="No invoice uploaded."))

    db.commit()
    updated = crud.finalize_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return schemas.AssessmentProcessResponse(assessment=updated, results=results)
