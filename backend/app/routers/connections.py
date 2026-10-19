from fastapi import APIRouter, Depends, HTTPException, Path
<<<<<<< HEAD
from pydantic import BaseModel, Field, field_validator
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

from ..schemas import ConnectionCreateRequest, ConnectionResponse, ConnectionsResponse
from ..security import current_user
from ..services.connections import (
    ConnectionForbiddenError,
    ConnectionInvalidStateError,
    ConnectionNotFoundError,
    ConnectionSelfRequestError,
    ConnectionService,
    ConnectionTargetNotFoundError,
<<<<<<< HEAD
    FriendInviteInvalidError,
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    get_connection_service,
)

router = APIRouter(prefix="/connections", tags=["connections"])


<<<<<<< HEAD
class EmailLookup(BaseModel):
    email: str = Field(min_length=5, max_length=254)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        local, separator, domain = value.partition("@")
        if not separator or not local or "." not in domain or domain.startswith(".") or domain.endswith("."):
            raise ValueError("Email không hợp lệ")
        return value


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def _connection_http_error(error: Exception) -> HTTPException:
    if isinstance(error, ConnectionSelfRequestError):
        return HTTPException(status_code=400, detail="Cannot request a connection with yourself")
    if isinstance(error, ConnectionForbiddenError):
        return HTTPException(status_code=403, detail="Only the recipient can respond to this connection request")
<<<<<<< HEAD
    if isinstance(error, ConnectionTargetNotFoundError):
        return HTTPException(status_code=404, detail="Tài khoản bạn học không tồn tại hoặc không thể nhận lời mời.")
    if isinstance(error, ConnectionNotFoundError):
        return HTTPException(status_code=404, detail="Lời mời kết nối không còn tồn tại.")
    if isinstance(error, ConnectionInvalidStateError):
        return HTTPException(status_code=409, detail="Lời mời đã tồn tại, hai bạn đã kết nối hoặc đã đạt giới hạn 3 lời mời trong 7 ngày.")
    if isinstance(error, FriendInviteInvalidError):
        return HTTPException(status_code=404, detail="Link mời không còn hiệu lực. Hãy xin link mới.")
=======
    if isinstance(error, (ConnectionNotFoundError, ConnectionTargetNotFoundError)):
        return HTTPException(status_code=404, detail="Connection request not found")
    if isinstance(error, ConnectionInvalidStateError):
        return HTTPException(status_code=409, detail="Invalid connection request state transition")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return HTTPException(status_code=500, detail="Could not process connection request")


@router.get("", response_model=ConnectionsResponse)
def list_connections(
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> ConnectionsResponse:
    try:
        return service.list_connections(user)
    except ConnectionForbiddenError as error:
        raise _connection_http_error(error) from error


<<<<<<< HEAD
@router.post("/invite-link")
def rotate_friend_link(
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> dict:
    try:
        return {"token": service.rotate_friend_link(user)}
    except ConnectionForbiddenError as error:
        raise _connection_http_error(error) from error


@router.post("/email/lookup")
def find_connection_by_email(
    payload: EmailLookup,
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> dict:
    try:
        return service.find_by_email(user, payload.email)
    except (ConnectionForbiddenError, ConnectionTargetNotFoundError) as error:
        raise _connection_http_error(error) from error


@router.get("/invite-link/{token}")
def preview_friend_link(
    token: str,
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> dict:
    try:
        return service.friend_link_owner(user, token)
    except (ConnectionForbiddenError, FriendInviteInvalidError) as error:
        raise _connection_http_error(error) from error


@router.post("/invite-link/{token}/request", response_model=ConnectionResponse, status_code=201)
def request_friend_link(
    token: str,
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> ConnectionResponse:
    try:
        return service.request_from_friend_link(user, token)
    except (ConnectionForbiddenError, FriendInviteInvalidError, ConnectionSelfRequestError, ConnectionInvalidStateError) as error:
        raise _connection_http_error(error) from error


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
@router.post("", response_model=ConnectionResponse, status_code=201)
def create_connection_request(
    payload: ConnectionCreateRequest,
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> ConnectionResponse:
    try:
        return service.create_connection_request(user, payload)
    except (
        ConnectionForbiddenError,
        ConnectionInvalidStateError,
        ConnectionSelfRequestError,
        ConnectionTargetNotFoundError,
    ) as error:
        raise _connection_http_error(error) from error


@router.post("/{connection_request_id}/accept", response_model=ConnectionResponse)
def accept_connection_request(
    connection_request_id: int = Path(gt=0),
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> ConnectionResponse:
    try:
        return service.accept_connection_request(user, connection_request_id)
    except (ConnectionForbiddenError, ConnectionInvalidStateError, ConnectionNotFoundError) as error:
        raise _connection_http_error(error) from error


@router.post("/{connection_request_id}/reject", response_model=ConnectionResponse)
def reject_connection_request(
    connection_request_id: int = Path(gt=0),
    user: dict = Depends(current_user),
    service: ConnectionService = Depends(get_connection_service),
) -> ConnectionResponse:
    try:
        return service.reject_connection_request(user, connection_request_id)
    except (ConnectionForbiddenError, ConnectionInvalidStateError, ConnectionNotFoundError) as error:
        raise _connection_http_error(error) from error
