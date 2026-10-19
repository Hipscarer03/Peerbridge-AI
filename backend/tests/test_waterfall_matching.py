from app.services.matching_config import (
    TIER_1_GOLDEN,
    TIER_2_PEER,
    TIER_3_DISCIPLINE,
)
from app.services.matching_engine import (
    calculate_concept_score,
    calculate_style_score,
    determine_deadline_level,
    extract_learning_style,
    find_top_matches,
)


def make_profile(
    user_id: int,
    *,
    bio: str = "",
    needs: list[str] | None = None,
    offers: list[str] | None = None,
    goals: list[str] | None = None,
    interests: list[str] | None = None,
    subjects: list[str] | None = None,
    retention_rate: float = 0.0,
) -> dict:
    return {
        "profile": {
            "user_id": user_id,
            "bio": bio,
            "learning_goals": goals or [],
            "interests": interests or [],
            "subjects": subjects or [],
        },
        "needs_help_with": [{"topic": topic} for topic in needs or []],
        "can_help_with": [{"topic": topic} for topic in offers or []],
        "availability": [],
        "retention_rate": retention_rate,
    }


def test_tier_1_golden_match_two_way_swap() -> None:
    # A needs Python, offers English
    requester = make_profile(1, needs=["Python"], offers=["English"])
    # B needs English, offers Python
    candidate = make_profile(2, needs=["English"], offers=["Python"])

    score, tier = calculate_concept_score(requester, candidate)
    assert tier == TIER_1_GOLDEN
    assert score == 1.0

    matches = find_top_matches(requester, [candidate])
    assert len(matches) == 1
    assert matches[0]["match_tier"] == TIER_1_GOLDEN
    assert "bù trừ" in matches[0]["match_badge"].lower()


def test_tier_2_peer_match_shared_study_topic() -> None:
    # Both need to study Python together
    requester = make_profile(1, needs=["Python"], bio="Học đều đặn mỗi ngày, im lặng tập trung")
    candidate = make_profile(2, needs=["Python"], bio="Học đều đặn mỗi ngày, yên tĩnh")

    score, tier = calculate_concept_score(requester, candidate)
    assert tier == TIER_2_PEER
    assert score >= 0.7

    matches = find_top_matches(requester, [candidate])
    assert len(matches) == 1
    assert matches[0]["match_tier"] == TIER_2_PEER
    assert "cùng cày" in matches[0]["match_badge"].lower()


def test_tier_3_discipline_match_different_topics_same_deadline() -> None:
    # A studies Machine Learning, B studies Marketing, both have urgent deadline
    requester = make_profile(1, needs=["Machine Learning"], bio="Học tập trung im lặng, đều đặn mỗi ngày", goals=["Thi gấp trong tuần tới"])
    candidate = make_profile(2, needs=["Marketing"], bio="Học tập trung im lặng, đều đặn mỗi ngày", goals=["Chạy deadline cấp tốc trong 10 ngày"])

    score, tier = calculate_concept_score(requester, candidate)
    assert tier == TIER_3_DISCIPLINE
    assert score == 0.0

    style = calculate_style_score(requester, candidate)
    assert style >= 0.50

    matches = find_top_matches(requester, [candidate])
    assert len(matches) == 1
    assert matches[0]["match_tier"] == TIER_3_DISCIPLINE
    assert "kỷ luật" in matches[0]["match_badge"].lower()


def test_learning_style_reads_explicit_choices_and_ignores_bio() -> None:
    bundle = make_profile(
        1,
        bio="Mình thích im lặng tập trung, học đều đặn mỗi ngày, thích giải thích và kèm bạn",
    )
    assert extract_learning_style(bundle)["role"] == ("unknown", 0.0)
    bundle["profile"]["learning_style"] = {
        "Vai trò khi học": "Thích giải thích",
        "Nhịp học": "Học đều mỗi ngày",
        "Môi trường học": "Im lặng, tập trung",
    }
    style = extract_learning_style(bundle)
    assert style["role"][0] == "giai_thich"
    assert style["pace"][0] == "deu_dan"
    assert style["environment"][0] == "im_lang"


def test_deadline_level_classification() -> None:
    assert determine_deadline_level(make_profile(1, goals=["Ôn thi gấp trong tuần"])) == "gap"
    assert determine_deadline_level(make_profile(1, goals=["Học nền tảng dài hạn"])) == "dai"
    assert determine_deadline_level(make_profile(1, goals=["Học trong 1 tháng"])) == "vua"


def test_retention_bonus_applied_for_good_history() -> None:
    requester = make_profile(1, needs=["Python"])
    candidate_lo = make_profile(2, offers=["Python"], retention_rate=0.1)
    candidate_hi = make_profile(3, offers=["Python"], retention_rate=0.5)

    matches = find_top_matches(requester, [candidate_lo, candidate_hi])
    score_lo = next(m["total_score"] for m in matches if m["candidate_id"] == 2)
    score_hi = next(m["total_score"] for m in matches if m["candidate_id"] == 3)
    # Candidate with retention >= 0.3 gets +0.05 bonus (+5.0 total_score)
    assert score_hi > score_lo
