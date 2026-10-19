<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
=======
from fastapi import APIRouter, Depends, Path
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

from ..repositories.plans import PlanError
from ..security import current_user
from ..services.coach import CoachService, get_coach_service
<<<<<<< HEAD
from ..services.owl_coach import chat_history, chat_reply
from ..services.tracking_cases import list_cases, save_action
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from .plans import http_error

router = APIRouter(prefix="/coach", tags=["coach"])


<<<<<<< HEAD
class CoachMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class CoachCaseActionIn(BaseModel):
    action: str = Field(min_length=1, max_length=40)
    detail: str = Field(default="", max_length=300)


@router.get("/cases")
def active_cases(user=Depends(current_user)) -> dict:
    return {"items": list_cases(user["id"])}


@router.post("/cases/{case_key}/action")
def act_on_case(case_key: str, payload: CoachCaseActionIn, user=Depends(current_user)) -> dict:
    try:
        return {"items": save_action(user["id"], case_key, payload.action, payload.detail)}
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("/{pair_id}/chat")
def personal_chat(pair_id: int = Path(ge=0), user=Depends(current_user)) -> dict:
    if pair_id != 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy cuộc trò chuyện này")
    return chat_history(user["id"])


@router.post("/{pair_id}/chat")
def send_personal_chat(payload: CoachMessageIn, pair_id: int = Path(ge=0), user=Depends(current_user)) -> dict:
    if pair_id != 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy cuộc trò chuyện này")
    if not payload.message.strip():
        raise HTTPException(status_code=422, detail="Hãy nhập lời nhắn cho Cú")
    return chat_reply(user["id"], payload.message)


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
@router.get("/{pair_id}")
def list_interventions(
    pair_id: int = Path(gt=0), user=Depends(current_user), service: CoachService = Depends(get_coach_service)
):
    try:
        return {"interventions": service.list(pair_id, user)}
    except PlanError as error:
        raise http_error(error) from error


@router.post("/{pair_id}/evaluate")
async def evaluate(
    pair_id: int = Path(gt=0), user=Depends(current_user), service: CoachService = Depends(get_coach_service)
):
    try:
        return await service.evaluate(pair_id, user)
    except PlanError as error:
        raise http_error(error) from error
