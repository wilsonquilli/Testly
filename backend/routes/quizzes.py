import os
import tempfile
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..realtime import broadcast_dashboard_snapshot, broadcast_generation_progress
from ..services.ai_service import AIServiceError, AIServiceUnavailableError, generate_quiz
from ..services.parser import extract_text_from_file
from ..services.usage_limiter import get_or_create_usage, check_limit
from ..schemas import QuizOut
router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizOut)
async def generate_quiz_endpoint(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = get_or_create_usage(db, current_user.id)

    if not check_limit(current_user, usage, "quiz"):
        raise HTTPException(
            status_code=403,
            detail=f"Monthly quiz limit reached (10 quizzes). Upgrade to premium for unlimited access.",
        )

    if file:
        original_name = file.filename or "upload"
        _, extension = os.path.splitext(original_name)
        suffix = extension.lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        if session_id:
            await broadcast_generation_progress(session_id, "reading", "Reading your document...", 15)

        try:
            source_text = extract_text_from_file(tmp_path, filename=original_name, content_type=file.content_type)
        except ValueError as exc:
            os.unlink(tmp_path)
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        os.unlink(tmp_path)
    elif text:
        if session_id:
            await broadcast_generation_progress(session_id, "reading", "Reading your notes...", 15)
        source_text = text
    else:
        raise HTTPException(status_code=422, detail="Provide either a PDF/DOCX file or raw text.")

    if not source_text:
        raise HTTPException(status_code=422, detail="Could not extract text from the provided source.")

    if session_id:
        await broadcast_generation_progress(session_id, "analyzing", "Analyzing key concepts...", 45)

    try:
        quiz_content = generate_quiz(source_text, is_premium=current_user.is_premium)
    except AIServiceUnavailableError as exc:
        if session_id:
            await broadcast_generation_progress(session_id, "error", str(exc), 100)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIServiceError as exc:
        if session_id:
            await broadcast_generation_progress(session_id, "error", str(exc), 100)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if session_id:
        await broadcast_generation_progress(session_id, "generating", "Saving your quiz...", 80)

    quiz = models.Quiz(
        user_id=current_user.id,
        title=file.filename if file else "Pasted Notes",
        content=quiz_content,
    )
    db.add(quiz)

    usage.quizzes_generated += 1
    if file:
        usage.files_uploaded += 1
    db.commit()
    db.refresh(quiz)

    await broadcast_dashboard_snapshot(db, current_user.id)

    if session_id:
        await broadcast_generation_progress(session_id, "done", "Your quiz is ready!", 100)

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