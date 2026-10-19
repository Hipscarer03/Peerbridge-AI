"""Register interest in a peer's active lesson without changing either schedule."""
from datetime import UTC, datetime

from ..db import database, utc_now
from ..repositories.plans import PlanError, PlanRepository
from .commitments import committed_members

TABLE_SQL = """CREATE TABLE IF NOT EXISTS pb_plan_together (
 pair_id INTEGER NOT NULL REFERENCES peer_matches(id),
 item_id TEXT NOT NULL REFERENCES pb_plan_items(id),
 user_id INTEGER NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL,
 PRIMARY KEY(pair_id,item_id,user_id)
)"""


def active_lesson(repo, pair, item_id):
    for owner in (pair["user_a_id"], pair["user_b_id"]):
        row = repo.active(pair["id"], owner)
        if row:
            plan = repo.hydrated(row)
            for item in plan.items + plan.deferred_items:
                if item.id == item_id:
                    return item
    raise PlanError("ITEM_NOT_FOUND", "Buổi học này không còn trong kế hoạch hiện tại.", 404)


def registrations(db, pair_id):
    db.execute(TABLE_SQL)
    return [dict(row) for row in db.execute(
        "SELECT item_id,user_id,created_at FROM pb_plan_together WHERE pair_id=?", (pair_id,)
    )]


def register(pair_id, item_id, user, enabled):
    with database() as db:
        # Serialize against edits/replans while checking the active lesson.
        db.execute("BEGIN IMMEDIATE")
        repo = PlanRepository(db)
        pair = repo.pair(pair_id, user)
        item = active_lesson(repo, pair, item_id)
        if item.user_id == user["id"]:
            raise PlanError("OWN_LESSON", "Chọn buổi học của bạn đồng hành để đề nghị học chung.", 422)
        if enabled and item.status == "COMPLETED":
            raise PlanError("LESSON_COMPLETED", "Buổi học này đã hoàn thành.", 422)
        if enabled:
            if not item.scheduled_start or not item.scheduled_end or item.scheduled_end.astimezone(UTC) <= datetime.now(UTC):
                raise PlanError("TIME_REQUIRED", "Khung giờ học đã kết thúc; hãy chọn giờ mới trước khi đề nghị học chung.", 409)
            duration = (item.scheduled_end - item.scheduled_start).total_seconds() / 60
            if not 15 <= duration <= 180:
                raise PlanError("DURATION_REQUIRED", "Buổi học chung cần dài từ 15 đến 180 phút.", 409)
            plans = [repo.active(pair_id, uid) for uid in (pair["user_a_id"], pair["user_b_id"])]
            if not all(plans):
                raise PlanError("COMMITMENT_REQUIRED", "Cả hai cần có kế hoạch trước khi đề nghị học chung.", 409)
            committed = committed_members(db, pair_id)
            missing = set((pair["user_a_id"], pair["user_b_id"])) - committed
            if missing:
                if len(missing) == 2:
                    message = "Cả hai cần cam kết kế hoạch ban đầu."
                elif user["id"] in missing:
                    message = "Bạn cần cam kết kế hoạch ban đầu."
                else:
                    message = "Bạn học cần cam kết kế hoạch ban đầu."
                raise PlanError("COMMITMENT_REQUIRED", message, 409)
        db.execute(TABLE_SQL)
        if enabled:
            added = db.execute("INSERT OR IGNORE INTO pb_plan_together VALUES(?,?,?,?)", (pair_id,item_id,user["id"],utc_now()))
            if added.rowcount:
                from ..home import notifications
                sender = db.execute("SELECT display_name FROM profiles WHERE user_id=?", (user["id"],)).fetchone()
                name = sender["display_name"] if sender else "Bạn học"
                notifications.add(item.user_id, "study_together", f"🤝 {name} đề nghị học chung với bạn", item.action,
                                  "plan", connection=db, target={"pair_id": pair_id, "item_id": item_id})
        else:
            db.execute("DELETE FROM pb_plan_together WHERE pair_id=? AND item_id=? AND user_id=?", (pair_id,item_id,user["id"]))
        return {"items": registrations(db, pair_id)}
