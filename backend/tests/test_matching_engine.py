<<<<<<< HEAD
import json
from pathlib import Path

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from app.services.matching_config import (
    FEATURE_AVAILABILITY_OVERLAP,
    FEATURE_SKILL_COMPLEMENTARITY,
    FEATURE_TOPIC_COMPATIBILITY,
)
from app.services.matching_engine import (
    calculate_availability_overlap,
    calculate_skill_complementarity,
    find_top_matches,
)


def profile_bundle(
    user_id: int,
    *,
    needs: list[str] | None = None,
    offers: list[str] | None = None,
    availability: list[dict] | None = None,
    subjects: list[str] | None = None,
    learning_goals: list[str] | None = None,
) -> dict:
    return {
        "profile": {
            "user_id": user_id,
            "subjects": subjects or [],
            "learning_goals": learning_goals or [],
        },
        "needs_help_with": [{"topic": topic} for topic in needs or []],
        "can_help_with": [{"topic": topic} for topic in offers or []],
        "availability": availability or [],
    }


def window(day_of_week: int, start_time: str, end_time: str, timezone: str = "Asia/Bangkok") -> dict:
    return {
        "day_of_week": day_of_week,
        "start_time": start_time,
        "end_time": end_time,
        "timezone": timezone,
    }


def test_self_candidate_is_filtered_out() -> None:
    requester = profile_bundle(1, needs=["Python"])
    candidates = [
        profile_bundle(1, offers=["Python"]),
        profile_bundle(2, offers=["Python"]),
    ]

    results = find_top_matches(requester, candidates)

    assert [result["candidate_id"] for result in results] == [2]


<<<<<<< HEAD
def test_blocked_and_approved_report_candidates_stay_excluded() -> None:
    requester = profile_bundle(1, needs=["Product"])
    blocked = {**profile_bundle(2), "status": "blocked"}
    reported = {**profile_bundle(3), "is_reported": True}
    eligible = profile_bundle(4, offers=["Calculus"])

    assert [item["candidate_id"] for item in find_top_matches(requester, [blocked, reported, eligible])] == [4]


def test_low_score_candidate_is_still_suggested() -> None:
    requester = profile_bundle(1, needs=["Product"])
    requester["profile"]["matching_goal"] = {"topic": "Product", "deadline_level": "dai"}
    requester["profile"]["learning_style"] = {
        "Vai trò khi học": "Thích giải thích", "Nhịp học": "Học đều mỗi ngày",
        "Phong cách phản hồi": "Thích được hỏi lại, tranh luận",
        "Môi trường học": "Im lặng, tập trung", "Khi gặp khó": "Tự research trước",
    }
    candidate = profile_bundle(2, offers=["Calculus"])
    candidate["profile"]["matching_goal"] = {"topic": "Calculus", "deadline_level": "gap"}
    candidate["profile"]["learning_style"] = {
        "Vai trò khi học": "Thích giải thích", "Nhịp học": "Học dồn theo đợt",
        "Phong cách phản hồi": "Thích tự làm rồi mới hỏi",
        "Môi trường học": "Nói chuyện, trao đổi nhiều", "Khi gặp khó": "Hỏi ngay",
    }

    results = find_top_matches(requester, [candidate])

    assert [item["candidate_id"] for item in results] == [2]
    assert results[0]["match_tier"] == "tier_4_queue"
    assert results[0]["is_uncertain"] is True


def test_product_profile_finds_seed_profiles() -> None:
    seeds = json.loads((Path(__file__).parents[1] / "data/seed_profiles.json").read_text(encoding="utf-8"))
    requester = profile_bundle(1, needs=["Product"], offers=["Phân tích nghiệp vụ"])
    requester["profile"]["matching_goal"] = {"topic": "Product", "duration_days": 150, "deadline_level": "dai"}
    requester["profile"]["learning_style"] = {
        "Vai trò khi học": "Thích nghe", "Nhịp học": "Học đều mỗi ngày",
        "Phong cách phản hồi": "Thích tự làm rồi mới hỏi",
        "Môi trường học": "Im lặng, tập trung", "Khi gặp khó": "Tự research trước",
    }
    candidates = [{
        "profile": {**seed, "user_id": index},
        "needs_help_with": seed["needs_help_with"],
        "can_help_with": seed["can_help_with"],
        "availability": seed["available_times"],
    } for index, seed in enumerate(seeds, 2)]
    ids_by_slug = {seed["slug"]: index for index, seed in enumerate(seeds, 2)}

    results = find_top_matches(requester, candidates)

    assert 8 <= len(results) <= 10
    assert [item["candidate_id"] for item in results[:2]] == [ids_by_slug["khoi_product"], ids_by_slug["yen_product"]]
=======
def test_candidate_without_matching_skill_is_filtered_out() -> None:
    requester = profile_bundle(1, needs=["Python"])
    candidates = [profile_bundle(2, offers=["Calculus"])]

    assert find_top_matches(requester, candidates) == []
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def test_skill_complementarity_is_requester_need_coverage() -> None:
    requester = profile_bundle(1, needs=["Python", "Calculus"])
    candidate = profile_bundle(2, offers=["python", "SQL"])

    assert calculate_skill_complementarity(requester, candidate) == 0.5


def test_availability_overlap_is_normalized_by_smaller_available_window() -> None:
    requester = profile_bundle(1, availability=[window(2, "09:00", "11:00")])
    candidate = profile_bundle(2, availability=[window(2, "10:00", "12:00")])

    assert calculate_availability_overlap(requester, candidate) == 0.5


def test_ranking_uses_weighted_score_and_deterministic_tie_breaking() -> None:
    requester = profile_bundle(
        1,
        needs=["Python", "Calculus"],
        availability=[window(2, "09:00", "11:00")],
        subjects=["Algorithms"],
<<<<<<< HEAD
=======
        learning_goals=["Practice algorithms"],
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    )
    candidates = [
        profile_bundle(4, offers=["Python"], availability=[window(2, "10:00", "11:00")]),
        profile_bundle(
            3,
            offers=["Python", "Calculus"],
            availability=[window(2, "09:00", "11:00")],
            subjects=["Algorithms"],
<<<<<<< HEAD
=======
            learning_goals=["Practice algorithms"],
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        ),
        profile_bundle(
            2,
            offers=["Python", "Calculus"],
            availability=[window(2, "09:00", "11:00")],
            subjects=["Algorithms"],
<<<<<<< HEAD
=======
            learning_goals=["Practice algorithms"],
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        ),
    ]

    results = find_top_matches(requester, candidates)

    assert [result["candidate_id"] for result in results] == [2, 3, 4]
    assert [result["rank"] for result in results] == [1, 2, 3]
    assert results[0]["total_score"] == results[1]["total_score"]
    assert results[1]["total_score"] > results[2]["total_score"]
    assert results[0]["component_scores"][FEATURE_SKILL_COMPLEMENTARITY] == 1.0
    assert results[0]["component_scores"][FEATURE_TOPIC_COMPATIBILITY] == 1.0
    assert results[0]["component_scores"][FEATURE_AVAILABILITY_OVERLAP] == 1.0


def test_same_input_produces_same_result_independent_of_candidate_order() -> None:
    requester = profile_bundle(1, needs=["Python"], availability=[window(1, "09:00", "10:00")])
    candidates = [
        profile_bundle(3, offers=["Python"], availability=[window(1, "09:00", "10:00")]),
        profile_bundle(2, offers=["Python"], availability=[window(1, "09:00", "10:00")]),
    ]

    assert find_top_matches(requester, candidates) == find_top_matches(requester, list(reversed(candidates)))


def test_top_k_limits_ranked_results() -> None:
    requester = profile_bundle(1, needs=["Python"])
    candidates = [
        profile_bundle(2, offers=["Python"], subjects=["A"]),
        profile_bundle(3, offers=["Python"], subjects=["B"]),
        profile_bundle(4, offers=["Python"], subjects=["C"]),
    ]

    results = find_top_matches(requester, candidates, top_k=2)

    assert [result["candidate_id"] for result in results] == [2, 3]
    assert [result["rank"] for result in results] == [1, 2]
