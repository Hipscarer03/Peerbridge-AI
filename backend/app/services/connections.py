<<<<<<< HEAD
import hashlib
import json
import secrets
import sqlite3
from collections.abc import Generator
from datetime import UTC, datetime, timedelta
=======
import sqlite3
from collections.abc import Generator
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

from ..db import database, utc_now
from ..enums import ConnectionStatus, Role
from ..repositories.connections import ConnectionRepository
from ..schemas import ConnectionCreateRequest, ConnectionResponse, ConnectionsResponse


class ConnectionTargetNotFoundError(Exception):
    """Raised when a requested student account does not exist."""


class ConnectionNotFoundError(Exception):
    """Raised when a connection request does not exist."""


class ConnectionForbiddenError(Exception):
    """Raised when a user is not allowed to transition a connection request."""


class ConnectionInvalidStateError(Exception):
    """Raised when a connection request transition is not valid."""


class ConnectionSelfRequestError(Exception):
    """Raised when a student requests a connection with themselves."""


<<<<<<< HEAD
class FriendInviteInvalidError(Exception):
    """The shared link was replaced or is not valid."""


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def notify_connection(connection, to_user: int, from_user: int, *, accepted: bool) -> None:
    """Thông báo trong app cho lời mời kết nối / chấp nhận (ghi cùng giao dịch, lỗi thì bỏ qua)."""
    from ..home import notifications

    row = connection.execute("SELECT display_name FROM profiles WHERE user_id=?", (from_user,)).fetchone()
    name = row["display_name"] if row else "Một bạn"
    if accepted:
        notifications.add(to_user, "connection_accepted", f"{name} đã chấp nhận kết nối",
                          "Hai bạn có thể lập kế hoạch và check-in cùng nhau.", "plan", connection=connection)
    else:
        notifications.add(to_user, "connection_request", f"{name} muốn kết nối học cùng bạn",
                          "Xem lời mời trong mục Kết nối.", "connections", connection=connection)


class ConnectionService:
    def __init__(self, repository: ConnectionRepository) -> None:
        self.repository = repository

<<<<<<< HEAD
    def rotate_friend_link(self, user: dict) -> str:
        owner_id = self._current_student_id(user)
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        self.repository.connection.execute(
            """INSERT INTO friend_invite_links(owner_id, token_hash, created_at)
               VALUES (?, ?, ?) ON CONFLICT(owner_id) DO UPDATE SET
               token_hash=excluded.token_hash, created_at=excluded.created_at""",
            (owner_id, token_hash, utc_now()),
        )
        self.repository.connection.commit()
        return token

    def friend_link_owner(self, user: dict, token: str) -> dict:
        visitor_id = self._current_student_id(user)
        if len(token) > 128 or len(token) < 32:
            raise FriendInviteInvalidError()
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        row = self.repository.connection.execute(
            """SELECT l.owner_id, p.display_name FROM friend_invite_links l
               JOIN profiles p ON p.user_id=l.owner_id WHERE l.token_hash=?""",
            (token_hash,),
        ).fetchone()
        if not row:
            raise FriendInviteInvalidError()
        owner_id = int(row["owner_id"])
        return {"owner_id": owner_id, "display_name": row["display_name"],
                "is_self": owner_id == visitor_id,
                "connected": self.repository.peer_match_exists_between(owner_id, visitor_id) if owner_id != visitor_id else False,
                "pending": self.repository.has_pending_request_between(owner_id, visitor_id) if owner_id != visitor_id else False}

    def find_by_email(self, user: dict, email: str) -> dict:
        visitor_id = self._current_student_id(user)
        row = self.repository.connection.execute(
            """SELECT u.id, p.display_name, p.school, p.major, p.bio, p.avatar_url, p.learning_goals
               FROM users u JOIN profiles p ON p.user_id=u.id
               WHERE u.email=? AND u.role='STUDENT'""",
            (email.strip().lower(),),
        ).fetchone()
        if not row:
            raise ConnectionTargetNotFoundError()
        target_id = int(row["id"])
        goals = json.loads(row["learning_goals"] or "[]")
        return {"user_id": target_id, "display_name": row["display_name"],
                "school": row["school"], "major": row["major"], "bio": row["bio"],
                "avatar_url": row["avatar_url"], "learning_goal": goals[0] if goals else "",
                "is_self": target_id == visitor_id,
                "connected": self.repository.peer_match_exists_between(target_id, visitor_id) if target_id != visitor_id else False,
                "pending": self.repository.has_pending_request_between(target_id, visitor_id) if target_id != visitor_id else False}

    def request_from_friend_link(self, user: dict, token: str) -> ConnectionResponse:
        # The link discovers a person; its owner must still accept the request.
        visitor_id = self._current_student_id(user)
        self.repository.connection.execute("BEGIN IMMEDIATE")
        owner = self.friend_link_owner(user, token)
        owner_id = owner["owner_id"]
        if owner["is_self"]:
            raise ConnectionSelfRequestError()
        if owner["connected"] or owner["pending"]:
            raise ConnectionInvalidStateError()
        week_ago = (datetime.now(UTC) - timedelta(days=7)).isoformat()
        sent = self.repository.connection.execute(
            "SELECT COUNT(*) FROM connection_requests WHERE requester_id=? AND created_at>=?",
            (visitor_id, week_ago),
        ).fetchone()[0]
        if sent >= 3:
            raise ConnectionInvalidStateError("Weekly invitation limit reached")
        response = ConnectionResponse(**self.repository.create_connection_request(visitor_id, owner_id, utc_now(), "friend_link"))
        notify_connection(self.repository.connection, owner_id, visitor_id, accepted=False)
        self.repository.connection.commit()
        return response

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    def create_connection_request(self, user: dict, payload: ConnectionCreateRequest) -> ConnectionResponse:
        requester_id = self._current_student_id(user)
        recipient_id = payload.recipient_id
        if requester_id == recipient_id:
            raise ConnectionSelfRequestError("Students cannot request themselves")
        if not self.repository.student_exists(recipient_id):
            raise ConnectionTargetNotFoundError("Recipient student not found")
        if self.repository.peer_match_exists_between(requester_id, recipient_id):
            raise ConnectionInvalidStateError("Students are already matched")
        if self.repository.has_pending_request_between(requester_id, recipient_id):
            raise ConnectionInvalidStateError("A pending connection request already exists")

        response = ConnectionResponse(
            **self.repository.create_connection_request(
                requester_id=requester_id,
                recipient_id=recipient_id,
                created_at=utc_now(),
            )
        )
        notify_connection(self.repository.connection, recipient_id, requester_id, accepted=False)
        # A yield dependency may close after HTTP bytes have already been sent.
        # Commit the successful mutation before clients can follow it with accept/read.
        self.repository.connection.commit()
        return response

    def list_connections(self, user: dict) -> ConnectionsResponse:
        user_id = self._current_student_id(user)
        return ConnectionsResponse(**self.repository.list_connections(user_id))

    def accept_connection_request(self, user: dict, connection_request_id: int) -> ConnectionResponse:
        return self._transition_connection_request(
            user=user,
            connection_request_id=connection_request_id,
            status=ConnectionStatus.MATCHED,
            create_peer_match=True,
        )

    def reject_connection_request(self, user: dict, connection_request_id: int) -> ConnectionResponse:
        return self._transition_connection_request(
            user=user,
            connection_request_id=connection_request_id,
            status=ConnectionStatus.REJECTED,
            create_peer_match=False,
        )

    def _transition_connection_request(
        self,
        user: dict,
        connection_request_id: int,
        status: ConnectionStatus,
        *,
        create_peer_match: bool,
    ) -> ConnectionResponse:
        recipient_id = self._current_student_id(user)
        record = self.repository.get_connection_request(connection_request_id)
        if record is None:
            raise ConnectionNotFoundError("Connection request not found")
        if int(record["recipient_id"]) != recipient_id:
            raise ConnectionForbiddenError("Only the recipient can respond to a connection request")
        if record["status"] != ConnectionStatus.PENDING.value:
            raise ConnectionInvalidStateError("Connection request is not pending")

        responded_at = utc_now()
        if create_peer_match:
            try:
                self.repository.create_peer_match(
                    connection_request_id=connection_request_id,
                    requester_id=int(record["requester_id"]),
                    recipient_id=int(record["recipient_id"]),
                    created_at=responded_at,
                )
            except sqlite3.IntegrityError as error:
                raise ConnectionInvalidStateError("Peer match already exists") from error

        updated = self.repository.mark_connection_request(
            connection_request_id=connection_request_id,
            status=status,
            responded_at=responded_at,
        )
        response = ConnectionResponse(**updated)
        if create_peer_match:
            notify_connection(self.repository.connection, int(record["requester_id"]), recipient_id, accepted=True)
        self.repository.connection.commit()
        return response

    @staticmethod
    def _current_student_id(user: dict) -> int:
        if str(user.get("role")) != Role.STUDENT.value:
            raise ConnectionForbiddenError("Only students can use connection requests")
        return int(user["id"])


def get_connection_service() -> Generator[ConnectionService, None, None]:
    with database() as connection:
        yield ConnectionService(ConnectionRepository(connection))
