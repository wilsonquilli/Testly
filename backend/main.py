import os
from json import JSONDecodeError
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from .db import engine, ensure_database_schema
from . import models
from .routes import auth, quizzes, flashcards, subscription, invite, users
from .realtime import build_dashboard_snapshot
from .websocket_manager import manager
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    ensure_database_schema()
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

@app.websocket("/ws/generation/{session_id}")
async def generation_ws(ws: WebSocket, session_id: str):
    await manager.connect(ws, f"gen:{session_id}")
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws, f"gen:{session_id}")

@app.websocket("/ws/quiz/{quiz_id}")
async def quiz_ws(ws: WebSocket, quiz_id: str):
    await manager.connect(ws, f"quiz:{quiz_id}")
    try:
        async for raw in ws.iter_text():
            if raw == "ping":
                continue

            try:
                msg = json.loads(raw)
            except JSONDecodeError:
                continue

            if not isinstance(msg, dict) or "type" not in msg:
                continue

            if msg["type"] == "answer":
                await manager.broadcast(f"quiz:{quiz_id}", {
                    "type": "score_update",
                    "userId": msg["userId"],
                    "score": msg["score"],
                    "correct": msg["correct"],
                })
            elif msg["type"] == "reveal":
                await manager.broadcast(f"quiz:{quiz_id}", {
                    "type": "answer_revealed",
                    "questionId": msg["questionId"],
                    "answer": msg["answer"],
                })
    except WebSocketDisconnect:
        manager.disconnect(ws, f"quiz:{quiz_id}")

@app.websocket("/ws/dashboard/{user_id}")
async def dashboard_ws(ws: WebSocket, user_id: str):
    await manager.connect(ws, f"dash:{user_id}")
    try:
        from .db import SessionLocal

        db = SessionLocal()
        try:
            await ws.send_json(build_dashboard_snapshot(db, int(user_id)))
        finally:
            db.close()

        while True:
            await ws.receive_text()
    except ValueError:
        await ws.close(code=1008, reason="Invalid user id")
    except WebSocketDisconnect:
        manager.disconnect(ws, f"dash:{user_id}")