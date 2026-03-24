import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..services.ai_service import generate_flashcards
from ..services.parser import extract_text_from_pdf
from ..services.usage_limiter import get_or_create_usage, check_limit
from ..schemas import FlashcardOut
router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@router.post("/generate", response_model=FlashcardOut)
async def generate_flashcards_endpoint(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = get_or_create_usage(db, current_user.id)

    if not check_limit(current_user, usage, "flashcard"):
        raise HTTPException(
            status_code=403,
            detail="Monthly flashcard limit reached (20 sets). Upgrade to premium for unlimited access.",
        )

    if file:
        suffix = ".pdf" if file.content_type == "application/pdf" else ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        source_text = extract_text_from_pdf(tmp_path)
        os.unlink(tmp_path)
        usage.files_uploaded += 1
    elif text:
        source_text = text
    else:
        raise HTTPException(status_code=422, detail="Provide either a PDF file or raw text.")

    if not source_text:
        raise HTTPException(status_code=422, detail="No text could be extracted.")

    flashcard_content = generate_flashcards(source_text, is_premium=current_user.is_premium)

    flashcard = models.Flashcard(
        user_id=current_user.id,
        content=flashcard_content,
    )
    db.add(flashcard)

    usage.flashcards_generated += 1
    db.commit()
    db.refresh(flashcard)

    return flashcard

@router.get("/history", response_model=list[FlashcardOut])
def flashcard_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Flashcard)
        .filter(models.Flashcard.user_id == current_user.id)
        .order_by(models.Flashcard.created_at.desc())
        .all()
    )