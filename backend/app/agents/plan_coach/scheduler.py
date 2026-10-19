import re
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

<<<<<<< HEAD
from .contract import (
    BusyInterval,
    Issue,
    ItemStatus,
    LessonTemplate,
    Member,
    PersonalPlan,
    PlanItem,
    PlannerInput,
    PlannerOutput,
    Task,
)
=======
from .contract import Issue, ItemStatus, Member, PersonalPlan, PlanItem, PlannerInput, PlannerOutput, Task
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


class PlanValidationError(ValueError):
    def __init__(self, issues: list[Issue]):
        self.issues = issues
        super().__init__("; ".join(i.code + ": " + i.message for i in issues))


def concept_order(ctx: PlannerInput, member: Member) -> list[str]:
    catalog = {c.id: c for c in ctx.concepts}
<<<<<<< HEAD
    seen, result = set(member.known_concept_ids), []
=======
    # An explicit target can be a review goal. Only skip known prerequisites.
    seen, result = set(member.known_concept_ids) - set(member.concept_ids), []
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

    def visit(cid):
        if cid in seen:
            return
        seen.add(cid)
        for prerequisite in catalog[cid].prerequisites:
            visit(prerequisite)
        result.append(cid)

    for cid in member.concept_ids:
        visit(cid)
    return result


<<<<<<< HEAD
def base_lesson_templates(ctx: PlannerInput, member: Member, cid: str):
    concept = next(c for c in ctx.concepts if c.id == cid)
    if member.calendar is None:
        return [LessonTemplate(action=concept.action, expected_output=concept.expected_output, est_minutes=concept.est_minutes)]
    if concept.lessons:
        return concept.lessons
    return [
        LessonTemplate(action="Tìm hiểu và làm ví dụ mẫu: " + concept.action[:530], expected_output="Ghi chú các bước chính và một ví dụ đã giải thích", est_minutes=concept.est_minutes),
        LessonTemplate(action="Tự thực hành: " + concept.action[:550], expected_output=concept.expected_output, est_minutes=concept.est_minutes),
        LessonTemplate(action="Ôn tập, sửa lỗi và tự kiểm tra: " + concept.action[:520], expected_output="Bài làm đã sửa và ghi chú những điểm còn cần luyện", est_minutes=concept.est_minutes),
    ]


def lesson_templates(ctx: PlannerInput, member: Member, cid: str):
    result = list(base_lesson_templates(ctx, member, cid))
    for change in member.lesson_overrides:
        if change.concept_id == cid and change.session_index <= len(result):
            result[change.session_index - 1] = LessonTemplate(action=change.action, expected_output=change.expected_output, est_minutes=change.est_minutes)
    return result


def lesson_order(ctx: PlannerInput, member: Member):
    removed = {(ref.concept_id, ref.session_index) for ref in member.removed_lessons}
    return [(cid, index) for cid in concept_order(ctx, member) for index in range(1, len(lesson_templates(ctx, member, cid)) + 1) if (cid, index) not in removed]


def task_key(item):
    return item.user_id, item.concept_id, item.session_index


def lesson_dependencies(ctx, member, cid, index):
    remaining = set(lesson_order(ctx, member))
    previous = [i for c, i in remaining if c == cid and i < index]
    if previous:
        return [(cid, max(previous))]
    concept = next(c for c in ctx.concepts if c.id == cid)
    return [(p, max(i for c, i in remaining if c == p)) for p in concept.prerequisites if p not in member.known_concept_ids and any(c == p for c, _ in remaining)]


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def validate_context(ctx: PlannerInput, user_ids=None):
    if user_ids is not None and (not user_ids or not user_ids <= {m.user_id for m in ctx.members}):
        raise PlanValidationError([Issue(code="MEMBER_SCOPE", message="Selected members must belong to the pair")])
    catalog = {c.id: c for c in ctx.concepts}
    issues = []
    if len(catalog) != len(ctx.concepts):
        issues.append(Issue(code="DUPLICATE_CONCEPT", message="Concept IDs must be unique"))
    for concept in ctx.concepts:
        for prerequisite in concept.prerequisites:
            if prerequisite not in catalog:
                issues.append(
                    Issue(
                        code="UNKNOWN_PREREQUISITE",
                        message=f"Missing prerequisite {prerequisite}",
                        concept_id=concept.id,
                    )
                )
        if any(r not in ctx.resources for r in concept.resource_ids):
            issues.append(
                Issue(
                    code="UNKNOWN_RESOURCE", message="Resource is not in the supplied registry", concept_id=concept.id
                )
            )
    for m in ctx.members:
        for cid in m.concept_ids + m.known_concept_ids + m.can_help_concept_ids:
            if cid not in catalog:
                issues.append(
                    Issue(code="UNKNOWN_CONCEPT", message=f"Unknown concept {cid}", user_id=m.user_id, concept_id=cid)
                )
        if (user_ids is None or m.user_id in user_ids) and m.deadline and m.deadline <= ctx.planning_start:
            issues.append(
                Issue(code="DEADLINE_PAST", message="Deadline is before the planning start", user_id=m.user_id)
            )
    if issues:
        raise PlanValidationError(issues)
    visited, visiting = set(), set()

    def visit(cid):
        if cid in visiting:
            raise PlanValidationError(
                [Issue(code="PREREQUISITE_CYCLE", message=f"Cycle through {cid}", concept_id=cid)]
            )
        if cid in visited:
            return
        visiting.add(cid)
        for prerequisite in catalog[cid].prerequisites:
            visit(prerequisite)
        visiting.remove(cid)
        visited.add(cid)

    for cid in catalog:
        visit(cid)


def validate_tasks(ctx: PlannerInput, tasks: list[Task], completed: list[PlanItem] | None = None, *, user_ids=None):
    validate_context(ctx, user_ids)
    catalog = {c.id: c for c in ctx.concepts}
    members = {m.user_id: m for m in ctx.members}
<<<<<<< HEAD
    done = {task_key(i) for i in completed or [] if not i.is_custom}
    expected = {
        (m.user_id, cid, index)
        for m in ctx.members
        if user_ids is None or m.user_id in user_ids
        for cid, index in lesson_order(ctx, m)
    } - done
    actual, issues = set(), []
    for task in tasks:
        key = task_key(task)
=======
    done = {(i.user_id, i.concept_id) for i in completed or []}
    expected = {
        (m.user_id, cid)
        for m in ctx.members
        if user_ids is None or m.user_id in user_ids
        for cid in concept_order(ctx, m)
    } - done
    actual, issues = set(), []
    for task in tasks:
        key = task.user_id, task.concept_id
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        if key in actual:
            issues.append(
                Issue(
                    code="DUPLICATE_TASK",
<<<<<<< HEAD
                    message="Each required lesson must appear exactly once",
=======
                    message="One task per required concept in MVP",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    user_id=task.user_id,
                    concept_id=task.concept_id,
                )
            )
        actual.add(key)
<<<<<<< HEAD
        member = members.get(task.user_id)
        change = next((value for value in member.lesson_overrides if (value.concept_id, value.session_index) == (task.concept_id, task.session_index)), None) if member else None
        if change and (task.action, task.expected_output, task.est_minutes) != (change.action, change.expected_output, change.est_minutes):
            issues.append(Issue(code="USER_LESSON_CHANGED", message="Keep the learner's edited lesson content and duration", user_id=task.user_id, concept_id=task.concept_id))
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        if task.user_id not in members or task.concept_id not in catalog or key not in expected:
            issues.append(
                Issue(
                    code="UNEXPECTED_TASK",
                    message="Task is outside the authorized goal/concept closure",
                    user_id=task.user_id,
                    concept_id=task.concept_id,
                )
            )
        if any(r not in ctx.resources for r in task.resource_ids):
            issues.append(
                Issue(
                    code="UNKNOWN_RESOURCE",
                    message="Only supplied resource IDs are allowed",
                    concept_id=task.concept_id,
                )
            )
<<<<<<< HEAD
        if not change and re.search(
=======
        if re.search(
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            r"https?://|www\.|\b[a-z0-9-]+\.(?:com|org|net|edu|io|vn)(?:/|\b)",
            task.action + " " + task.expected_output,
            re.I,
        ):
            issues.append(
                Issue(code="INLINE_URL", message="Use resource IDs, not generated URLs", concept_id=task.concept_id)
            )
<<<<<<< HEAD
    for uid, cid, index in expected - actual:
        issues.append(
            Issue(
                code="MISSING_TASK",
                message=f"Required lesson {index} is missing",
=======
    for uid, cid in expected - actual:
        issues.append(
            Issue(
                code="MISSING_TASK",
                message="Required concept/prerequisite task is missing",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                user_id=uid,
                concept_id=cid,
            )
        )
    if issues:
        raise PlanValidationError(issues)


def template_tasks(ctx: PlannerInput, completed: list[PlanItem] | None = None) -> list[Task]:
    validate_context(ctx)
    catalog = {c.id: c for c in ctx.concepts}
<<<<<<< HEAD
    done = {task_key(i) for i in completed or [] if not i.is_custom}
=======
    done = {(i.user_id, i.concept_id) for i in completed or []}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return [
        Task(
            user_id=m.user_id,
            concept_id=cid,
<<<<<<< HEAD
            session_index=index,
            action=lesson.action if any(change.concept_id == cid and change.session_index == index for change in m.lesson_overrides) else (("Ôn tóm tắt và luyện tập: " if m.learner_tier == "REFRESHER" else "") + lesson.action)[:600],
            expected_output=lesson.expected_output,
            est_minutes=lesson.est_minutes,
=======
            action=catalog[cid].action,
            expected_output=catalog[cid].expected_output,
            est_minutes=catalog[cid].est_minutes,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            resource_ids=catalog[cid].resource_ids,
        )
        for m in ctx.members
        for cid in concept_order(ctx, m)
<<<<<<< HEAD
        for index, lesson in enumerate(lesson_templates(ctx, m, cid), 1)
        if (cid, index) in set(lesson_order(ctx, m))
        if (m.user_id, cid, index) not in done
=======
        if (m.user_id, cid) not in done
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    ]


def week_key(stamp: datetime, member: Member) -> str:
    local = stamp.astimezone(ZoneInfo(member.timezone)).date()
    return (local - timedelta(days=local.weekday())).isoformat()


def slots(ctx: PlannerInput, member: Member):
    tz = ZoneInfo(member.timezone)
    begin = ctx.planning_start.astimezone(tz).date()
    limit = ctx.planning_start + timedelta(days=ctx.horizon_days)
    result = []
    for offset in range(ctx.horizon_days + 1):
        day = begin + timedelta(days=offset)
        for window in member.availability:
            if day.weekday() != window.day_of_week:
                continue
            start = datetime.combine(day, window.start_time, tz).astimezone(UTC)
            end = datetime.combine(day, window.end_time, tz).astimezone(UTC)
            # Reject nonexistent/ambiguous DST wall times rather than guessing a fold.
            for wall, instant in [(window.start_time, start), (window.end_time, end)]:
                local = datetime.combine(day, wall, tz)
                if (
                    instant.astimezone(tz).replace(tzinfo=None) != local.replace(tzinfo=None)
                    or local.utcoffset() != local.replace(fold=1).utcoffset()
                ):
                    raise PlanValidationError(
                        [
                            Issue(
                                code="DST_WINDOW",
                                message="Ambiguous or nonexistent local window",
                                user_id=member.user_id,
                            )
                        ]
                    )
            end = min(end, limit, member.deadline or limit)
            if end > ctx.planning_start and start < limit:
                result.append((f"{window.id}@{day.isoformat()}", max(start, ctx.planning_start), end))
    return sorted(result, key=lambda s: (s[1], s[0]))


def if_then(item: PlanItem, member: Member) -> str:
    local = item.scheduled_start.astimezone(ZoneInfo(member.timezone))
    return f"Nếu {local:%d/%m/%Y lúc %H:%M} tại {member.location} thì {item.action} ({item.est_minutes} phút)."


<<<<<<< HEAD
def plan_days(ctx, member, tasks, completed, previous):
    """Keep every lesson; assign only confirmed study dates without inventing hours."""
    task_map = {task_key(t): t for t in tasks}
    items = [i.model_copy(update={"plan_version": ctx.plan_version}) for i in completed if i.user_id == member.user_id]
    prior = {(i.concept_id, i.session_index): i for i in previous if i.user_id == member.user_id and not i.is_custom}
    today = ctx.planning_start.astimezone(ZoneInfo(member.timezone)).date()
    end = min(member.calendar.end_date, today + timedelta(days=ctx.horizon_days))
    if member.deadline:
        end = min(end, member.deadline.astimezone(ZoneInfo(member.timezone)).date())
    dates = {(i.concept_id, i.session_index): i.scheduled_end.astimezone(ZoneInfo(member.timezone)).date() for i in items if not i.is_custom}
    for lesson in lesson_order(ctx, member):
        old = prior.get(lesson)
        if lesson not in dates and old and old.scheduled_start and old.scheduled_end and old.scheduled_start >= ctx.planning_start and old.scheduled_end <= (member.deadline or ctx.planning_start + timedelta(days=ctx.horizon_days)):
            task = task_map[(member.user_id, *lesson)]
            kept = old.model_copy(update={
                "plan_version": ctx.plan_version,
                "action": task.action,
                "expected_output": task.expected_output,
                "est_minutes": task.est_minutes,
                "scheduled_end": old.scheduled_start + timedelta(minutes=task.est_minutes),
            })
            if kept.if_then_text:
                kept.if_then_text = if_then(kept, member)
            items.append(kept)
            dates[lesson] = old.scheduled_end.astimezone(ZoneInfo(member.timezone)).date()
    custom_dates = {i.planned_date for i in previous if i.is_custom and i.id in member.custom_item_ids and i.planned_date}
    available = sorted(day for day in member.calendar.study_dates if today <= day <= end and day not in dates.values() and day not in custom_dates)
    deferred = []
    order = lesson_order(ctx, member)
    for cid, index in order:
        lesson = (cid, index)
        if lesson in dates:
            continue
        dependencies = lesson_dependencies(ctx, member, cid, index)
        earliest = max([dates[p] + timedelta(days=1) for p in dependencies if p in dates] or [today])
        later_dates = [dates[key] for key in dates if lesson in lesson_dependencies(ctx, member, *key)]
        chosen = next((day for day in available if day >= earliest and (not later_dates or day < min(later_dates))), None) if all(p in dates for p in dependencies) else None
        if chosen:
            available.remove(chosen)
            dates[lesson] = chosen
        deferred.append(PlanItem(
            **task_map[(member.user_id, cid, index)].model_dump(), pair_id=ctx.pair_id,
            plan_version=ctx.plan_version, status=ItemStatus.DEFERRED, planned_date=chosen,
            defer_reason="AWAITING_TIME" if chosen else "NO_STUDY_DATE",
            **({"id": prior[lesson].id} if lesson in prior else {}),
        ))
    return PersonalPlan(user_id=member.user_id, pair_id=ctx.pair_id, plan_version=ctx.plan_version,
                        items=items, deferred_items=deferred, partial=bool(deferred),
                        warnings=[Issue(code="NO_STUDY_DATE", message="Một số buổi chưa chọn ngày; xem danh sách buổi học.", user_id=member.user_id)] if any(not i.planned_date for i in deferred) else [])


=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
def schedule(
    ctx: PlannerInput,
    tasks: list[Task],
    *,
    completed: list[PlanItem] | None = None,
    previous: list[PlanItem] | None = None,
    budget_caps: dict[tuple[int, str], int] | None = None,
    user_ids: set[int] | None = None,
) -> PlannerOutput:
<<<<<<< HEAD
    validation_ctx = ctx
    if previous:
        busy = {uid: list(intervals) for uid, intervals in ctx.busy_intervals.items()}
        for item in previous:
            member = next((m for m in ctx.members if m.user_id == item.user_id), None)
            if item.is_custom and member and item.id in member.custom_item_ids and item.scheduled_start and item.scheduled_end and item.scheduled_start >= ctx.planning_start:
                busy.setdefault(item.user_id, []).append(BusyInterval(start=item.scheduled_start, end=item.scheduled_end))
        ctx = ctx.model_copy(update={"busy_intervals": busy})
    completed = completed or []
    validate_tasks(ctx, tasks, completed, user_ids=user_ids)
=======
    completed = completed or []
    validate_tasks(ctx, tasks, completed, user_ids=user_ids)
    catalog = {c.id: c for c in ctx.concepts}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    task_map = {(t.user_id, t.concept_id): t for t in tasks}
    prior = {(i.user_id, i.concept_id): i for i in previous or []}
    plans = []
    for m in ctx.members:
        if user_ids is not None and m.user_id not in user_ids:
            continue
<<<<<<< HEAD
        if m.calendar is not None and not m.availability:
            plans.append(plan_days(ctx, m, tasks, completed, previous or []))
            continue
        items = [i.model_copy(update={"plan_version": ctx.plan_version}) for i in completed if i.user_id == m.user_id]
        ends = {i.concept_id: i.scheduled_end for i in items if not i.is_custom}
=======
        items = [i.model_copy(update={"plan_version": ctx.plan_version}) for i in completed if i.user_id == m.user_id]
        ends = {i.concept_id: i.scheduled_end for i in items}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        used_slots = {i.slot_id for i in items}
        spent = defaultdict(int)
        for i in items:
            spent[week_key(i.scheduled_start, m)] += i.est_minutes
        new_spent = defaultdict(int)
        deferred = []
        windows = slots(ctx, m)
<<<<<<< HEAD
        for cid, _ in lesson_order(ctx, m):
=======
        for cid in concept_order(ctx, m):
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            if cid in ends:
                continue
            task = task_map[(m.user_id, cid)]
            previous_item = prior.get((m.user_id, cid))
            item = PlanItem(
                **task.model_dump(),
                pair_id=ctx.pair_id,
                plan_version=ctx.plan_version,
                status=ItemStatus.DEFERRED,
                **({"id": previous_item.id} if previous_item else {}),
            )
<<<<<<< HEAD
            missing = [p for p, _ in lesson_dependencies(ctx, m, cid, 1) if p not in ends]
=======
            missing = [p for p in catalog[cid].prerequisites if p not in m.known_concept_ids and p not in ends]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            reason = "PREREQUISITE_DEFERRED" if missing else "NO_FITTING_SLOT_OR_BUDGET"
            if not missing:
                for slot_id, start, end in windows:
                    if slot_id in used_slots:
                        continue
<<<<<<< HEAD
                    prerequisites_end = [ends[p] for p, _ in lesson_dependencies(ctx, m, cid, 1) if p in ends]
=======
                    prerequisites_end = [ends[p] for p in catalog[cid].prerequisites if p in ends]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    start = max([start] + prerequisites_end)
                    for busy in sorted(ctx.busy_intervals.get(m.user_id, []), key=lambda b: b.start):
                        if start < busy.end and busy.start < start + timedelta(minutes=task.est_minutes):
                            start = busy.end.astimezone(UTC)
                    finish = start + timedelta(minutes=task.est_minutes)
                    if finish > end:
                        continue
                    wk = week_key(start, m)
                    if spent[wk] + task.est_minutes > m.committed_minutes_per_week * 4 // 5:
                        continue
                    if budget_caps is not None and new_spent[wk] + task.est_minutes > budget_caps.get(
                        (m.user_id, wk), m.committed_minutes_per_week * 4 // 5
                    ):
                        continue
                    if any(start < i.scheduled_end and i.scheduled_start < finish for i in items):
                        continue
                    item = item.model_copy(
                        update={
                            "status": ItemStatus.SCHEDULED,
                            "scheduled_start": start,
                            "scheduled_end": finish,
                            "slot_id": slot_id,
                        }
                    )
                    item.if_then_text = if_then(item, m)
                    used_slots.add(slot_id)
                    spent[wk] += task.est_minutes
                    new_spent[wk] += task.est_minutes
                    ends[cid] = finish
                    items.append(item)
                    break
            if item.status == ItemStatus.DEFERRED:
                item.defer_reason = reason
                deferred.append(item)
        warnings = (
            [
                Issue(
                    code="PARTIAL_PLAN",
                    message="Một phần mục tiêu chưa được xếp trong khoảng lập kế hoạch; xem mục để sau.",
                    user_id=m.user_id,
                )
            ]
            if deferred
            else []
        )
        if not any(i.status == ItemStatus.SCHEDULED for i in items) and deferred:
            warnings.append(
                Issue(
                    code="NO_FEASIBLE_SCHEDULE",
<<<<<<< HEAD
                    message="Không có khung/ngân sách đủ cho việc 10–90 phút và tiên quyết.",
=======
                    message="Không có khung/ngân sách đủ cho việc 30–90 phút và tiên quyết.",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    user_id=m.user_id,
                )
            )
        plans.append(
            PersonalPlan(
                user_id=m.user_id,
                pair_id=ctx.pair_id,
                plan_version=ctx.plan_version,
                items=items,
                deferred_items=deferred,
                partial=bool(deferred),
                warnings=warnings,
            )
        )
<<<<<<< HEAD
    for plan in plans:
        member = next(m for m in ctx.members if m.user_id == plan.user_id)
        present = {i.id for i in plan.items + plan.deferred_items}
        for prior_item in previous or []:
            if prior_item.user_id != member.user_id or prior_item.id not in member.custom_item_ids or prior_item.id in present:
                continue
            item = prior_item.model_copy(update={"plan_version": ctx.plan_version})
            if item.scheduled_start and item.status != ItemStatus.COMPLETED and item.scheduled_start < ctx.planning_start:
                item.scheduled_start = item.scheduled_end = item.slot_id = item.if_then_text = item.planned_date = None
                item.status, item.defer_reason = ItemStatus.DEFERRED, "NO_STUDY_DATE"
            if item.status == ItemStatus.DEFERRED and item.planned_date and item.planned_date < ctx.planning_start.astimezone(ZoneInfo(member.timezone)).date():
                item.planned_date, item.defer_reason = None, "NO_STUDY_DATE"
            (plan.deferred_items if item.status == ItemStatus.DEFERRED else plan.items).append(item)
        plan.partial = bool(plan.deferred_items)
    result = PlannerOutput(pair_id=ctx.pair_id, plans=plans)
    validate_plan(validation_ctx, result, budget_caps=budget_caps, user_ids=user_ids)
=======
    result = PlannerOutput(pair_id=ctx.pair_id, plans=plans)
    validate_plan(ctx, result, budget_caps=budget_caps, user_ids=user_ids)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return result


def validate_plan(ctx: PlannerInput, output: PlannerOutput, *, budget_caps=None, user_ids=None):
    validate_context(ctx, user_ids)
    issues, ids = [], set()
    catalog = {c.id: c for c in ctx.concepts}
    members = {m.user_id: m for m in ctx.members if user_ids is None or m.user_id in user_ids}
    if (
        output.pair_id != ctx.pair_id
        or {p.user_id for p in output.plans} != set(members)
        or len(output.plans) != len(members)
    ):
        raise PlanValidationError(
<<<<<<< HEAD
            [Issue(code="PAIR_SCOPE", message="Output must contain exactly the requested authorized members")]
=======
            [Issue(code="PAIR_SCOPE", message="Output must contain exactly the two authorized members")]
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        )
    for plan in output.plans:
        m = members[plan.user_id]
        if plan.pair_id != ctx.pair_id or plan.plan_version != ctx.plan_version:
            issues.append(
                Issue(code="PLAN_SCOPE", message="Personal plan pair/version must match context", user_id=m.user_id)
            )
        windows = {key: (start, end) for key, start, end in slots(ctx, m)}
        spent, new_spent, slot_ids = defaultdict(int), defaultdict(int), set()
        all_items = plan.items + plan.deferred_items
<<<<<<< HEAD
        expected = set(lesson_order(ctx, m))
        generated = [i for i in all_items if not i.is_custom]
        custom = [i for i in all_items if i.is_custom]
        actual = {(i.concept_id, i.session_index) for i in generated}
        if actual != expected or len(actual) != len(generated) or {i.id for i in custom} != set(m.custom_item_ids):
            issues.append(
                Issue(
                    code="CONCEPT_COVERAGE",
                    message="Every required lesson must appear once, including lessons without dates",
                    user_id=m.user_id,
                )
            )
        ends = {(i.concept_id, i.session_index): i.scheduled_end for i in plan.items if not i.is_custom}
=======
        expected = set(concept_order(ctx, m))
        actual = {i.concept_id for i in all_items}
        if actual != expected or len(actual) != len(all_items):
            issues.append(
                Issue(
                    code="CONCEPT_COVERAGE",
                    message="Required concepts must appear exactly once, including deferred prerequisites",
                    user_id=m.user_id,
                )
            )
        ends = {i.concept_id: i.scheduled_end for i in plan.items}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        for i in all_items:

            def fail(code, message):
                issues.append(
                    Issue(code=code, message=message, user_id=m.user_id, concept_id=i.concept_id, item_id=i.id)
                )

            if i.id in ids or i.user_id != m.user_id or i.pair_id != ctx.pair_id or i.plan_version != ctx.plan_version:
                fail("ITEM_SCOPE", "Duplicate ID or incorrect owner/pair/version")
            ids.add(i.id)
<<<<<<< HEAD
            if not 10 <= i.est_minutes <= 90:
                fail("TASK_DURATION", "Task must take 10–90 minutes")
=======
            if not 30 <= i.est_minutes <= 90:
                fail("TASK_DURATION", "Task must take 30–90 minutes")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            if any(r not in ctx.resources for r in i.resource_ids):
                fail("UNKNOWN_RESOURCE", "Only supplied learning resources are allowed")
            if i.status == ItemStatus.COMPLETED and not i.completed_at:
                fail("COMPLETION_REQUIRED", "Completed items require confirmation timestamp")
            if i.concept_id not in catalog:
                fail("UNKNOWN_CONCEPT", "Unknown concept")
                continue
            if i.status == ItemStatus.DEFERRED:
                if (
                    i not in plan.deferred_items
                    or i.scheduled_start
                    or i.scheduled_end
                    or i.if_then_text
                    or not i.defer_reason
                ):
                    fail("DEFERRED_STATE", "Deferred work needs a reason and no fabricated schedule")
<<<<<<< HEAD
                if i.planned_date:
                    if not m.calendar or (i.planned_date not in m.calendar.study_dates and not (i.is_custom and i.planned_date in m.calendar.buffer_dates)):
                        fail("STUDY_DATE", "Untimed work must use a selected study date")
                    if m.calendar and (i.planned_date < ctx.planning_start.astimezone(ZoneInfo(m.timezone)).date() or i.planned_date > m.calendar.end_date or (m.deadline and i.planned_date > m.deadline.astimezone(ZoneInfo(m.timezone)).date())):
                        fail("DATE_RANGE", "Untimed work must lie within the remaining planning period")
                    for prerequisite in ([] if i.is_custom else lesson_dependencies(ctx, m, i.concept_id, i.session_index)):
                        earlier = next((x for x in all_items if not x.is_custom and (x.concept_id, x.session_index) == prerequisite), None)
                        earlier_day = (earlier.scheduled_end.astimezone(ZoneInfo(m.timezone)).date() if earlier and earlier.scheduled_end else earlier.planned_date if earlier else None)
                        if not earlier_day or earlier_day >= i.planned_date:
                            fail("PREREQUISITE_ORDER", "Date-only work must follow its prerequisites")
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                continue
            if i not in plan.items or not i.scheduled_start or not i.scheduled_end:
                fail("SCHEDULE_REQUIRED", "Scheduled/completed work requires timestamps")
                continue
            if i.scheduled_start.tzinfo is None or i.scheduled_end.tzinfo is None:
                fail("TIMEZONE_REQUIRED", "Schedule must be timezone-aware")
                continue
            if (i.scheduled_end - i.scheduled_start).total_seconds() != i.est_minutes * 60:
                fail("DURATION", "Schedule duration differs from est_minutes")
            wk = week_key(i.scheduled_start, m)
            spent[wk] += i.est_minutes
<<<<<<< HEAD
            if not i.is_custom and m.calendar is None and i.slot_id in slot_ids:
                fail("SLOT_REUSED", "At most one activity per window occurrence")
            slot_ids.add(i.slot_id)
            if i.status != ItemStatus.COMPLETED:
                if m.calendar and (i.scheduled_start.astimezone(ZoneInfo(m.timezone)).date() < m.calendar.start_date or i.scheduled_end.astimezone(ZoneInfo(m.timezone)).date() > m.calendar.end_date or (m.deadline and i.scheduled_end > m.deadline)):
                    fail("CALENDAR_RANGE", "Timed work must fit the calendar and deadline")
=======
            if i.slot_id in slot_ids:
                fail("SLOT_REUSED", "At most one activity per window occurrence")
            slot_ids.add(i.slot_id)
            if i.status != ItemStatus.COMPLETED:
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                if any(
                    i.scheduled_start < b.end and b.start < i.scheduled_end
                    for b in ctx.busy_intervals.get(m.user_id, [])
                ):
                    fail("BUSY_OVERLAP", "Activity overlaps an existing scheduled study session")
                new_spent[wk] += i.est_minutes
                window = windows.get(i.slot_id)
<<<<<<< HEAD
                if not i.is_custom and m.calendar is None and (not window or not (window[0] <= i.scheduled_start < i.scheduled_end <= window[1])):
                    fail("OUTSIDE_WINDOW", "Work must fit one remaining availability window and deadline")
                if i.scheduled_start < ctx.planning_start:
                    fail("PAST_SCHEDULE", "Cannot schedule work in the past")
                if not i.is_custom and m.calendar is None and i.if_then_text != if_then(i, m):
                    fail("IF_THEN_MISMATCH", "If-then text must use the actual schedule and task")
                for prerequisite in ([] if i.is_custom else lesson_dependencies(ctx, m, i.concept_id, i.session_index)):
                    prerequisite_item = next((x for x in all_items if not x.is_custom and (x.concept_id, x.session_index) == prerequisite), None)
                    fits_by_date = bool(m.calendar and prerequisite_item and prerequisite_item.planned_date and not prerequisite_item.scheduled_end and prerequisite_item.planned_date < i.scheduled_start.astimezone(ZoneInfo(m.timezone)).date())
                    if not fits_by_date and (prerequisite not in ends or ends[prerequisite] > i.scheduled_start):
=======
                if not window or not (window[0] <= i.scheduled_start < i.scheduled_end <= window[1]):
                    fail("OUTSIDE_WINDOW", "Work must fit one remaining availability window and deadline")
                if i.scheduled_start < ctx.planning_start:
                    fail("PAST_SCHEDULE", "Cannot schedule work in the past")
                if i.if_then_text != if_then(i, m):
                    fail("IF_THEN_MISMATCH", "If-then text must use the actual schedule and task")
                for prerequisite in catalog[i.concept_id].prerequisites:
                    if prerequisite not in m.known_concept_ids and (
                        prerequisite not in ends or ends[prerequisite] > i.scheduled_start
                    ):
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                        fail("PREREQUISITE_ORDER", f"{prerequisite} must finish before {i.concept_id}")
        for left_index, left in enumerate(plan.items):
            for right in plan.items[left_index + 1 :]:
                if (
                    left.scheduled_start
                    and right.scheduled_start
                    and left.scheduled_end
                    and right.scheduled_end
                    and left.scheduled_start < right.scheduled_end
                    and right.scheduled_start < left.scheduled_end
                ):
                    issues.append(
                        Issue(code="OVERLAP", message="A member has overlapping activities", user_id=m.user_id)
                    )
<<<<<<< HEAD
        if m.committed_minutes_per_week and any(minutes > m.committed_minutes_per_week * 4 // 5 for minutes in spent.values()):
=======
        if any(minutes > m.committed_minutes_per_week * 4 // 5 for minutes in spent.values()):
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
            issues.append(
                Issue(code="WEEKLY_BUDGET", message="Weekly 80% commitment budget exceeded", user_id=m.user_id)
            )
        if budget_caps and any(
            minutes > budget_caps.get((m.user_id, wk), m.committed_minutes_per_week * 4 // 5)
            for wk, minutes in new_spent.items()
        ):
            issues.append(Issue(code="REPLAN_BUDGET", message="Remaining reduced budget exceeded", user_id=m.user_id))
        if plan.partial != bool(plan.deferred_items):
            issues.append(Issue(code="PARTIAL_FLAG", message="Partial plans must be labelled", user_id=m.user_id))
    if issues:
        raise PlanValidationError(issues)
