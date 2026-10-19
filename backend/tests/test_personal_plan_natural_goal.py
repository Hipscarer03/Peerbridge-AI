from datetime import timedelta
from pathlib import Path

import pytest
from app.agents.plan_coach.llm import TemplateLLM
from app.onboarding.retrieval import LocalConceptRetriever, infer_domain
from test_plans_api import flow as flow
from test_plans_api import headers, read


@pytest.mark.parametrize("goal", [
    "giao tiếp được tiếng anh trong môi trường công việc trong 2 tháng",
    "Muốn học giao tiếp tiếng Anh trong môi trường công việc trong 8 tuần",
    "Tôi muốn học tiếng Anh để giao tiếp trong công việc",
])
def test_workplace_goal_with_inserted_words(goal):
    assert infer_domain(goal) == "english"
    candidates = LocalConceptRetriever().retrieve(goal, "english")
    assert candidates[0].concept_id == "english.workplace"
    assert candidates[0].score >= 0.75


def test_general_english_goal_does_not_invent_workplace_context():
    candidates = LocalConceptRetriever().retrieve("Giao tiếp tiếng Anh khi mua sắm", "english")
    assert not any(c.concept_id == "english.workplace" and c.score >= 0.75 for c in candidates)


def test_generate_personal_api_accepts_natural_goal_and_preserves_day_only_plan(flow):
    client, service, _, ctx = flow
    service.settings.catalog_path = str(Path(__file__).resolve().parents[1] / "data/concepts/plan_catalog.json")
    service.llm_factory = lambda context, _: TemplateLLM(context)
    goal = "giao tiếp được tiếng anh trong môi trường công việc trong 2 tháng"
    payload = {
        "pair_id": 1, "goal": goal,
        "target_date": (ctx.planning_start + timedelta(days=60)).isoformat(),
        "learner_tier": "TRANSFER", "days": [2, 3, 4, 5, 6],
        "recurring": True, "calendar_complete": True, "weeks": [],
    }
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert response.status_code == 201, response.text
    view = read(client)
    assert view["goal"] == goal
    items = view["plan"]["deferred_items"]
    assert len(items) == 8 and all(i["concept_id"] == "english.workplace" for i in items)
    assert [i["session_index"] for i in items] == list(range(1, 9))
    assert len({i["action"] for i in items}) == 8
    assert [i["planned_date"] for i in items] == sorted(i["planned_date"] for i in items)
    assert items[0]["planned_date"] in view["calendar"]["study_dates"]
    assert items[0]["planned_date"] not in view["calendar"]["buffer_dates"]
    assert items[0]["defer_reason"] == "AWAITING_TIME"
    assert items[0]["scheduled_start"] is None and items[0]["scheduled_end"] is None
    assert read(client, 102)["plan"] is None
    retry = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert retry.status_code == 201 and retry.json() == response.json()
