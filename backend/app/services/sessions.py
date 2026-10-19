from collections.abc import Generator

from ..db import database, utc_now
from ..enums import Role
from ..repositories.sessions import StudySessionRepository
from ..schemas import StudySession, StudySessionCreateRequest, StudySessionListResponse, StudySessionResponse


class StudySessionNotFoundError(Exception):
    """Raised when a study session or peer match cannot be found."""


class StudySessionForbiddenError(Exception):
    """Raised when a user cannot access or create a study session."""


class StudySessionOwnershipError(Exception):
    """Raised when requested session participants do not belong to the peer match."""


class StudySessionService:
    def __init__(self, repository: StudySessionRepository) -> None:
        self.repository = repository

    def list_study_sessions(self, user: dict) -> StudySessionListResponse:
        role = str(user.get("role"))
        if role == Role.INSTRUCTOR.value:
            user_id = None
        elif role == Role.STUDENT.value:
            user_id = int(user["id"])
        else:
<<<<<<< HEAD
            raise StudySessionForbiddenError("Only students or instructors can list study sessions")
        items = [StudySession(**record) for record in self.repository.list_study_sessions(user_id)]
        if role == Role.INSTRUCTOR.value:
            items = [item for item in items if self.repository.instructor_has_session(int(user["id"]), item.id)]
=======
            raise StudySessionForbiddenError("Only students or admins can list study sessions")
        # Admin (role INSTRUCTOR trong DB) xem được mọi phiên để giám sát.
        items = [StudySession(**record) for record in self.repository.list_study_sessions(user_id)]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        return StudySessionListResponse(items=items, count=len(items))

    def create_study_session(self, user: dict, payload: StudySessionCreateRequest) -> StudySessionResponse:
        user_id = self._require_student(user)
        peer_match = self.repository.get_peer_match(payload.peer_match_id)
        if peer_match is None:
            raise StudySessionNotFoundError("Peer match not found")

        peer_member_ids = self._peer_member_ids(peer_match)
        if user_id not in peer_member_ids:
            raise StudySessionForbiddenError("Only peer match members can create study sessions")
        if {payload.learner_id, payload.helper_id} != peer_member_ids:
            raise StudySessionOwnershipError("Study session participants must match the peer match members")

        return StudySessionResponse(
            **self.repository.create_study_session(
                payload=payload,
                created_at=utc_now(),
            )
        )

    def get_study_session(self, user: dict, session_id: int) -> StudySessionResponse:
        record = self.repository.get_study_session(session_id)
        if record is None:
            raise StudySessionNotFoundError("Study session not found")

        role = str(user.get("role"))
<<<<<<< HEAD
        if role == Role.INSTRUCTOR.value:
            if not self.repository.instructor_has_session(int(user["id"]), session_id):
                raise StudySessionForbiddenError("Instructor is not assigned to this session")
            return StudySessionResponse(**record)
        if role != Role.STUDENT.value:
            raise StudySessionForbiddenError("Only session members or instructors can access study sessions")
=======
        if role == Role.INSTRUCTOR.value:  # Admin
            return StudySessionResponse(**record)
        if role != Role.STUDENT.value:
            raise StudySessionForbiddenError("Only session members or admins can access study sessions")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

        user_id = int(user["id"])
        if user_id not in self._peer_member_ids(record):
            raise StudySessionForbiddenError("Only peer match members can access this study session")
        return StudySessionResponse(**record)

    @staticmethod
    def _require_student(user: dict) -> int:
        if str(user.get("role")) != Role.STUDENT.value:
            raise StudySessionForbiddenError("Only matched students can create study sessions")
        return int(user["id"])

    @staticmethod
    def _peer_member_ids(record: dict) -> set[int]:
        return {int(record["user_a_id"]), int(record["user_b_id"])}


def get_study_session_service() -> Generator[StudySessionService, None, None]:
    with database() as connection:
        yield StudySessionService(StudySessionRepository(connection))
