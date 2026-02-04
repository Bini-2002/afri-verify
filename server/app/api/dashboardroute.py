from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import database, models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary", response_model=schemas.DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    total_assessments = (
        db.query(func.count(models.ComplianceAssessment.id))
        .filter(models.ComplianceAssessment.user_id == user_id)
        .scalar()
        or 0
    )

    eligible_count = (
        db.query(func.count(models.ComplianceAssessment.id))
        .filter(models.ComplianceAssessment.user_id == user_id)
        .filter(models.ComplianceAssessment.status == models.AssessmentStatus.ELIGIBLE)
        .scalar()
        or 0
    )

    pending_count = (
        db.query(func.count(models.ComplianceAssessment.id))
        .filter(models.ComplianceAssessment.user_id == user_id)
        .filter(models.ComplianceAssessment.status == models.AssessmentStatus.ACTION_REQUIRED)
        .scalar()
        or 0
    )

    action_required_count = (
        db.query(func.count(models.ComplianceAssessment.id))
        .filter(models.ComplianceAssessment.user_id == user_id)
        .filter(models.ComplianceAssessment.status == models.AssessmentStatus.INELIGIBLE)
        .scalar()
        or 0
    )

    certified_trade_value = (
        db.query(func.coalesce(func.sum(models.ComplianceAssessment.ex_works_price), 0.0))
        .filter(models.ComplianceAssessment.user_id == user_id)
        .filter(models.ComplianceAssessment.status == models.AssessmentStatus.ELIGIBLE)
        .scalar()
        or 0.0
    )

    documents_awaiting_action = (
        db.query(func.count(models.Document.id))
        .filter(models.Document.user_id == user_id)
        .filter(models.Document.status == models.DocStatus.PENDING)
        .scalar()
        or 0
    )

    def pct(part: int, whole: int) -> float:
        if whole <= 0:
            return 0.0
        return round((part / whole) * 100.0, 1)

    status_overview = schemas.ShipmentStatusOverview(
        eligible_percent=pct(eligible_count, total_assessments),
        pending_percent=pct(pending_count, total_assessments),
        action_required_percent=pct(action_required_count, total_assessments),
    )

    recent = (
        db.query(models.ComplianceAssessment)
        .filter(models.ComplianceAssessment.user_id == user_id)
        .order_by(models.ComplianceAssessment.created_at.desc())
        .limit(6)
        .all()
    )

    home = current_user.home_country or "Origin"
    recent_activities: List[schemas.DashboardRecentActivity] = []
    for a in recent:
        recent_activities.append(
            schemas.DashboardRecentActivity(
                assessment_id=a.id,
                shipment_reference=a.id[:8],
                route=f"{home} → {a.destination_country}",
                protocol_used=a.protocol_used or "AfCFTA",
                value_added_percent=round(float(a.va_percentage or 0.0), 1),
                data_added_at=a.created_at,
                application_status=str(a.status.value if hasattr(a.status, "value") else a.status),
            )
        )

    return schemas.DashboardSummaryResponse(
        total_active_shipments=total_assessments,
        pending_application_checks=pending_count,
        certified_trade_value=float(certified_trade_value or 0.0),
        documents_awaiting_action=documents_awaiting_action,
        status_overview=status_overview,
        recent_activities=recent_activities,
    )
