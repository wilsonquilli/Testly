from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
import os
from pathlib import Path
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlparse, urlunparse
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env", override=True)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./testly.db")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
DATABASE_READY = True
DATABASE_ERROR_MESSAGE = ""

Base = declarative_base()

def _build_url(parsed, username=None, password=None, host=None, port=None, query=None):
    netloc = ""

    if username is not None:
        netloc += quote(username, safe="")
        if password is not None:
            netloc += f":{quote(password, safe='')}"
        netloc += "@"

    if host:
        netloc += host

    if port:
        netloc += f":{port}"

    return urlunparse(
        (
            parsed.scheme,
            netloc,
            parsed.path,
            parsed.params,
            urlencode(query or [], doseq=True),
            parsed.fragment,
        )
    )

def _get_supabase_project_ref(parsed=None):
    if parsed and parsed.username and "." in parsed.username:
        _, project_ref = parsed.username.split(".", 1)
        if project_ref:
            return project_ref

    supabase_host = urlparse(SUPABASE_URL).hostname or ""
    if supabase_host.endswith(".supabase.co"):
        return supabase_host.split(".", 1)[0]

    return None

def normalize_database_url(database_url: str) -> str:
    parsed = urlparse(database_url)

    if parsed.scheme == "postgres":
        parsed = parsed._replace(scheme="postgresql")

    host = parsed.hostname or ""
    query = parse_qsl(parsed.query, keep_blank_values=True)
    query_dict = dict(query)

    if host.endswith(".supabase.com") or host.endswith(".supabase.co"):
        query_dict.setdefault("sslmode", "require")

    username = unquote(parsed.username) if parsed.username else None
    password = unquote(parsed.password) if parsed.password else None

    if host.endswith(".pooler.supabase.com") and username and "." not in username:
        project_ref = _get_supabase_project_ref(parsed)
        if project_ref:
            username = f"{username}.{project_ref}"

    return _build_url(
        parsed,
        username=username,
        password=password,
        host=parsed.hostname,
        port=parsed.port,
        query=list(query_dict.items()),
    )


def _create_engine(database_url: str):
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    return create_engine(
        database_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )

DATABASE_URL = normalize_database_url(DATABASE_URL)
engine = _create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def rebind_engine(database_url: str):
    global DATABASE_URL, engine
    DATABASE_URL = normalize_database_url(database_url)
    engine.dispose()
    engine = _create_engine(DATABASE_URL)
    SessionLocal.configure(bind=engine)
    return engine

def set_database_status(ready: bool, message: str = ""):
    global DATABASE_READY, DATABASE_ERROR_MESSAGE
    DATABASE_READY = ready
    DATABASE_ERROR_MESSAGE = message

def get_database_status():
    parsed = urlparse(DATABASE_URL)
    return {
        "ready": DATABASE_READY,
        "message": DATABASE_ERROR_MESSAGE,
        "dialect": parsed.scheme,
        "host": parsed.hostname,
        "port": parsed.port,
        "database": parsed.path.lstrip("/") or None,
        "username": parsed.username,
    }

def ensure_database_schema():
    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "password_hash" in columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))

def get_db():
    if not DATABASE_READY:
        raise HTTPException(
            status_code=503,
            detail=DATABASE_ERROR_MESSAGE or "Database is currently unavailable",
        )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()