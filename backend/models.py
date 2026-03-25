from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)

    is_premium = Column(Boolean, default=False)
    premium_expires = Column(DateTime, nullable=True)

    invites_sent = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    usage = relationship("Usage", back_populates="user", uselist=False)
    invites = relationship("Invite", foreign_keys="Invite.inviter_id", back_populates="inviter")


class Usage(Base):
    __tablename__ = "usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    month = Column(String) 

    quizzes_generated = Column(Integer, default=0)
    flashcards_generated = Column(Integer, default=0)
    files_uploaded = Column(Integer, default=0)

    user = relationship("User", back_populates="usage")


class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, index=True)
    inviter_id = Column(Integer, ForeignKey("users.id"))
    invite_code = Column(String, unique=True, index=True, nullable=False)

    used_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inviter = relationship("User", foreign_keys=[inviter_id], back_populates="invites")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False)  
    created_at = Column(DateTime, default=datetime.utcnow)