from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..services.usage_limiter import get_or_create_usage, get_limits_for_user
from ..schemas import UserOut, UsageOut

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/usage", response_model=UsageOut)
def get_usage(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = get_or_create_usage(db, current_user.id)
    limits = get_limits_for_user(current_user)

    return UsageOut(
        quizzes_generated=usage.quizzes_generated,
        flashcards_generated=usage.flashcards_generated,
        files_uploaded=usage.files_uploaded,
        month=usage.month,
        quiz_limit=limits["quiz"],
        flashcard_limit=limits["flashcard"],
        upload_limit=limits["upload"],
    )