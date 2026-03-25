import os
import httpx
from urllib.parse import urlencode
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from fastapi import Depends
from ..db import get_db
from ..auth import authenticate_user, create_jwt, create_user_with_password, get_or_create_user
from ..schemas import LoginIn, RegisterIn, TokenOut
router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

def build_frontend_redirect(path: str = "/", access_token: str | None = None, error: str | None = None):
    target_path = path if path.startswith("/") else "/"
    query = {}
    if access_token:
        query["access_token"] = access_token
    if error:
        query["auth_error"] = error

    base = f"{FRONTEND_URL.rstrip('/')}{target_path}"
    if not query:
        return base
    return f"{base}?{urlencode(query)}"

@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    user = create_user_with_password(
        db=db,
        email=payload.email,
        password=payload.password,
        name=payload.name,
    )
    return TokenOut(access_token=create_jwt(user), user=user)

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    return TokenOut(access_token=create_jwt(user), user=user)

@router.get("/google/login")
def google_login(redirect_to: str = Query(default="/")):
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": redirect_to,
    }
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")

@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str = "/",
    db: Session = Depends(get_db),
):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_resp.json()

        if "error" in token_data:
            return RedirectResponse(url=build_frontend_redirect(state, error=token_data["error"]))

        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        info = user_resp.json()

    user = get_or_create_user(
        db=db,
        email=info["email"],
        name=info["name"],
        picture=info.get("picture"),
        provider="google",
    )
    return RedirectResponse(url=build_frontend_redirect(state, access_token=create_jwt(user)))