from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
from app.agents.plan_coach.llm import TemplateLLM
from app.onboarding.retrieval import LocalConceptRetriever, infer_domain
from test_plans_api import flow as flow
from test_plans_api import headers, read


@pytest.mark.parametrize("topic", ["Business analysis", "Phân tích nghiệp vụ", "BA cơ bản", "Business analyst"])
def test_business_analysis_aliases_resolve_to_the_same_topic(topic):
    assert infer_domain(topic) == "business"
    candidates = LocalConceptRetriever().retrieve(topic, "business")
    assert candidates[0].concept_id == "business.analysis"
    assert candidates[0].score >= 0.75


def test_business_analysis_api_with_the_reported_weekly_input(flow):
    client, service, clock, _ = flow
    clock[0] = datetime(2026, 10, 14, 9, tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
    service.settings.catalog_path = str(Path(__file__).resolve().parents[1] / "data/concepts/plan_catalog.json")
    service.llm_factory = lambda context, _: TemplateLLM(context)
    payload = {
        "pair_id": 1, "goal": "Muốn học Business analysis trong 1 tháng",
        "target_date": "2026-11-13T23:59:59+07:00", "learner_tier": "NEWBIE",
        "recurring": False, "days": [], "calendar_complete": False,
        "weeks": [
            {"start_date": "2026-10-12", "days": [5, 6], "complete": False},
            {"start_date": "2026-10-19", "days": [3, 4], "complete": False},
        ],
    }
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert response.status_code == 201, response.text
    view = read(client)
    lessons = view["plan"]["deferred_items"]
    assert len(lessons) == 8
    assert all(i["concept_id"] == "business.analysis" for i in lessons)
    assert [i["planned_date"] for i in lessons[:4]] == ["2026-10-17", "2026-10-18", "2026-10-22", "2026-10-23"]
    assert all(i["planned_date"] is None and i["defer_reason"] == "NO_STUDY_DATE" for i in lessons[4:])
    assert all(i["scheduled_start"] is None for i in lessons)
    assert view["calendar"]["buffer_dates"] == []
