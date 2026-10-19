<<<<<<< HEAD
from datetime import date, datetime, time
=======
from datetime import datetime, time
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from enum import StrEnum
from typing import Literal
from uuid import uuid4
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

<<<<<<< HEAD
from ...learning_domains import Domain

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ItemStatus(StrEnum):
    SCHEDULED = "SCHEDULED"
    DEFERRED = "DEFERRED"
    COMPLETED = "COMPLETED"


class PlanStatus(StrEnum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    REJECTED = "REJECTED"


def aware(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("Datetime must include a timezone offset")
    return value


def timezone_name(value: str) -> str:
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError):
        raise ValueError("Unknown IANA timezone") from None
    return value


class Availability(Contract):
    id: str = Field(min_length=1, max_length=80)
    day_of_week: int = Field(ge=0, le=6)  # Monday = 0
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def ordered(self):
        if self.start_time.tzinfo or self.end_time.tzinfo or self.end_time <= self.start_time:
            raise ValueError("Use local times with end_time > start_time; split overnight windows")
        return self


<<<<<<< HEAD
class LessonTemplate(Contract):
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(default=45, ge=10, le=90)


class Concept(Contract):
    id: str = Field(min_length=1, max_length=100)
    track: Domain
    prerequisites: list[str] = Field(default_factory=list, max_length=20)
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(ge=10, le=90)
    resource_ids: list[str] = Field(default_factory=list)
    lessons: list[LessonTemplate] = Field(default_factory=list, max_length=24)


class StudyCalendar(Contract):
    start_date: date
    end_date: date
    study_dates: list[date] = Field(default_factory=list, max_length=366)
    buffer_dates: list[date] = Field(default_factory=list, max_length=366)

    @model_validator(mode="after")
    def valid_dates(self):
        if self.end_date < self.start_date or (self.end_date - self.start_date).days > 365:
            raise ValueError("Calendar must cover at most one year")
        if len(set(self.study_dates)) != len(self.study_dates) or len(set(self.buffer_dates)) != len(self.buffer_dates):
            raise ValueError("Calendar dates must be unique")
        if set(self.study_dates) & set(self.buffer_dates):
            raise ValueError("Study and buffer dates must be separate")
        if any(day < self.start_date or day > self.end_date for day in self.study_dates + self.buffer_dates):
            raise ValueError("Calendar dates must lie within the planning period")
        return self


class LessonRef(Contract):
    concept_id: str
    session_index: int = Field(ge=1, le=24)


class LessonOverride(LessonRef):
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(ge=10, le=90)
=======
class Concept(Contract):
    id: str = Field(min_length=1, max_length=100)
    track: Literal["sql", "python", "english", "ai"]
    prerequisites: list[str] = Field(default_factory=list, max_length=20)
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(ge=30, le=90)
    resource_ids: list[str] = Field(default_factory=list)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class Member(Contract):
    user_id: int = Field(gt=0)
    goal: str = Field(min_length=3, max_length=500)
<<<<<<< HEAD
    learner_tier: Literal["NEWBIE", "TRANSFER", "REFRESHER"] = "NEWBIE"
    preferred_days: list[int] = Field(default_factory=list, max_length=7)
    calendar: StudyCalendar | None = None
    removed_lessons: list[LessonRef] = Field(default_factory=list, max_length=600)
    lesson_overrides: list[LessonOverride] = Field(default_factory=list, max_length=600)
    custom_item_ids: list[str] = Field(default_factory=list, max_length=200)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    deadline: datetime | None = None
    concept_ids: list[str] = Field(min_length=1, max_length=100)
    known_concept_ids: list[str] = Field(default_factory=list, max_length=100)
    can_help_concept_ids: list[str] = Field(default_factory=list, max_length=100)
    committed_minutes_per_week: int = Field(ge=0, le=10080)
    availability: list[Availability] = Field(default_factory=list, max_length=50)
    timezone: str = "Asia/Ho_Chi_Minh"
    location: str = Field(default="Góc học tập của tôi", min_length=1, max_length=160)

    _timezone = field_validator("timezone")(timezone_name)
    _deadline = field_validator("deadline")(lambda v: aware(v) if v else v)

    @model_validator(mode="after")
    def unique_windows(self):
        if len({s.id for s in self.availability}) != len(self.availability):
            raise ValueError("Availability IDs must be unique")
        for i, left in enumerate(self.availability):
            for right in self.availability[i + 1 :]:
                if (
                    left.day_of_week == right.day_of_week
                    and left.start_time < right.end_time
                    and right.start_time < left.end_time
                ):
                    raise ValueError("Availability windows must not overlap")
        return self


class BusyInterval(Contract):
    start: datetime
    end: datetime
    _start = field_validator("start")(aware)
    _end = field_validator("end")(aware)

    @model_validator(mode="after")
    def ordered(self):
        if self.end <= self.start:
            raise ValueError("Busy interval must have end after start")
        return self


class PlannerInput(Contract):
    pair_id: int = Field(gt=0)
<<<<<<< HEAD
    members: list[Member] = Field(min_length=1, max_length=2)
    concepts: list[Concept] = Field(min_length=1, max_length=150)
    resources: dict[str, str] = Field(default_factory=dict)
    planning_start: datetime
    horizon_days: int = Field(default=7, ge=1, le=365)
=======
    members: list[Member] = Field(min_length=2, max_length=2)
    concepts: list[Concept] = Field(min_length=1, max_length=150)
    resources: dict[str, str] = Field(default_factory=dict)
    planning_start: datetime
    horizon_days: int = Field(default=7, ge=1, le=28)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    plan_version: int = Field(default=1, gt=0)
    catalog_source: str = "demo"
    busy_intervals: dict[int, list[BusyInterval]] = Field(default_factory=dict)

    _start = field_validator("planning_start")(aware)

    @model_validator(mode="after")
    def distinct_members(self):
<<<<<<< HEAD
        if len({m.user_id for m in self.members}) != len(self.members):
            raise ValueError("Distinct authorized members are required")
=======
        if self.members[0].user_id == self.members[1].user_id:
            raise ValueError("Two distinct pair members are required")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        return self


class Task(Contract):
    user_id: int = Field(gt=0)
    concept_id: str = Field(min_length=1)
<<<<<<< HEAD
    session_index: int = Field(default=1, ge=1, le=24)
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(ge=10, le=90)
=======
    action: str = Field(min_length=5, max_length=600)
    expected_output: str = Field(min_length=3, max_length=500)
    est_minutes: int = Field(ge=30, le=90)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    resource_ids: list[str] = Field(default_factory=list)


class TaskBatch(Contract):
<<<<<<< HEAD
    tasks: list[Task] = Field(max_length=600)
=======
    tasks: list[Task] = Field(max_length=300)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class Issue(Contract):
    code: str
    message: str
    user_id: int | None = None
    concept_id: str | None = None
    item_id: str | None = None


class PlanItem(Task):
    id: str = Field(default_factory=lambda: str(uuid4()))
    pair_id: int = Field(gt=0)
    plan_version: int = Field(gt=0)
    status: ItemStatus
<<<<<<< HEAD
    is_custom: bool = False
    display_order: int | None = Field(default=None, ge=0)
    planned_date: date | None = None
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    slot_id: str | None = None
    if_then_text: str | None = None
    defer_reason: str | None = None
    completed_at: datetime | None = None


class PersonalPlan(Contract):
    user_id: int
    pair_id: int
    plan_version: int
    items: list[PlanItem] = Field(default_factory=list)
    deferred_items: list[PlanItem] = Field(default_factory=list)
    partial: bool = False
    warnings: list[Issue] = Field(default_factory=list)


class PlannerOutput(Contract):
    pair_id: int
    plans: list[PersonalPlan]
    warnings: list[Issue] = Field(default_factory=list)
    peer_sessions: list[dict] = Field(default_factory=list)
    peer_session_reason: str = "OPTIONAL_NOT_REQUESTED"


class CompletionEvent(Contract):
    event_id: str = Field(min_length=1, max_length=120)
    plan_item_id: str
    pair_id: int = Field(gt=0)
    user_id: int = Field(gt=0)
    plan_version: int = Field(gt=0)
    confirmed_at: datetime
    confirmed: Literal[True]
    _confirmed_at = field_validator("confirmed_at")(aware)

    @field_validator("confirmed", mode="before")
    @classmethod
    def explicit_confirmation(cls, value):
        if value is not True:
            raise ValueError("AI Vision must explicitly confirm with boolean true")
        return value


class MetricSnapshot(Contract):
    pair_id: int
    as_of: datetime
    source: str
    plan_versions: dict[int, int]
    pacing: dict[int, float | None]
    due_count: dict[int, int]
    last_checkin: dict[int, datetime | None]
    gap: float | None = Field(default=None, ge=0, le=1)
    lagging_user_id: int | None = None
    _as_of = field_validator("as_of")(aware)

    @model_validator(mode="after")
    def bounded(self):
        for p in self.pacing.values():
            if p is not None and not 0 <= p <= 1:
                raise ValueError("Pacing must be between 0 and 1 or null")
        for stamp in self.last_checkin.values():
            if stamp is not None:
                aware(stamp)
        if any(count < 0 for count in self.due_count.values()):
            raise ValueError("due_count must be non-negative")
        return self


class GenerateRequest(Contract):
    pair_id: int = Field(gt=0)
<<<<<<< HEAD
    members: list[Member] = Field(min_length=1, max_length=2)
    horizon_days: int = Field(default=7, ge=1, le=365)

    @model_validator(mode="after")
    def unique_members(self):
        if len({m.user_id for m in self.members}) != len(self.members):
            raise ValueError("Distinct members are required")
        return self
=======
    members: list[Member] = Field(min_length=2, max_length=2)
    horizon_days: int = Field(default=7, ge=1, le=28)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class ReplanRequest(Contract):
    expected_version: int = Field(gt=0)
    reduce_load: bool = True
    reason: str = Field(default="Giảm tải và dùng thời gian còn lại", min_length=3, max_length=300)
<<<<<<< HEAD
    mode: Literal["weekly", "fewer_sessions", "lighter_lesson", "focus"] = "weekly"
    remove_sessions: int = Field(default=0, ge=0, le=20)
    target_item_id: str | None = Field(default=None, max_length=120)
    focus_concept_id: str | None = Field(default=None, max_length=100)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class AcceptRequest(Contract):
    expected_version: int = Field(gt=0)
