import sqlite3

<<<<<<< HEAD
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response

from ..db import database, utc_now
from ..schemas import AuthResponse, LoginRequest, PasswordResetConfirm, PasswordResetRequest, RegisterRequest
from ..security import (
    SESSION_COOKIE,
    clear_session_cookie,
    create_session,
    current_user,
    hash_password,
    revoke_session,
    set_session_cookie,
    verify_password,
)
from ..services.password_reset import (
    GENERIC_RESPONSE,
    change_password,
    mail_configured,
    prepare_reset,
    send_reset_email,
)
=======
from fastapi import APIRouter, HTTPException

from ..admin_roles import promote_if_listed
from ..db import database, utc_now
from ..schemas import LoginRequest, RegisterRequest, TokenResponse
from ..security import create_token, hash_password, verify_password
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

router = APIRouter(prefix="/auth", tags=["auth"])


<<<<<<< HEAD
@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, response: Response) -> AuthResponse:
=======
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest) -> TokenResponse:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    try:
        with database() as connection:
            cursor = connection.execute(
                "INSERT INTO users(email, password_hash, created_at) VALUES (?, ?, ?)",
                (str(payload.email).lower(), hash_password(payload.password), utc_now()),
            )
            user_id = int(cursor.lastrowid)
<<<<<<< HEAD
=======
            promote_if_listed(connection, user_id, str(payload.email))
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            connection.execute(
                """INSERT INTO profiles(
                    user_id, display_name, age, city, intent, interests, available_times, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, payload.display_name.strip(), payload.age, payload.city.strip(), payload.intent, "[]", "[]", utc_now()),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email đã được sử dụng")
<<<<<<< HEAD
    set_session_cookie(response, create_session(user_id))
    return AuthResponse(user_id=user_id)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response) -> AuthResponse:
=======
    return TokenResponse(access_token=create_token(user_id), user_id=user_id)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    with database() as connection:
        row = connection.execute(
            "SELECT id, password_hash, is_seed FROM users WHERE email = ?", (str(payload.email).lower(),)
        ).fetchone()
    if not row or row["is_seed"] or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
<<<<<<< HEAD
    set_session_cookie(response, create_session(row["id"]))
    return AuthResponse(user_id=row["id"])


@router.post("/password-reset/request", status_code=202)
def request_password_reset(payload: PasswordResetRequest, background: BackgroundTasks) -> dict[str, str]:
    if not mail_configured():
        raise HTTPException(status_code=503, detail="Chức năng đặt lại mật khẩu chưa được cấu hình email.")
    delivery = prepare_reset(payload.email)
    if delivery:
        background.add_task(send_reset_email, *delivery)
    return {"message": GENERIC_RESPONSE}


@router.post("/password-reset/confirm", status_code=204)
def confirm_password_reset(payload: PasswordResetConfirm, response: Response) -> Response:
    if not change_password(payload.token, payload.new_password):
        raise HTTPException(status_code=400, detail="Liên kết đặt lại không hợp lệ hoặc đã hết hạn.")
    clear_session_cookie(response)
    response.status_code = 204
    return response


@router.get("/session", response_model=AuthResponse)
def restore_session(user: dict = Depends(current_user)) -> AuthResponse:
    return AuthResponse(user_id=user["id"])


@router.post("/session", response_model=AuthResponse)
def upgrade_session(request: Request, response: Response, user: dict = Depends(current_user)) -> AuthResponse:
    """Exchange a legacy Bearer JWT for a persistent HttpOnly browser session."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        set_session_cookie(response, create_session(user["id"]))
    return AuthResponse(user_id=user["id"])


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response) -> Response:
    revoke_session(request.cookies.get(SESSION_COOKIE))
    clear_session_cookie(response)
    response.status_code = 204
    return response
=======
    with database() as connection:
        promote_if_listed(connection, int(row["id"]), str(payload.email))
    return TokenResponse(access_token=create_token(row["id"]), user_id=row["id"])
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

