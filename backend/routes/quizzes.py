import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..services.ai_service import generate_quiz
from ..services.parser import extract_text_from_pdf
from ..services.usage_limiter import get_or_create_usage, check_limit
from ..schemas import QuizOut
router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizOut)
async def generate_quiz_endpoint(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = get_or_create_usage(db, current_user.id)

    if not check_limit(current_user, usage, "quiz"):
        raise HTTPException(
            status_code=403,
            detail=f"Monthly quiz limit reached (10 quizzes). Upgrade to premium for unlimited access.",
        )

    suffix = ".pdf" if file.content_type == "application/pdf" else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    text = extract_text_from_pdf(tmp_path)
    os.unlink(tmp_path)

    if not text:
        raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file.")

    quiz_content = generate_quiz(text, is_premium=current_user.is_premium)

    quiz = models.Quiz(
        user_id=current_user.id,
        title=file.filename,
        content=quiz_content,
    )
    db.add(quiz)

    usage.quizzes_generated += 1
    usage.files_uploaded += 1
    db.commit()
    db.refresh(quiz)

    return quiz

@router.get("/history", response_model=list[QuizOut])
def quiz_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Quiz)
        .filter(models.Quiz.user_id == current_user.id)
        .order_by(models.Quiz.created_at.desc())
        .all()
    )