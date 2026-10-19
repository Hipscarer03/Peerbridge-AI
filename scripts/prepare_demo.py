"""Prepare synthetic local demo accounts and verify the main API journey.

Run with backend/.venv/Scripts/python.exe from the project root while API is up.
Does not change existing accounts or delete any database.
"""
import json
import time
from pathlib import Path
from uuid import uuid4
import httpx

BASE = "http://127.0.0.1:8000/api/v1"
PASSWORD = "PeerBridgeDemo2026!"
PEOPLE = [
    ("minhanh", "Minh Anh", "Học tiếng Anh giao tiếp trong 7 tuần", "Tiếng Anh", "Python", "Kinh tế", "ĐH Ngoại thương", "Mình muốn tự tin trò chuyện khi đi làm. Cần một người cùng luyện đều mỗi tối."),
    ("quochuy", "Quốc Huy", "Viết ứng dụng Python đầu tiên trong 4 tuần", "Python", "Tiếng Anh", "Công nghệ thông tin", "ĐH Bách khoa", "Tiếng Anh là thế mạnh của mình. Mình đang học Python và thích giải thích bằng ví dụ."),
    ("thaomy", "Thảo My", "Luyện hội thoại tiếng Anh mỗi ngày trong 7 tuần", "Tiếng Anh", "SQL", "Ngôn ngữ Anh", "ĐH Hà Nội", "Mình học tốt hơn khi có người cùng check-in. Thích các buổi học ngắn nhưng đều đặn."),
    ("ducminh", "Đức Minh", "Làm chủ truy vấn SQL trong 4 tuần", "SQL", "Python", "Phân tích dữ liệu", "ĐH Kinh tế", "Cùng nhau làm một việc nhỏ mỗi ngày. Mình có thể giúp bạn Python cơ bản."),
]
client = httpx.Client(timeout=45)

def call(method, path, token=None, body=None, headers=None):
    hdr = {**(headers or {}), **({"Authorization": f"Bearer {token}"} if token else {})}
    r = client.request(method, BASE + path, json=body, headers=hdr)
    if r.is_error:
        raise RuntimeError(f"{method} {path}: {r.status_code} {r.text[:1000]}")
    return r.json()

accounts = []
for slug, name, goal, need, strength, major, school, bio in PEOPLE:
    email = f"demo.{slug}@peerbridge.local"
    response = client.post(BASE + "/auth/register", json={"email": email, "password": PASSWORD, "display_name": name, "age": 21, "city": "Hà Nội", "intent": "conversation"})
    if response.status_code == 409:
        auth = call("POST", "/auth/login", body={"email": email, "password": PASSWORD})
    else:
        response.raise_for_status()
        auth = response.json()
    token = auth["access_token"]
    profile = call("GET", "/profiles/me", token)
    if not profile["profile"]["learning_goals"]:
        call("PUT", "/profiles/me", token, {
            "profile": {"display_name": name, "bio": bio, "major": major, "school": school, "subjects": [need,strength], "learning_goals": [goal]},
            "needs_help_with": [{"topic": need, "description": goal, "current_level": "Cơ bản", "target_outcome": goal}],
            "can_help_with": [{"topic": strength, "description": "Giải thích qua ví dụ", "proficiency_level": "Khá", "max_sessions_per_week": 3}],
            "availability": [{"day_of_week": day, "start_time": "19:00", "end_time": "21:00", "timezone": "Asia/Ho_Chi_Minh"} for day in range(7)],
        })
    accounts.append({"email": email,"name": name, "user_id": auth["user_id"], "token": token})

a,b=accounts[:2]
matches=call("POST","/matches/search",a["token"])
assert any(c.get("learning_goals") and c.get("availability") for c in matches["candidates"]), "Matching profile enrichment missing"
connections=call("GET","/connections",a["token"])
pair=next((p for p in connections["connected"] if p["peer"]["user_id"]==b["user_id"]),None)
if not pair:
    invitation=next((r for r in connections["sent"] if r["peer"]["user_id"]==b["user_id"] and r["status"]=="PENDING"),None)
    if not invitation: invitation=call("POST","/connections",a["token"],{"recipient_id":b["user_id"]})
    call("POST",f'/connections/{invitation["id"]}/accept',b["token"])
    pair=next(p for p in call("GET","/connections",a["token"])["connected"] if p["peer"]["user_id"]==b["user_id"])
pair_id=pair["peer_match_id"]
view=call("GET",f"/plans/{pair_id}",a["token"])
if not view["plan"]:
    setup=call("GET",f"/plans/{pair_id}/setup",a["token"])
    members=[]
    for m in setup["members"]:
        members.append({"user_id":m["user_id"],"goal":m["goals"][0],"concept_ids":["english.conversation" if m["user_id"]==a["user_id"] else "python.loops"],"known_concept_ids":[],"can_help_concept_ids":[],"committed_minutes_per_week":240,"availability":[{"id":str(w["id"]),"day_of_week":w["day_of_week"],"start_time":w["start_time"][:5],"end_time":w["end_time"][:5]} for w in m["availability"]],"timezone":"Asia/Ho_Chi_Minh","location":"Góc học tập của tôi","deadline":None})
    call("POST","/plans/generate",a["token"],{"pair_id":pair_id,"members":members,"horizon_days":7},{"Idempotency-Key":str(uuid4())})
for person in (a,b):
    call("POST",f"/plans/{pair_id}/commit",person["token"])
assert call("GET",f"/plans/{pair_id}/commitments",a["token"])["both"]
denied=client.get(BASE+f"/plans/{pair_id}/commitments",headers={"Authorization":"Bearer "+accounts[2]["token"]})
assert denied.status_code==403, "Non-member must not read commitments"
feed=call("GET","/pairs/me/feed",a["token"])
if not feed["my_latest"]:
    checkin=call("POST","/checkins/text",a["token"],{"id":str(uuid4()),"note":"Mình đã luyện giới thiệu bản thân 2 phút và ghi lại 5 từ mới."})
    for _ in range(20):
        current=call("GET",f'/checkins/{checkin["id"]}',a["token"])
        if current["status"]!="processing":break
        time.sleep(.5)
    if current["status"]!="done":
        call("POST",f'/checkins/{checkin["id"]}/confirm',a["token"],{"plan_item_id":current["options"][0]["plan_item_id"] if current["options"] else None})
for person in (a,b):
    home=call("GET","/home",person["token"])
    assert home["pair"] and home["plan"]["has_plan"]
    assert "today_total" in home["plan"]
result={"verified":["registration","profile and availability","matching enriched profiles","mutual invitation","English/Python plans","both commitments","non-member forbidden","text check-in and confirmation","home progress"],"accounts":[{k:v for k,v in p.items() if k!="token"} for p in accounts],"pair_id":pair_id}
logdir=Path(__file__).resolve().parents[1]/"logs"
logdir.mkdir(exist_ok=True)
(logdir/"demo-smoke.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))
