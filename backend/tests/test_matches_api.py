import json
import os
import tempfile
from pathlib import Path
from uuid import uuid4

os.environ.setdefault("DATABASE_PATH", str(Path(tempfile.gettempdir()) / f"peerbridge-matches-{uuid4().hex}.db"))
os.environ.setdefault("UPLOAD_DIRECTORY", str(Path(tempfile.gettempdir()) / f"peerbridge-uploads-{uuid4().hex}"))
os.environ.setdefault("JWT_SECRET", "test-secret")

from app.config import get_settings
from app.db import database, utc_now
from app.main import app
<<<<<<< HEAD
from app.security import create_token
from app.services.matching_config import (
    FEATURE_AVAILABILITY_OVERLAP,
    FEATURE_CONCEPT_SCORE,
    FEATURE_GOAL_SCORE,
    FEATURE_PREFERENCE_COMPATIBILITY,
    FEATURE_SKILL_COMPLEMENTARITY,
    FEATURE_STYLE_SCORE,
=======
from app.services.matching_config import (
    FEATURE_AVAILABILITY_OVERLAP,
    FEATURE_PREFERENCE_COMPATIBILITY,
    FEATURE_SKILL_COMPLEMENTARITY,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    FEATURE_TOPIC_COMPATIBILITY,
)
from fastapi.testclient import TestClient


def register_user(client: TestClient, display_name: str) -> tuple[dict[str, str], int]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{display_name.lower()}-{uuid4().hex}@example.edu",
            "password": "password123",
            "display_name": display_name,
            "age": 22,
            "city": "Ha Noi",
            "intent": "conversation",
        },
    )
    assert response.status_code == 201
    data = response.json()
<<<<<<< HEAD
    client.cookies.clear()
    return {"Authorization": f"Bearer {create_token(data['user_id'])}"}, int(data["user_id"])
=======
    return {"Authorization": f"Bearer {data['access_token']}"}, int(data["user_id"])
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def peerbridge_payload(display_name: str, *, needs: list[str] | None = None, offers: list[str] | None = None) -> dict:
    return {
        "profile": {
            "display_name": display_name,
            "bio": "Peer learning profile",
            "school": "Open University",
            "major": "Computer Science",
            "subjects": [],
            "learning_goals": [],
        },
        "needs_help_with": [{"topic": topic} for topic in needs or []],
        "can_help_with": [{"topic": topic, "max_sessions_per_week": 3} for topic in offers or []],
        "availability": [],
    }


def update_peerbridge_profile(client: TestClient, headers: dict[str, str], payload: dict) -> None:
    response = client.put("/api/v1/profiles/me", headers=headers, json=payload)
    assert response.status_code == 200


def insert_candidate_profiles(topic: str, count: int) -> list[int]:
    user_ids: list[int] = []
    with database() as connection:
        for index in range(count):
            now = utc_now()
            cursor = connection.execute(
                """INSERT INTO users(email, role, password_hash, created_at)
                   VALUES (?, 'STUDENT', ?, ?)""",
                (f"candidate-{uuid4().hex}@example.edu", "not-used", now),
            )
            user_id = int(cursor.lastrowid)
            connection.execute(
                """INSERT INTO profiles(
                    user_id, display_name, age, city, school, major, intent, interests, available_times, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_id,
                    f"Candidate {index}",
                    22,
                    "Ha Noi",
                    f"Candidate School {index}",
                    f"Candidate Major {index}",
                    "conversation",
                    "[]",
                    "[]",
                    now,
                ),
            )
            connection.execute(
                """INSERT INTO help_offers(
                    profile_user_id, topic, description, proficiency_level, max_sessions_per_week, created_at, updated_at
                ) VALUES (?, ?, '', '', 3, ?, ?)""",
                (user_id, topic, now, now),
            )
            user_ids.append(user_id)
    return user_ids


<<<<<<< HEAD
def test_search_matches_persists_ranked_pool_and_is_owner_scoped() -> None:
=======
def test_search_matches_persists_candidates_can_be_loaded_and_is_owner_scoped() -> None:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    get_settings.cache_clear()
    topic = f"matching topic {uuid4().hex}"
    with TestClient(app) as client:
        requester_headers, requester_id = register_user(client, "Requester")
        update_peerbridge_profile(client, requester_headers, peerbridge_payload("Requester", needs=[topic]))
        helper_ids = insert_candidate_profiles(topic, 6)

        response = client.post("/api/v1/matches/search", headers=requester_headers)
        assert response.status_code == 201
        data = response.json()

        reloaded = client.get(f"/api/v1/matches/{data['request_id']}", headers=requester_headers)
        assert reloaded.status_code == 200

        other_headers, _ = register_user(client, "Other")
        forbidden = client.get(f"/api/v1/matches/{data['request_id']}", headers=other_headers)
        assert forbidden.status_code == 404

        assert reloaded.json() == data
        assert data["request_id"] > 0
<<<<<<< HEAD
        candidate_ids = [candidate["candidate_id"] for candidate in data["candidates"]]
        assert candidate_ids[:len(helper_ids)] == helper_ids
        assert len(candidate_ids) >= len(helper_ids)
        assert [candidate["rank"] for candidate in data["candidates"]] == list(range(1, len(data["candidates"]) + 1))
=======
        assert [candidate["candidate_id"] for candidate in data["candidates"]] == helper_ids
        assert [candidate["rank"] for candidate in data["candidates"]] == [1, 2, 3, 4, 5, 6]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        assert data["candidates"][0]["display_name"] == "Candidate 0"
        assert data["candidates"][0]["school"] == "Candidate School 0"
        assert data["candidates"][0]["major"] == "Candidate Major 0"
        for candidate in data["candidates"]:
            assert candidate["request_id"] == data["request_id"]
            assert 0 <= candidate["total_score"] <= 100
            assert "email" not in candidate
<<<<<<< HEAD
            assert {
                FEATURE_CONCEPT_SCORE,
                FEATURE_STYLE_SCORE,
                FEATURE_GOAL_SCORE,
=======
            assert set(candidate["component_scores"]) == {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                FEATURE_SKILL_COMPLEMENTARITY,
                FEATURE_TOPIC_COMPATIBILITY,
                FEATURE_AVAILABILITY_OVERLAP,
                FEATURE_PREFERENCE_COMPATIBILITY,
<<<<<<< HEAD
            }.issubset(set(candidate["component_scores"]))
            assert "match_tier" in candidate
            assert "match_badge" in candidate
            assert "deadline_level" in candidate
=======
            }
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

    with database() as connection:
        request = connection.execute(
            "SELECT requester_id FROM match_requests WHERE id = ?",
            (data["request_id"],),
        ).fetchone()
        candidates = connection.execute(
            "SELECT candidate_id, component_scores, rank FROM match_candidates WHERE request_id = ? ORDER BY rank",
            (data["request_id"],),
        ).fetchall()

    assert request["requester_id"] == requester_id
<<<<<<< HEAD
    assert [candidate["candidate_id"] for candidate in candidates] == candidate_ids
    assert [candidate["rank"] for candidate in candidates] == list(range(1, len(candidates) + 1))
=======
    assert [candidate["candidate_id"] for candidate in candidates] == helper_ids
    assert [candidate["rank"] for candidate in candidates] == [1, 2, 3, 4, 5, 6]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    assert FEATURE_SKILL_COMPLEMENTARITY in json.loads(candidates[0]["component_scores"])


def test_search_matches_requires_authentication() -> None:
    get_settings.cache_clear()
    with TestClient(app) as client:
        response = client.post("/api/v1/matches/search")

    assert response.status_code == 401
<<<<<<< HEAD


def test_match_suggestions_label_seed_users_and_both_candidate_types_receive_invitations() -> None:
    get_settings.cache_clear()
    topic = f"connection compatibility {uuid4().hex}"
    with TestClient(app) as client:
        headers, requester_id = register_user(client, "ConnectionRequester")
        update_peerbridge_profile(client, headers, peerbridge_payload("ConnectionRequester", needs=[topic]))
        seed_id, real_id = insert_candidate_profiles(topic, 2)
        with database() as connection:
            connection.execute("UPDATE users SET is_seed=1 WHERE id=?", (seed_id,))

        for suffix in ("", "?expanded=true"):
            response = client.post(f"/api/v1/matches/search{suffix}", headers=headers)
            assert response.status_code == 201
            candidates = {candidate["candidate_id"]: candidate for candidate in response.json()["candidates"]}
            ids = set(candidates)
            assert seed_id in ids
            assert real_id in ids
            assert candidates[seed_id]["is_seed"] is True
            assert candidates[real_id]["is_seed"] is False

        seed_request = client.post("/api/v1/connections", headers=headers, json={"recipient_id": seed_id})
        assert seed_request.status_code == 201
        assert seed_request.json()["status"] == "PENDING"
        with database() as connection:
            assert connection.execute(
                "SELECT COUNT(*) FROM connection_requests WHERE requester_id=? AND recipient_id=?",
                (requester_id, seed_id),
            ).fetchone()[0] == 1

        real_request = client.post("/api/v1/connections", headers=headers, json={"recipient_id": real_id})
        assert real_request.status_code == 201
        assert real_request.json()["status"] == "PENDING"
        sent = client.get("/api/v1/connections", headers=headers)
        assert sent.status_code == 200
        assert real_request.json()["id"] in {item["id"] for item in sent.json()["sent"]}
        assert seed_request.json()["id"] in {item["id"] for item in sent.json()["sent"]}
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
