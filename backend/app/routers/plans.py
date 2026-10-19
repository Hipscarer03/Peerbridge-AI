<<<<<<< HEAD
import re
import secrets
from datetime import date, datetime, timedelta
from typing import Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Header, HTTPException, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

from ..agents.plan_coach.contract import (
    AcceptRequest,
    CompletionEvent,
    GenerateRequest,
    Member,
    ReplanRequest,
    StudyCalendar,
)
from ..agents.plan_coach.llm import PlannerFailureError
from ..agents.plan_coach.scheduler import PlanValidationError
from ..onboarding.retrieval import LocalConceptRetriever, infer_domain
from ..repositories.plans import PlanError
from ..security import current_user
from ..services.concept_expansion import prepare_draft
=======
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..agents.plan_coach.contract import AcceptRequest, CompletionEvent, GenerateRequest, ReplanRequest
from ..agents.plan_coach.llm import PlannerFailureError
from ..agents.plan_coach.scheduler import PlanValidationError
from ..repositories.plans import PlanError
from ..security import current_user
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from ..services.plans import PlanService, get_plan_service

router = APIRouter(prefix="/plans", tags=["plans"])


class PlanNoteIn(BaseModel):
    text: str = Field(min_length=1, max_length=280)
<<<<<<< HEAD
    plan_item_id: str | None = Field(default=None, min_length=1, max_length=120)


@router.get("/{pair_id}/notes")
def read_notes(pair_id: int = Path(gt=0), item_id: str | None = None, user=Depends(current_user)):
    from ..services.plan_notes import notes
    try:
        return notes(pair_id,user,item_id=item_id)
=======


@router.get("/{pair_id}/notes")
def read_notes(pair_id: int = Path(gt=0), user=Depends(current_user)):
    from ..services.plan_notes import notes
    try:
        return notes(pair_id,user)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    except PlanError as error:
        raise http_error(error) from error


@router.post("/{pair_id}/notes", status_code=201)
def add_note(body: PlanNoteIn, pair_id: int = Path(gt=0), user=Depends(current_user)):
    from ..services.plan_notes import notes
    try:
<<<<<<< HEAD
        return notes(pair_id,user,body.text,body.plan_item_id)
    except PlanError as error:
        raise http_error(error) from error


class StudyTogetherIn(BaseModel):
    enabled: bool


@router.put("/{pair_id}/items/{item_id}/together")
def study_together(body: StudyTogetherIn, pair_id: int = Path(gt=0), item_id: str = Path(min_length=1, max_length=120), user=Depends(current_user)):
    from ..services.plan_together import register
    try:
        return register(pair_id,item_id,user,body.enabled)
=======
        return notes(pair_id,user,body.text)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    except PlanError as error:
        raise http_error(error) from error


@router.get("/{pair_id}/commitments")
def commitments(pair_id: int = Path(gt=0), user=Depends(current_user)):
    from ..services.commitments import plan_commitments
    try:
        return plan_commitments(pair_id, user)
    except PlanError as error:
        raise http_error(error) from error


@router.post("/{pair_id}/commit")
def commit(pair_id: int = Path(gt=0), user=Depends(current_user)):
    from ..services.commitments import plan_commitments
    try:
        return plan_commitments(pair_id, user, commit=True)
    except PlanError as error:
        raise http_error(error) from error


def http_error(error):
    if isinstance(error, PlanError):
        return HTTPException(error.status, detail=f"{error.code}: {error.message}")
    if isinstance(error, PlanValidationError):
        return HTTPException(422, detail="; ".join(f"{i.code}: {i.message}" for i in error.issues))
    raise error


@router.get("/{pair_id}/setup")
def setup(pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.setup(pair_id, user)
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


@router.post("/generate", status_code=201)
async def generate(
    payload: GenerateRequest,
    user=Depends(current_user),
    service: PlanService = Depends(get_plan_service),
    idempotency_key: str = Header(min_length=1, max_length=120),
):
<<<<<<< HEAD
    return await _generate_response(payload, user, service, idempotency_key)


async def _generate_response(payload, user, service, idempotency_key, *, draft_concepts=None, draft_source=None):
    try:
        return await service.generate(payload, user, idempotency_key, draft_concepts=draft_concepts, draft_source=draft_source)
=======
    try:
        return await service.generate(payload, user, idempotency_key)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    except PlannerFailureError as error:
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Không lập được kế hoạch hợp lệ sau hai lần sửa; chưa lưu kế hoạch. "
                + "; ".join(f"{i.code}: {i.message}" for i in error.issues),
                "trace_id": error.trace_id,
                "errors": [i.model_dump(mode="json") for i in error.issues],
                "unplanned_concepts": error.trace["unplanned_concepts"],
            },
        )
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


<<<<<<< HEAD
class CalendarWeekInput(BaseModel):
    start_date: date
    days: list[int] = Field(default_factory=list, max_length=7)
    complete: bool = False


class PersonalPlanInput(BaseModel):
    pair_id: int = Field(gt=0)
    goal: str = Field(min_length=3, max_length=500)
    target_date: datetime
    learner_tier: Literal["NEWBIE", "TRANSFER", "REFRESHER"]
    days: list[int] = Field(default_factory=list, max_length=7)
    recurring: bool = True
    calendar_complete: bool = False
    weeks: list[CalendarWeekInput] = Field(default_factory=list, max_length=54)


@router.post("/generate-personal", status_code=201)
async def generate_personal(payload: PersonalPlanInput, user=Depends(current_user), service: PlanService = Depends(get_plan_service), idempotency_key: str = Header(min_length=1, max_length=120)):
    # The authenticated user owns the input. No peer ID or peer form is accepted.
    service.setup(payload.pair_id, user)
    if any(day < 0 or day > 6 for day in payload.days) or len(set(payload.days)) != len(payload.days):
        raise HTTPException(422, "Ngày học không hợp lệ.")
    if payload.target_date.tzinfo is None or payload.target_date <= service.clock():
        raise HTTPException(422, "Chọn hạn chót sau thời điểm hiện tại.")
    today = service.clock().astimezone(ZoneInfo("Asia/Ho_Chi_Minh")).date()
    deadline = payload.target_date.astimezone(ZoneInfo("Asia/Ho_Chi_Minh")).date()
    if (deadline - today).days > 365:
        raise HTTPException(422, "Chọn hạn hoàn thành trong vòng một năm.")
    study_dates, buffer_dates = [], []
    if payload.recurring:
        if payload.weeks:
            raise HTTPException(422, "Lịch cố định chỉ dùng các thứ đã chọn.")
        for offset in range((deadline - today).days + 1):
            day = today + timedelta(days=offset)
            if day.weekday() in payload.days:
                study_dates.append(day)
            elif payload.calendar_complete:
                buffer_dates.append(day)
    else:
        seen = set()
        for week in payload.weeks:
            if week.start_date.weekday() != 0 or week.start_date in seen or any(day < 0 or day > 6 for day in week.days) or len(set(week.days)) != len(week.days):
                raise HTTPException(422, "Tuần học hoặc ngày được chọn không hợp lệ.")
            seen.add(week.start_date)
            if week.start_date > deadline or week.start_date + timedelta(days=6) < today:
                raise HTTPException(422, "Tuần học nằm ngoài khoảng mục tiêu.")
            for index in range(7):
                day = week.start_date + timedelta(days=index)
                if index in week.days and not today <= day <= deadline:
                    raise HTTPException(422, "Không thể chọn ngày đã qua hoặc sau hạn hoàn thành.")
                if today <= day <= deadline:
                    if index in week.days:
                        study_dates.append(day)
                    elif week.complete:
                        buffer_dates.append(day)
    structured = re.fullmatch(r"muốn học\.?\s+(.+?)\s+trong\s+[1-9]\d*\s+(ngày|tuần|tháng|năm)\.?", payload.goal.strip(), re.IGNORECASE)
    topic = structured[1] if structured else payload.goal
    track = infer_domain(topic)
    concepts, _, _ = service.catalog()
    targets = [c for c in concepts if c.track == track]
    available_ids = {c.id for c in targets}
    matches = LocalConceptRetriever().retrieve(topic, track, 5) if track else []
    selected_ids = [candidate.concept_id for candidate in matches if candidate.score >= 0.75 and candidate.concept_id in available_ids]
    draft_concepts, draft_source = None, None
    if not selected_ids:
        try:
            draft_concepts, draft_source = await prepare_draft(
                pair_id=payload.pair_id, user_id=user["id"], request_key=idempotency_key,
                topic=topic, tier=payload.learner_tier, available_days=len(study_dates),
                track=track or "learning", settings=service.settings,
            )
        except PlanError as error:
            raise http_error(error) from error
        selected_ids = [draft_concepts[-1].id]
    known = [c.id for c in targets if not c.prerequisites and c.id not in selected_ids] if payload.learner_tier == "TRANSFER" and not draft_concepts else []
    member = Member(user_id=user["id"], goal=payload.goal, deadline=payload.target_date, learner_tier=payload.learner_tier, preferred_days=payload.days if payload.recurring else [], concept_ids=selected_ids, known_concept_ids=known, committed_minutes_per_week=0, availability=[], calendar=StudyCalendar(start_date=today, end_date=deadline, study_dates=study_dates, buffer_dates=buffer_dates))
    request = GenerateRequest(pair_id=payload.pair_id, members=[member], horizon_days=min(365, max(1, (deadline - today).days + 1)))
    return await _generate_response(request, user, service, idempotency_key, draft_concepts=draft_concepts, draft_source=draft_source)


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
@router.get("/{pair_id}/traces")
def traces(pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.traces(pair_id, user)
    except PlanError as error:
        raise http_error(error) from error


@router.get("/{pair_id}")
def read(pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.read(pair_id, user)
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


@router.post("/{pair_id}/replan", status_code=201)
def replan(
    payload: ReplanRequest,
    pair_id: int = Path(gt=0),
    user=Depends(current_user),
    service: PlanService = Depends(get_plan_service),
):
    try:
        return service.replan(pair_id, user, payload)
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


<<<<<<< HEAD
@router.post("/{pair_id}/expand-lessons")
def expand_lessons(payload: AcceptRequest, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.expand_lessons(pair_id, user, payload.expected_version)
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
@router.post("/{pair_id}/proposals/{proposal_id}/{decision}")
def decide(
    payload: AcceptRequest,
    decision: str,
    pair_id: int = Path(gt=0),
    proposal_id: int = Path(gt=0),
    user=Depends(current_user),
    service: PlanService = Depends(get_plan_service),
):
    if decision not in ("accept", "reject"):
        raise HTTPException(404, "Unknown decision")
    try:
        return service.decide_proposal(pair_id, proposal_id, user, payload.expected_version, decision == "accept")
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


@router.post("/events/completion")
def completion(
    payload: CompletionEvent, service: PlanService = Depends(get_plan_service), x_vision_key: str = Header(default="")
):
    key = service.settings.vision_adapter_key.get_secret_value()
    if not key:
        raise HTTPException(503, "AI Vision adapter chưa được cấu hình")
    if not secrets.compare_digest(key, x_vision_key):
        raise HTTPException(403, "AI Vision adapter authentication required")
    try:
        return service.complete(payload)
    except (PlanError, PlanValidationError) as error:
        raise http_error(error) from error


class ScheduleEditIn(BaseModel):
    expected_version: int = Field(gt=0)
    scheduled_start: datetime
<<<<<<< HEAD
    minutes: int = Field(ge=10, le=90)
    confirm_buffer: bool = False


class BulkScheduleItemIn(BaseModel):
    item_id: str = Field(min_length=1, max_length=120)
    scheduled_start: datetime


class BulkScheduleEditIn(BaseModel):
    expected_version: int = Field(gt=0)
    items: list[BulkScheduleItemIn] = Field(min_length=1, max_length=200)
    confirm_buffer: bool = False

    @model_validator(mode="after")
    def unique_items(self):
        ids = [item.item_id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate lesson ids are not allowed")
        return self


class LessonEditIn(BaseModel):
    model_config = {"str_strip_whitespace": True}
    expected_version: int = Field(gt=0)
    action: str | None = Field(default=None, min_length=5, max_length=600)
    expected_output: str | None = Field(default=None, min_length=3, max_length=500)
    minutes: int | None = Field(default=None, ge=10, le=90)
    planned_date: date | None = None
    scheduled_start: datetime | None = None
    confirm_buffer: bool = False


class LessonCreateIn(LessonEditIn):
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    minutes: int = Field(default=45, ge=10, le=90)


class LessonOrderIn(BaseModel):
    expected_version: int = Field(gt=0)
    item_ids: list[str] = Field(min_length=1, max_length=200)


@router.post("/{pair_id}/items", status_code=201)
def add_lesson(payload: LessonCreateIn, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.change_lesson(pair_id, user, payload)
    except PlanError as error:
        raise http_error(error) from error


@router.put("/{pair_id}/items/order")
def reorder_lessons(payload: LessonOrderIn, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.reorder_lessons(pair_id, user, payload)
    except PlanError as error:
        raise http_error(error) from error


@router.patch("/{pair_id}/items/{item_id}")
def edit_lesson(payload: LessonEditIn, item_id: str, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.change_lesson(pair_id, user, payload, item_id)
    except PlanError as error:
        raise http_error(error) from error


@router.delete("/{pair_id}/items/{item_id}")
def delete_lesson(payload: AcceptRequest, item_id: str, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.change_lesson(pair_id, user, payload, item_id, delete=True)
    except PlanError as error:
        raise http_error(error) from error
=======
    minutes: int = Field(ge=30, le=90)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


@router.patch("/{pair_id}/items/{item_id}/schedule")
def edit_schedule(payload: ScheduleEditIn, item_id: str, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.edit_schedule(pair_id, user, item_id, payload)
<<<<<<< HEAD
    except PlanError as error:
        raise http_error(error) from error


@router.patch("/{pair_id}/schedule")
def edit_schedules(payload: BulkScheduleEditIn, pair_id: int = Path(gt=0), user=Depends(current_user), service: PlanService = Depends(get_plan_service)):
    try:
        return service.edit_schedules(pair_id, user, payload)
    except PlanError as error:
=======
    except (PlanError, PlanValidationError) as error:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        raise http_error(error) from error
