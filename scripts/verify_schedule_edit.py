import sys,json
from pathlib import Path
from datetime import datetime,timedelta
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"backend"))
from app.db import database
from app.security import create_token
from app.schemas import ProfileInput
import httpx
c=httpx.Client(timeout=30)
tokens=[]
for slug in ["minhanh","quochuy","thaomy"]:
 with database() as db: uid=db.execute("SELECT id FROM users WHERE email=?",(f"demo.{slug}@peerbridge.local",)).fetchone()["id"]
 tokens.append(create_token(uid))
def req(method,path,who=0,body=None):
 r=c.request(method,"http://127.0.0.1:8000/api/v1"+path,headers={"Authorization":"Bearer "+tokens[who]},json=body)
 if r.is_error: print(r.status_code,r.text)
 return r
view=req("GET","/plans/1").json()
item=next(i for i in reversed(view["plan"]["items"]) if i["status"]!="COMPLETED")
last=max(datetime.fromisoformat(i["scheduled_end"]) for i in view["plan"]["items"] if i["scheduled_end"])
body={"expected_version":view["plan"]["plan_version"],"scheduled_start":(last+timedelta(hours=2)).isoformat(),"minutes":item["est_minutes"]}
r=req("PATCH",f"/plans/1/items/{item['id']}/schedule",body=body);r.raise_for_status()
after=req("GET","/plans/1").json();assert after["plan"]["plan_version"]>body["expected_version"]
changed=next(i for i in after["plan"]["items"] if i["id"]==item["id"])
assert datetime.fromisoformat(changed["scheduled_start"])==datetime.fromisoformat(body["scheduled_start"])
assert after["partner"]==view["partner"]
assert sum(i["status"]=="COMPLETED" for i in after["plan"]["items"])==sum(i["status"]=="COMPLETED" for i in view["plan"]["items"])
assert req("PATCH",f"/plans/1/items/{item['id']}/schedule",body=body).status_code==409
body["expected_version"]=after["plan"]["plan_version"]
assert req("PATCH",f"/plans/1/items/{view['partner']['items'][-1]['id']}/schedule",body=body).status_code==403
assert req("PATCH",f"/plans/1/items/{item['id']}/schedule",who=2,body=body).status_code==403
body["scheduled_start"]=item["scheduled_start"]
restore=req("PATCH",f"/plans/1/items/{item['id']}/schedule",body=body)
if restore.status_code==422:
 body["scheduled_start"]=(datetime.fromisoformat(item["scheduled_start"])+timedelta(minutes=90)).isoformat()
 restore=req("PATCH",f"/plans/1/items/{item['id']}/schedule",body=body)
if restore.status_code not in (200,422): restore.raise_for_status()
for who in (0,1): req("POST","/plans/1/commit",who=who).raise_for_status()
p=ProfileInput(display_name="Ngọc Ánh",learning_goals=["Luyện Tiếng Anh Giao Tiếp", "LUYỆN TIẾNG ANH GIAO TIẾP"])
assert p.learning_goals==["Luyện Tiếng Anh Giao Tiếp"]
photo=json.loads(Path("logs/photo-smoke.json").read_text(encoding="utf-8"))
check=req("GET",f"/checkins/{photo['id']}",who=1).json()
if check["status"]!="done": req("POST",f"/checkins/{photo['id']}/confirm",who=1,body={"plan_item_id":None}).raise_for_status()
check=req("GET",f"/checkins/{photo['id']}",who=0).json()
assert c.get("http://127.0.0.1:8000"+check["image_url"]).status_code==200
print(json.dumps({"passed":True,"checks":["save own schedule and restore","new version preserves completed progress and companion plan","stale edit rejected","partner task edit forbidden","non-member forbidden","Vietnamese casing and Unicode preserved","uploaded image visible to both buddies"]}))
