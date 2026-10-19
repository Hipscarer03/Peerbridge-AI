"""Plan orchestration. LLM divides tasks; code owns dates, state and authorization."""

import asyncio
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4
<<<<<<< HEAD
from zoneinfo import ZoneInfo

from ..agents.plan_coach.contract import (
    Availability,
    CompletionEvent,
    Concept,
    ItemStatus,
    LessonOverride,
    LessonRef,
    PlanItem,
=======

from ..agents.plan_coach.contract import (
    Availability,
    BusyInterval,
    CompletionEvent,
    Concept,
    ItemStatus,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    PlannerInput,
    PlannerOutput,
    Task,
)
from ..agents.plan_coach.fixtures import demo_catalog
from ..agents.plan_coach.llm import PlannerFailureError, PlanSettings, divide_tasks, provider
<<<<<<< HEAD
from ..agents.plan_coach.scheduler import (
    PlanValidationError,
    lesson_dependencies,
    lesson_order,
    schedule,
    template_tasks,
    validate_plan,
    week_key,
)
from ..db import database
=======
from ..agents.plan_coach.scheduler import PlanValidationError, if_then, schedule, slots, validate_plan, week_key
from ..db import database
from ..onboarding.catalog import load_catalog
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
from ..repositories.plans import PlanError, PlanRepository, digest, encode
from ..repositories.profiles import ProfileRepository


<<<<<<< HEAD
def preserve_display_order(plan, previous):
    orders = {item.id: item.display_order for item in previous if item.display_order is not None}
    for item in plan.items + plan.deferred_items:
        if item.id in orders:
            item.display_order = orders[item.id]
=======
def suggested_concepts(needs, plan_concept_ids) -> list[str]:
    """Concept trong danh mục Plan khớp tên hoặc alias với chủ đề người học cần (vd "RAG Pipeline" -> ai.rag_pipeline)."""
    names = {}
    for c in load_catalog():
        for name in (c.name, *c.aliases):
            names.setdefault(name.casefold().strip(), c.id)
    ids = (names.get(str(n.get("topic", "")).casefold().strip()) for n in needs)
    return list(dict.fromkeys(cid for cid in ids if cid in plan_concept_ids))
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class PlanService:
    def __init__(self, settings=None, llm_factory=None, clock=None):
        self.settings = settings or PlanSettings()
        self.llm_factory = llm_factory or provider
        self.clock = clock or (lambda: datetime.now(UTC))

    def catalog(self):
        if not self.settings.catalog_path:
            return demo_catalog(), {}, "demo"
        try:
            raw = json.loads(Path(self.settings.catalog_path).read_text(encoding="utf-8"))
            concepts = [Concept.model_validate(c) for c in raw["concepts"]]
        except (OSError, ValueError, KeyError, TypeError):
<<<<<<< HEAD
            raise PlanError("BAD_CATALOG", "Danh mục nội dung học chưa sẵn sàng hoặc không hợp lệ", 503) from None
=======
            raise PlanError("BAD_CATALOG", "Danh mục concept của team chưa sẵn sàng hoặc không hợp lệ", 503) from None
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        resources = raw.get("resources", {})
        if not isinstance(resources, dict) or not all(
            isinstance(k, str) and isinstance(v, str) and v.startswith("https://") for k, v in resources.items()
        ):
            raise PlanError("BAD_CATALOG", "Danh mục nguồn học của team không hợp lệ", 503)
        return concepts, resources, "team"

    def busy_intervals(self, db, members):
<<<<<<< HEAD
        # Retired room appointments are historical data, not current commitments.
        return {}

    def curriculum_context(self, ctx):
        latest = {c.id: c for c in self.catalog()[0]}
        return ctx.model_copy(update={"concepts": [latest.get(c.id, c) for c in ctx.concepts]})

    def setup(self, pair_id, user, include_peer_inputs=False):
=======
        result = {}
        for m in members:
            rows = db.execute(
                "SELECT scheduled_start,scheduled_end FROM study_sessions WHERE (learner_id=? OR helper_id=?) AND scheduled_start IS NOT NULL AND scheduled_end IS NOT NULL",
                (m.user_id, m.user_id),
            ).fetchall()
            try:
                result[m.user_id] = [BusyInterval(start=r[0], end=r[1]) for r in rows]
            except ValueError:
                raise PlanError(
                    "SESSION_TIME_INVALID", "Lịch phiên học có thời gian thiếu múi giờ; cần sửa lịch phiên học", 422
                ) from None
        return result

    def setup(self, pair_id, user):
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        with database() as db:
            pair = PlanRepository(db).pair(pair_id, user)
            members = []
            for uid in (pair["user_a_id"], pair["user_b_id"]):
<<<<<<< HEAD
                if uid != user["id"] and not include_peer_inputs:
                    continue
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                bundle = ProfileRepository(db).get_profile_bundle(uid)
                if not bundle:
                    raise PlanError("PROFILE_MISSING", "Thành viên chưa có hồ sơ", 422)
                members.append(
                    {
                        "user_id": uid,
                        "display_name": bundle["profile"]["display_name"],
                        "goals": bundle["profile"]["learning_goals"],
<<<<<<< HEAD
                        "target_date": (self.clock() + timedelta(days=bundle["profile"].get("matching_goal", {}).get("duration_days", 0))).date().isoformat() if bundle["profile"].get("matching_goal", {}).get("duration_days") else None,
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                        "needs": bundle["needs_help_with"],
                        "strengths": bundle["can_help_with"],
                        "availability": bundle["availability"],
                    }
                )
        concepts, resources, source = self.catalog()
<<<<<<< HEAD
=======
        plan_ids = {c.id for c in concepts}
        for m in members:
            m["suggested_concept_ids"] = suggested_concepts(m["needs"], plan_ids)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        return {
            "pair_id": pair_id,
            "members": members,
            "concepts": [c.model_dump(mode="json") for c in concepts],
            "resources": resources,
            "catalog_source": source,
            "provider_mode": self.settings.llm_provider,
            "dependencies": [
<<<<<<< HEAD
                "Nội dung muốn học, phần đã biết, thời gian cam kết và hạn hoàn thành cần xác nhận",
=======
                "AI Data 1: chọn concept/đã biết, cam kết và deadline cần xác nhận",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                "AI Vision: sự kiện check-in xác nhận",
                "AI Data 1: metric",
                "SE/PO: adapter gửi và cron",
            ],
        }

    def read(self, pair_id, user):
        with database() as db:
            repo = PlanRepository(db)
            pair = repo.pair(pair_id, user)
            row = repo.active(pair_id, user["id"])
<<<<<<< HEAD
            from .plan_together import registrations
            together = registrations(db, pair_id)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            partner_uid = pair["user_b_id"] if pair["user_a_id"] == user["id"] else pair["user_a_id"]
            partner = repo.active(pair_id, partner_uid)
            partner_summary = None
            if partner:
                p = repo.hydrated(partner)
                context, _ = repo.context(partner)
                member = next(m for m in context.members if m.user_id == partner_uid)
                partner_summary = {
                    "user_id": partner_uid,
                    "goal": member.goal,
<<<<<<< HEAD
                    "calendar": member.calendar.model_dump(mode="json") if member.calendar else None,
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    "version": p.plan_version,
                    "scheduled_count": len(p.items),
                    "completed_count": sum(i.status == ItemStatus.COMPLETED for i in p.items),
                    "deferred_count": len(p.deferred_items),
                    "partial": p.partial,
<<<<<<< HEAD
                    "items": [i.model_dump(mode="json") for i in [*p.items, *p.deferred_items]],
=======
                    "items": [i.model_dump(mode="json") for i in p.items],
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                }
            draft = db.execute(
                "SELECT * FROM pb_plans WHERE pair_id=? AND user_id=? AND status='DRAFT' ORDER BY version DESC LIMIT 1",
                (pair_id, user["id"]),
            ).fetchone()
            if not row:
<<<<<<< HEAD
                return {"plan": None, "partner": partner_summary, "proposal": None, "study_together": together}
=======
                return {"plan": None, "partner": partner_summary, "proposal": None}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            ctx, _ = repo.context(row)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            trace = db.execute(
                "SELECT body FROM pb_traces WHERE pair_id=? AND kind='planner' ORDER BY created_at DESC,id DESC LIMIT 1",
                (pair_id,),
            ).fetchone()
<<<<<<< HEAD
            own_plan = repo.hydrated(row)
            return {
                "id": row["id"],
                "study_together": together,
                "plan": own_plan.model_dump(mode="json"),
                "can_expand_lessons": member.calendar is not None and set(lesson_order(self.curriculum_context(ctx), member)) != {(i.concept_id, i.session_index) for i in own_plan.items + own_plan.deferred_items if not i.is_custom},
                "timezone": member.timezone,
                "available_days": member.preferred_days,
                "calendar": member.calendar.model_dump(mode="json") if member.calendar else None,
=======
            return {
                "id": row["id"],
                "plan": repo.hydrated(row).model_dump(mode="json"),
                "timezone": member.timezone,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                "goal": member.goal,
                "partner": partner_summary,
                "catalog_source": ctx.catalog_source,
                "resources": ctx.resources,
                "provider_mode": json.loads(trace["body"])["provider_mode"] if trace else "unknown",
                "proposal": self._proposal(repo, dict(draft)) if draft else None,
            }

<<<<<<< HEAD
    def check_lesson_time(self, db, ctx, own, item, start, minutes, payload, now):
        if start.tzinfo is None:
            raise PlanError("TIMEZONE", "Giờ học phải có múi giờ.", 422)
        start = start.astimezone(UTC)
        end = start + timedelta(minutes=minutes)
        if (start != item.scheduled_start and start < now) or start > now + timedelta(days=365):
            raise PlanError("TIME_RANGE", "Chọn giờ học trong tương lai, tối đa một năm.", 422)
        member = next(m for m in ctx.members if m.user_id == item.user_id)
        for other in own.items:
            if other.id != item.id and other.scheduled_start and other.scheduled_end and start < other.scheduled_end and end > other.scheduled_start:
                raise PlanError("OVERLAP", "Giờ này trùng một việc khác của bạn.", 422)
        day = start.astimezone(ZoneInfo(member.timezone)).date()
        if member.deadline and end > member.deadline:
            raise PlanError("DEADLINE", "Buổi học phải kết thúc trước hạn hoàn thành.", 422)
        if member.calendar:
            if end.astimezone(ZoneInfo(member.timezone)).date() != day:
                raise PlanError("OVERNIGHT", "Chọn giờ để buổi học kết thúc trong cùng ngày.", 422)
            if not member.calendar.start_date <= day <= member.calendar.end_date:
                raise PlanError("CALENDAR_RANGE", "Ngày học nằm ngoài khoảng kế hoạch.", 422)
            if day in member.calendar.buffer_dates and not payload.confirm_buffer:
                raise PlanError("BUFFER_CONFIRMATION", "Đây là ngày đệm. Xác nhận nếu bạn muốn dùng ngày này để học.", 422)
        if member.committed_minutes_per_week:
            spent = sum(i.est_minutes for i in own.items if i.id != item.id and i.scheduled_start and week_key(i.scheduled_start, member) == week_key(start, member))
            if spent + minutes > member.committed_minutes_per_week * 4 // 5:
                raise PlanError("WEEKLY_BUDGET", "Tuần này đã dùng hết thời gian học; cần giữ 20% thời gian đệm.", 422)
        for busy in self.busy_intervals(db, [member]).get(member.user_id, []):
            if start < busy.end and end > busy.start:
                raise PlanError("SESSION_OVERLAP", "Giờ này trùng một phiên học đã đặt.", 422)
        dependencies = set(lesson_dependencies(ctx, member, item.concept_id, item.session_index)) if not item.is_custom else set()
        for other in own.items + own.deferred_items:
            if other.id == item.id or other.is_custom:
                continue
            prerequisite_fits = (other.scheduled_end <= start if other.scheduled_end else bool(member.calendar and other.planned_date and other.planned_date < day))
            if (other.concept_id, other.session_index) in dependencies and other.status != ItemStatus.COMPLETED and not prerequisite_fits:
                raise PlanError("PREREQUISITE", "Xếp việc này sau việc cần học trước.", 422)
            dependent = not item.is_custom and (item.concept_id, item.session_index) in lesson_dependencies(ctx, member, other.concept_id, other.session_index)
            if dependent and other.status != ItemStatus.COMPLETED and other.scheduled_start and end > other.scheduled_start:
                raise PlanError("DEPENDENT", "Xếp việc này trước việc học tiếp theo.", 422)
            if dependent and other.status != ItemStatus.COMPLETED and not other.scheduled_start and other.planned_date and end.astimezone(ZoneInfo(member.timezone)).date() >= other.planned_date:
                raise PlanError("DEPENDENT_DATE", "Buổi học tiếp theo đã có ngày. Hãy dời buổi đó trước khi đổi thứ tự.", 422)
        if member.calendar and day not in member.calendar.study_dates and day not in member.calendar.buffer_dates:
            member.calendar.study_dates.append(day)
            member.calendar.study_dates.sort()

        return start, end, day

    def edit_schedule(self, pair_id, user, item_id, payload):
        return self.change_lesson(pair_id, user, payload, item_id)

    def edit_schedules(self, pair_id, user, payload):
        now = self.clock()
=======
    def edit_schedule(self, pair_id, user, item_id, payload):
        now = self.clock()
        start = payload.scheduled_start
        if start.tzinfo is None:
            raise PlanError("TIMEZONE", "Giờ học phải có múi giờ.", 422)
        start = start.astimezone(UTC)
        end = start + timedelta(minutes=payload.minutes)
        if start < now or start > now + timedelta(days=365):
            raise PlanError("TIME_RANGE", "Chọn giờ học trong tương lai, tối đa một năm.", 422)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            row = repo.active(pair_id, user["id"])
            if not row:
                raise PlanError("NO_PLAN", "Bạn chưa có kế hoạch.", 404)
            if row["version"] != payload.expected_version:
<<<<<<< HEAD
                raise PlanError("STALE_PLAN", "Kế hoạch vừa thay đổi. Tải lại trước khi đặt giờ.", 409)
            own = repo.hydrated(row)
            ctx, caps = repo.context(row)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            by_id = {item.id: item for item in own.items + own.deferred_items}
            requested = []
            for entry in payload.items:
                item = by_id.get(entry.item_id)
                if item is None:
                    raise PlanError("NOT_OWN_ITEM", "Chỉ được đặt giờ cho buổi học trong kế hoạch của mình.", 403)
                if item.status == ItemStatus.COMPLETED:
                    raise PlanError("DONE_ITEM", "Buổi đã hoàn thành không thể đổi lịch.", 409)
                if entry.scheduled_start.tzinfo is None:
                    raise PlanError("TIMEZONE", "Giờ học phải có múi giờ.", 422)
                day = entry.scheduled_start.astimezone(ZoneInfo(member.timezone)).date()
                current_day = item.planned_date or (item.scheduled_start.astimezone(ZoneInfo(member.timezone)).date() if item.scheduled_start else None)
                if current_day is None or current_day != day:
                    raise PlanError("DATE_TIME_MISMATCH", "Tác vụ này chỉ áp dụng giờ và giữ nguyên ngày của từng buổi.", 422)
                requested.append((entry, item))

            # Validate and apply in date order so overlaps between selected lessons
            # are checked against both the existing plan and earlier batch entries.
            for entry, item in sorted(requested, key=lambda pair: pair[0].scheduled_start):
                start, end, day = self.check_lesson_time(
                    db, ctx, own, item, entry.scheduled_start, item.est_minutes, payload, now
                )
                item.scheduled_start, item.scheduled_end = start, end
                item.planned_date = day
                item.status, item.defer_reason, item.slot_id = ItemStatus.SCHEDULED, None, None
                item.if_then_text = "Đến giờ đã chọn, mình dành thời gian cho: " + item.action
                own.items = [current for current in own.items if current.id != item.id]
                own.deferred_items = [current for current in own.deferred_items if current.id != item.id]
                own.items.append(item)

            own.items.sort(key=lambda item: item.scheduled_start or now)
            own.partial = bool(own.deferred_items)
            if not any(not item.planned_date for item in own.deferred_items):
                own.warnings = []
            own.plan_version = repo.next_version(pair_id, user["id"])
            for item in own.items + own.deferred_items:
                item.plan_version = own.plan_version
            ctx = PlannerInput.model_validate(ctx.model_copy(update={"plan_version": own.plan_version}).model_dump(mode="json"))
            db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (row["id"],))
            db.execute("UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'", (pair_id, user["id"]))
            new_id = repo.insert(own, ctx, now, base=row["id"], reason="Bạn đặt giờ cho nhiều buổi học", caps=caps)
            repo.trace(pair_id, "lessons_scheduled", {"user_id": user["id"], "item_ids": [item.id for _, item in requested], "version": own.plan_version}, now)
            return {"plan_id": new_id, "plan_version": own.plan_version, "scheduled_count": len(requested)}

    def change_lesson(self, pair_id, user, payload, item_id=None, delete=False):
        now = self.clock()
        fields = payload.model_fields_set
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            row = repo.active(pair_id, user["id"])
            if not row:
                raise PlanError("NO_PLAN", "Bạn chưa có kế hoạch.", 404)
            if row["version"] != payload.expected_version:
                raise PlanError("STALE_PLAN", "Kế hoạch vừa thay đổi. Tải lại trước khi sửa.", 409)
            own = repo.hydrated(row)
            ctx, caps = repo.context(row)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            item = next((i for i in own.items + own.deferred_items if i.id == item_id), None) if item_id else None
            if item_id and item is None:
                raise PlanError("NOT_OWN_ITEM", "Chỉ được sửa buổi học trong kế hoạch của mình.", 403)
            if item and item.status == ItemStatus.COMPLETED:
                raise PlanError("DONE_ITEM", "Buổi đã hoàn thành được giữ trong nhật ký.", 409)
            created = item is None
            if created:
                if len(member.custom_item_ids) >= 200:
                    raise PlanError("LESSON_LIMIT", "Kế hoạch đã có đủ 200 buổi tự thêm.", 422)
                item = PlanItem(user_id=user["id"], pair_id=pair_id, plan_version=own.plan_version,
                                concept_id=member.concept_ids[0], action=payload.action,
                                expected_output=payload.expected_output, est_minutes=payload.minutes,
                                is_custom=True, status=ItemStatus.DEFERRED, defer_reason="NO_STUDY_DATE")
                member.custom_item_ids.append(item.id)
                own.deferred_items.append(item)
            if delete:
                own.items = [i for i in own.items if i.id != item.id]
                own.deferred_items = [i for i in own.deferred_items if i.id != item.id]
                if item.is_custom:
                    member.custom_item_ids = [value for value in member.custom_item_ids if value != item.id]
                elif not any(ref.concept_id == item.concept_id and ref.session_index == item.session_index for ref in member.removed_lessons):
                    member.removed_lessons.append(LessonRef(concept_id=item.concept_id, session_index=item.session_index))
                reason = "Bạn xóa buổi học"
            else:
                for name in ("action", "expected_output"):
                    if name in fields and getattr(payload, name) is not None:
                        setattr(item, name, getattr(payload, name))
                minutes = getattr(payload, "minutes", None) or item.est_minutes
                start = item.scheduled_start
                day = item.planned_date
                if "planned_date" in fields:
                    day = payload.planned_date
                if "scheduled_start" in fields:
                    start = payload.scheduled_start
                elif "planned_date" in fields and day is not None and start is not None:
                    start = datetime.combine(day, start.astimezone(ZoneInfo(member.timezone)).time(), ZoneInfo(member.timezone))
                elif "planned_date" in fields and day is None:
                    start = None
                if start:
                    if "planned_date" in fields and day is not None and start.tzinfo is not None and start.astimezone(ZoneInfo(member.timezone)).date() != day:
                        raise PlanError("DATE_TIME_MISMATCH", "Ngày và giờ học phải thuộc cùng một ngày.", 422)
                    start, end, day = self.check_lesson_time(db, ctx, own, item, start, minutes, payload, now)
                    item.scheduled_start, item.scheduled_end = start, end
                    item.status, item.defer_reason, item.slot_id = ItemStatus.SCHEDULED, None, None
                    item.if_then_text = "Đến giờ đã chọn, mình dành thời gian cho: " + item.action
                else:
                    if day:
                        today = now.astimezone(ZoneInfo(member.timezone)).date()
                        if (day != item.planned_date and day < today) or (member.deadline and day > member.deadline.astimezone(ZoneInfo(member.timezone)).date()):
                            raise PlanError("DATE_RANGE", "Chọn ngày từ hôm nay đến hạn hoàn thành.", 422)
                        if member.calendar:
                            if not member.calendar.start_date <= day <= member.calendar.end_date:
                                raise PlanError("CALENDAR_RANGE", "Ngày học nằm ngoài khoảng kế hoạch.", 422)
                            if day in member.calendar.buffer_dates and not payload.confirm_buffer:
                                raise PlanError("BUFFER_CONFIRMATION", "Xác nhận nếu muốn dùng ngày đệm để học.", 422)
                            if day not in member.calendar.study_dates and day not in member.calendar.buffer_dates:
                                member.calendar.study_dates.append(day)
                                member.calendar.study_dates.sort()
                        if not item.is_custom:
                            dependencies = set(lesson_dependencies(ctx, member, item.concept_id, item.session_index))
                            for other in own.items + own.deferred_items:
                                if other.id == item.id or other.is_custom:
                                    continue
                                other_day = other.scheduled_end.astimezone(ZoneInfo(member.timezone)).date() if other.scheduled_end else other.planned_date
                                if (other.concept_id, other.session_index) in dependencies and (not other_day or other_day >= day):
                                    raise PlanError("PREREQUISITE", "Chọn ngày sau buổi cần học trước.", 422)
                                if (item.concept_id, item.session_index) in lesson_dependencies(ctx, member, other.concept_id, other.session_index) and other_day and day >= other_day:
                                    raise PlanError("DEPENDENT_DATE", "Chọn ngày trước buổi học tiếp theo.", 422)
                    item.scheduled_start = item.scheduled_end = item.slot_id = item.if_then_text = None
                    item.status = ItemStatus.DEFERRED
                    item.defer_reason = "AWAITING_TIME" if day else "NO_STUDY_DATE"
                item.planned_date, item.est_minutes = day, minutes
                own.items = [i for i in own.items if i.id != item.id]
                own.deferred_items = [i for i in own.deferred_items if i.id != item.id]
                (own.deferred_items if item.status == ItemStatus.DEFERRED else own.items).append(item)
                if not item.is_custom and any(name in fields for name in ("action", "expected_output", "minutes")):
                    member.lesson_overrides = [change for change in member.lesson_overrides if (change.concept_id, change.session_index) != (item.concept_id, item.session_index)]
                    member.lesson_overrides.append(LessonOverride(concept_id=item.concept_id, session_index=item.session_index,
                                                                  action=item.action, expected_output=item.expected_output, est_minutes=item.est_minutes))
                reason = "Bạn thêm buổi học" if created else "Bạn sửa buổi học"
            own.items.sort(key=lambda i: i.scheduled_start or now)
            own.partial = bool(own.deferred_items)
            if not any(not i.planned_date for i in own.deferred_items):
                own.warnings = []
            own.plan_version = repo.next_version(pair_id, user["id"])
            for current in own.items + own.deferred_items:
                current.plan_version = own.plan_version
            ctx = PlannerInput.model_validate(ctx.model_copy(update={"plan_version": own.plan_version}).model_dump(mode="json"))
            db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (row["id"],))
            db.execute("UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'", (pair_id, user["id"]))
            new_id = repo.insert(own, ctx, now, base=row["id"], reason=reason, caps=caps)
            if delete:
                if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='facilitated_meetings'").fetchone():
                    db.execute("""UPDATE facilitated_meetings SET status='CANCELLED', updated_at=?
                        WHERE peer_match_id=? AND plan_item_id=?
                        AND status IN ('INVITED','CONFIRMED','ACTIVE','NEEDS_RECONFIRMATION')""",
                        (now.astimezone(UTC).isoformat(), pair_id, item.id))
                if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='pb_plan_together'").fetchone():
                    db.execute("DELETE FROM pb_plan_together WHERE pair_id=? AND item_id=?", (pair_id, item.id))
            repo.trace(pair_id, "lesson_changed", {"user_id": user["id"], "item_id": item.id, "version": own.plan_version, "deleted": delete}, now)
            return {"plan_id": new_id, "plan_version": own.plan_version, "item_id": item.id}

    def reorder_lessons(self, pair_id, user, payload):
        now = self.clock()
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            row = repo.active(pair_id, user["id"])
            if not row:
                raise PlanError("NO_PLAN", "Bạn chưa có kế hoạch.", 404)
            if row["version"] != payload.expected_version:
                raise PlanError("STALE_PLAN", "Kế hoạch vừa thay đổi. Tải lại trước khi sắp xếp.", 409)
            own = repo.hydrated(row)
            items = own.items + own.deferred_items
            current_ids = {item.id for item in items}
            if len(payload.item_ids) != len(set(payload.item_ids)) or set(payload.item_ids) != current_ids:
                raise PlanError("INVALID_ITEM_ORDER", "Danh sách buổi học đã thay đổi. Tải lại kế hoạch rồi thử lại.", 422)

            ctx, caps = repo.context(row)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            positions = {item_id: index for index, item_id in enumerate(payload.item_ids)}
            for item in items:
                if item.is_custom:
                    continue
                dependencies = set(lesson_dependencies(ctx, member, item.concept_id, item.session_index))
                for prerequisite in items:
                    if not prerequisite.is_custom and (prerequisite.concept_id, prerequisite.session_index) in dependencies and positions[prerequisite.id] > positions[item.id]:
                        raise PlanError("PREREQUISITE_ORDER", "Buổi học cần giữ sau nội dung tiên quyết.", 422)

            by_id = {item.id: item for item in items}
            for index, item_id in enumerate(payload.item_ids):
                by_id[item_id].display_order = index
            own.plan_version = repo.next_version(pair_id, user["id"])
            for item in items:
                item.plan_version = own.plan_version
            ctx = PlannerInput.model_validate(ctx.model_copy(update={"plan_version": own.plan_version}).model_dump(mode="json"))
            db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (row["id"],))
            db.execute("UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'", (pair_id, user["id"]))
            new_id = repo.insert(own, ctx, now, base=row["id"], reason="Bạn sắp xếp lại thứ tự buổi học", caps=caps)
            repo.trace(pair_id, "lessons_reordered", {"user_id": user["id"], "version": own.plan_version, "item_ids": payload.item_ids}, now)
            return {"plan_id": new_id, "plan_version": own.plan_version}

    def expand_lessons(self, pair_id, user, expected_version):
        now = self.clock()
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            row = repo.active(pair_id, user["id"])
            if not row or row["version"] != expected_version:
                raise PlanError("STALE_PLAN", "Kế hoạch vừa thay đổi. Tải lại trước khi cập nhật.")
            ctx, _ = repo.context(row)
            ctx = self.curriculum_context(ctx)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            if member.calendar is None:
                raise PlanError("CALENDAR_REQUIRED", "Kế hoạch này chưa có lịch theo ngày.", 422)
            previous = repo.hydrated(row)
            all_items = previous.items + previous.deferred_items
            if set(lesson_order(ctx, member)) == {(i.concept_id, i.session_index) for i in all_items if not i.is_custom}:
                return {"plan_id": row["id"], "plan_version": row["version"]}
            ctx = ctx.model_copy(update={"members": [member], "planning_start": now, "plan_version": repo.next_version(pair_id, user["id"]), "busy_intervals": self.busy_intervals(db, [member])})
            done = [i for i in all_items if i.status == ItemStatus.COMPLETED]
            tasks = template_tasks(ctx, done)
            output = schedule(ctx, tasks, completed=done, previous=all_items, user_ids={user["id"]})
            plan = output.plans[0]
            preserve_display_order(plan, all_items)
            db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (row["id"],))
            db.execute("UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'", (pair_id, user["id"]))
            new_id = repo.insert(plan, ctx, now, base=row["id"], reason="Bổ sung đầy đủ buổi học")
            repo.trace(pair_id, "lessons_expanded", {"user_id": user["id"], "version": plan.plan_version, "lessons": len(plan.items) + len(plan.deferred_items)}, now)
            return {"plan_id": new_id, "plan_version": plan.plan_version}
=======
                raise PlanError("STALE_PLAN", "Lịch vừa thay đổi. Tải lại trước khi sửa.", 409)
            own = repo.hydrated(row)
            item = next((i for i in own.items + own.deferred_items if i.id == item_id), None)
            if not item:
                raise PlanError("NOT_OWN_ITEM", "Chỉ được sửa việc trong lịch của mình.", 403)
            if item.status == ItemStatus.COMPLETED:
                raise PlanError("DONE_ITEM", "Việc đã hoàn thành được giữ trong nhật ký.", 409)
            for other in own.items:
                if other.id != item_id and other.scheduled_start and other.scheduled_end and start < other.scheduled_end and end > other.scheduled_start:
                    raise PlanError("OVERLAP", "Giờ này trùng một việc khác của bạn.", 422)
            ctx, caps = repo.context(row)
            member = next(m for m in ctx.members if m.user_id == user["id"])
            busy_intervals = self.busy_intervals(db, ctx.members)
            window = next((sid for sid, a, b in slots(ctx, member) if a <= start and end <= b), None)
            if window is None:
                raise PlanError("OUTSIDE_WINDOW", "Chọn giờ trong lịch rảnh, khoảng lập kế hoạch và trước hạn mục tiêu.", 422)
            for busy in busy_intervals.get(user["id"], []):
                if start < busy.end and end > busy.start:
                    raise PlanError("SESSION_OVERLAP", "Giờ này trùng một phiên học đã đặt.", 422)
            concepts = {c.id: c for c in ctx.concepts}
            for other in own.items + own.deferred_items:
                if other.id == item.id: continue
                if other.concept_id in concepts[item.concept_id].prerequisites and other.status != ItemStatus.COMPLETED and (not other.scheduled_end or other.scheduled_end > start):
                    raise PlanError("PREREQUISITE", "Xếp việc này sau việc cần học trước.", 422)
                if item.concept_id in concepts[other.concept_id].prerequisites and other.status != ItemStatus.COMPLETED and other.scheduled_start and end > other.scheduled_start:
                    raise PlanError("DEPENDENT", "Xếp việc này trước việc học tiếp theo.", 422)
            item.scheduled_start, item.scheduled_end = start, end
            item.est_minutes, item.status = payload.minutes, ItemStatus.SCHEDULED
            item.defer_reason, item.slot_id = None, window
            item.if_then_text = if_then(item, member)
            if item in own.deferred_items:
                own.deferred_items.remove(item); own.items.append(item)
            own.items.sort(key=lambda i: i.scheduled_start or now)
            own.partial = bool(own.deferred_items)
            own.plan_version = repo.next_version(pair_id, user["id"])
            for i in own.items + own.deferred_items: i.plan_version = own.plan_version
            ctx = ctx.model_copy(update={"plan_version": own.plan_version, "busy_intervals": busy_intervals})
            validate_plan(ctx, PlannerOutput(pair_id=pair_id, plans=[own]), budget_caps=caps, user_ids={user["id"]})
            db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (row["id"],))
            db.execute("UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'", (pair_id, user["id"]))
            new_id = repo.insert(own, ctx, now, base=row["id"], reason="Bạn tự điều chỉnh lịch", caps=caps)
            repo.trace(pair_id, "schedule_edited", {"user_id": user["id"], "item_id": item_id, "version": own.plan_version}, now)
        return {"plan_id": new_id, "plan_version": own.plan_version}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

    def traces(self, pair_id, user):
        with database() as db:
            PlanRepository(db).pair(pair_id, user)
            rows = db.execute(
                "SELECT id,kind,body,created_at FROM pb_traces WHERE pair_id=? ORDER BY created_at DESC,id DESC LIMIT 30",
                (pair_id,),
            ).fetchall()
            return {
                "traces": [
                    {"id": r["id"], "kind": r["kind"], "body": json.loads(r["body"]), "created_at": r["created_at"]}
                    for r in rows
                ]
            }

<<<<<<< HEAD
    async def generate(self, request, user, request_key, *, draft_concepts=None, draft_source=None):
        if not 1 <= len(request_key) <= 120:
            raise PlanError("REQUEST_KEY", "Cần Idempotency-Key dài 1–120 ký tự", 422)
        fingerprint = digest(request) if not draft_concepts else digest({
            "request": request.model_dump(mode="json"),
            "draft_concepts": [c.model_dump(mode="json") for c in draft_concepts],
        })
        now, token = self.clock(), uuid4().hex
        setup = self.setup(request.pair_id, user, include_peer_inputs=True)
        if draft_concepts:
            with database() as db:
                draft = db.execute(
                    "SELECT payload,source FROM pb_concept_drafts WHERE pair_id=? AND user_id=? AND request_key=?",
                    (request.pair_id, user["id"], request_key),
                ).fetchone()
            if not draft or digest(json.loads(draft["payload"])) != digest([c.model_dump(mode="json") for c in draft_concepts]):
                raise PlanError("DRAFT_INVALID", "Nội dung học mới không khớp bản nháp đã lưu", 422)
            existing_ids = {c["id"] for c in setup["concepts"]}
            if existing_ids & {c.id for c in draft_concepts}:
                raise PlanError("DRAFT_COLLISION", "Nội dung học mới trùng ID catalog", 422)
            setup["concepts"].extend(c.model_dump(mode="json") for c in draft_concepts)
            setup["catalog_source"] = "team+private-" + (draft_source or draft["source"])
        requested_ids = {m.user_id for m in request.members}
        if requested_ids != {user["id"]} and requested_ids != {m["user_id"] for m in setup["members"]}:
=======
    async def generate(self, request, user, request_key):
        if not 1 <= len(request_key) <= 120:
            raise PlanError("REQUEST_KEY", "Cần Idempotency-Key dài 1–120 ký tự", 422)
        now, fingerprint, token = self.clock(), digest(request), uuid4().hex
        setup = self.setup(request.pair_id, user)
        if {m.user_id for m in request.members} != {m["user_id"] for m in setup["members"]}:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            raise PlanError("MEMBER_MISMATCH", "Hai thành viên phải khớp peer_matches", 403)
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            old = db.execute(
                "SELECT * FROM pb_plan_requests WHERE pair_id=? AND actor_id=? AND request_key=?",
                (request.pair_id, user["id"], request_key),
            ).fetchone()
            if old:
                if old["request_hash"] != fingerprint:
                    raise PlanError("KEY_REUSED", "Idempotency-Key đã dùng cho nội dung khác")
                if old["status"] == "DONE":
                    return json.loads(old["result"])
                if old["status"] == "PENDING" and now - datetime.fromisoformat(old["created_at"]) < timedelta(
                    minutes=5
                ):
                    raise PlanError("IN_PROGRESS", "Yêu cầu đang được xử lý; thử đọc plan sau ít phút")
                db.execute(
                    "UPDATE pb_plan_requests SET status='PENDING',owner_token=?,created_at=? WHERE id=?",
                    (token, now.isoformat(), old["id"]),
                )
            else:
                db.execute(
                    "INSERT INTO pb_plan_requests(pair_id,actor_id,request_key,request_hash,owner_token,status,created_at) VALUES (?,?,?,?,?,'PENDING',?)",
                    (request.pair_id, user["id"], request_key, fingerprint, token, now.isoformat()),
                )
            if any(repo.active(request.pair_id, m.user_id) for m in request.members):
                raise PlanError("PLAN_EXISTS", "Cặp đã có plan; dùng phương án điều chỉnh")
            for m in request.members:
                if db.execute(
                    "SELECT 1 FROM pb_plans WHERE user_id=? AND pair_id<>? AND status='ACTIVE'",
                    (m.user_id, request.pair_id),
                ).fetchone():
                    raise PlanError(
                        "ACTIVE_PLAN_ELSEWHERE", "MVP chỉ giữ một plan hoạt động/người để bảo đảm ngân sách tuần"
                    )
            version = max(repo.next_version(request.pair_id, m.user_id) for m in request.members)
        # Reuse profile availability if already present; no second profile system.
        members = []
        for m in request.members:
            bundle = next(x for x in setup["members"] if x["user_id"] == m.user_id)
            try:
<<<<<<< HEAD
                if bundle["availability"] and len(request.members) > 1 and m.calendar is None:
=======
                if bundle["availability"]:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    zones = {w["timezone"] for w in bundle["availability"]}
                    if len(zones) != 1:
                        raise PlanError("MIXED_TIMEZONES", "Cần thống nhất múi giờ trong hồ sơ", 422)
                    m = m.model_copy(
                        update={
                            "availability": [
                                Availability.model_validate(
                                    {
                                        "id": str(w["id"]),
                                        "day_of_week": w["day_of_week"],
                                        "start_time": w["start_time"],
                                        "end_time": w["end_time"],
                                    }
                                )
                                for w in bundle["availability"]
                            ],
                            "timezone": zones.pop(),
                        }
                    )
                m = type(m).model_validate(m.model_dump(mode="json"))
            except PlanError:
                self._fail_request(request.pair_id, user["id"], request_key, token)
                raise
            except ValueError:
                self._fail_request(request.pair_id, user["id"], request_key, token)
                raise PlanError(
                    "PROFILE_PLAN_CONSTRAINTS",
                    "Múi giờ hoặc khung giờ trong hồ sơ không hợp lệ cho Plan; cần cập nhật hồ sơ",
                    422,
                ) from None
            members.append(m)
        ctx = PlannerInput(
            pair_id=request.pair_id,
            members=members,
            concepts=setup["concepts"],
            resources=setup["resources"],
            planning_start=now,
            horizon_days=request.horizon_days,
            plan_version=version,
            catalog_source=setup["catalog_source"],
        )
        trace = None
        try:
            try:
                llm = self.llm_factory(ctx, self.settings)
            except ValueError:
                raise PlanError("PROVIDER_CONFIGURATION", "Provider chưa được cấu hình đầy đủ", 503) from None
            tasks, trace = await divide_tasks(ctx, llm, self.settings.llm_timeout_seconds)
            with database() as db:
                db.execute("BEGIN IMMEDIATE")
                repo = PlanRepository(db)
                # Refresh the anchor after generation. A one-minute lead avoids saving work already in the past.
                ctx = ctx.model_copy(
                    update={
                        "planning_start": self.clock() + timedelta(minutes=1),
                        "busy_intervals": self.busy_intervals(db, ctx.members),
                    }
                )
                output = schedule(ctx, tasks)
                validate_plan(ctx, output)
                owner = db.execute(
                    "SELECT owner_token,status FROM pb_plan_requests WHERE pair_id=? AND actor_id=? AND request_key=?",
                    (ctx.pair_id, user["id"], request_key),
                ).fetchone()
                if not owner or owner["owner_token"] != token or owner["status"] != "PENDING":
                    raise PlanError("REQUEST_CHANGED", "Yêu cầu đã được tiếp quản; đọc lại plan")
                if any(repo.active(ctx.pair_id, m.user_id) for m in ctx.members):
                    raise PlanError("PLAN_EXISTS", "Plan đã được tạo đồng thời; đọc lại plan")
                for m in ctx.members:
                    if db.execute(
                        "SELECT 1 FROM pb_plans WHERE user_id=? AND pair_id<>? AND status='ACTIVE'",
                        (m.user_id, ctx.pair_id),
                    ).fetchone():
                        raise PlanError("ACTIVE_PLAN_ELSEWHERE", "Thành viên đã có plan ở cặp khác; tải lại")
                ids = {p.user_id: repo.insert(p, ctx, now) for p in output.plans}
<<<<<<< HEAD
                if draft_concepts:
                    db.execute(
                        "UPDATE pb_concept_drafts SET plan_id=? WHERE pair_id=? AND user_id=? AND request_key=?",
                        (ids[user["id"]], ctx.pair_id, user["id"], request_key),
                    )
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                trace_id = repo.trace(ctx.pair_id, "planner", trace, now)
                result = {
                    "plan_ids": ids,
                    "version": version,
                    "trace_id": trace_id,
                    "partial": any(p.partial for p in output.plans),
                    "provider_mode": trace["provider_mode"],
                    "catalog_source": ctx.catalog_source,
                }
                db.execute(
                    "UPDATE pb_plan_requests SET status='DONE',result=? WHERE pair_id=? AND actor_id=? AND request_key=? AND owner_token=?",
                    (encode(result), ctx.pair_id, user["id"], request_key, token),
                )
            from ..agents.plan_coach.tracing import export_db_trace

            await asyncio.to_thread(
                export_db_trace,
                self.settings,
                "planner",
                trace,
                trace_id,
                {"plan_ids": list(ids.values()), "plan_version": version},
            )
            return result
        except Exception as error:
            self._fail_request(ctx.pair_id, user["id"], request_key, token)
            if isinstance(error, PlannerFailureError):
                with database() as db:
                    error.trace_id = PlanRepository(db).trace(ctx.pair_id, "planner_error", error.trace, now)
                from ..agents.plan_coach.tracing import export_db_trace

                await asyncio.to_thread(export_db_trace, self.settings, "planner_error", error.trace, error.trace_id)
            elif isinstance(error, PlanValidationError):
                error_body = {**(trace or {}), "validation_errors": [i.model_dump(mode="json") for i in error.issues]}
                with database() as db:
                    error_trace_id = PlanRepository(db).trace(
                        ctx.pair_id,
                        "planner_error",
                        error_body,
                        now,
                    )
                from ..agents.plan_coach.tracing import export_db_trace

                await asyncio.to_thread(export_db_trace, self.settings, "planner_error", error_body, error_trace_id)
            raise

    def _fail_request(self, pair_id, uid, key, token):
        with database() as db:
            db.execute(
                "UPDATE pb_plan_requests SET status='FAILED' WHERE pair_id=? AND actor_id=? AND request_key=? AND owner_token=? AND status='PENDING'",
                (pair_id, uid, key, token),
            )

    def complete(self, event: CompletionEvent):
        now = self.clock()
        if event.confirmed_at > now:
            raise PlanError("FUTURE_CHECKIN", "Thời điểm xác nhận không được ở tương lai", 422)
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            old = db.execute(
                "SELECT event_hash FROM pb_completion_events WHERE event_id=?", (event.event_id,)
            ).fetchone()
            if old:
                if old["event_hash"] != digest(event):
                    raise PlanError("EVENT_CONFLICT", "event_id đã dùng cho nội dung khác")
                return {"applied": False, "duplicate": True}
            row = db.execute(
                "SELECT * FROM pb_plans WHERE pair_id=? AND user_id=? AND version=? AND status IN ('ACTIVE','SUPERSEDED')",
                (event.pair_id, event.user_id, event.plan_version),
            ).fetchone()
            active = repo.active(event.pair_id, event.user_id)
            if not row or not active:
                raise PlanError("CHECKIN_PLAN", "Phiên bản plan không hợp lệ", 422)
            historic = repo.hydrated(dict(row))
            current = repo.hydrated(active)
            item = next((i for i in historic.items if i.id == event.plan_item_id), None)
            if not item or not any(i.id == item.id for i in current.items + current.deferred_items):
                raise PlanError("CHECKIN_ITEM", "Check-in không tham chiếu việc đã xếp của thành viên", 422)
            if item.scheduled_start and event.confirmed_at < item.scheduled_start:
                raise PlanError("EARLY_CHECKIN", "Check-in trước thời điểm thực hiện việc", 422)
            # A moved scheduled item keeps its identity, including a late event on an old version.
            db.execute(
                "INSERT INTO pb_completion_events(event_id,item_id,event_hash,confirmed_at) VALUES (?,?,?,?)",
                (event.event_id, item.id, digest(event), event.confirmed_at.isoformat()),
            )
            applied = (
                db.execute(
                    "UPDATE pb_plan_items SET completed_at=?,completed_payload=? WHERE id=? AND completed_at IS NULL",
                    (event.confirmed_at.isoformat(), encode(item), item.id),
                ).rowcount
                == 1
            )
            return {"applied": applied, "duplicate": not applied}

    def _proposal(self, repo, row):
        base = repo.plan(row["base_plan_id"], row["pair_id"], row["user_id"])
        ctx, caps = repo.context(row)
        member = next(m for m in ctx.members if m.user_id == row["user_id"])
        # Use the draft's progress snapshot, not live completion events arriving
        # after preview. Acceptance separately rejects any changed progress.
        draft = repo.hydrated(row)
        stored = type(draft).model_validate_json(row["payload"])
        budgets = []
        for (uid, week), cap in sorted(caps.items()):
            if uid != row["user_id"]:
                continue
            baseline = member.committed_minutes_per_week * 4 // 5
            completed = sum(
                i.est_minutes
                for i in stored.items
                if i.status == ItemStatus.COMPLETED and week_key(i.scheduled_start, member) == week
            )
            budgets.append(
                {
                    "week_start": week,
                    "baseline_minutes": baseline,
                    "completed_minutes": completed,
                    "remaining_minutes": max(0, baseline - completed),
                    "proposed_limit_minutes": cap,
                }
            )
        return {
            "id": row["id"],
            "status": row["status"],
            "expected_version": base["version"],
            "reason": row["reason"],
            "cutoff": row["cutoff"],
            "budget": budgets,
            "before": repo.hydrated(base).model_dump(mode="json"),
            "after": draft.model_dump(mode="json"),
        }

    def replan(self, pair_id, user, request):
        now = self.clock()
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            active = repo.active(pair_id, user["id"])
            if not active or active["version"] != request.expected_version:
                raise PlanError("STALE_PLAN", "Plan đã thay đổi; tải lại trước khi điều chỉnh")
            original, _ = repo.context(active)
            end = original.planning_start + timedelta(days=original.horizon_days)
            member = next(m for m in original.members if m.user_id == user["id"])
<<<<<<< HEAD
            lower_weekly_budget = request.mode == "weekly" and request.reduce_load
            if lower_weekly_budget and not member.committed_minutes_per_week:
                raise PlanError("TIME_BUDGET_UNKNOWN", "Chưa có ngân sách thời gian tuần để tính giảm tải 20%. Bạn có thể tự đổi lịch từng buổi.", 422)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            end = min(end, member.deadline or end)
            # Expired horizon yields a controlled response, without inventing a new deadline.
            if now >= end:
                raise PlanError(
                    "HORIZON_EXPIRED", "Khoảng lập kế hoạch/deadline đã hết; cần chốt mục tiêu và mốc mới", 422
                )
            anchor = now + timedelta(minutes=1)
            if anchor >= end:
                raise PlanError("HORIZON_TOO_SHORT", "Không còn đủ thời gian để xem và xác nhận lịch mới", 422)
            p = repo.hydrated(active)
            prior = p.items + p.deferred_items
            done = [i for i in prior if i.status == ItemStatus.COMPLETED]
<<<<<<< HEAD
            remaining_lessons = [i for i in prior if i.user_id == user["id"] and i.status != ItemStatus.COMPLETED and not i.is_custom]
            removed = list(member.removed_lessons)
            overrides = list(member.lesson_overrides)
            member_updates = {}
            if request.mode in ("fewer_sessions", "focus"):
                if request.mode == "fewer_sessions" and request.remove_sessions < 1:
                    raise PlanError("LESSON_COUNT", "Hãy chọn số buổi muốn bớt.", 422)
                focus = request.focus_concept_id if request.mode == "focus" else None
                if focus and focus not in {i.concept_id for i in remaining_lessons}:
                    raise PlanError("FOCUS_NOT_FOUND", "Không tìm thấy phần bạn muốn tập trung trong các buổi còn lại.", 422)
                if focus:
                    member_updates["concept_ids"] = [focus, *[cid for cid in member.concept_ids if cid != focus]]
                protected = {r["plan_item_id"] for r in db.execute(
                    "SELECT plan_item_id FROM facilitated_meetings WHERE peer_match_id=? AND plan_item_id IS NOT NULL AND status IN ('INVITED','CONFIRMED','ACTIVE','NEEDS_RECONFIRMATION')",
                    (pair_id,),
                )}
                focus_ancestors = set()
                if focus:
                    catalog = {concept.id: concept for concept in original.concepts}
                    def keep_prerequisites(cid):
                        if cid in focus_ancestors:
                            return
                        focus_ancestors.add(cid)
                        for prerequisite in catalog[cid].prerequisites:
                            keep_prerequisites(prerequisite)
                    keep_prerequisites(focus)
                candidates = [i for i in reversed(remaining_lessons) if i.id not in protected and i.concept_id not in focus_ancestors]
                if request.remove_sessions > len(candidates) or request.remove_sessions >= len(remaining_lessons):
                    raise PlanError("LESSON_COUNT", "Không thể bớt số buổi này; cần giữ bài nền tảng và buổi học chung.", 422)
                removed.extend(LessonRef(concept_id=i.concept_id, session_index=i.session_index) for i in candidates[:request.remove_sessions])
                member_updates["removed_lessons"] = removed
            elif request.mode == "lighter_lesson":
                target = next((i for i in remaining_lessons if i.id == request.target_item_id), None)
                if target is None:
                    raise PlanError("LESSON_NOT_FOUND", "Hãy chọn một buổi chưa học để làm nhẹ.", 422)
                lighter = LessonOverride(
                    concept_id=target.concept_id, session_index=target.session_index,
                    action=("Làm một ví dụ nhỏ: " + target.action)[:600],
                    expected_output="Một ví dụ đã làm và điều còn vướng",
                    est_minutes=max(10, min(60, target.est_minutes // 2)),
                )
                overrides = [item for item in overrides if (item.concept_id, item.session_index) != (target.concept_id, target.session_index)]
                member_updates["lesson_overrides"] = [*overrides, lighter]
            if member_updates:
                member = member.model_copy(update=member_updates)
            version = repo.next_version(pair_id, user["id"])
            # Keep the original end by shortening deadlines; fresh cutoff never compounds reduction.
            members = [
                member.model_copy(update={"deadline": end}) if m.user_id == user["id"] else m for m in original.members
=======
            version = repo.next_version(pair_id, user["id"])
            # Keep the original end by shortening deadlines; fresh cutoff never compounds reduction.
            members = [
                m.model_copy(update={"deadline": end}) if m.user_id == user["id"] else m for m in original.members
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            ]
            ctx = original.model_copy(
                update={
                    "planning_start": anchor,
<<<<<<< HEAD
                    "horizon_days": min(365, max(1, int((end - now).total_seconds() // 86400) + 1)),
=======
                    "horizon_days": min(28, max(1, int((end - now).total_seconds() // 86400) + 1)),
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    "plan_version": version,
                    "members": members,
                }
            )
            ctx.busy_intervals = self.busy_intervals(db, [m for m in ctx.members if m.user_id == user["id"]])
            caps = {}
            for m in ctx.members:
<<<<<<< HEAD
                if not m.committed_minutes_per_week:
                    continue
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                for d in range(ctx.horizon_days + 1):
                    wk = week_key(now + timedelta(days=d), m)
                    completed_spent = sum(
                        i.est_minutes for i in done if i.user_id == m.user_id and week_key(i.scheduled_start, m) == wk
                    )
                    remaining = max(0, m.committed_minutes_per_week * 4 // 5 - completed_spent)
<<<<<<< HEAD
                    caps[m.user_id, wk] = remaining * 4 // 5 if lower_weekly_budget else remaining
            removed_keys = {(item.concept_id, item.session_index) for item in member.removed_lessons}
            override_by_key = {(item.concept_id, item.session_index): item for item in member.lesson_overrides}
            tasks = []
            for item in prior:
                key = (item.concept_id, item.session_index)
                if item.status == ItemStatus.COMPLETED or item.is_custom or key in removed_keys:
                    continue
                values = {field: getattr(item, field) for field in Task.model_fields}
                if key in override_by_key:
                    change = override_by_key[key]
                    values.update(action=change.action, expected_output=change.expected_output, est_minutes=change.est_minutes)
                tasks.append(Task.model_validate(values))
            output = schedule(ctx, tasks, completed=done, previous=prior, budget_caps=caps, user_ids={user["id"]})
            own = next(p for p in output.plans if p.user_id == user["id"])
            preserve_display_order(own, prior)
=======
                    caps[m.user_id, wk] = remaining * 4 // 5 if request.reduce_load else remaining
            tasks = [
                Task.model_validate({k: i.model_dump()[k] for k in Task.model_fields})
                for i in prior
                if i.status != ItemStatus.COMPLETED
            ]
            output = schedule(ctx, tasks, completed=done, previous=prior, budget_caps=caps, user_ids={user["id"]})
            own = next(p for p in output.plans if p.user_id == user["id"])
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            # Older pending proposals remain history and cannot be accepted.
            db.execute(
                "UPDATE pb_plans SET status='REJECTED' WHERE pair_id=? AND user_id=? AND status='DRAFT'",
                (pair_id, user["id"]),
            )
            pid = repo.insert(
                own,
                ctx,
                now,
                status="DRAFT",
                base=active["id"],
                progress=repo.progress_hash(active),
                reason=request.reason,
                caps=caps,
            )
            repo.trace(
                pair_id,
                "replan",
                {
                    "user_id": user["id"],
                    "proposal_id": pid,
                    "base_version": active["version"],
                    "cutoff": now.isoformat(),
<<<<<<< HEAD
                    "reduction": 0.2 if lower_weekly_budget else 0,
                    "mode": request.mode,
                    "remaining_before": len(remaining_lessons),
                    "remaining_after": len(remaining_lessons) - request.remove_sessions,
=======
                    "reduction": 0.2 if request.reduce_load else 0,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                },
                now,
            )
            return self._proposal(repo, repo.plan(pid, pair_id, user["id"]))

    def decide_proposal(self, pair_id, proposal_id, user, expected_version, accept):
        now = self.clock()
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            repo = PlanRepository(db)
            repo.pair(pair_id, user)
            proposal = repo.plan(proposal_id, pair_id, user["id"])
            if proposal["base_plan_id"] is None:
                raise PlanError("NOT_PROPOSAL", "Đây không phải phương án điều chỉnh")
            base = repo.plan(proposal["base_plan_id"], pair_id, user["id"])
            if base["version"] != expected_version:
                raise PlanError("STALE_PLAN", "Phiên bản trước/sau không khớp")
            if proposal["status"] == "ACTIVE" and accept:
                return {"applied": False, "duplicate": True, "plan_id": proposal_id}
            if proposal["status"] == "REJECTED" and not accept:
                return {"applied": False, "duplicate": True, "plan_id": proposal_id}
            active = repo.active(pair_id, user["id"])
            if proposal["status"] != "DRAFT" or not active or active["id"] != base["id"]:
                raise PlanError("STALE_PROPOSAL", "Phương án không còn áp dụng được; tạo phương án mới")
            if accept:
                if repo.progress_hash(active) != proposal["progress_hash"]:
                    raise PlanError("PROGRESS_CHANGED", "Có check-in mới; tạo lại phương án để giữ tiến độ")
                ctx, caps = repo.context(proposal)
                ctx.busy_intervals = self.busy_intervals(db, [m for m in ctx.members if m.user_id == user["id"]])
                # Revalidate only the consenting person's proposal; companion deadlines/progress are independent.
                own = repo.hydrated(proposal)
                if any(i.status == ItemStatus.SCHEDULED and i.scheduled_start < now for i in own.items):
                    raise PlanError("PROPOSAL_EXPIRED", "Giờ trong phương án đã qua; tạo lại phương án")
                validate_plan(ctx, PlannerOutput(pair_id=pair_id, plans=[own]), budget_caps=caps, user_ids={user["id"]})
                db.execute("UPDATE pb_plans SET status='SUPERSEDED' WHERE id=?", (active["id"],))
                db.execute(
                    "UPDATE pb_plans SET status='ACTIVE',accepted_at=? WHERE id=?", (now.isoformat(), proposal_id)
                )
                repo.trace(
                    pair_id,
                    "replan_accepted",
                    {"proposal_id": proposal_id, "user_id": user["id"], "base_version": expected_version},
                    now,
                )
            else:
                db.execute("UPDATE pb_plans SET status='REJECTED' WHERE id=?", (proposal_id,))
            return {"applied": accept, "duplicate": False, "plan_id": proposal_id}


def get_plan_service():
    return PlanService()
