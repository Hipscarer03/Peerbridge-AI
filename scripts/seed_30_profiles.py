"""Create/update only 30 named synthetic local demo profiles. Safe to rerun."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"backend"))
from pathlib import Path
import httpx
from app.db import database
from app.routers.auth import register
from app.schemas import RegisterRequest
from app.security import create_token
BASE="http://127.0.0.1:8000/api/v1"
PASSWORD="PeerBridgeDemo2026!"
client=httpx.Client(timeout=45)
names=["Ngọc Mai","Tuấn Kiệt","Bảo Trâm","Hải Nam","Khánh Linh","Gia Bảo","Phương Nhi","Đức Anh","Yến Nhi","Hoàng Long","Thanh Hà","Minh Khang","Thu Uyên","Quang Vinh","Hồng Nhung","Anh Tú","Diệu Linh","Nhật Minh","Kim Ngân","Trọng Phúc","Hà My","Duy Khánh","Lan Chi","Thế Anh","Minh Châu","Hữu Phước","Bích Ngọc","Quốc Bảo","Thùy Dương","Trung Hiếu"]
tracks=[("Tiếng Anh","Luyện tiếng Anh giao tiếp tự tin trong 7 tuần","Ngôn ngữ Anh"),("Python","Xây ứng dụng Python đầu tiên trong 4 tuần","Công nghệ thông tin"),("SQL","Phân tích dữ liệu bán hàng bằng SQL trong 6 tuần","Phân tích dữ liệu"),("UI/UX","Hoàn thiện portfolio thiết kế UI/UX trong 8 tuần","Thiết kế đồ họa"),("Marketing","Lập chiến dịch marketing cho dự án cá nhân trong 5 tuần","Truyền thông"),("Tiếng Nhật","Luyện tiếng Nhật giao tiếp và ôn N4 trong 10 tuần","Ngôn ngữ Nhật")]
backgrounds=["Sinh viên năm 2","Sinh viên năm cuối","Người mới đi làm","Đang chuyển ngành","Freelancer"]
styles=["Cần người nhắc mình học đều, vì hay bỏ dở khi học một mình.","Thích thực hành qua ví dụ và phản hồi nhẹ nhàng sau mỗi buổi.","Muốn chia mục tiêu thành việc nhỏ, cùng check-in mỗi tối.","Cần bạn cùng luyện tập, trao đổi vướng mắc và giữ động lực.","Thích học tập trung 25 phút rồi chia sẻ điều vừa hiểu."]
schools=["ĐH Ngoại thương","ĐH Bách khoa","ĐH Kinh tế","ĐH Mỹ thuật","ĐH Hà Nội"]
goal_variants=[
 ["Học tiếng Anh giao tiếp trong 7 tuần", "Luyện phỏng vấn bằng tiếng Anh trong 6 tuần", "Tự tin thuyết trình bằng tiếng Anh trong 8 tuần", "Luyện tiếng Anh để đi du lịch trong 5 tuần", "Trao đổi với khách hàng bằng tiếng Anh trong 10 tuần"],
 ["Viết ứng dụng Python đầu tiên trong 4 tuần", "Tự động hóa công việc Excel bằng Python trong 6 tuần", "Xây API Python cho portfolio trong 8 tuần", "Học Python phân tích dữ liệu trong 7 tuần", "Hoàn thành chatbot Python cá nhân trong 5 tuần"],
 ["Phân tích bán hàng bằng SQL trong 6 tuần", "Ôn SQL để phỏng vấn data analyst trong 4 tuần", "Làm dashboard dữ liệu với SQL trong 8 tuần", "Tự viết truy vấn SQL cho công việc trong 5 tuần", "Học SQL và thiết kế cơ sở dữ liệu trong 7 tuần"],
 ["Hoàn thiện portfolio UI/UX trong 8 tuần", "Thiết kế giao diện web bằng Figma trong 4 tuần", "Học UX research và phỏng vấn người dùng trong 6 tuần", "Thiết kế app quản lý chi tiêu trong 7 tuần", "Xây design system đầu tiên trong 5 tuần"],
 ["Lập chiến dịch marketing cá nhân trong 5 tuần", "Viết content đều mỗi ngày trong 4 tuần", "Học marketing để phát triển cửa hàng trong 8 tuần", "Lập kế hoạch truyền thông cho CLB trong 6 tuần", "Hoàn thiện portfolio content marketing trong 7 tuần"],
 ["Luyện tiếng Nhật giao tiếp và ôn N4 trong 10 tuần", "Luyện tiếng Nhật để du lịch trong 6 tuần", "Ôn JLPT N3 trong 12 tuần", "Luyện hội thoại tiếng Nhật nơi công sở trong 8 tuần", "Duy trì học tiếng Nhật mỗi ngày trong 7 tuần"]
]
accounts=[]
def call(method,path,token=None,body=None):
 r=client.request(method,BASE+path,json=body,headers={"Authorization":"Bearer "+token} if token else {})
 r.raise_for_status();return r.json()
for i,name in enumerate(names):
 topic,goal,major=tracks[i%6]
 goal=goal_variants[i%6][i//6]
 email=f"demo.buddy{i+1:02}@peerbridge.local"
 with database() as connection:
  existing=connection.execute("SELECT id FROM users WHERE email=?",(email,)).fetchone()
 if existing: auth={"user_id":existing["id"],"access_token":create_token(existing["id"])}
 else: auth=register(RegisterRequest(email=email,password=PASSWORD,display_name=name,age=19+i%10,city=["Hà Nội","TP.HCM","Đà Nẵng"][i%3],intent="conversation")).model_dump()
 with database() as connection:
  connection.execute("UPDATE profiles SET city=? WHERE user_id=?",(["Hà Nội","TP.HCM","Đà Nẵng"][i%3],auth["user_id"]))
 token=auth["access_token"]
 # Different study interests and complementary strengths; no uniform all-subject expert profiles.
 secondary=tracks[(i+1)%6][0]
 offers=[tracks[(i+2)%6][0],tracks[(i+4)%6][0]]
 days=[0,2,4] if i%3==0 else [1,3,5] if i%3==1 else [0,1,2,3,4,5,6]
 start,end=[("19:00","21:00"),("20:00","22:00"),("07:00","09:00")][i%3]
 profile={"profile":{"display_name":name,"bio":backgrounds[i//6]+" · "+styles[i%5],"major":major,"school":schools[i%5] if i//6<2 else "","subjects":[topic,secondary,*offers],"learning_goals":[goal]},"needs_help_with":[{"topic":topic,"description":styles[i%5],"current_level":["Mới bắt đầu","Cơ bản","Trung cấp"][i%3],"target_outcome":goal},{"topic":secondary,"description":"Muốn bổ sung kỹ năng để phục vụ dự án cá nhân","current_level":"Cơ bản","target_outcome":"Thực hành đều đặn trong 6 tuần"}],"can_help_with":[{"topic":offer,"description":"Hướng dẫn thực hành, góp ý và chia sẻ tài liệu đã học","proficiency_level":"Khá","max_sessions_per_week":2+i%3} for offer in offers],"availability":[{"day_of_week":day,"start_time":start,"end_time":end,"timezone":"Asia/Ho_Chi_Minh"} for day in days]}
 call("PUT","/profiles/me",token,profile)
 accounts.append({"email":email,"name":name,"background":backgrounds[i//6],"goal":goal,"needs":[topic,secondary],"strengths":offers,"user_id":auth["user_id"]})
Path("logs/demo-30-accounts.json").write_text(json.dumps(accounts,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"created_or_updated":len(accounts),"backgrounds":backgrounds,"tracks":[t[0] for t in tracks]},ensure_ascii=False))
