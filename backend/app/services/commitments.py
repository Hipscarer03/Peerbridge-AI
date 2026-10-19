<<<<<<< HEAD
"""Persist each member's initial plan commitment for the lifetime of a peer match."""
=======
"""Persist each member's confirmation for the current pair of plan versions."""
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from ..db import database, utc_now
from ..repositories.plans import PlanError, PlanRepository


<<<<<<< HEAD
def committed_members(db, pair_id):
    """Read any prior commitment for this match, including versioned legacy rows."""
    db.execute("CREATE TABLE IF NOT EXISTS pb_plan_commits (pair_id INTEGER, user_id INTEGER, version_key TEXT, committed_at TEXT, PRIMARY KEY(pair_id,user_id,version_key))")
    return {row[0] for row in db.execute("SELECT DISTINCT user_id FROM pb_plan_commits WHERE pair_id=?", (pair_id,))}


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def plan_commitments(pair_id, user, commit=False):
    with database() as db:
        repo = PlanRepository(db)
        pair = repo.pair(pair_id, user)
<<<<<<< HEAD
=======
        db.execute("CREATE TABLE IF NOT EXISTS pb_plan_commits (pair_id INTEGER, user_id INTEGER, version_key TEXT, committed_at TEXT, PRIMARY KEY(pair_id,user_id,version_key))")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        members = [pair["user_a_id"], pair["user_b_id"]]
        plans = [repo.active(pair_id, uid) for uid in members]
        if not all(plans):
            if commit:
                raise PlanError("PLAN_MISSING", "Hãy tạo kế hoạch cho cả hai trước khi cam kết", 422)
<<<<<<< HEAD
        confirmed = committed_members(db, pair_id)
        if commit and user["id"] not in confirmed:
            db.execute("INSERT OR IGNORE INTO pb_plan_commits VALUES(?,?,?,?)", (pair_id, user["id"], "initial", utc_now()))
            confirmed.add(user["id"])
=======
            return {"mine": False, "partner": False, "both": False}
        version_key = ":".join(str(p["version"]) for p in plans)
        if commit:
            db.execute("INSERT OR IGNORE INTO pb_plan_commits VALUES(?,?,?,?)", (pair_id, user["id"], version_key, utc_now()))
        confirmed = {r[0] for r in db.execute("SELECT user_id FROM pb_plan_commits WHERE pair_id=? AND version_key=?", (pair_id, version_key))}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        other = next(uid for uid in members if uid != user["id"])
        return {"mine": user["id"] in confirmed, "partner": other in confirmed, "both": all(uid in confirmed for uid in members)}
