import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from .db import engine
from . import models
from .routes import auth, quizzes, flashcards, subscription, invite, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Testly API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(quizzes.router)
app.include_router(flashcards.router)
app.include_router(subscription.router)
app.include_router(invite.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Testly API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}