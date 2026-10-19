import base64
import hashlib
import hmac
import json
import os
<<<<<<< HEAD
import secrets
import time

from fastapi import Depends, HTTPException, Request, Response
=======
import time

from fastapi import Depends, HTTPException
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings
from .db import database

bearer = HTTPBearer(auto_error=False)
<<<<<<< HEAD
SESSION_COOKIE = "peerbridge_session"
SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 400
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def _jwt_secret_bytes() -> bytes:
    secret = get_settings().jwt_secret
    if secret is None or not secret.get_secret_value():
        raise HTTPException(status_code=500, detail="JWT_SECRET is not configured")
    return secret.get_secret_value().encode()


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${_b64(salt)}${_b64(digest)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        _, rounds, salt, expected = encoded.split("$", 3)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), _unb64(salt), int(rounds))
        return hmac.compare_digest(_b64(actual), expected)
    except (ValueError, TypeError):
        return False


def create_token(user_id: int) -> str:
    settings = get_settings()
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({
        "sub": str(user_id),
        "exp": int(time.time()) + settings.access_token_minutes * 60,
    }, separators=(",", ":")).encode())
    body = f"{header}.{payload}"
    signature = hmac.new(_jwt_secret_bytes(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64(signature)}"


def decode_token(token: str) -> int:
    try:
        header, payload, signature = token.split(".")
        body = f"{header}.{payload}"
        expected = hmac.new(_jwt_secret_bytes(), body.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64(signature)):
            raise ValueError("bad signature")
        data = json.loads(_unb64(payload))
        if int(data["exp"]) < int(time.time()):
            raise ValueError("expired")
        return int(data["sub"])
    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")


<<<<<<< HEAD
def _session_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    with database() as connection:
        connection.execute(
            "INSERT INTO auth_sessions(token_hash, user_id, created_at) VALUES (?, ?, ?)",
            (_session_hash(token), user_id, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
        )
    return token


def revoke_session(token: str | None) -> None:
    if token:
        with database() as connection:
            connection.execute("DELETE FROM auth_sessions WHERE token_hash = ?", (_session_hash(token),))


def session_user_id(token: str) -> int:
    with database() as connection:
        row = connection.execute(
            "SELECT user_id FROM auth_sessions WHERE token_hash = ?", (_session_hash(token),)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập không hợp lệ")
    return int(row["user_id"])


def set_session_cookie(response: Response, token: str) -> None:
    production = get_settings().app_env == "production"
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_COOKIE_MAX_AGE,
        httponly=True,
        secure=production,
        samesite="none" if production else "lax",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    production = get_settings().app_env == "production"
    response.delete_cookie(
        SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=production,
        samesite="none" if production else "lax",
    )


def current_user(
    request: Request,
    response: Response,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    session_token = request.cookies.get(SESSION_COOKIE)
    if session_token:
        user_id = session_user_id(session_token)
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            origin = request.headers.get("origin")
            if origin not in get_settings().allowed_origins:
                raise HTTPException(status_code=403, detail="Nguồn gửi yêu cầu không được phép")
        # Sliding cookie lifetime: active users remain signed in; the server session has no timeout.
        set_session_cookie(response, session_token)
    elif credentials:
        user_id = decode_token(credentials.credentials)
    else:
        raise HTTPException(status_code=401, detail="Thiếu phiên đăng nhập")
=======
def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Thiếu Bearer token")
    user_id = decode_token(credentials.credentials)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    with database() as connection:
        row = connection.execute(
            "SELECT id, email, role, is_seed, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    if not row or row["is_seed"]:
        raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
    return dict(row)

