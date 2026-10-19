import json
from datetime import timedelta
from pathlib import Path

import pytest
from app.agents.plan_coach.llm import TemplateLLM
from app.db import database
from test_plans_api import flow as flow
from test_plans_api import headers, read


def create_workplace(flow, study_days):
    client, service, _, ctx = flow
    service.settings.catalog_path = str(Path(__file__).resolve().parents[1] / "data/concepts/plan_catalog.json")
    service.llm_factory = lambda context, _: TemplateLLM(context)
    monday = ctx.planning_start.date() - timedelta(days=ctx.planning_start.weekday())
    dates = [ctx.planning_start.date() + timedelta(days=d) for d in study_days]
    weeks = {}
    for day in dates:
        start = day - timedelta(days=day.weekday())
        weeks.setdefault(start, []).append(day.weekday())
    if not weeks:
        weeks[monday] = []
    payload = {
        "pair_id": 1, "goal": "Giao tiếp tiếng Anh trong công việc",
        "target_date": (ctx.planning_start + timedelta(days=60)).isoformat(),
        "learner_tier": "NEWBIE", "days": [], "recurring": False,
        "weeks": [{"start_date": start.isoformat(), "days": days, "complete": True} for start, days in weeks.items()],
    }
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json=payload)
    assert response.status_code == 201, response.text
    return client, dates


@pytest.mark.parametrize("days", [[], [1, 2], list(range(1, 9))])
def test_all_lessons_exist_even_when_calendar_is_partial(flow, days):
    client, dates = create_workplace(flow, days)
    view = read(client)
    lessons = view["plan"]["items"] + view["plan"]["deferred_items"]
    assert len(lessons) == 8
    dated = [i for i in lessons if i["planned_date"]]
    undated = [i for i in lessons if not i["planned_date"]]
    assert len(dated) == len(days)
    assert [i["planned_date"] for i in dated] == [d.isoformat() for d in dates]
    assert len(undated) == 8 - len(days)
    assert all(i["defer_reason"] == "NO_STUDY_DATE" for i in undated)
    assert all(i["defer_reason"] == "AWAITING_TIME" for i in dated)
    assert all(i["scheduled_start"] is None for i in lessons)
    assert not view["can_expand_lessons"]


def test_expansion_keeps_existing_lesson_identity_and_peer_plan_private(flow):
    client, _ = create_workplace(flow, [1, 2])
    before = read(client)
    first_id = before["plan"]["deferred_items"][0]["id"]
    with database() as db:
        row = db.execute("SELECT id,payload FROM pb_plans WHERE user_id=101 AND status='ACTIVE'").fetchone()
        stored = json.loads(row["payload"])
        stored["deferred_items"] = stored["deferred_items"][:1]
        db.execute("UPDATE pb_plans SET payload=? WHERE id=?", (json.dumps(stored), row["id"]))
    assert read(client)["can_expand_lessons"]
    response = client.post("/api/v1/plans/1/expand-lessons", headers=headers(), json={"expected_version": 1})
    assert response.status_code == 200, response.text
    view = read(client)
    assert view["plan"]["plan_version"] == 2
    assert len(view["plan"]["deferred_items"]) == 8
    assert view["plan"]["deferred_items"][0]["id"] == first_id
    assert sum(bool(i["planned_date"]) for i in view["plan"]["deferred_items"]) == 2
    assert read(client, 102)["plan"] is None
    repeated = client.post("/api/v1/plans/1/expand-lessons", headers=headers(), json={"expected_version": 2})
    assert repeated.status_code == 200 and read(client)["plan"]["plan_version"] == 2


def test_edit_time_respects_order_between_lessons_of_the_same_topic(flow):
    client, dates = create_workplace(flow, [1, 2])
    lessons = read(client)["plan"]["deferred_items"]
    invalid = client.patch(f"/api/v1/plans/1/items/{lessons[1]['id']}/schedule", headers=headers(), json={
        "expected_version": 1, "scheduled_start": dates[0].isoformat() + "T20:00:00+07:00", "minutes": 45,
    })
    assert invalid.status_code == 422 and "PREREQUISITE" in invalid.text
    valid = client.patch(f"/api/v1/plans/1/items/{lessons[1]['id']}/schedule", headers=headers(), json={
        "expected_version": 1, "scheduled_start": dates[1].isoformat() + "T20:00:00+07:00", "minutes": 45,
    })
    assert valid.status_code == 200, valid.text
    after = read(client)["plan"]
    assert len(after["items"]) == 1 and len(after["deferred_items"]) == 7
