"""
auth.py – Lightweight authentication using SQLite + bcrypt + JWT.
No heavy ORM required. Works out-of-the-box with the existing requirements
plus: python-jose[cryptography]  passlib[bcrypt]
"""
import sqlite3, os, datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "oculocardia-super-secret-change-in-prod")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days

from database import get_conn, init_db

init_db()

router  = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Pydantic Models ────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    name:     str
    email:    str
    password: str

class LoginIn(BaseModel):
    email:    str
    password: str

class UserOut(BaseModel):
    id:    int
    name:  str
    email: str

class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut

# ── Helpers ────────────────────────────────────────────────────────────────
def _hash(pw: str) -> str:
    return pwd_ctx.hash(pw)

def _verify(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def _make_token(user_id: int) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

# ── Routes ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterIn):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
        if existing:
            raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
        cur = conn.execute(
            "INSERT INTO users (name, email, hashed_pw) VALUES (?, ?, ?)",
            (body.name.strip(), body.email.lower().strip(), _hash(body.password))
        )
        conn.commit()
        user_id = cur.lastrowid
    token = _make_token(user_id)
    return TokenOut(
        access_token=token,
        user=UserOut(id=user_id, name=body.name.strip(), email=body.email.lower().strip())
    )


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name, email, hashed_pw FROM users WHERE email = ?",
            (body.email.lower().strip(),)
        ).fetchone()
    if not row or not _verify(body.password, row["hashed_pw"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    token = _make_token(row["id"])
    return TokenOut(
        access_token=token,
        user=UserOut(id=row["id"], name=row["name"], email=row["email"])
    )

# ── Auth Dependency ────────────────────────────────────────────────────────
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Could not validate credentials")
        
    with get_conn() as conn:
        row = conn.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "User not found")
        return UserOut(id=row["id"], name=row["name"], email=row["email"])
