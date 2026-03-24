from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str]
    is_premium: bool
    premium_expires: Optional[datetime]
    invites_sent: int
    created_at: datetime

    class Config:
        from_attributes = True

class UsageOut(BaseModel):
    quizzes_generated: int
    flashcards_generated: int
    files_uploaded: int
    month: str

    quiz_limit: int = 10
    flashcard_limit: int = 20
    upload_limit: int = 10

    class Config:
        from_attributes = True

class QuizOut(BaseModel):
    id: int
    title: Optional[str]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardOut(BaseModel):
    id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class InviteOut(BaseModel):
    invite_code: str


class RedeemIn(BaseModel):
    code: str

class SubscribeOut(BaseModel):
    checkout_url: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut