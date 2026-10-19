from datetime import timedelta

from test_plans_api import flow as flow
from test_plans_api import headers, read


def test_personal_input_is_private_and_generation_does_not_overwrite_peer(flow):
    client, _, _, ctx = flow
    for uid in (101, 102):
        setup = client.get("/api/v1/plans/1/setup", headers=headers(uid)).json()
        assert [m["user_id"] for m in setup["members"]] == [uid]
    body = {"pair_id": 1, "goal": "Học Python cơ bản", "target_date": (ctx.planning_start + timedelta(days=20)).isoformat(), "learner_tier": "NEWBIE", "days": [0, 2], "start_time": None, "end_time": None}
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json=body)
    assert response.status_code == 201, response.text
    assert set(response.json()["plan_ids"]) == {"101"}
    original = read(client)["plan"]
    assert original["items"] == [] and original["deferred_items"]
    assert read(client, 102)["plan"] is None
    response = client.post("/api/v1/plans/generate-personal", headers=headers(102, "peer-input"), json={**body, "goal": "Học SQL cơ bản", "learner_tier": "REFRESHER"})
    assert response.status_code == 201, response.text
    assert set(response.json()["plan_ids"]) == {"102"}
    assert read(client)["plan"] == original
    assert read(client)["partner"]["items"]
    retry = client.post("/api/v1/plans/generate-personal", headers=headers(), json=body)
    assert retry.status_code == 201 and set(retry.json()["plan_ids"]) == {"101"}


def test_new_subject_and_invalid_days_never_default_to_sql(flow):
    client, _, _, ctx = flow
    body = {"pair_id": 1, "goal": "Học thuật toán", "target_date": (ctx.planning_start + timedelta(days=20)).isoformat(), "learner_tier": "NEWBIE", "days": []}
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json=body)
    assert response.status_code == 201, response.text
    plan = read(client)["plan"]
    items = plan["items"] + plan["deferred_items"]
    assert items and all(not item["concept_id"].startswith("sql.") for item in items)
    assert any("thuật toán" in item["action"] for item in items)
    response = client.post("/api/v1/plans/generate-personal", headers=headers(), json={**body, "goal": "Học Python", "days": [8]})
    assert response.status_code == 422
    assert read(client)["plan"] == plan
