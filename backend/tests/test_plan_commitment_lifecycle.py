"""Initial pair commitment and per-session agreement have separate lifetimes."""

from app.db import database
from test_plans_api import flow as flow
from test_plans_api import generate, headers, read


def _commit_both(client):
    for user_id in (101, 102):
        response = client.post("/api/v1/plans/1/commit", headers=headers(user_id))
        assert response.status_code == 200, response.text


def test_initial_commitment_survives_plan_version_change(flow):
    client, _, _, _ = flow
    generate(flow)
    _commit_both(client)

    added = client.post("/api/v1/plans/1/items", headers=headers(101), json={
        "expected_version": 1,
        "action": "Ôn thêm một buổi SQL JOIN",
        "expected_output": "Một bài SQL JOIN đã giải",
        "minutes": 45,
    })
    assert added.status_code == 201, added.text
    assert read(client)["plan"]["plan_version"] == 2

    for user_id in (101, 102):
        response = client.get("/api/v1/plans/1/commitments", headers=headers(user_id))
        assert response.status_code == 200, response.text
        assert response.json() == {"mine": True, "partner": True, "both": True}

    partner_lesson = read(client, 102)["plan"]["items"][0]
    together = client.put(f"/api/v1/plans/1/items/{partner_lesson['id']}/together", headers=headers(101), json={"enabled": True})
    assert together.status_code == 200, together.text

    with database() as db:
        assert db.execute("SELECT COUNT(*) FROM pb_plan_commits WHERE pair_id=1").fetchone()[0] == 2


def test_joining_solo_meeting_requires_explicit_goal_and_timeline_agreement(flow):
    client, _, _, _ = flow
    generate(flow)
    _commit_both(client)
    lesson = read(client)["plan"]["items"][0]
    created = client.post("/api/v1/study-meetings", headers=headers(101), json={
        "client_key": "solo-to-together-commitment",
        "peer_match_id": 1,
        "plan_item_id": lesson["id"],
        "goal": "Giải một bài SQL JOIN",
        "mode": "solo",
        "starts_at": lesson["scheduled_start"],
        "ends_at": lesson["scheduled_end"],
        "source_text": "Thực hành SQL JOIN",
        "segments": [{"title": "Thực hành SQL JOIN", "minutes": 15}],
    })
    assert created.status_code == 201, created.text
    meeting_id = created.json()["id"]

    invited = client.post(f"/api/v1/study-meetings/{meeting_id}/participation", headers=headers(101), json={"action": "invite"})
    assert invited.status_code == 200, invited.text
    accepted = client.post(f"/api/v1/study-meetings/{meeting_id}/participation", headers=headers(102), json={"action": "accept"})
    assert accepted.status_code == 200, accepted.text
    assert accepted.json()["pending_version"] == accepted.json()["active_version"] == 1
    assert {row["user_id"] for row in accepted.json()["confirmations"] if row["version"] == 1} == {101}

    before = client.post(f"/api/v1/study-meetings/{meeting_id}/join", headers=headers(102))
    assert before.status_code == 409
    assert "mục tiêu và timeline" in before.text

    confirmed = client.post(f"/api/v1/study-meetings/{meeting_id}/timeline/1/confirm", headers=headers(102))
    assert confirmed.status_code == 200, confirmed.text
    assert confirmed.json()["pending_version"] is None
    assert {row["user_id"] for row in confirmed.json()["confirmations"] if row["version"] == 1} == {101, 102}
