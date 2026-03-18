from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="My App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None

@app.get("/")
def root():
    return {"status": "ok", "message": "API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/auth/google/login")
def google_login():
    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",  
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return {"url": f"{GOOGLE_AUTH_URL}?{query}"}

@app.get("/auth/google/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data={
            "code":          code,
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri":  GOOGLE_REDIRECT_URI,
            "grant_type":    "authorization_code",
        })
        token_data = token_response.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data["error"])

        access_token = token_data["access_token"]

        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()

    user = User(
        id=user_data["id"],
        email=user_data["email"],
        name=user_data["name"],
        picture=user_data.get("picture"),
    )

    # TODO: save user to your DB, create a session/JWT, etc.
    return {"user": user, "access_token": access_token}


# ─── PROTECTED ROUTE EXAMPLE ────────────────────────────────────────────────
# Replace this with real JWT validation once you add auth middleware
@app.get("/me")
def get_current_user(token: str):
    # Placeholder — swap out for a proper Depends() auth guard
    return {"message": "Implement JWT verification here", "token_received": bool(token)}