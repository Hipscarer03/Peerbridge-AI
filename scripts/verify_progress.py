"""Checks on synthetic local accounts: completion, idempotency, ownership and partner advice."""
import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import httpx
BASE="http://127.0.0.1:8000/api/v1"
client=httpx.Client(timeout=45)
def call(method,path,token=None,body=None):
    response=client.request(method,BASE+path,json=body,headers={"Authorization":"Bearer "+token} if token else {})
    if response.is_error: print(response.status_code, response.text)
    response.raise_for_status()
    return response.json()
people=[]
for slug in ("minhanh","quochuy","thaomy"):
    people.append(call("POST","/auth/login",body={"email":f"demo.{slug}@peerbridge.local","password":"PeerBridgeDemo2026!"}))
checks=[]
for person in people[:2]:
    token=person["access_token"]
    pair=call("GET","/connections",token)["connected"][0]["peer_match_id"]
    before=call("GET",f"/plans/{pair}",token)
    pending=next((i for i in before["plan"]["items"] if i["status"]!="COMPLETED" and (not i.get("scheduled_start") or datetime.fromisoformat(i["scheduled_start"]) <= datetime.now(timezone.utc))),None)
    if pending:
        payload={"id":str(uuid4()),"note":"Đã hoàn thành buổi học theo kế hoạch (tài khoản demo).","plan_item_id":pending["id"]}
        result=call("POST","/checkins/text",token,payload)
        assert result["status"]=="done" and result["plan_item_label"],result
        same=call("POST","/checkins/text",token,payload)
        assert same["id"]==result["id"]
        after=call("GET",f"/plans/{pair}",token)
        assert next(i for i in after["plan"]["items"] if i["id"]==pending["id"])["status"]=="COMPLETED"
        checks.append("direct tick marks own plan item completed and duplicate is idempotent")
token=people[0]["access_token"]
partner_view=call("GET",f"/plans/{pair}",token)
assert partner_view["partner"]["items"]
partner_item=partner_view["partner"]["items"][-1]["id"]
denied=client.post(BASE+"/checkins/text",headers={"Authorization":"Bearer "+token},json={"id":str(uuid4()),"note":"Ownership negative test","plan_item_id":partner_item})
assert denied.status_code==400,denied.text
checks.append("cannot tick partner's task")
message="Mình thấy lịch này vừa sức. Tối nay cùng chia sẻ một điều mới học nhé!"
call("POST",f"/plans/{pair}/notes",token,{"text":message})
notes=call("GET",f"/plans/{pair}/notes",people[1]["access_token"])
assert any(n["text"]==message for n in notes["items"])
denied=client.get(BASE+f"/plans/{pair}/notes",headers={"Authorization":"Bearer "+people[2]["access_token"]})
assert denied.status_code==403
checks.append("partner sees plan advice, non-member forbidden")
home=call("GET","/home",token)
assert home["plan"]["week_done"]>=1
assert home["checkin"]["partner_checked_in_today"]
checks.append("real home progress and partner check-in update")
output={"checks":checks,"my_week_done":home["plan"]["week_done"],"pair_streak":home["checkin"]["streak"]}
(Path(__file__).resolve().parents[1]/"logs/progress-smoke.json").write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(output,ensure_ascii=False))
