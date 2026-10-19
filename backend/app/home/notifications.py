"""Thông báo trong app: lưu trong bảng `notifications`, hiện ở chuông và trang Tổng quan.

Các phần khác gọi `add(...)` (check-in của bạn cặp, cảm xúc, bình luận, lời nhắc, lời mời kết nối).
Lỗi khi ghi thông báo không bao giờ làm hỏng thao tác chính.
"""
from __future__ import annotations

<<<<<<< HEAD
import json
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
import logging
import sqlite3
from datetime import UTC, datetime

from ..db import database

log = logging.getLogger("home.notifications")

SCHEMA = """
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    page TEXT NOT NULL DEFAULT 'dashboard',
<<<<<<< HEAD
    target TEXT NOT NULL DEFAULT '{}',
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    created_at TEXT NOT NULL,
    read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, id DESC);
"""

<<<<<<< HEAD
KINDS = {"checkin", "reaction", "comment", "nudge", "connection_request", "connection_accepted", "plan", "plan_comment", "study_together", "study_meeting", "system"}
=======
KINDS = {"checkin", "reaction", "comment", "nudge", "connection_request", "connection_accepted", "plan", "system"}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def initialize(connection: sqlite3.Connection) -> None:
    connection.executescript(SCHEMA)
<<<<<<< HEAD
    if "target" not in {row[1] for row in connection.execute("PRAGMA table_info(notifications)")}:
        connection.execute("ALTER TABLE notifications ADD COLUMN target TEXT NOT NULL DEFAULT '{}'")
    connection.execute("UPDATE notifications SET title='Đề nghị học chung' WHERE kind='study_meeting' AND title='Lời mời học cùng'")
    connection.execute("""UPDATE notifications SET title=REPLACE(title,' muốn học chung với bạn',' đề nghị học chung với bạn')
        WHERE kind='study_together' AND title LIKE '% muốn học chung với bạn'""")
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def add(user_id: int, kind: str, title: str, body: str = "", page: str = "dashboard",
<<<<<<< HEAD
        connection: sqlite3.Connection | None = None, *, target: dict | None = None) -> bool:
    """Ghi một thông báo. Truyền `connection` khi đang trong một giao dịch sqlite khác để tránh khóa."""
    if kind not in KINDS:
        kind = "system"
    try:
        row = (int(user_id), kind, title[:160], body[:300], page[:40], now_iso(), json.dumps(target or {}, ensure_ascii=False))
        sql = "INSERT INTO notifications(user_id,kind,title,body,page,created_at,target) VALUES (?,?,?,?,?,?,?)"
=======
        connection: sqlite3.Connection | None = None) -> bool:
    """Ghi một thông báo. Truyền `connection` khi đang trong một giao dịch sqlite khác để tránh khóa."""
    if kind not in KINDS:
        kind = "system"
    row = (int(user_id), kind, title[:160], body[:300], page[:40], now_iso())
    sql = "INSERT INTO notifications(user_id,kind,title,body,page,created_at) VALUES (?,?,?,?,?,?)"
    try:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        if connection is not None:
            connection.execute(sql, row)
        else:
            with database() as db:
                db.execute(sql, row)
        return True
    except Exception:  # thông báo là phụ, không được làm hỏng luồng chính
        log.exception("Không ghi được thông báo cho %s", user_id)
        return False


def recent(user_id: int, limit: int = 20) -> list[dict]:
    with database() as db:
        rows = db.execute(
<<<<<<< HEAD
            "SELECT id,kind,title,body,page,created_at,read_at,target FROM notifications WHERE user_id=? AND NOT (kind='study_meeting' AND title='Bạn học nhắn tin') ORDER BY id DESC LIMIT ?",
            (user_id, max(1, min(limit, 50))),
        ).fetchall()
    items = []
    for row in rows:
        item = dict(row)
        try:
            item["target"] = json.loads(item["target"])
        except (TypeError, ValueError):
            item["target"] = {}
        items.append(item)
    return items
=======
            "SELECT id,kind,title,body,page,created_at,read_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT ?",
            (user_id, max(1, min(limit, 50))),
        ).fetchall()
    return [dict(r) for r in rows]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def unread_count(user_id: int) -> int:
    with database() as db:
<<<<<<< HEAD
        return db.execute("SELECT COUNT(*) FROM notifications WHERE user_id=? AND read_at IS NULL AND NOT (kind='study_meeting' AND title='Bạn học nhắn tin')", (user_id,)).fetchone()[0]
=======
        return db.execute("SELECT COUNT(*) FROM notifications WHERE user_id=? AND read_at IS NULL", (user_id,)).fetchone()[0]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def mark_read(user_id: int, ids: list[int] | None = None) -> int:
    with database() as db:
        if ids:
            marks = ",".join("?" * len(ids))
            cur = db.execute(
                f"UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL AND id IN ({marks})",
                (now_iso(), user_id, *ids),
            )
        else:
            cur = db.execute("UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL", (now_iso(), user_id))
        return cur.rowcount
