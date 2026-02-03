from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, database, models, schemas
from .auth import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.update_user_profile(db=db, user_id=current_user.id, payload=payload)
