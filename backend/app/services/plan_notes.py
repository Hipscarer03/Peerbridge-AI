from ..db import database, utc_now
from ..repositories.plans import PlanError, PlanRepository


<<<<<<< HEAD
def notes(pair_id, user, text=None, item_id=None):
    with database() as db:
        repo = PlanRepository(db)
        pair = repo.pair(pair_id, user)
        db.execute("CREATE TABLE IF NOT EXISTS pb_plan_notes (id INTEGER PRIMARY KEY AUTOINCREMENT,pair_id INTEGER,user_id INTEGER,text TEXT,created_at TEXT)")
        if "plan_item_id" not in {r[1] for r in db.execute("PRAGMA table_info(pb_plan_notes)")}:
            db.execute("ALTER TABLE pb_plan_notes ADD COLUMN plan_item_id TEXT")
        if item_id is not None:
            from .plan_together import active_lesson
            lesson = active_lesson(repo, pair, item_id)
        if text is not None:
            if item_id is not None and lesson.user_id == user["id"]:
                raise PlanError("OWN_PLAN_COMMENT", "Chỉ có thể góp ý lịch của bạn học.", 403)
            text = text.strip()
            if not text:
                raise PlanError("EMPTY_NOTE", "Viết một lời nhắn trước khi gửi nhé.", 422)
            db.execute("INSERT INTO pb_plan_notes(pair_id,user_id,text,created_at,plan_item_id) VALUES(?,?,?,?,?)",(pair_id,user["id"],text,utc_now(),item_id))
            from ..home import notifications
            sender = db.execute("SELECT display_name FROM profiles WHERE user_id=?", (user["id"],)).fetchone()
            name = sender["display_name"] if sender else "Bạn học"
            recipient = pair["user_b_id"] if pair["user_a_id"] == user["id"] else pair["user_a_id"]
            notifications.add(recipient, "plan_comment", f"{name} đã góp ý {'buổi học' if item_id else 'kế hoạch'}",
                              f"{lesson.action}\n{text}" if item_id else text, "plan", connection=db,
                              target={"pair_id": pair_id, "item_id": item_id, "feedback": True})
        rows = db.execute("SELECT n.id,n.user_id,p.display_name,n.text,n.created_at,n.plan_item_id FROM pb_plan_notes n JOIN profiles p ON p.user_id=n.user_id WHERE n.pair_id=? AND (? IS NULL OR n.plan_item_id=?) ORDER BY n.id DESC LIMIT 30",(pair_id,item_id,item_id)).fetchall()
=======
def notes(pair_id, user, text=None):
    with database() as db:
        PlanRepository(db).pair(pair_id, user)
        db.execute("CREATE TABLE IF NOT EXISTS pb_plan_notes (id INTEGER PRIMARY KEY AUTOINCREMENT,pair_id INTEGER,user_id INTEGER,text TEXT,created_at TEXT)")
        if text is not None:
            text = text.strip()
            if not text:
                raise PlanError("EMPTY_NOTE", "Viết một lời nhắn trước khi gửi nhé.", 422)
            db.execute("INSERT INTO pb_plan_notes(pair_id,user_id,text,created_at) VALUES(?,?,?,?)",(pair_id,user["id"],text,utc_now()))
        rows = db.execute("SELECT n.id,n.user_id,p.display_name,n.text,n.created_at FROM pb_plan_notes n JOIN profiles p ON p.user_id=n.user_id WHERE n.pair_id=? ORDER BY n.id DESC LIMIT 30",(pair_id,)).fetchall()
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        return {"items":[dict(r) for r in rows]}
