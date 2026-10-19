"""Single-use password reset links delivered through a configured SMTP relay."""

import hashlib
import logging
import secrets
import smtplib
import ssl
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage
from urllib.parse import urlencode

from ..config import get_settings
from ..db import database
from ..security import hash_password

RESET_TTL = timedelta(minutes=30)
REQUEST_COOLDOWN = timedelta(minutes=5)
GENERIC_RESPONSE = "Nếu email có tài khoản, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."


def mail_configured() -> bool:
    settings = get_settings()
    web_url = settings.public_web_url.rstrip("/")
    if settings.app_env == "production" and not web_url.startswith("https://"):
        return False
    return bool(
        settings.smtp_host.strip()
        and settings.smtp_port > 0
        and settings.smtp_username.strip()
        and settings.smtp_password
        and settings.smtp_password.get_secret_value()
        and settings.smtp_from_email.strip()
        and web_url
    )


def prepare_reset(email: str) -> tuple[str, str, str] | None:
    """Return delivery details only for a real account that is outside cooldown."""
    now = datetime.now(UTC)
    with database() as connection:
        row = connection.execute(
            "SELECT id, email FROM users WHERE email=? AND is_seed=0",
            (email,),
        ).fetchone()
        if row is None:
            return None
        user_id = int(row["id"])
        latest = connection.execute(
            "SELECT created_at FROM password_reset_tokens WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        ).fetchone()
        if latest and now - datetime.fromisoformat(latest["created_at"]) < REQUEST_COOLDOWN:
            return None
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        connection.execute("DELETE FROM password_reset_tokens WHERE user_id=?", (user_id,))
        connection.execute(
            "INSERT INTO password_reset_tokens(token_hash,user_id,created_at,expires_at) VALUES (?,?,?,?)",
            (token_hash, user_id, now.isoformat(), (now + RESET_TTL).isoformat()),
        )
    url = f"{get_settings().public_web_url.rstrip('/')}?{urlencode({'reset_token': token})}"
    return str(row["email"]), url, token_hash


def send_reset_email(email: str, url: str, token_hash: str) -> None:
    settings = get_settings()
    message = EmailMessage()
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message["Subject"] = "Đặt lại mật khẩu PeerBridge"
    message.set_content(
        "Bạn đã yêu cầu đặt lại mật khẩu PeerBridge.\n\n"
        f"Mở liên kết này trong 30 phút: {url}\n\n"
        "Nếu không phải bạn yêu cầu, hãy bỏ qua email này."
    )
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as client:
            client.ehlo()
            client.starttls(context=ssl.create_default_context())
            client.ehlo()
            client.login(settings.smtp_username, settings.smtp_password.get_secret_value())
            client.send_message(message)
    except Exception:
        logging.getLogger(__name__).exception("Could not send password reset email")
        with database() as connection:
            connection.execute("DELETE FROM password_reset_tokens WHERE token_hash=?", (token_hash,))


def change_password(token: str, new_password: str) -> bool:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = datetime.now(UTC)
    with database() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            """SELECT r.user_id, r.expires_at FROM password_reset_tokens r
               JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND u.is_seed=0""",
            (token_hash,),
        ).fetchone()
        if row is None or datetime.fromisoformat(row["expires_at"]) <= now:
            return False
        user_id = int(row["user_id"])
        connection.execute("UPDATE users SET password_hash=? WHERE id=?", (hash_password(new_password), user_id))
        connection.execute("DELETE FROM auth_sessions WHERE user_id=?", (user_id,))
        connection.execute("DELETE FROM password_reset_tokens WHERE user_id=?", (user_id,))
    return True
