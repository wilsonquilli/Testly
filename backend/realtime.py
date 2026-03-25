from sqlalchemy.orm import Session
from . import models
from .services.usage_limiter import get_or_create_usage
from .websocket_manager import manager

def build_dashboard_snapshot(db: Session, user_id: int) -> dict:
    usage = get_or_create_usage(db, user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()

    quizzes_created = (
        db.query(models.Quiz).filter(models.Quiz.user_id == user_id).count()
    )
    flashcards_created = (
        db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).count()
    )

    return {
        "type": "snapshot",
        "quizzesCreated": quizzes_created,
        "flashcardsCreated": flashcards_created,
        "filesUploaded": usage.files_uploaded,
        "invitesSent": user.invites_sent if user else 0,
    }

async def broadcast_dashboard_snapshot(db: Session, user_id: int, event_type: str = "update"):
    payload = build_dashboard_snapshot(db, user_id)
    payload["type"] = event_type
    await manager.broadcast(f"dash:{user_id}", payload)

async def broadcast_generation_progress(session_id: str, status: str, label: str, pct: int):
    await manager.broadcast(
        f"gen:{session_id}",
        {
            "type": "progress",
            "status": status,
            "label": label,
            "pct": pct,
        },
    )