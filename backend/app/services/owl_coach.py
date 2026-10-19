"""Cú Bridge: short, private coaching grounded in the user's current plan."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from ..agents.plan_coach.contract import ItemStatus
from ..db import database, utc_now
from ..repositories.plans import PlanRepository

SESSION_ID = "cu-bridge-personal"
LOCAL_ZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def _context(user_id: int) -> dict:
    today = datetime.now(LOCAL_ZONE).date()
    with database() as connection:
        row = connection.execute(
            "SELECT * FROM pb_plans WHERE user_id=? AND status='ACTIVE' ORDER BY created_at DESC, id DESC LIMIT 1",
            (user_id,),
        ).fetchone()
        if row is None:
            return {"has_plan": False, "has_connection": bool(connection.execute(
                "SELECT 1 FROM peer_matches WHERE user_a_id=? OR user_b_id=? LIMIT 1", (user_id, user_id)
            ).fetchone())}
        plan = PlanRepository(connection).hydrated(dict(row))
        items = plan.items + plan.deferred_items
        done = sum(item.status == ItemStatus.COMPLETED for item in items)
        scheduled = [item for item in items if item.status == ItemStatus.SCHEDULED]

        def day(item):
            if item.scheduled_start:
                return item.scheduled_start.astimezone(LOCAL_ZONE).date()
            return item.planned_date

        today_items = [item for item in items if day(item) == today]
        pending_today = [item for item in today_items if item.status != ItemStatus.COMPLETED]
        overdue = [item for item in scheduled if day(item) and day(item) < today]
        next_item = sorted(scheduled, key=lambda item: (day(item) is None, day(item) or today, item.session_index))[0] if scheduled else None
        checked_in = connection.execute(
            "SELECT 1 FROM vi_checkins WHERE user_id=? AND study_day=? AND status='done' LIMIT 1",
            (user_id, today.isoformat()),
        ).fetchone() is not None
        return {
            "has_plan": True,
            "total": len(items),
            "done": done,
            "today_total": len(today_items),
            "today_done": len(today_items) - len(pending_today),
            "overdue": len(overdue),
            "checked_in_today": checked_in,
            "next_action": next_item.action if next_item else None,
            "today_action": pending_today[0].action if pending_today else None,
        }


def _greeting(context: dict) -> str:
    if not context["has_plan"]:
        return ("Chào bạn, mình là Cú Bridge. Hãy kết nối với một bạn học rồi tạo kế hoạch; "
                "mình sẽ giúp bạn theo dõi tiến độ và chọn việc vừa sức.") if not context["has_connection"] else (
                "Chào bạn, mình là Cú Bridge. Bạn đã có bạn học rồi. Hãy tạo kế hoạch để mình gợi ý việc tiếp theo và theo dõi tiến độ nhé.")
    action = context["today_action"] or context["next_action"]
    if action:
        return f"Chào bạn, mình là Cú Bridge. Việc tiếp theo trong kế hoạch là “{action}”. Bạn muốn xem tiến độ hay chia việc này thành bước nhỏ?"
    return "Chào bạn, mình là Cú Bridge. Kế hoạch hiện không có việc chờ làm. Bạn có thể xem lại kế hoạch hoặc kể mình nghe bạn muốn học gì tiếp."


def _reply(message: str, context: dict) -> str:
    if not context["has_plan"]:
        return _greeting(context)
    text = message.casefold()
    action = context["today_action"] or context["next_action"]
    if any(word in text for word in ("mệt", "quá tải", "bận", "áp lực", "không kịp", "lo lắng")):
        if action:
            return f"Nghe như hôm nay bạn cần nhẹ nhịp hơn. Với “{action}”, thử làm 10 phút phần dễ bắt đầu nhất rồi nghỉ một chút. Nếu vẫn quá sức, bạn có thể đề nghị đổi lịch trong Kế hoạch; mình sẽ không tự đổi giúp bạn."
        return "Nghe như hôm nay bạn cần nghỉ một chút. Khi sẵn sàng, hãy mở Kế hoạch để chọn một việc nhỏ vừa sức; mình sẽ không tự đổi lịch của bạn."
    if any(word in text for word in ("tiến độ", "đã làm", "hoàn thành", "hôm nay", "theo plan")):
        status = f"Bạn đã hoàn thành {context['done']}/{context['total']} việc trong kế hoạch; hôm nay {context['today_done']}/{context['today_total']} việc."
        if context["overdue"]:
            status += f" Có {context['overdue']} việc chưa hoàn thành từ trước."
        status += " Hôm nay đã check-in." if context["checked_in_today"] else " Nếu đã học, bạn có thể check-in để ghi nhận tiến độ."
        return f"{status} Việc tiếp theo: “{action}”." if action else status
    if any(word in text for word in ("vướng", "bí", "khó", "bắt đầu", "bước nhỏ", "gợi ý")):
        if action:
            return f"Với “{action}”, thử dành 10 phút đọc lại yêu cầu và viết ra một câu hỏi cụ thể. Sau đó làm một ví dụ ngắn. Nếu vẫn vướng, hãy nhắn bạn học phần bạn cần hỗ trợ."
        return "Bạn có thể chọn một mục trong Kế hoạch và nói rõ phần đang vướng. Mình sẽ gợi ý bước đầu tiên vừa sức."
    if action:
        return f"Mình đang dựa vào kế hoạch của bạn. Việc tiếp theo là “{action}”. Bạn đang vướng ở đâu, hay muốn xem tiến độ hôm nay?"
    return "Mình chưa thấy việc nào đang chờ trong kế hoạch. Hãy mở Kế hoạch để chọn hoặc thêm việc phù hợp với mục tiêu của bạn."


def _history(connection, user_id: int) -> list[dict]:
    rows = connection.execute(
        "SELECT id, role, content, created_at FROM agent_messages WHERE user_id=? AND session_id=? ORDER BY id DESC LIMIT 60",
        (user_id, SESSION_ID),
    ).fetchall()
    return [dict(row) for row in reversed(rows)]


def chat_history(user_id: int) -> dict:
    from .tracking_cases import list_cases
    list_cases(user_id)
    context = _context(user_id)
    with database() as connection:
        items = _history(connection, user_id)
        if not items:
            connection.execute(
                "INSERT INTO agent_messages(user_id,session_id,role,content,created_at) VALUES (?,?,'assistant',?,?)",
                (user_id, SESSION_ID, _greeting(context), utc_now()),
            )
            items = _history(connection, user_id)
    return {"items": items, "context": context}


def chat_reply(user_id: int, message: str) -> dict:
    context = _context(user_id)
    response = _reply(message.strip(), context)
    with database() as connection:
        if not _history(connection, user_id):
            connection.execute(
                "INSERT INTO agent_messages(user_id,session_id,role,content,created_at) VALUES (?,?,'assistant',?,?)",
                (user_id, SESSION_ID, _greeting(context), utc_now()),
            )
        connection.execute(
            "INSERT INTO agent_messages(user_id,session_id,role,content,created_at) VALUES (?,?,'user',?,?)",
            (user_id, SESSION_ID, message.strip(), utc_now()),
        )
        cursor = connection.execute(
            "INSERT INTO agent_messages(user_id,session_id,role,content,created_at) VALUES (?,?,'assistant',?,?)",
            (user_id, SESSION_ID, response, utc_now()),
        )
        items = _history(connection, user_id)
        reply = next(item for item in reversed(items) if item["id"] == cursor.lastrowid)
    return {"items": items, "reply": reply, "context": context}
