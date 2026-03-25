from datetime import datetime
from sqlalchemy.orm import Session
from .. import models

FREE_LIMITS = {
    "quiz": 10,
    "flashcard": 20,
    "upload": 10,
}

PREMIUM_LIMITS = {
    "quiz": 999999,
    "flashcard": 999999,
    "upload": 999999,
}

def get_or_create_usage(db: Session, user_id: int) -> models.Usage:
    """Return the current month's usage row, creating it if needed."""
    current_month = datetime.utcnow().strftime("%Y-%m")
    usage = db.query(models.Usage).filter(models.Usage.user_id == user_id).first()

    if not usage:
        usage = models.Usage(user_id=user_id, month=current_month)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return usage

    if usage.month != current_month:
        usage.month = current_month
        usage.quizzes_generated = 0
        usage.flashcards_generated = 0
        usage.files_uploaded = 0
        db.commit()
        db.refresh(usage)

    return usage

def check_limit(user: models.User, usage: models.Usage, feature: str) -> bool:
    """Return True if the user is allowed to perform the action."""
    if user.is_premium and (
        user.premium_expires is None or user.premium_expires > datetime.utcnow()
    ):
        return True

    limits = FREE_LIMITS
    if feature == "quiz":
        return usage.quizzes_generated < limits["quiz"]
    elif feature == "flashcard":
        return usage.flashcards_generated < limits["flashcard"]
    elif feature == "upload":
        return usage.files_uploaded < limits["upload"]

    return False

def get_limits_for_user(user: models.User) -> dict:
    is_active_premium = user.is_premium and (
        user.premium_expires is None or user.premium_expires > datetime.utcnow()
    )
    return PREMIUM_LIMITS if is_active_premium else FREE_LIMITS