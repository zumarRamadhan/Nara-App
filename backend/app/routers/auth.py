from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.security import create_session_token, delete_auth_cookie, set_auth_cookie
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister, UserResponse
from app.services.auth_service import (
    authenticate_user,
    get_current_user,
    register_new_user,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    user = register_new_user(db, data)
    return user


@router.post("/login")
def login(
    data: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    user = authenticate_user(db, data, client_ip)

    # Buat JWT session token
    token = create_session_token(
        {"sub": str(user.id), "email": user.email, "name": user.name}
    )
    set_auth_cookie(response, token)

    return {
        "message": "Berhasil masuk ke akun Nara.",
        "user": UserResponse.model_validate(user),
    }


@router.post("/logout")
def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
):
    delete_auth_cookie(response)
    return {"message": "Berhasil keluar dari akun."}


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
