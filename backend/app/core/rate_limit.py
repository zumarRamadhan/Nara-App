import time

from fastapi import HTTPException, status

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 30

# In-memory store: key -> list of failed attempt timestamps
_failed_attempts: dict[str, list[float]] = {}


def check_login_rate_limit(key: str) -> None:
    now = time.time()
    attempts = _failed_attempts.get(key, [])

    # Keep only attempts within the window
    recent_attempts = [t for t in attempts if now - t < LOCKOUT_DURATION_SECONDS]
    _failed_attempts[key] = recent_attempts

    if len(recent_attempts) >= MAX_FAILED_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi dalam 30 detik.",
        )


def record_login_failure(key: str) -> None:
    now = time.time()
    attempts = _failed_attempts.get(key, [])
    attempts = [t for t in attempts if now - t < LOCKOUT_DURATION_SECONDS]
    attempts.append(now)
    _failed_attempts[key] = attempts


def reset_login_attempts(key: str) -> None:
    _failed_attempts.pop(key, None)


def clear_all_rate_limits() -> None:
    _failed_attempts.clear()
