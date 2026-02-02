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
