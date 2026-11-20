from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import (
    check_login_rate_limit,
    record_login_failure,
    reset_login_attempts,
)
from app.core.security import (
    COOKIE_NAME,
    decode_session_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    # Read from cookie first, fallback to Authorization Bearer header
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi tidak ditemukan atau telah berakhir.",
        )

    payload = decode_session_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi tidak valid atau telah berakhir.",
        )

    try:
        user_id = UUID(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi tidak valid.",
        ) from None

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan.",
        )

    return user


def register_new_user(db: Session, data: UserRegister) -> User:
    normalized_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar. Silakan gunakan email lain atau masuk.",
        )

    hashed = hash_password(data.password)
    user = User(
        name=data.name.strip(),
        email=normalized_email,
        password_hash=hashed,
    )
    db.add(user)
    db.flush()

    # Log activity
    log = ActivityLog(user_id=user.id, action="REGISTER")
    db.add(log)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: UserLogin, client_ip: str) -> User:
    normalized_email = data.email.strip().lower()
    rate_key = f"{normalized_email}:{client_ip}"

    # Check in-memory rate limiter (5 failed attempts -> 429 30s)
    check_login_rate_limit(rate_key)

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        record_login_failure(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi salah.",
        )

    if not verify_password(data.password, user.password_hash):
        record_login_failure(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi salah.",
        )

    # Login success: reset rate limit attempts
    reset_login_attempts(rate_key)

    # Log activity
    log = ActivityLog(user_id=user.id, action="LOGIN")
    db.add(log)
    db.commit()
    return user
