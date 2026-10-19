import sys,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"backend"))
from app.db import database
from app.security import create_token
from app.services.matching_engine import find_top_matches,goal_similarity
import httpx
client=httpx.Client(timeout=30)
results=[]
for slug in ["minhanh","quochuy","buddy01","buddy04","buddy06"]:
 with database() as db: uid=db.execute("SELECT id FROM users WHERE email=?",(f"demo.{slug}@peerbridge.local",)).fetchone()["id"]
 r=client.post("http://127.0.0.1:8000/api/v1/matches/search",headers={"Authorization":"Bearer "+create_token(uid)})
 r.raise_for_status();data=r.json();assert 10<=len(data["candidates"])<=15,data
 assert uid not in [c["candidate_id"] for c in data["candidates"]]
 assert all(c["reasons"] for c in data["candidates"])
 results.append({"user":slug,"count":len(data["candidates"]),"mode":data["matching_mode"],"top3":[{"name":c["display_name"],"score":c["total_score"],"goals":c["learning_goals"]} for c in data["candidates"][:3]]})
assert results[0]["top3"]!=results[1]["top3"]
def bundle(uid,need,offer,goal):
 return {"profile":{"user_id":uid,"learning_goals":[goal]},"needs_help_with":[{"topic":need}],"can_help_with":[{"topic":offer}],"availability":[{"day_of_week":0,"start_time":"19:00","end_time":"21:00","timezone":"Asia/Ho_Chi_Minh"}]}
a=bundle(1,"Tiếng Anh","Python","Luyện tiếng Anh giao tiếp trong 7 tuần")
b=bundle(2,"Python","English speaking","Luyện tiếng Anh giao tiếp tự tin")
c=bundle(3,"SQL","Tiếng Anh","Phân tích SQL cho bán hàng")
d=bundle(4,"UI/UX","Figma","Thiết kế portfolio trong 8 tuần")
ranked=find_top_matches(a,[a,b,c,d],15)
assert [r["candidate_id"] for r in ranked]==[2,3],ranked
assert goal_similarity(a,b)>goal_similarity(a,c)
a["needs_help_with"]=[{"topic":"UI/UX"}];a["profile"]["learning_goals"]=["Thiết kế portfolio trong 8 tuần"]
assert find_top_matches(a,[b,c,d],15)[0]["candidate_id"]==4
accounts=json.loads(Path("logs/demo-30-accounts.json").read_text(encoding="utf-8"))
assert len(accounts)==30 and len({a["goal"] for a in accounts})==30
output={"checks":["30 accounts with distinct goals","top15 for five different profiles","self excluded","grounded reasons","ranking changes with needs and goals","English synonyms accepted","unrelated candidate excluded"],"profiles":results}
Path("logs/matching-30-smoke.json").write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"passed":True,"counts":[r["count"] for r in results],"first_choices":[r["top3"][0]["name"] for r in results]},ensure_ascii=False))
