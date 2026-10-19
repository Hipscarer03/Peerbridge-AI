"""Small, deterministic Cú Bridge prompts shared by the hero and private chat."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

from ..agents.plan_coach.contract import ItemStatus
from ..db import database, utc_now
from ..metrics.repository import MetricsRepository
from ..repositories.plans import PlanRepository

ZONE = ZoneInfo("Asia/Ho_Chi_Minh")
SESSION_ID = "cu-bridge-personal"
SCHEMA = """
CREATE TABLE IF NOT EXISTS owl_case_state (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_key TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  chat_message_id INTEGER,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id,case_key)
);
"""
FINISHED = {"dismiss", "short_done", "short_more", "sent", "plan_opened"}


def initialize(connection) -> None:
    connection.executescript(SCHEMA)


def _peer_name(db, user_id: int) -> str:
    row = db.execute("SELECT display_name FROM profiles WHERE user_id=?", (user_id,)).fetchone()
    return row["display_name"] if row else "bạn học"


def _pair_cases(db, pair, user_id: int, now: datetime) -> list[dict]:
    pair_id = pair["id"]
    peer_id = pair["user_b_id"] if pair["user_a_id"] == user_id else pair["user_a_id"]
    peer_name = _peer_name(db, peer_id)
    result: list[dict] = []
    row = PlanRepository(db).active(pair_id, user_id)
    if row:
        plan = PlanRepository(db).hydrated(row)
        today = now.astimezone(ZONE).date()
        unfinished = [i for i in plan.items + plan.deferred_items if i.status == ItemStatus.SCHEDULED]
        yesterday = today - timedelta(days=1)
        overdue = [i for i in unfinished if
                   (i.scheduled_end and i.scheduled_end.astimezone(ZONE).date() >= yesterday and
                    i.scheduled_end <= now - timedelta(minutes=10)) or
                   (not i.scheduled_end and i.planned_date == yesterday)]
        overdue.sort(key=lambda i: (i.scheduled_end or datetime.min.replace(tzinfo=UTC)), reverse=True)
        if overdue:
            item = overdue[0]
            multiple = len(overdue) >= 2
            result.append({
                "id": f"personal:{pair_id}:{item.id}", "kind": "overload" if multiple else "late_lesson",
                "pair_id": pair_id, "item_id": item.id, "meeting_id": None, "peer_name": peer_name,
                "label": "Lịch học hơi nặng" if multiple else "Buổi học chưa xong",
                "title": "Mình làm nhẹ lại nhé?" if multiple else item.action,
                "body": f"{len(overdue)} buổi đang chờ. Cú giúp bạn chọn bước vừa sức." if multiple else
                        "Bạn chưa kịp học buổi này. Cú giúp bạn bắt đầu bằng một bước nhỏ.",
                "action": item.action, "priority": 70 if multiple else 60, "tone": "yellow",
            })
        upcoming = sorted((item for item in unfinished if item.scheduled_start and
                           now < item.scheduled_start <= now + timedelta(hours=24)),
                          key=lambda item: item.scheduled_start)
        for item in upcoming:
            has_timeline = db.execute("""SELECT 1 FROM facilitated_meetings
              WHERE peer_match_id=? AND plan_item_id=?
                AND status NOT IN ('CANCELLED','EXPIRED','MISSED','ENDED') LIMIT 1""",
              (pair_id, item.id)).fetchone()
            if not has_timeline:
                result.append({
                    "id": f"timeline:{pair_id}:{item.id}", "kind": "timeline_reminder",
                    "pair_id": pair_id, "item_id": item.id, "meeting_id": None, "peer_name": peer_name,
                    "label": "Sắp đến giờ học", "title": "Buổi này chưa có timeline",
                    "body": "Bạn có thể chia nhỏ hoạt động trước giờ học, hoặc bổ sung sau.",
                    "action": item.action, "priority": 45, "tone": "blue",
                })
                break
    missed = db.execute("""SELECT m.id,m.goal,m.peer_match_id,m.ends_at,m.status,
          mine.joined_at AS mine_joined,mine.attendance AS mine_attendance,
          other.joined_at AS other_joined,other.user_id AS other_id
          FROM facilitated_meetings m
          JOIN facilitated_members mine ON mine.meeting_id=m.id AND mine.user_id=?
          JOIN facilitated_members other ON other.meeting_id=m.id AND other.user_id!=?
          WHERE m.peer_match_id=? AND m.mode!='solo' AND m.status IN ('MISSED','CONFIRMED','ACTIVE')
            AND m.ends_at<=? AND m.ends_at>=?
          ORDER BY m.ends_at DESC LIMIT 5""",
          (user_id, user_id, pair_id, now.isoformat(), (now - timedelta(days=7)).isoformat())).fetchall()
    for meeting in missed:
        if meeting["mine_joined"] and not meeting["other_joined"]:
            kind, priority = "waiting_peer", 85
            title = f"Buổi với {peer_name} chưa diễn ra"
            body = f"Có thể {peer_name} gặp việc đột xuất. Bạn có thể học phần ngắn hoặc gửi lời hỏi thăm."
        elif not meeting["mine_joined"] and meeting["other_joined"] and meeting["mine_attendance"] != "DECLINED":
            kind, priority = "missed_shared", 95
            title = f"Hôm trước bạn và {peer_name} chưa học cùng được"
            body = f"Bạn có bận đột xuất hay quên lịch với {peer_name} không?"
        else:
            continue
        result.append({
            "id": f"meeting:{meeting['id']}:{kind}", "kind": kind,
            "pair_id": pair_id, "item_id": None, "meeting_id": meeting["id"],
            "peer_name": peer_name, "label": "Học chung", "title": title, "body": body,
            "action": meeting["goal"], "priority": priority, "tone": "pink",
        })
    repo = MetricsRepository(db)
    tracking_pair = db.execute("""SELECT id FROM pairs WHERE status='active' AND
      ((user_a=? AND user_b=?) OR (user_a=? AND user_b=?)) ORDER BY id DESC LIMIT 1""",
      (user_id, peer_id, peer_id, user_id)).fetchone()
    if tracking_pair and repo.eligible(tracking_pair["id"]):
        history = repo.history(repo.context(tracking_pair["id"]), 7)
        if len(history) >= 3:
            recent = history[:3]
            days = [m.study_date for m in recent]
            valid_days = all(days[index] - days[index + 1] == timedelta(days=1) for index in (0, 1))
            fresh = days[0] >= now.astimezone(ZONE).date() - timedelta(days=1)
            valid_work = all(m.learner_a.has_due_workload and m.learner_b.has_due_workload for m in recent)
            gaps = [abs(min(1.0, m.pacing_a) - min(1.0, m.pacing_b)) for m in recent]
            if valid_days and fresh and valid_work and all(gap > .3 for gap in gaps):
                latest = recent[0]
                slower = latest.lagging_member == user_id
                result.append({
                    "id": f"pacing:{pair_id}:{days[0].isoformat()}",
                    "kind": "pacing_slow" if slower else "pacing_fast",
                    "pair_id": pair_id, "item_id": None, "meeting_id": None, "peer_name": peer_name,
                    "label": "Nhịp học của hai bạn", "title": "Cùng tìm nhịp vừa sức" if slower else "Cùng học cho dễ theo kịp",
                    "body": "Dạo này lịch của bạn có hơi nhiều không? Cú có thể làm nhẹ tuần này." if slower else
                            f"{peer_name} có thể cần thêm thời gian. Bạn muốn động viên hoặc học cùng phần quan trọng?",
                    "action": "", "priority": 40, "tone": "blue",
                })
    return result


def list_cases(user_id: int, *, sync_chat: bool = True) -> list[dict]:
    now = datetime.now(UTC)
    with database() as db:
        pairs = db.execute("""SELECT id,user_a_id,user_b_id FROM peer_matches
          WHERE user_a_id=? OR user_b_id=? ORDER BY created_at DESC,id DESC LIMIT 2""",
          (user_id, user_id)).fetchall()
        cases = [case for pair in pairs for case in _pair_cases(db, pair, user_id, now)]
        db.execute("BEGIN IMMEDIATE")
        visible = []
        for case in sorted(cases, key=lambda item: -item["priority"]):
            state = db.execute("SELECT action,detail,chat_message_id FROM owl_case_state WHERE user_id=? AND case_key=?",
                               (user_id, case["id"])).fetchone()
            if state and state["action"] in FINISHED:
                continue
            if not state:
                db.execute("INSERT OR IGNORE INTO owl_case_state(user_id,case_key,updated_at) VALUES (?,?,?)",
                           (user_id, case["id"], utc_now()))
            case["stage"] = state["action"] if state else ""
            case["reason"] = state["detail"] if state and state["action"].startswith("reason_") else ""
            if case["kind"] == "missed_shared":
                care = db.execute("""SELECT content FROM peer_study_messages WHERE peer_match_id=? AND sender_id=?
                  AND client_key=? LIMIT 1""",
                  (case["pair_id"], next((p["user_b_id"] if p["user_a_id"] == user_id else p["user_a_id"] for p in pairs if p["id"] == case["pair_id"]), 0),
                   f"owl-care:{case['meeting_id']}")).fetchone()
                case["care_message"] = care["content"] if care else None
            else:
                case["care_message"] = None
            if sync_chat and (not state or state["chat_message_id"] is None):
                content = f"{case['title']}. {case['body']}"
                cursor = db.execute("""INSERT INTO agent_messages(user_id,session_id,role,content,created_at)
                  VALUES (?,?,'assistant',?,?)""", (user_id, SESSION_ID, content, utc_now()))
                db.execute("UPDATE owl_case_state SET chat_message_id=? WHERE user_id=? AND case_key=?",
                           (cursor.lastrowid, user_id, case["id"]))
            visible.append(case)
        return visible


def save_action(user_id: int, case_key: str, action: str, detail: str = "") -> list[dict]:
    allowed = {
        "late_lesson": {"short_start", "too_hard", "plan_opened", "short_done", "short_more", "dismiss"},
        "overload": {"short_start", "too_hard", "plan_opened", "short_done", "short_more", "dismiss"},
        "missed_shared": {"reason_busy", "reason_forgot", "reason_other", "sent", "dismiss"},
        "waiting_peer": {"sent", "plan_opened", "dismiss"},
        "pacing_slow": {"short_start", "short_done", "short_more", "plan_opened", "dismiss"},
        "pacing_fast": {"sent", "plan_opened", "dismiss"},
        "timeline_reminder": {"plan_opened", "dismiss"},
    }
    case = next((item for item in list_cases(user_id) if item["id"] == case_key), None)
    if not case or action not in allowed[case["kind"]]:
        raise ValueError("Gợi ý này không còn phù hợp. Hãy tải lại trang.")
    with database() as db:
        db.execute("""UPDATE owl_case_state SET action=?,detail=?,updated_at=?
          WHERE user_id=? AND case_key=?""", (action, detail[:300], utc_now(), user_id, case_key))
    return list_cases(user_id)
