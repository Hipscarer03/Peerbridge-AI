<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, Path, Query
=======
from fastapi import APIRouter, Depends, HTTPException, Path
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

from ..schemas import MatchSearchResponse
from ..security import current_user
from ..services.matches import (
    MatchProfileNotFoundError,
    MatchRequestNotFoundError,
    MatchSearchForbiddenError,
    MatchSearchService,
    get_match_search_service,
)

router = APIRouter(prefix="/matches", tags=["matches"])


def _match_http_error(error: Exception) -> HTTPException:
    if isinstance(error, MatchSearchForbiddenError):
        return HTTPException(status_code=403, detail="Only students can search matches")
    if isinstance(error, (MatchProfileNotFoundError, MatchRequestNotFoundError)):
        return HTTPException(status_code=404, detail="Match request not found")
    return HTTPException(status_code=500, detail="Could not process match request")


@router.post("/search", response_model=MatchSearchResponse, status_code=201)
def search_matches(
<<<<<<< HEAD
    expanded: bool = Query(default=False),
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    user: dict = Depends(current_user),
    service: MatchSearchService = Depends(get_match_search_service),
) -> MatchSearchResponse:
    try:
<<<<<<< HEAD
        return service.search_matches(user, expanded=expanded)
=======
        return service.search_matches(user)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    except (MatchProfileNotFoundError, MatchSearchForbiddenError) as error:
        raise _match_http_error(error) from error


@router.get("/{request_id}", response_model=MatchSearchResponse)
def get_match_request(
    request_id: int = Path(gt=0),
    user: dict = Depends(current_user),
    service: MatchSearchService = Depends(get_match_search_service),
) -> MatchSearchResponse:
    try:
        return service.get_match_request(user, request_id)
    except (MatchRequestNotFoundError, MatchSearchForbiddenError) as error:
        raise _match_http_error(error) from error
