"""A new goal gets a private, stable curriculum without changing the shared catalog."""

import json
from datetime import timedelta
from pathlib import Path

from app.agents.plan_coach.llm import TemplateLLM
from app.db import database
from test_plans_api import flow as flow
from test_plans_api import headers, read


def test_unknown_goal_creates_private_draft_and_reuses_it(flow):
    client, service, _, ctx = flow
    service.settings.catalog_path = str(Path(__file__).resolve().parents[1] / "data/concepts/plan_catalog.json")
    service.llm_factory = lambda context, _: TemplateLLM(context)
    payload = {
        "pair_id": 1, "goal": "Học làm gốm thủ công",
        "target_date": (ctx.planning_start + timedelta(days=21)).isoformat(),
        "learner_tier": "NEWBIE", "days": [0, 2, 4],
        "recurring": True, "calendar_complete": True, "weeks": [],
    }
    created = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert created.status_code == 201, created.text
    view = read(client)
    items = view["plan"]["items"] + view["plan"]["deferred_items"]
    assert items and all(item["concept_id"].startswith("draft.") for item in items)
    assert any("gốm" in item["action"] for item in items)
    assert view["catalog_source"] == "team+private-template"
    assert read(client, 102)["plan"] is None
    with database() as db:
        row = db.execute("SELECT * FROM pb_concept_drafts WHERE pair_id=1 AND user_id=101").fetchone()
        assert row["plan_id"] == created.json()["plan_ids"]["101"]
        assert [concept["id"] for concept in json.loads(row["payload"])] == list(dict.fromkeys(item["concept_id"] for item in items))
        assert db.execute("SELECT COUNT(*) FROM pb_concept_drafts").fetchone()[0] == 1
    retry = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert retry.status_code == 201 and retry.json() == created.json()


def test_ai_draft_is_validated_and_uses_server_owned_ids(flow, monkeypatch):
    client, service, _, ctx = flow
    service.settings.catalog_path = str(Path(__file__).resolve().parents[1] / "data/concepts/plan_catalog.json")
    service.settings.llm_provider = "openai_compatible"
    service.llm_factory = lambda context, _: TemplateLLM(context)

    class CurriculumLLM:
        def __init__(self, settings):
            pass

        async def complete_json(self, system, user):
            return {"steps": [{"title": "Nặn gốm", "lessons": [{
                "action": "Nặn một chiếc cốc nhỏ bằng đất sét", "expected_output": "Chiếc cốc đã tạo hình", "est_minutes": 45,
            }]}]}

    monkeypatch.setattr("app.services.concept_expansion.CompatibleLLM", CurriculumLLM)
    payload = {
        "pair_id": 1, "goal": "Học làm gốm thủ công",
        "target_date": (ctx.planning_start + timedelta(days=21)).isoformat(),
        "learner_tier": "NEWBIE", "days": [0, 2, 4], "recurring": True,
    }
    created = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert created.status_code == 201, created.text
    view = read(client)
    items = view["plan"]["items"] + view["plan"]["deferred_items"]
    assert len(items) == 1 and items[0]["action"] == "Nặn một chiếc cốc nhỏ bằng đất sét"
    assert items[0]["concept_id"].startswith("draft.")
    with database() as db:
        row = db.execute("SELECT source,payload FROM pb_concept_drafts WHERE user_id=101").fetchone()
        assert row["source"] == "ai"
        assert json.loads(row["payload"])[0]["id"] == items[0]["concept_id"]
