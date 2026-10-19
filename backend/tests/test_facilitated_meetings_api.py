import sys
from datetime import datetime, timedelta
from types import SimpleNamespace

from app import study_meetings as meeting_module
from app.config import get_settings
from app.db import database
from app.main import app
from app.security import current_user
from app.study_meetings import emit_due_reminders
from test_plans_api import flow as flow
from test_plans_api import generate, headers, read


def test_two_people_confirm_timeline_and_keep_private_hint(flow, monkeypatch):
    monkeypatch.setenv("STUDY_AI_ENABLED", "false")
    get_settings.cache_clear()
    client, _, _, _ = flow
    generate(flow)
    for uid in (101, 102):
        committed = client.post("/api/v1/plans/1/commit", headers=headers(uid))
        assert committed.status_code == 200, committed.text
    lesson = read(client)["plan"]["items"][0]

    def as_user(uid):
        app.dependency_overrides[current_user] = lambda: {"id": uid, "role": "STUDENT", "is_seed": 0}

    start = datetime.fromisoformat(lesson["scheduled_start"])
    end = datetime.fromisoformat(lesson["scheduled_end"])
    class MeetingClock(datetime):
        @classmethod
        def now(cls, tz=None):
            instant = start + timedelta(minutes=1)
            return instant.astimezone(tz) if tz else instant.replace(tzinfo=None)

    segments = [{"title": "Tự thử", "minutes": 20}, {"title": "Chốt", "minutes": 5}]
    try:
        as_user(101)
        create_payload = {
            "client_key": "create-meeting-123",
            "peer_match_id": 1, "plan_item_id": lesson["id"], "goal": "Tự giải bài SQL JOIN", "mode": "together",
            "starts_at": start.isoformat(), "ends_at": end.isoformat(),
            "segments": segments, "source_text": "Ví dụ bảng học viên và lớp học",
        }
        created = client.post("/api/v1/study-meetings", json=create_payload)
        assert created.status_code == 201, created.text
        meeting_id = created.json()["id"]
        assert client.post("/api/v1/study-meetings", json=create_payload).json()["id"] == meeting_id
        assert created.json()["active_version"] is None
        as_user(103)
        assert client.get(f"/api/v1/study-meetings/{meeting_id}").status_code == 404

        as_user(102)
        assert client.post(f"/api/v1/study-meetings/{meeting_id}/invitation", json={"accept": True}).status_code == 200
        confirmed = client.post(f"/api/v1/study-meetings/{meeting_id}/timeline/1/confirm")
        assert confirmed.json()["active_version"] == 1
        monkeypatch.setattr(meeting_module, "datetime", MeetingClock)
        as_user(101)
        joined = client.post(f"/api/v1/study-meetings/{meeting_id}/join")
        assert joined.status_code == 200, joined.text
        assert joined.json()["status"] == "ACTIVE"
        hint = client.post(f"/api/v1/study-meetings/{meeting_id}/suggestions", json={
            "kind": "guide", "selected_input": "Bạn học đang bí", "request_key": "hint-one-123",
        })
        assert hint.status_code == 200 and hint.json()["content"]
        assert client.post(f"/api/v1/study-meetings/{meeting_id}/suggestions", json={
            "kind": "guide", "selected_input": "Bạn học đang bí", "request_key": "hint-one-123",
        }).json()["id"] == hint.json()["id"]
        monkeypatch.setenv("STUDY_AI_ENABLED", "true")
        monkeypatch.setenv("OPENAI_API_KEY", "fake-test-key")
        monkeypatch.setenv("STUDY_AI_INPUT_PRICE_PER_MILLION", "1")
        monkeypatch.setenv("STUDY_AI_OUTPUT_PRICE_PER_MILLION", "2")
        get_settings.cache_clear()
        fake_response = SimpleNamespace(
            model="fake-study-model", usage=SimpleNamespace(prompt_tokens=120, completion_tokens=30),
            choices=[SimpleNamespace(message=SimpleNamespace(content='{"hint":"Hãy hỏi bạn học vì sao chọn phép JOIN này trước khi xem đáp án.","source_refs":["meeting-source"]}'))],
        )
        fake_pack = SimpleNamespace(
            model="fake-study-model", usage=SimpleNamespace(prompt_tokens=200, completion_tokens=80),
            choices=[SimpleNamespace(message=SimpleNamespace(content='{"opening_questions":["Bạn muốn giải được dạng JOIN nào?"],"guide_questions":["Vì sao bạn chọn khóa nối này?"],"learner_warmup":["Hãy thử nêu bảng đầu tiên cần dùng."],"transfer_task":"Đổi một khóa nối và tự thử lại."}'))],
        )
        def fake_create(**kwargs):
            return fake_response if '"task"' in kwargs["messages"][1]["content"] else fake_pack
        fake_client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=fake_create)))
        monkeypatch.setitem(sys.modules, "openai", SimpleNamespace(OpenAI=lambda **_: fake_client))
        live_hint = client.post(f"/api/v1/study-meetings/{meeting_id}/suggestions", json={
            "kind": "guide", "selected_input": "Bạn học chưa hiểu JOIN", "request_key": "hint-two-123",
        })
        assert live_hint.status_code == 200, live_hint.text
        assert live_hint.json()["status"] == "AI"
        with database() as db:
            usage = db.execute("SELECT input_tokens,output_tokens,cost_usd FROM ai_usage WHERE feature='study_facilitation'").fetchone()
            assert (usage["input_tokens"], usage["output_tokens"]) == (120, 30)
            assert usage["cost_usd"] > 0
        assert client.post(f"/api/v1/study-meetings/{meeting_id}/suggestions/{live_hint.json()['id']}/report",
                           json={"reason": "Chưa hợp với vai trò"}).status_code == 200
        assert all(s["id"] != live_hint.json()["id"] for s in client.get(f"/api/v1/study-meetings/{meeting_id}").json()["suggestions"])
        as_user(102)
        assert client.get(f"/api/v1/study-meetings/{meeting_id}").json()["suggestions"] == []
        as_user(101)
        proposed = client.put(f"/api/v1/study-meetings/{meeting_id}/timeline", json={
            "expected_version": 1, "goal": "Làm thêm bài SQL JOIN",
            "starts_at": start.isoformat(), "ends_at": end.isoformat(),
            "segments": segments,
        })
        assert proposed.status_code == 409
        assert "15 phút" in proposed.text
        refreshed = client.get(f"/api/v1/study-meetings/{meeting_id}").json()
        assert refreshed["goal"] == "Tự giải bài SQL JOIN"
        emit_due_reminders()
        emit_due_reminders()
        with database() as db:
            rows = db.execute("SELECT meeting_id,user_id,kind,COUNT(*) AS n FROM facilitated_reminders GROUP BY meeting_id,user_id,kind").fetchall()
            assert all(row["n"] == 1 for row in rows)
        cancelled = client.post(f"/api/v1/study-meetings/{meeting_id}/cancel", json={"message": "Hôm nay mình không tiếp tục được, mình hẹn lại nhé."})
        assert cancelled.status_code == 200
        assert cancelled.json()["status"] == "CANCELLED"
        assert cancelled.json()["messages"][-1]["content"].startswith("Hôm nay")
    finally:
        app.dependency_overrides.pop(current_user, None)
        get_settings.cache_clear()
