from __future__ import annotations

<<<<<<< HEAD
import heapq
import math
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
import re
import unicodedata
from collections.abc import Iterable, Mapping
from datetime import time
from typing import Any

from .matching_config import (
    DEFAULT_TOP_K,
<<<<<<< HEAD
    EXPANDED_MIN_POOL_SIZE,
    EXPANDED_TOP_K,
    FEATURE_AVAILABILITY_OVERLAP,
    FEATURE_CONCEPT_SCORE,
    FEATURE_GOAL_SCORE,
    FEATURE_PREFERENCE_COMPATIBILITY,
    FEATURE_SKILL_COMPLEMENTARITY,
    FEATURE_STYLE_SCORE,
    FEATURE_TOPIC_COMPATIBILITY,
    MAX_BONUS_DROP,
    MIN_POOL_SIZE,
    MINUTES_PER_HOUR,
    SCORE_DECIMAL_PLACES,
    TIER_1_GOLDEN,
    TIER_2_PEER,
    TIER_3_DISCIPLINE,
    TIER_4_QUEUE,
    TIER_BADGES,
    TIER_WEIGHTS,
    TOTAL_SCORE_MULTIPLIER,
    UNCERTAIN_SCORE_THRESHOLD,
=======
    FEATURE_AVAILABILITY_OVERLAP,
    FEATURE_PREFERENCE_COMPATIBILITY,
    FEATURE_SKILL_COMPLEMENTARITY,
    FEATURE_TOPIC_COMPATIBILITY,
    MATCHING_WEIGHTS,
    MINUTES_PER_HOUR,
    SCORE_DECIMAL_PLACES,
    TOTAL_SCORE_MULTIPLIER,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
)

ProfileBundle = Mapping[str, Any]
ComponentScores = dict[str, float]
MatchCandidateResult = dict[str, Any]
AvailabilityInterval = tuple[int, str, int, int]


<<<<<<< HEAD
def pool_result_limit(pool_size: int, expanded: bool = False) -> int:
    """Return 8–10 initial suggestions, or up to 20 when the user expands."""
    if pool_size <= 0:
        return 0
    if expanded:
        return min(pool_size, EXPANDED_TOP_K, max(EXPANDED_MIN_POOL_SIZE, math.ceil(pool_size / 2)))
    return min(pool_size, DEFAULT_TOP_K, max(MIN_POOL_SIZE, math.ceil(pool_size / 5)))


def find_top_matches(requester: ProfileBundle, candidates: Iterable[ProfileBundle],
                     top_k: int | None = None, expanded: bool = False) -> list[MatchCandidateResult]:
    """Pure-code ranking. K is derived from the eligible pool."""
    if top_k is not None and top_k <= 0:
        return []
    valid = [candidate for candidate in candidates if passes_hard_filters(requester, candidate)]
    k = pool_result_limit(len(valid), expanded=expanded) if top_k is None else min(top_k, len(valid))
    tier_order = {TIER_1_GOLDEN: 1, TIER_2_PEER: 2, TIER_3_DISCIPLINE: 3, TIER_4_QUEUE: 4}
    def rank_key(item):
        return (tier_order.get(item["match_tier"], 5), -item["total_score"],
                -item["component_scores"][FEATURE_STYLE_SCORE], item["candidate_id"])
    ranked = heapq.nsmallest(k, (_score_candidate(requester, candidate) for candidate in valid), key=rank_key)
    return [{**item, "rank": rank, "is_uncertain": item["total_score"] < 50}
            for rank, item in enumerate(ranked, 1)]
=======
def find_top_matches(
    requester: ProfileBundle,
    candidates: Iterable[ProfileBundle],
    top_k: int = DEFAULT_TOP_K,
) -> list[MatchCandidateResult]:
    if top_k <= 0:
        return []

    scored_candidates = [
        _score_candidate(requester, candidate)
        for candidate in load_candidates(candidates)
        if passes_hard_filters(requester, candidate)
    ]
    ranked_candidates = sorted(
        scored_candidates,
        key=lambda item: (
            -item["total_score"],
            -item["component_scores"][FEATURE_SKILL_COMPLEMENTARITY],
            -item["component_scores"][FEATURE_AVAILABILITY_OVERLAP],
            item["candidate_id"],
        ),
    )

    return [
        {
            **candidate,
            "rank": rank,
        }
        for rank, candidate in enumerate(ranked_candidates[:top_k], start=1)
    ]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def load_candidates(candidates: Iterable[ProfileBundle]) -> list[ProfileBundle]:
    return sorted(candidates, key=_user_id)


def passes_hard_filters(requester: ProfileBundle, candidate: ProfileBundle) -> bool:
<<<<<<< HEAD
    """Only safety and identity are hard filters; relevance belongs in ranking."""
    if _user_id(requester) == _user_id(candidate):
        return False
    if candidate.get("is_reported") or candidate.get("status") == "blocked":
        return False
    return True


# ---------------------------------------------------------------------------
# Learning Style Extraction (5 Dimensions - Spec Section 5.1 & 6.2.2)
# ---------------------------------------------------------------------------

def extract_learning_style(bundle: ProfileBundle) -> dict[str, Any]:
    """Read the five explicit learning-style choices; the bio is display-only."""
    profile = _profile(bundle)
    result = {key: ("unknown", 0.0) for key in ("role", "pace", "feedback", "environment", "obstacle")}
    structured = {
        "vai tro khi hoc": ("role", {"thich giai thich": "giai_thich", "thich nghe": "nghe", "can bang": "can_bang"}),
        "nhip hoc": ("pace", {"hoc don theo dot": "don_dap", "hoc deu moi ngay": "deu_dan"}),
        "phong cach phan hoi": ("feedback", {"thich duoc hoi lai, tranh luan": "tranh_luan", "thich tu lam roi moi hoi": "tu_lam", "linh hoat": "linh_hoat"}),
        "moi truong hoc": ("environment", {"im lang, tap trung": "im_lang", "noi chuyen, trao doi nhieu": "trao_doi"}),
        "khi gap kho": ("obstacle", {"tu research truoc": "tu_research", "hoi ngay": "hoi_ngay", "tuy tinh huong": "tuy_tinh_huong"}),
    }
    for label, value in profile.get("learning_style", {}).items():
        spec = structured.get(_normalize_text(label).strip())
        if spec:
            key, options = spec
            selected = options.get(_normalize_text(value).strip())
            if selected:
                result[key] = (selected, 1.0)
    return result


def calculate_style_score(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    """Calculate 5-dimension style compatibility score (0.0 to 1.0).

    Uses confidence as dimension weights per Spec Section 5.1 so ambiguous dimensions
    do not penalize the score.
    """
    style_a = extract_learning_style(requester)
    style_b = extract_learning_style(candidate)

    # 1. Role MatchRule
    role_a, conf_ra = style_a["role"]
    role_b, conf_rb = style_b["role"]
    if (role_a == "giai_thich" and role_b == "nghe") or (role_a == "nghe" and role_b == "giai_thich"):
        role_rule = 1.0
    elif role_a == "can_bang" and role_b == "can_bang":
        role_rule = 0.8
    elif role_a == "can_bang" or role_b == "can_bang":
        role_rule = 0.75
    elif role_a == role_b == "giai_thich":
        role_rule = 0.3
    else:
        role_rule = 0.7
    weight_role = min(conf_ra, conf_rb)
    score_role = role_rule * weight_role

    # 2. Pace MatchRule
    pace_a, conf_pa = style_a["pace"]
    pace_b, conf_pb = style_b["pace"]
    pace_rule = 1.0 if pace_a == pace_b else 0.2
    weight_pace = min(conf_pa, conf_pb)
    score_pace = pace_rule * weight_pace

    # 3. Feedback MatchRule
    fb_a, conf_fa = style_a["feedback"]
    fb_b, conf_fb = style_b["feedback"]
    if fb_a == fb_b == "linh_hoat":
        fb_rule = 0.9
    elif fb_a == fb_b:
        fb_rule = 0.8
    elif "linh_hoat" in (fb_a, fb_b):
        fb_rule = 0.75
    else:
        fb_rule = 0.4
    weight_fb = min(conf_fa, conf_fb)
    score_fb = fb_rule * weight_fb

    # 4. Environment MatchRule
    env_a, conf_ea = style_a["environment"]
    env_b, conf_eb = style_b["environment"]
    env_rule = 1.0 if env_a == env_b else 0.2
    weight_env = min(conf_ea, conf_eb)
    score_env = env_rule * weight_env

    # 5. Obstacle MatchRule
    obs_a, conf_oa = style_a["obstacle"]
    obs_b, conf_ob = style_b["obstacle"]
    obs_rule = 0.8 if obs_a == obs_b else 0.5
    weight_obs = min(conf_oa, conf_ob)
    score_obs = obs_rule * weight_obs

    total_weighted_score = score_role + score_pace + score_fb + score_env + score_obs
    total_weights = weight_role + weight_pace + weight_fb + weight_env + weight_obs
    avg_score = total_weighted_score / total_weights if total_weights > 0 else 0.5
    return _round_score(avg_score)


# ---------------------------------------------------------------------------
# Goal & Deadline Determination (Spec Section 4.2 & 6.2.3)
# ---------------------------------------------------------------------------

def determine_deadline_level(bundle: ProfileBundle) -> str:
    """Classify deadline urgency: 'gap' (<=14d) | 'vua' (15-45d) | 'dai' (>45d)."""
    profile = _profile(bundle)
    stored = profile.get("matching_goal", {}).get("deadline_level")
    if stored in ("gap", "vua", "dai"):
        return stored
    goals = _normalize_text(" ".join(profile.get("learning_goals", [])))
    text = goals

    structured_duration = re.search(r"muon hoc\.?\s+.+?\s+trong\s+([1-9]\d*)\s+(ngay|tuan|thang|nam)", goals)
    if structured_duration:
        days = int(structured_duration[1]) * {"ngay": 1, "tuan": 7, "thang": 30, "nam": 365}[structured_duration[2]]
        return "gap" if days <= 14 else "vua" if days <= 45 else "dai"

    if any(k in text for k in ("gap", "thi", "deadline", "cap toc", "tuan", "sap thi", "khan", "10 ngay")):
        return "gap"
    if any(k in text for k in ("dai han", "nen tang", "nam", "lau dai", "su nghiep")):
        return "dai"
    return "vua"


def calculate_goal_score(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    """GoalScore = 0.6 * TimeframeMatch + 0.4 * TopicSimilarity."""
    level_a = determine_deadline_level(requester)
    level_b = determine_deadline_level(candidate)

    if level_a == level_b:
        timeframe_match = 1.0
    elif (level_a == "vua" and level_b in ("gap", "dai")) or (level_b == "vua" and level_a in ("gap", "dai")):
        timeframe_match = 0.5
    else:
        timeframe_match = 0.1

    topic_sim = goal_similarity(requester, candidate)
    return _round_score(0.6 * timeframe_match + 0.4 * topic_sim)


# ---------------------------------------------------------------------------
# ConceptScore & Waterfall Hierarchy (Spec Section 6.1 & 6.2.1)
# ---------------------------------------------------------------------------

def calculate_concept_score(
    requester: ProfileBundle,
    candidate: ProfileBundle,
) -> tuple[float, str]:
    """Calculate ConceptScore and preliminary Tier based on skill/need overlap.

    Returns: (concept_score, tier_name)
    """
    req_needs = _topic_set(requester, "needs_help_with")
    req_offers = _topic_set(requester, "can_help_with")
    cand_needs = _topic_set(candidate, "needs_help_with")
    cand_offers = _topic_set(candidate, "can_help_with")

    cand_helps_req = req_needs & cand_offers
    req_helps_cand = cand_needs & req_offers

    # Check Two-Way Complementarity (Bậc 1: Golden Match)
    if cand_helps_req and req_helps_cand:
        cov_a = len(cand_helps_req) / len(req_needs) if req_needs else 1.0
        cov_b = len(req_helps_cand) / len(cand_needs) if cand_needs else 1.0
        return _round_score(0.8 + 0.2 * ((cov_a + cov_b) / 2.0)), TIER_1_GOLDEN

    # One-way swap
    if cand_helps_req or req_helps_cand:
        if cand_helps_req and req_needs:
            cov = len(cand_helps_req) / len(req_needs)
        elif req_helps_cand and cand_needs:
            cov = len(req_helps_cand) / len(cand_needs)
        else:
            cov = 0.5
        return _round_score(0.4 + 0.3 * cov), TIER_1_GOLDEN

    # Check Shared Need / Study Buddy (Bậc 2: Peer Match)
    shared_needs = req_needs & cand_needs
    if shared_needs:
        return 0.8, TIER_2_PEER


    # Bậc 3: Different topics (Discipline / Virtual Co-working)
    return 0.0, TIER_3_DISCIPLINE


def determine_match_tier(
    concept_score: float,
    concept_tier: str,
    style_score: float,
    goal_score: float,
) -> tuple[str, str, str]:
    """Determine final Waterfall tier and badge details.

    Returns: (tier_id, badge_text, subtitle_text)
    """
    if concept_tier == TIER_1_GOLDEN and concept_score >= 0.7:
        tier = TIER_1_GOLDEN
    elif concept_tier == TIER_2_PEER or (concept_score > 0 and style_score >= 0.45):
        tier = TIER_2_PEER
    elif style_score >= 0.40 or goal_score >= 0.50:
        tier = TIER_3_DISCIPLINE
    else:
        tier = TIER_4_QUEUE

    badge_info = TIER_BADGES.get(tier, TIER_BADGES[TIER_2_PEER])
    return tier, badge_info["badge"], badge_info["subtitle"]


# ---------------------------------------------------------------------------
# Scoring Pipeline
# ---------------------------------------------------------------------------

def calculate_component_scores(requester: ProfileBundle, candidate: ProfileBundle) -> ComponentScores:
    """Compute component scores including both Waterfall features and legacy fields."""
    concept_score, _ = calculate_concept_score(requester, candidate)
    style_score = calculate_style_score(requester, candidate)
    goal_score = calculate_goal_score(requester, candidate)

    # Legacy fields
    skill_comp = calculate_skill_complementarity(requester, candidate)
    topic_comp = calculate_topic_compatibility(requester, candidate)
    avail_overlap = calculate_availability_overlap(requester, candidate)
    pref_comp = calculate_preference_compatibility(requester, candidate)

    return {
        FEATURE_CONCEPT_SCORE: concept_score,
        FEATURE_STYLE_SCORE: style_score,
        FEATURE_GOAL_SCORE: goal_score,
        FEATURE_SKILL_COMPLEMENTARITY: skill_comp,
        FEATURE_TOPIC_COMPATIBILITY: topic_comp,
        FEATURE_AVAILABILITY_OVERLAP: avail_overlap,
        FEATURE_PREFERENCE_COMPATIBILITY: pref_comp,
    }


def calculate_retention_bonus(candidate: ProfileBundle) -> float:
    """Bonus_drop = +0.05 max for candidates maintaining >= 30% duration (Spec 7.1)."""
    retention_rate = candidate.get("retention_rate", candidate.get("maintenance_rate", 0.0))
    if retention_rate >= 0.30:
        return MAX_BONUS_DROP
    return 0.0


def _score_candidate(requester: ProfileBundle, candidate: ProfileBundle) -> MatchCandidateResult:
    concept_score, concept_tier = calculate_concept_score(requester, candidate)
    style_score = calculate_style_score(requester, candidate)
    goal_score = calculate_goal_score(requester, candidate)

    tier, badge, subtitle = determine_match_tier(concept_score, concept_tier, style_score, goal_score)
    weights = TIER_WEIGHTS.get(tier, TIER_WEIGHTS[TIER_2_PEER])

    base_score = (
        weights[FEATURE_CONCEPT_SCORE] * concept_score
        + weights[FEATURE_STYLE_SCORE] * style_score
        + weights[FEATURE_GOAL_SCORE] * goal_score
    )

    bonus = calculate_retention_bonus(candidate)
    total_score_fraction = min(1.0, max(0.0, base_score + bonus))
    total_score = _round_score(total_score_fraction * TOTAL_SCORE_MULTIPLIER)

    component_scores = calculate_component_scores(requester, candidate)

    deadline_level = determine_deadline_level(candidate)
    is_uncertain = total_score < (UNCERTAIN_SCORE_THRESHOLD * TOTAL_SCORE_MULTIPLIER)

    return {
        "candidate_id": _user_id(candidate),
        "total_score": total_score,
        "component_scores": component_scores,
        "match_tier": tier,
        "match_badge": badge,
        "match_subtitle": subtitle,
        "deadline_level": deadline_level,
        "is_uncertain": is_uncertain,
    }


# ---------------------------------------------------------------------------
# Legacy Support Functions & Utilities
# ---------------------------------------------------------------------------

=======
    if _user_id(requester) == _user_id(candidate):
        return False
    return bool(_matching_skill_topics(requester, candidate) or (_topic_set(requester, "needs_help_with") & _topic_set(candidate, "needs_help_with")) or goal_similarity(requester, candidate) >= 0.2)


def calculate_component_scores(requester: ProfileBundle, candidate: ProfileBundle) -> ComponentScores:
    return {
        FEATURE_SKILL_COMPLEMENTARITY: calculate_skill_complementarity(requester, candidate),
        FEATURE_TOPIC_COMPATIBILITY: calculate_topic_compatibility(requester, candidate),
        FEATURE_AVAILABILITY_OVERLAP: calculate_availability_overlap(requester, candidate),
        FEATURE_PREFERENCE_COMPATIBILITY: calculate_preference_compatibility(requester, candidate),
    }


>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def calculate_skill_complementarity(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    requester_need_topics = _topic_set(requester, "needs_help_with")
    if not requester_need_topics:
        return 0.0
    direct = len(_matching_skill_topics(requester, candidate)) / len(requester_need_topics)
    shared = len(requester_need_topics & _topic_set(candidate, "needs_help_with")) / len(requester_need_topics)
    return _round_score(max(direct, shared * 0.55))


def calculate_topic_compatibility(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    mine = _topic_set(requester, "needs_help_with")
    theirs = _topic_set(candidate, "needs_help_with")
    union = mine | theirs
<<<<<<< HEAD
    shared = len(mine & theirs) / len(union) if union else 0.0

    # Also check subject overlap from profile
    pref_mine = _preference_terms(requester)
    pref_theirs = _preference_terms(candidate)
    pref_union = pref_mine | pref_theirs
    pref_shared = len(pref_mine & pref_theirs) / len(pref_union) if pref_union else 0.0

    return _round_score(max(shared, pref_shared, goal_similarity(requester, candidate)))
=======
    shared = len(mine & theirs) / len(union) if union else 0
    return _round_score(max(shared, goal_similarity(requester, candidate)))
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def calculate_availability_overlap(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    requester_intervals = _merge_intervals(_availability_intervals(requester))
    candidate_intervals = _merge_intervals(_availability_intervals(candidate))
    requester_minutes = _total_minutes(requester_intervals)
    candidate_minutes = _total_minutes(candidate_intervals)
    if not requester_minutes or not candidate_minutes:
        return 0.0

    overlap_minutes = _overlap_minutes(requester_intervals, candidate_intervals)
    return _round_score(overlap_minutes / min(requester_minutes, candidate_minutes))


def calculate_preference_compatibility(requester: ProfileBundle, candidate: ProfileBundle) -> float:
    my_offers = _topic_set(requester, "can_help_with")
    their_needs = _topic_set(candidate, "needs_help_with")
<<<<<<< HEAD
    mutual = len(my_offers & their_needs) / len(their_needs) if their_needs else 0.0
=======
    mutual = len(my_offers & their_needs) / len(their_needs) if their_needs else 0
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return _round_score(0.6 * goal_similarity(requester, candidate) + 0.4 * mutual)


def goal_similarity(requester: ProfileBundle, candidate: ProfileBundle) -> float:
<<<<<<< HEAD
    def terms(bundle: ProfileBundle) -> set[str]:
        profile = _profile(bundle)
        text = profile.get("matching_goal", {}).get("topic") or " ".join(profile.get("learning_goals", []))
        words = set(re.findall(r"[a-z0-9]+", _normalize_text(text)))
        stopwords = {
            "muon", "nam", "hoc", "trong", "tuan", "thang", "va", "de", "voi", "cua", "minh",
            "cho", "mot", "duoc", "ngay", "hoan", "thanh", "ban", "cung"
        }
        return {word for word in words - stopwords if not word.isdigit()}

=======
    def terms(bundle):
        text = " ".join(_profile(bundle).get("learning_goals", []))
        words = set(re.findall(r"[a-z]+", _normalize_text(text)))
        return words - {"hoc", "trong", "tuan", "thang", "va", "de", "voi", "cua", "minh", "cho", "mot", "duoc", "ngay", "hoan", "thanh"}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    left, right = terms(requester), terms(candidate)
    return len(left & right) / len(left | right) if left or right else 0.0


<<<<<<< HEAD
=======
def _score_candidate(requester: ProfileBundle, candidate: ProfileBundle) -> MatchCandidateResult:
    component_scores = calculate_component_scores(requester, candidate)
    weighted_score = sum(component_scores[feature] * weight for feature, weight in MATCHING_WEIGHTS.items())
    return {
        "candidate_id": _user_id(candidate),
        "total_score": _round_score(weighted_score * TOTAL_SCORE_MULTIPLIER),
        "component_scores": component_scores,
    }


>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def _user_id(bundle: ProfileBundle) -> int:
    profile = bundle.get("profile")
    if isinstance(profile, Mapping) and "user_id" in profile:
        return int(profile["user_id"])
    return int(bundle["user_id"])


def _items(bundle: ProfileBundle, key: str) -> list[Mapping[str, Any]]:
    values = bundle.get(key, [])
    if not isinstance(values, list | tuple):
        return []
    return [item for item in values if isinstance(item, Mapping)]


def _topic_set(bundle: ProfileBundle, key: str) -> set[str]:
    return {
        normalized
        for item in _items(bundle, key)
        if (normalized := _canonical_topic(item.get("topic", "")))
    }


def _matching_skill_topics(requester: ProfileBundle, candidate: ProfileBundle) -> set[str]:
    return _topic_set(requester, "needs_help_with") & _topic_set(candidate, "can_help_with")


def _profile(bundle: ProfileBundle) -> Mapping[str, Any]:
    profile = bundle.get("profile", {})
    return profile if isinstance(profile, Mapping) else {}


def _preference_terms(bundle: ProfileBundle) -> set[str]:
    profile = _profile(bundle)
    terms: set[str] = set()
    for field_name in ("subjects", "learning_goals", "interests"):
        values = profile.get(field_name, bundle.get(field_name, []))
        if not isinstance(values, list | tuple):
            continue
        terms.update(normalized for value in values if (normalized := _normalize_text(value)))
    return terms


def _availability_intervals(bundle: ProfileBundle) -> list[AvailabilityInterval]:
    intervals: list[AvailabilityInterval] = []
    for item in _items(bundle, "availability"):
        start_time = _parse_time(item.get("start_time"))
        end_time = _parse_time(item.get("end_time"))
        if start_time is None or end_time is None or end_time <= start_time:
            continue
        intervals.append(
            (
                int(item.get("day_of_week", 0)),
                str(item.get("timezone", "UTC")),
                _minutes_since_midnight(start_time),
                _minutes_since_midnight(end_time),
            )
        )
    return intervals


def _merge_intervals(intervals: list[AvailabilityInterval]) -> list[AvailabilityInterval]:
    merged: list[AvailabilityInterval] = []
    for day_of_week, timezone, start_minute, end_minute in sorted(intervals):
        if not merged:
            merged.append((day_of_week, timezone, start_minute, end_minute))
            continue

        last_day, last_timezone, last_start, last_end = merged[-1]
        if day_of_week == last_day and timezone == last_timezone and start_minute <= last_end:
            merged[-1] = (last_day, last_timezone, last_start, max(last_end, end_minute))
        else:
            merged.append((day_of_week, timezone, start_minute, end_minute))
    return merged


def _total_minutes(intervals: list[AvailabilityInterval]) -> int:
    return sum(end_minute - start_minute for _, _, start_minute, end_minute in intervals)


def _overlap_minutes(left: list[AvailabilityInterval], right: list[AvailabilityInterval]) -> int:
    total = 0
    right_by_key: dict[tuple[int, str], list[tuple[int, int]]] = {}
    for day_of_week, timezone, start_minute, end_minute in right:
        right_by_key.setdefault((day_of_week, timezone), []).append((start_minute, end_minute))

    for day_of_week, timezone, left_start, left_end in left:
        for right_start, right_end in right_by_key.get((day_of_week, timezone), []):
            total += max(0, min(left_end, right_end) - max(left_start, right_start))
    return total


def _parse_time(value: Any) -> time | None:
    if isinstance(value, time):
        return value
    if isinstance(value, str):
        try:
            return time.fromisoformat(value)
        except ValueError:
            return None
    return None


def _minutes_since_midnight(value: time) -> int:
    return value.hour * MINUTES_PER_HOUR + value.minute


def _normalize_text(value: Any) -> str:
<<<<<<< HEAD
    normalized = (
        "".join(
            c
            for c in unicodedata.normalize("NFKD", str(value)).casefold()
            if not unicodedata.combining(c)
        )
        .replace("đ", "d")
        .strip()
    )
=======
    normalized = "".join(c for c in unicodedata.normalize("NFKD", str(value)).casefold() if not unicodedata.combining(c)).replace("đ", "d").strip()
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return re.sub(r"\s+", " ", normalized)


def _round_score(value: float) -> float:
    return round(value, SCORE_DECIMAL_PLACES)


def _canonical_topic(value: Any) -> str:
    text = _normalize_text(value)
<<<<<<< HEAD
    aliases = {
        "english": ("tieng anh", "english", "ielts", "toeic"),
        "python": ("python",),
        "sql": ("sql", "co so du lieu"),
        "design": ("figma", "ui/ux", "thiet ke"),
        "marketing": ("marketing", "content"),
        "japanese": ("tieng nhat", "japanese", "jlpt"),
    }
=======
    aliases = {"english": ("tieng anh", "english", "ielts", "toeic"), "python": ("python",), "sql": ("sql", "co so du lieu"), "design": ("figma", "ui/ux", "thiet ke"), "marketing": ("marketing", "content"), "japanese": ("tieng nhat", "japanese", "jlpt")}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    for topic, names in aliases.items():
        if any(name in text for name in names):
            return topic
    return text
