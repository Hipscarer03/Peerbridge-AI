from collections.abc import Generator

from ..db import database, utc_now
from ..enums import Role
from ..repositories.matches import MatchRequestRepository
from ..repositories.profiles import ProfileRepository
from ..schemas import MatchSearchResponse
<<<<<<< HEAD
from .matching_engine import _topic_set, find_top_matches, goal_similarity

=======
from .match_ai import rerank
from .matching_engine import _topic_set, find_top_matches, goal_similarity

MATCH_SEARCH_TOP_K = 15

>>>>>>> 29066618049be865e9daa585fed068c149bc780f

class MatchProfileNotFoundError(Exception):
    """Raised when a student has no profile to match from."""


class MatchRequestNotFoundError(Exception):
    """Raised when a persisted match request does not exist for the student."""


class MatchSearchForbiddenError(Exception):
    """Raised when a non-student tries to use student matching."""


class MatchSearchService:
    def __init__(self, profiles: ProfileRepository, match_requests: MatchRequestRepository) -> None:
        self.profiles = profiles
        self.match_requests = match_requests

<<<<<<< HEAD
    def search_matches(self, user: dict, expanded: bool = False) -> MatchSearchResponse:
=======
    def search_matches(self, user: dict) -> MatchSearchResponse:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        requester_id = self._current_student_id(user)
        requester = self.profiles.get_profile_bundle(requester_id)
        if requester is None:
            raise MatchProfileNotFoundError("Profile not found")

<<<<<<< HEAD
        bundles = self.profiles.list_matching_profile_bundles(requester_id)
        ranked_candidates = find_top_matches(
            requester=requester,
            candidates=bundles,
            expanded=expanded,
        )
        record = self.match_requests.create_match_request(
            requester_id=requester_id,
            candidates=ranked_candidates,
            created_at=utc_now(),
        )
        response = self._enrich(record, requester, {b["profile"]["user_id"]: b for b in bundles})
        response.matching_mode = "local"
=======
        bundles = self.profiles.list_student_profile_bundles()
        ranked_candidates = find_top_matches(
            requester=requester,
            candidates=bundles,
            top_k=50,
        )
        ranked_candidates, mode = rerank(requester, ranked_candidates, bundles)
        record = self.match_requests.create_match_request(
            requester_id=requester_id,
            candidates=ranked_candidates[:MATCH_SEARCH_TOP_K],
            created_at=utc_now(),
        )
        response = self._enrich(record, requester)
        response.matching_mode = mode
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        return response

    def get_match_request(self, user: dict, request_id: int) -> MatchSearchResponse:
        requester_id = self._current_student_id(user)
        record = self.match_requests.get_match_request(requester_id=requester_id, request_id=request_id)
        if record is None:
            raise MatchRequestNotFoundError("Match request not found")
        return self._enrich(record, self.profiles.get_profile_bundle(requester_id))

<<<<<<< HEAD
    def _enrich(self, record, requester, bundles=None):
        from .matching_engine import (
            calculate_concept_score,
            calculate_goal_score,
            calculate_style_score,
            determine_deadline_level,
            determine_match_tier,
        )

        my_needs = _topic_set(requester or {}, "needs_help_with")
        my_offers = _topic_set(requester or {}, "can_help_with")

        def topic_labels(items, collection_key, topics):
            return [
                str(item.get("topic", "")).strip()
                for item in items
                if item.get("topic") and _topic_set({collection_key: [item]}, collection_key) & topics
            ]

        for candidate in record["candidates"]:
            bundle = bundles.get(candidate["candidate_id"]) if bundles is not None else self.profiles.get_profile_bundle(candidate["candidate_id"])
            if not bundle:
                continue
            to_me = topic_labels(bundle["can_help_with"], "can_help_with", my_needs)
            from_me = topic_labels(bundle["needs_help_with"], "needs_help_with", my_offers)
            shared = topic_labels(bundle["needs_help_with"], "needs_help_with", my_needs)
            if to_me and from_me:
                highlight = f"Bạn cần {', '.join(to_me)}; người này cần {', '.join(from_me)} — có thể hỗ trợ qua lại."
            elif to_me:
                highlight = f"Người này có thể hỗ trợ bạn về {', '.join(to_me)}."
            elif from_me:
                highlight = f"Bạn có thể hỗ trợ người này về {', '.join(from_me)}."
            elif shared:
                highlight = f"Cùng cần học {', '.join(shared)}; có thể luyện tập chung."
            elif goal_similarity(requester or {}, bundle) > 0.15:
                highlight = "Mục tiêu học tập gần nhau, phù hợp để cùng luyện tập và theo dõi tiến độ."
            else:
                highlight = candidate.get("match_subtitle") or "Cách học và thời hạn mục tiêu có điểm tương thích."
            candidate.update(
                is_seed=bool(bundle["profile"].get("is_seed", False)),
                learning_goals=bundle["profile"]["learning_goals"],
                bio=bundle["profile"]["bio"],
                learning_style=bundle["profile"].get("learning_style", {}),
                study_year=bundle["profile"].get("study_year", ""),
                needs=[n["topic"] for n in bundle["needs_help_with"]],
                strengths=[n["topic"] for n in bundle["can_help_with"]],
                availability=bundle["availability"],
                goal_duration_days=(bundle["profile"].get("matching_goal") or {}).get("duration_days"),
                goal_topic=(bundle["profile"].get("matching_goal") or {}).get("topic", ""),
                match_highlight=highlight,
            )

            concept_score, concept_tier = calculate_concept_score(requester or {}, bundle)
            style_score = candidate["component_scores"].get("style_score") or calculate_style_score(requester or {}, bundle)
            goal_score = candidate["component_scores"].get("goal_score") or calculate_goal_score(requester or {}, bundle)
            tier, badge, subtitle = determine_match_tier(concept_score, concept_tier, style_score, goal_score)
            deadline_lvl = determine_deadline_level(bundle)

            candidate["match_tier"] = candidate.get("match_tier") or tier
            candidate["match_badge"] = candidate.get("match_badge") or badge
            candidate["match_subtitle"] = candidate.get("match_subtitle") or subtitle
            candidate["deadline_level"] = candidate.get("deadline_level") or deadline_lvl
            candidate["is_uncertain"] = candidate.get("is_uncertain", candidate["total_score"] < 50.0)

            shared = [n for n in candidate["strengths"] if _topic_set({"can_help_with": [{"topic": n}]}, "can_help_with") & my_needs]
            reasons = []
            if badge:
                reasons.append(f"{badge}: {subtitle}")
            if shared:
                reasons.append("Có thể đồng hành với bạn ở " + ", ".join(shared))
=======
    def _enrich(self, record, requester):
        for candidate in record["candidates"]:
            bundle = self.profiles.get_profile_bundle(candidate["candidate_id"])
            if not bundle:
                continue
            candidate.update(
                learning_goals=bundle["profile"]["learning_goals"],
                bio=bundle["profile"]["bio"],
                needs=[n["topic"] for n in bundle["needs_help_with"]],
                strengths=[n["topic"] for n in bundle["can_help_with"]],
                availability=bundle["availability"],
            )
            my_needs = _topic_set(requester or {}, "needs_help_with")
            shared = [n for n in candidate["strengths"] if _topic_set({"can_help_with": [{"topic": n}]}, "can_help_with") & my_needs]
            reasons = []
            if shared:
                reasons.append("Có thể đồng hành với bạn ở " + ", ".join(shared))
            if candidate["component_scores"].get("availability_overlap", 0) > 0:
                reasons.append("Hai bạn có khung giờ rảnh trùng nhau để cùng giữ nhịp học.")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            common_needs = my_needs & _topic_set(bundle, "needs_help_with")
            if common_needs:
                reasons.append("Hai bạn đang cần học cùng chủ đề; có thể cùng luyện tập và check-in tiến độ.")
            mutual = _topic_set(requester or {}, "can_help_with") & _topic_set(bundle, "needs_help_with")
            if mutual:
                reasons.append("Bạn cũng có thế mạnh phù hợp với nhu cầu của người này; hai bạn có thể hỗ trợ qua lại.")
            if goal_similarity(requester or {}, bundle) > 0.15:
                reasons.append("Mục tiêu học tập có điểm chung; phù hợp để cùng luyện tập và nhắc nhau giữ cam kết.")
            if candidate["learning_goals"]:
                reasons.append("Đang hướng tới: " + candidate["learning_goals"][0])
            candidate["reasons"] = reasons
        return MatchSearchResponse(**record)

    @staticmethod
    def _current_student_id(user: dict) -> int:
        if str(user.get("role")) != Role.STUDENT.value:
            raise MatchSearchForbiddenError("Only students can search matches")
        return int(user["id"])


def get_match_search_service() -> Generator[MatchSearchService, None, None]:
    with database() as connection:
        yield MatchSearchService(
            profiles=ProfileRepository(connection),
            match_requests=MatchRequestRepository(connection),
        )
