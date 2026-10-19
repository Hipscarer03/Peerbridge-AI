"use client";

<<<<<<< HEAD
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ConnectedPeerSummary } from "@/lib/types";
import type { PlanSetup, PlanView, ReplanChoice } from "@/lib/plan-types";
import type {PlanNavigationTarget} from "@/lib/home-types";
import type {StudyMeetingCreateTarget} from "@/lib/study-meeting-navigation";
import type {StudyMeetingSummary} from "@/lib/study-meetings";
import StudyMeetingCreateSheet from "@/features/study-meetings/StudyMeetingCreateSheet";
import {timelineFromText} from "@/features/study-meetings/timeline-from-text";
import styles from "./StudyPlan.module.css";
import {formatDateTime, formatDate, formatClock} from "@/lib/time";

import PlanNotes from "./PlanNotes";
import PlanCalendar from "./PlanCalendar";
import PlanInput, {type PersonalPlanInput} from "./PlanInput";
import PlanToast from "./PlanToast";
import Select from "@/components/ui/Select";
import Avatar from "@/components/ui/Avatar";
import OwlAvatar from "@/components/ui/OwlAvatar";
import PlanInfo from "./PlanInfo";
import Sheet from "@/components/ui/Sheet";


const STATUS = { SCHEDULED: "Đã xếp lịch", COMPLETED: "Đã hoàn thành", DEFERRED: "Để sau" };
function errorText(error: unknown) { return error instanceof Error ? error.message : "Không kết nối được. Hãy thử lại."; }
function date(value: string | null, timezone: string) { return value ? formatDateTime(value,timezone) : "Để sau"; }
function dayKey(value: string, timezone: string) { return new Intl.DateTimeFormat("sv-SE", {timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date(value)); }

export default function StudyPlan({ token, userId, onConnections, navigationTarget, onOpenMeeting, onCoach }: { token: string; userId: number; onConnections: () => void; navigationTarget?: PlanNavigationTarget | null; onOpenMeeting?: (target: StudyMeetingCreateTarget) => void; onCoach?: () => void }) {
=======
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ConnectedPeerSummary } from "@/lib/types";
import type { CoachDecision, PlanItem, PlanMember, PlanSetup, PlanView } from "@/lib/plan-types";
import styles from "./StudyPlan.module.css";
import {formatDateTime, formatDate, toDateTimeInput, localInputToISO} from "@/lib/time";
import DateTimeField from "@/components/ui/DateTimeField";
import PlanNotes from "@/features/study-plan/components/PlanNotes";
import AvailabilityPicker, { pickerFromWindows, windowsFromPicker } from "@/components/ui/AvailabilityPicker";

const STATUS = { SCHEDULED: "Đã xếp lịch", COMPLETED: "Đã hoàn thành", DEFERRED: "Để sau" };
const DELIVERY_STATUS: Record<string, string> = {
  NOT_APPLICABLE: "Không có can thiệp cần gửi",
  RESERVED: "Đề xuất đang được xử lý; chưa gửi",
  PENDING: "Đang chờ kênh gửi xác nhận; chưa xác nhận gửi thành công",
  SIMULATED: "Mô phỏng; chưa gửi thông báo thật",
  NOT_CONFIGURED: "Đề xuất đã lưu; chưa có kênh gửi",
  FAILED: "Gửi thất bại",
  SENT: "Đã lưu thông báo trong ứng dụng; chưa xác nhận người nhận đã đọc",
  SUPPRESSED_QUIET_HOURS: "Chưa gửi vì đang trong giờ nghỉ 22:00–07:00",
};
const REASONS: Record<string, string> = { PREREQUISITE_DEFERRED: "Cần học việc tiên quyết trước", NO_FITTING_SLOT_OR_BUDGET: "Chưa có khung giờ hoặc ngân sách đủ", METRICS_UNAVAILABLE: "Chưa có dữ liệu tiến độ để đề xuất hỗ trợ", NO_DUE_WORK_OR_INSUFFICIENT_DATA: "Chưa có việc đến hạn hoặc chưa đủ dữ liệu", QUIET_HOURS: "Đang trong giờ nghỉ 22:00–07:00", DAILY_LIMIT: "Hôm nay bạn đã có một đề xuất hỗ trợ", NO_TRIGGER: "Hiện chưa cần can thiệp", METRICS_INVALID_OR_STALE: "Dữ liệu tiến độ cần được cập nhật", PLAN_UNAVAILABLE: "Cần có kế hoạch trước" };
function errorText(error: unknown) { return error instanceof Error ? error.message : "Không kết nối được. Hãy thử lại."; }
function date(value: string | null, timezone: string) { return value ? formatDateTime(value,timezone) : "Để sau"; }

function Item({ item, timezone, resources, onSave, busy, errorMessage }: { item: PlanItem; timezone: string; resources: Record<string, string>; busy?: boolean; errorMessage?: string; onSave?: (id: string, start: string, minutes: number) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(toDateTimeInput(item.scheduled_start));
  const [minutes, setMinutes] = useState(item.est_minutes);
  const [error, setError] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault(); setError("");
    try { if (await onSave?.(item.id, localInputToISO(start), minutes)) setEditing(false); }
    catch { setError("Chọn ngày và giờ hợp lệ."); }
  }
  return <article className={`${styles.item} ${item.status === "COMPLETED" ? styles.completed : ""}`}>
    <div className={styles.meta}><span>{STATUS[item.status]}</span><span>{item.est_minutes} phút</span></div>
    <h3>{item.action}</h3>
    {onSave && item.status !== "COMPLETED" && !editing && <button type="button" className="outline edit-schedule-button" disabled={busy} onClick={() => setEditing(true)}>✏️ Sửa lịch</button>}
    {editing && <form className="schedule-editor" onSubmit={save}><DateTimeField label="Ngày và giờ học" value={start} onChange={setStart}/><label>Thời lượng (phút)<input type="number" min={30} max={90} required value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label><p>Bạn tự chọn thời gian phù hợp. Các việc cần học trước và lịch đã đặt vẫn được kiểm tra.</p>{(error || errorMessage) && <p className="form-error">{error || errorMessage}</p>}<div className="product-actions"><button className="primary" disabled={busy}>Lưu lịch mới</button><button type="button" className="secondary" disabled={busy} onClick={()=>setEditing(false)}>Hủy</button></div></form>}
    {item.scheduled_start && <p><time dateTime={item.scheduled_start}>{date(item.scheduled_start, timezone)}</time> → {date(item.scheduled_end, timezone)}</p>}
    <p>Đầu ra: {item.expected_output}</p>
    {item.if_then_text && <p className={styles.commitment}>{item.if_then_text}</p>}
    {item.defer_reason && <p>{REASONS[item.defer_reason] || item.defer_reason}</p>}
    {item.resource_ids.filter(id => resources[id]?.startsWith("https://")).map(id => <a key={id} href={resources[id]} target="_blank" rel="noreferrer">Nguồn học: {id}</a>)}
  </article>;
}

export default function StudyPlan({ token, userId, onConnections }: { token: string; userId: number; onConnections: () => void }) {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const [connections, setConnections] = useState<ConnectedPeerSummary[]>([]);
  const [pair, setPair] = useState(0);
  const [setup, setSetup] = useState<PlanSetup | null>(null);
  const [view, setView] = useState<PlanView | null>(null);
<<<<<<< HEAD
  const [meetings, setMeetings] = useState<StudyMeetingSummary[]>([]);
  const [owlOpen, setOwlOpen] = useState(true);
  const [unconfirmedMeetings, setUnconfirmedMeetings] = useState<number[] | null>(null);

=======
  const [members, setMembers] = useState<PlanMember[]>([]);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [commits, setCommits] = useState({mine: false, partner: false, both: false});
<<<<<<< HEAD
  const [noteContext, setNoteContext] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [createTarget, setCreateTarget] = useState<StudyMeetingCreateTarget | null>(null);
  const [navigationReady, setNavigationReady] = useState<number | null>(null);
  const [replanOpen, setReplanOpen] = useState(false);
  const [replanMode, setReplanMode] = useState<ReplanChoice["mode"]>("fewer_sessions");
  const [removeSessions, setRemoveSessions] = useState(1);
  const [targetItemId, setTargetItemId] = useState("");
  const [focusConceptId, setFocusConceptId] = useState("");

  const sequence = useRef(0);
  const lock = useRef(false);
  const idempotency = useRef<{ payload: string; key: string } | null>(null);
  const openedFeedback = useRef<number | null>(null);
  const openedReplan = useRef<number | null>(null);
  const closeToast = useCallback(() => {setError(""); setNotice("");}, []);
=======
  const [coach, setCoach] = useState<CoachDecision | null>(null);
  const [retry, setRetry] = useState(0);
  const sequence = useRef(0);
  const lock = useRef(false);
  const idempotency = useRef<{ payload: string; key: string } | null>(null);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    void api.listConnections(token).then(result => {
      if (!active) return;
      const eligible = result.connected.filter(p => p.requester_id === userId || p.recipient_id === userId);
      setConnections(eligible);
      setPair(current => eligible.some(p => p.peer_match_id === current) ? current : eligible[0]?.peer_match_id ?? 0);
    }).catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
<<<<<<< HEAD
  }, [token, userId]);

  useEffect(() => {
    if (!navigationTarget || !connections.length) return;
    if (connections.some(connection => connection.peer_match_id === navigationTarget.pair_id)) setPair(navigationTarget.pair_id);
    else setError("Kết nối của thông báo này không còn khả dụng.");
  }, [navigationTarget, connections]);
  useEffect(() => {if (navigationTarget?.item_id) setNotesOpen(false);}, [navigationTarget]);
  useEffect(() => {if (navigationTarget?.replan && pair === navigationTarget.pair_id && view?.plan && openedReplan.current !== navigationTarget.request_id) {openedReplan.current = navigationTarget.request_id;setReplanMode("fewer_sessions");setTargetItemId(navigationTarget.item_id || "");setReplanOpen(true);}}, [navigationTarget, pair, view?.plan]);

  const refresh = useCallback(async () => {
    const seq = ++sequence.current;
    if (!pair) { setCommits({mine: false, partner: false, both: false}); return; }
    setLoading(true); setError("");
    try {
      const [s, v, nextCommits, nextMeetings] = await Promise.all([api.planSetup(token, pair), api.plan(token, pair), api.planCommitments(token, pair), api.studyMeetings(token)]);
      if (seq !== sequence.current) return;
      setSetup(s); setView(v); setCommits(nextCommits); setMeetings(nextMeetings);
=======
  }, [token, userId, retry]);

  const refresh = useCallback(async () => {
    const seq = ++sequence.current;
    if (!pair) return;
    setLoading(true); setError("");
    try {
      const [s, v, commitments] = await Promise.all([api.planSetup(token, pair), api.plan(token, pair), api.planCommitments(token, pair)]);
      if (seq !== sequence.current) return;
      setSetup(s); setView(v);
      setCommits(commitments);
      setMembers(current => current.length && current.every(m => s.members.some(p => p.user_id === m.user_id)) ? current : s.members.map(m => ({
        user_id: m.user_id, goal: m.goals.join("; "), concept_ids: m.suggested_concept_ids?.length ? m.suggested_concept_ids : [s.concepts.filter(c => c.track === (/anh|english|ielts/i.test(m.goals.join(" ")) ? "english" : /python/i.test(m.goals.join(" ")) ? "python" : "sql")).slice(-1)[0]?.id || s.concepts[0].id], known_concept_ids: [], can_help_concept_ids: [],
        committed_minutes_per_week: 240, availability: m.availability.length ? m.availability.map(w => ({ id: String(w.id), day_of_week: w.day_of_week, start_time: w.start_time.slice(0,5), end_time: w.end_time.slice(0,5) })) : windowsFromPicker([], []).map(w => ({ id: crypto.randomUUID(), ...w })),
        timezone: m.availability[0]?.timezone || "Asia/Ho_Chi_Minh", location: "Góc học tập của tôi", deadline: null,
      })));
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    } catch (e) { if (seq === sequence.current) setError(errorText(e)); }
    finally { if (seq === sequence.current) setLoading(false); }
  }, [pair, token]);

<<<<<<< HEAD
  useEffect(() => { setView(null); setSetup(null); setCommits({mine: false, partner: false, both: false}); setNotice(""); setNotesOpen(false); setNoteContext(""); idempotency.current = null; void refresh(); return () => { sequence.current++; }; }, [refresh]);

  useEffect(() => {
    if (!navigationTarget || pair !== navigationTarget.pair_id || loading || busy) return;
    let active = true;
    const seq = sequence.current;
    setNavigationReady(null);
    void Promise.all([api.plan(token, pair), api.planCommitments(token, pair)]).then(([next, nextCommits]) => {
      if (active && seq === sequence.current && !lock.current) {
        setView(next); setCommits(nextCommits); setNavigationReady(navigationTarget.request_id);
      }
    }).catch(failure => {if (active && seq === sequence.current) setError(errorText(failure));});
    return () => {active = false;};
  }, [navigationTarget, pair, token, loading, busy]);

  useEffect(() => {
    if (!navigationTarget || navigationReady !== navigationTarget.request_id || !navigationTarget.feedback || loading || !view?.plan || view.plan.pair_id !== navigationTarget.pair_id || pair !== navigationTarget.pair_id || openedFeedback.current === navigationTarget.request_id) return;
    openedFeedback.current = navigationTarget.request_id;
    setNoteContext(""); setNotesOpen(true);
  }, [navigationTarget, navigationReady, pair, view, loading]);

  const hasPlan = !!view?.plan;
  useEffect(() => {
    if (!pair || !hasPlan) return;
    let active = true;
    let inFlight = false;
    const sync = async () => {
      if (lock.current || document.hidden) return;
      if (inFlight) return;
      inFlight = true;
      const seq = sequence.current;
      try {
        const [next, nextCommits, nextMeetings] = await Promise.all([api.plan(token, pair), api.planCommitments(token, pair), api.studyMeetings(token)]);
        if (active && seq === sequence.current && !lock.current) {
          setView(next);
          setCommits(nextCommits); setMeetings(nextMeetings);
        }
      } catch { /* Keep the current calendar when a background refresh fails. */ }
      finally { inFlight = false; }
    };
    const onVisibilityChange = () => { if (!document.hidden) void sync(); };
    const timer = window.setInterval(() => void sync(), 15000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibilityChange);};
  }, [pair, token, hasPlan]);

  async function run(operation: () => Promise<unknown>, message: string | (() => string)) {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try { await operation(); setNotice(typeof message === "function" ? message() : message); await refresh(); return true; }
    catch (e) {
      const message = errorText(e);
      if (message.includes("COMMITMENT_REQUIRED")) await refresh();
      setError(message.replace(/^COMMITMENT_REQUIRED:\s*/, ""));
      return false;
    }
    finally { lock.current = false; setBusy(false); }
  }

  function generate(payload: PersonalPlanInput) {
    const encoded = JSON.stringify(payload);
    if (!idempotency.current || idempotency.current.payload !== encoded) idempotency.current = {payload: encoded, key: crypto.randomUUID()};
    void run(() => api.generatePersonalPlan(token, payload, idempotency.current!.key), "Đã tạo kế hoạch của bạn.");
  }
  async function createInlineTimeline(itemId: string, action: string, output: string, start: string, minutes: number, text: string) {
    if (!text.trim()) return;
    const startsAt = new Date(start).toISOString();
    await api.createStudyMeeting(token, {peer_match_id: pair, client_key: crypto.randomUUID(), plan_item_id: itemId,
      goal: `${action}. ${output}`.slice(0, 300), mode: "solo", starts_at: startsAt,
      ends_at: new Date(Date.parse(startsAt) + minutes * 60000).toISOString(), source_text: text.trim(),
      segments: timelineFromText(text, minutes, [])});
  }
  const timezone = view?.timezone || "Asia/Ho_Chi_Minh";

  const proposal = view?.proposal;
  const remainingLessons = [...(view?.plan?.items ?? []), ...(view?.plan?.deferred_items ?? [])].filter(item => item.user_id === userId && item.status !== "COMPLETED" && !item.is_custom);
  const conceptChoices = [...new Set(remainingLessons.map(item => item.concept_id))];
  const chosenItemId = remainingLessons.some(item => item.id === targetItemId) ? targetItemId : remainingLessons[0]?.id ?? "";
  const chosenConceptId = conceptChoices.includes(focusConceptId) ? focusConceptId : conceptChoices[0] ?? "";
  const maxRemoval = Math.max(0, remainingLessons.length - 1);
  const chosenRemoval = Math.min(Math.max(1, removeSessions), maxRemoval);
  async function previewReplan() {
    if (!view?.plan) return;
    const choice: ReplanChoice = replanMode === "weekly" ? {mode: "weekly", reason: "Giảm tải lịch học trong các tuần còn lại"}
      : replanMode === "fewer_sessions" ? {mode: "fewer_sessions", remove_sessions: chosenRemoval, reason: `Bớt ${chosenRemoval} buổi chưa học`}
      : replanMode === "lighter_lesson" ? {mode: "lighter_lesson", target_item_id: chosenItemId, reason: "Làm nhẹ một buổi chưa học"}
      : {mode: "focus", focus_concept_id: chosenConceptId, remove_sessions: maxRemoval > 0 ? chosenRemoval : 0, reason: "Ưu tiên phần quan trọng trong các buổi còn lại"};
    const created = await run(() => api.replan(token, pair, view.plan!.plan_version, choice), "Đã tạo phương án. Xem trước khi xác nhận.");
    if (created) setReplanOpen(false);
  }
  const today = dayKey(new Date().toISOString(), timezone);
  const todayItems = (view?.plan?.items ?? []).filter(item => item.planned_date === today || (item.scheduled_start && dayKey(item.scheduled_start, timezone) === today));
  const unscheduledItems = (view?.plan?.items ?? []).filter(item => item.status === "SCHEDULED" && !item.scheduled_start);
  const sharedMeetings = meetings.filter(item => item.peer_match_id === pair && item.mode !== "solo" && !["CANCELLED", "ENDED", "EXPIRED", "MISSED"].includes(item.status));
  const todaySharedMeetings = sharedMeetings.filter(item => dayKey(item.starts_at, timezone) === today);
  useEffect(() => {
    let active = true;
    const ids = meetings.filter(item => item.peer_match_id === pair && item.mode !== "solo" && !["CANCELLED", "ENDED", "EXPIRED", "MISSED"].includes(item.status)).map(item => item.id);
    if (!ids.length) { setUnconfirmedMeetings([]); return () => { active = false; }; }
    void Promise.all(ids.map(id => api.studyMeeting(token, id).then(meeting => meeting.active_version === null || meeting.pending_version !== null || meeting.status === "NEEDS_RECONFIRMATION" ? id : null).catch(() => null)))
      .then(results => { if (active) setUnconfirmedMeetings(results.filter((id): id is number => id !== null)); });
    return () => { active = false; };
  }, [meetings, pair, token]);
  const partnerName = connections.find(p => p.peer_match_id === pair)?.peer.display_name || "bạn học";
  function openNotes(context = "") {setNoteContext(context); setNotesOpen(true);}

  return <section className={`${styles.workspace} ${view?.plan ? styles.workspaceWide : styles.workspaceForm} plan-workspace-compact`}
    onTransitionEnd={event => {if (event.target === event.currentTarget && event.propertyName === "max-width") window.dispatchEvent(new Event("resize"));}}>
    <header className={styles.planHeader}>
      <h1>Kế hoạch tự học</h1>
      {connections.length > 0 && <div className={styles.peerSelect}><span>Bạn đồng hành</span><Select ariaLabel="Chọn bạn đồng hành" value={String(pair)} disabled={busy || loading} onValueChange={value => setPair(Number(value))} options={connections.map(connection => ({value: String(connection.peer_match_id), label: connection.peer.display_name, icon: <Avatar seed={connection.peer.user_id} src={connection.peer.avatar_url} size={28}/>}))}/></div>}
      {view?.plan && <div className={styles.headerActions}>
        <div className={styles.commitCompact}>
        <div className={styles.commitStatus} role="status"><span>Bạn: {commits.mine ? "Đã cam kết ✓" : "Chưa cam kết"}</span><span>Bạn học: {commits.partner ? "Đã cam kết ✓" : "Chưa cam kết"}</span></div>
        <button className="primary" disabled={busy || loading || commits.mine} onClick={() => void run(async () => { setCommits(await api.commitPlan(token, pair)); }, "Đã chốt kế hoạch ban đầu.")}>{commits.mine ? "Đã cam kết ✓" : "Chốt kế hoạch ban đầu"}</button>
        </div>
      </div>}
    </header>
    {onCoach && <aside className={styles.owlDock} aria-label="Cú Bridge nhắc lịch học">
      <button className={styles.owlTrigger} type="button" aria-label={owlOpen ? "Ẩn nhắc nhở của Cú" : "Xem nhắc nhở của Cú"} aria-expanded={owlOpen} onClick={() => setOwlOpen(open => !open)}><OwlAvatar size={44}/></button>
      {owlOpen && <div className={styles.owlPopup} role="status">
        <div className={styles.owlPopupHead}><strong>Cú Bridge nhắc bạn</strong><button type="button" aria-label="Đóng nhắc nhở" onClick={() => setOwlOpen(false)}>×</button></div>
        {!view?.plan ? <p>{loading ? "Đang xem kế hoạch của bạn…" : "Bạn chưa có kế hoạch học. Hãy tạo kế hoạch để Cú nhắc buổi học."}</p> : <>
          <div><strong>Hôm nay</strong>{todayItems.length ? <ul>{todayItems.slice(0, 2).map(item => <li key={item.id}>{item.action}{item.status === "COMPLETED" ? " ✓" : ""}</li>)}</ul> : <p>Chưa có mục tiêu buổi học hôm nay.</p>}{todayItems.length > 2 && <small>Và {todayItems.length - 2} mục tiêu khác.</small>}</div>
          <div><strong>Chưa chọn giờ</strong><p>{unscheduledItems.length ? `${unscheduledItems.length} buổi: ${unscheduledItems.slice(0, 2).map(item => item.action).join("; ")}${unscheduledItems.length > 2 ? ` và ${unscheduledItems.length - 2} buổi khác` : ""}.` : "Các buổi trong kế hoạch đã có giờ học."}</p></div>
          <div><strong>Học chung</strong><p>{todaySharedMeetings.length ? `${todaySharedMeetings.length} buổi hôm nay: ${todaySharedMeetings.slice(0, 2).map(item => `${item.goal} ${unconfirmedMeetings?.includes(item.id) ? "dự kiến " : ""}lúc ${formatClock(item.starts_at, timezone)}`).join("; ")}.` : "Hôm nay chưa có buổi học chung."}</p>{unconfirmedMeetings && unconfirmedMeetings.length > 0 && <p className={styles.owlAlert}>{unconfirmedMeetings.length} buổi học chung chưa chốt lịch trình: {sharedMeetings.filter(item => unconfirmedMeetings.includes(item.id)).slice(0, 2).map(item => item.goal).join("; ")}.</p>}</div>
        </>}
        <button className={styles.owlChat} type="button" onClick={onCoach}>Chat với Cú</button>
      </div>}
    </aside>}
    <PlanToast message={error || notice} error={!!error} onClose={closeToast}/>
    {loading && <p role="status">Đang tải kế hoạch…</p>}
    {!loading && !error && !connections.length && <div className="panel"><h2>Chưa có bạn đồng hành</h2><p>Kết nối một bạn học để lập hai kế hoạch riêng.</p><button className="primary" onClick={onConnections}>Xem kết nối</button></div>}
    {setup && !view?.plan && !loading && <PlanInput key={pair} setup={setup} userId={userId} pair={pair} busy={busy} onSubmit={generate} onError={setError}/>}
    {view?.plan && <>
      {view.can_expand_lessons && <div className={styles.expandLessons}><span>Lộ trình này chưa có đủ buổi học.</span><button className="secondary" disabled={busy || loading} onClick={() => void run(() => api.expandPlanLessons(token, pair, view.plan!.plan_version), "Đã bổ sung đầy đủ buổi học.")}>Cập nhật lộ trình</button></div>}
      {view.plan.warnings.length > 0 && <PlanInfo label={`Lưu ý (${view.plan.warnings.length})`}>{view.plan.warnings.map(w => <p key={w.code}>{w.message}</p>)}</PlanInfo>}
      <PlanCalendar key={pair} view={view} setup={setup} userId={userId} partnerName={partnerName} token={token} busy={busy || loading} commitmentReady={commits.both} meetings={meetings.filter(item => item.peer_match_id === pair)}
        navigationTarget={navigationTarget?.pair_id === pair && navigationReady === navigationTarget.request_id ? {...navigationTarget, item_id: navigationTarget.feedback ? null : navigationTarget.item_id} : null}
        onSave={(item, start, confirmBuffer, timelineText) => {let timelineFailed = false; return run(async () => {await api.editPlanSchedule(token, pair, item.id, view.plan!.plan_version, start, item.est_minutes, confirmBuffer); if (timelineText.trim()) try {await createInlineTimeline(item.id, item.action, item.expected_output, start, item.est_minutes, timelineText);} catch {timelineFailed = true;}}, () => timelineFailed ? "Đã lưu giờ học. Chưa thêm được timeline; mở buổi để thử lại." : timelineText.trim() ? "Đã lưu buổi học và timeline." : meetings.some(meeting => meeting.plan_item_id === item.id && ["INVITED", "CONFIRMED", "ACTIVE", "NEEDS_RECONFIRMATION"].includes(meeting.status)) ? "Đã đổi giờ học. Hai bạn cần chốt lại giờ mới trong buổi học." : "Đã lưu giờ học. Bạn có thể thêm timeline sau.");}}
        onBatchSchedule={(items, confirmBuffer) => run(() => api.editPlanSchedules(token, pair, view.plan!.plan_version, items, confirmBuffer), "Đã đặt giờ. Bạn có thể thêm timeline cho từng buổi sau.")}
        onEdit={(item, payload, timelineText) => {let timelineFailed = false; return run(async () => {const saved = item ? await api.editPlanLesson(token, pair, item.id, view.plan!.plan_version, payload) : await api.addPlanLesson(token, pair, view.plan!.plan_version, payload); if (timelineText.trim() && payload.scheduled_start) try {await createInlineTimeline(saved.item_id, payload.action, payload.expected_output, payload.scheduled_start, payload.minutes, timelineText);} catch {timelineFailed = true;}}, () => timelineFailed ? "Đã lưu buổi học. Chưa thêm được timeline; mở buổi để thử lại." : timelineText.trim() ? "Đã lưu buổi học và timeline." : payload.scheduled_start ? "Đã lưu buổi học. Có thể thêm timeline sau." : item ? "Đã sửa buổi học." : "Đã thêm buổi học.");}}
        onReorder={itemIds => run(() => api.reorderPlanLessons(token, pair, view.plan!.plan_version, itemIds), "Đã cập nhật thứ tự buổi học.")}
        onDelete={item => run(() => api.deletePlanLesson(token, pair, item.id, view.plan!.plan_version), "Đã xóa buổi học.")}
        onError={setError}
        onReduce={() => setReplanOpen(true)}
        onTogether={(item, enabled) => run(() => api.registerStudyTogether(token, pair, item.id, enabled), enabled ? "Đã gửi đề nghị học chung." : "Đã rút đề nghị học chung.")}
        onOpenMeeting={target => target.meeting_id ? onOpenMeeting?.(target) : setCreateTarget(target)}
        onComment={openNotes} />
      {createTarget && <StudyMeetingCreateSheet key={`${createTarget.pair_id}:${createTarget.item_id}`} token={token} userId={userId} target={createTarget} canInvite={commits.both} onClose={() => setCreateTarget(null)} onCreated={meeting => {
        const target = {...createTarget, meeting_id: meeting.id};
        setCreateTarget(null);
        if (meeting.mode === "solo" && commits.both && onOpenMeeting) {
          window.setTimeout(() => onOpenMeeting(target), 220);
        } else {
          setNotice(meeting.mode === "solo" ? "Đã tạo timeline. Hai bạn cần chốt kế hoạch trước khi gửi lời mời." : "Đã gửi đề nghị học chung.");
          void refresh();
        }
      }}/>}
      <Sheet open={replanOpen} onOpenChange={setReplanOpen} title="Điều chỉnh kế hoạch">
        <div className={styles.replanForm}>
          <p>Còn {remainingLessons.length} buổi chưa học. Chọn cách học phù hợp, rồi xem phương án trước khi áp dụng.</p>
          <label>Cách điều chỉnh<select value={replanMode} onChange={event => setReplanMode(event.target.value as ReplanChoice["mode"])}>
            <option value="fewer_sessions">Bớt số buổi</option><option value="lighter_lesson">Làm nhẹ một buổi</option><option value="focus">Tập trung phần quan trọng</option><option value="weekly">Giảm tải lịch tuần</option>
          </select></label>
          {(replanMode === "fewer_sessions" || replanMode === "focus") && maxRemoval > 0 && <label>Bớt bao nhiêu buổi<select value={chosenRemoval} onChange={event => setRemoveSessions(Number(event.target.value))}>{Array.from({length: Math.min(5, maxRemoval)}, (_, index) => <option value={index + 1} key={index + 1}>{index + 1} buổi</option>)}</select></label>}
          {replanMode === "lighter_lesson" && <label>Buổi cần làm nhẹ<select value={chosenItemId} onChange={event => setTargetItemId(event.target.value)}>{remainingLessons.map(item => <option value={item.id} key={item.id}>{item.action}</option>)}</select></label>}
          {replanMode === "focus" && <label>Phần cần ưu tiên<select value={chosenConceptId} onChange={event => setFocusConceptId(event.target.value)}>{conceptChoices.map(id => <option value={id} key={id}>{setup?.concepts.find(concept => concept.id === id)?.action || remainingLessons.find(item => item.concept_id === id)?.action || id}</option>)}</select></label>}
          <button type="button" className="primary" disabled={busy || !remainingLessons.length || (replanMode === "fewer_sessions" && !maxRemoval)} onClick={() => void previewReplan()}>Xem phương án</button>
        </div>
      </Sheet>
      <Sheet open={notesOpen} onOpenChange={setNotesOpen} title={`Góp ý kế hoạch cho ${partnerName}`} initialFocusSelector="textarea">
        {notesOpen && <PlanNotes key={`${pair}:${noteContext}`} token={token} pair={pair} partner={partnerName} context={noteContext}/>}
      </Sheet>
      {proposal && <section className={`panel ${styles.proposal}`}><span className="eyebrow">Phương án chưa áp dụng</span><h2>Điều chỉnh v{proposal.before.plan_version} → v{proposal.after.plan_version}</h2><p>{proposal.reason}</p><p>Tính lại các buổi chưa học từ {date(proposal.cutoff, timezone)}.</p>
        {(() => { const afterIds = new Set([...proposal.after.items, ...proposal.after.deferred_items].map(item => item.id)); const removed = [...proposal.before.items, ...proposal.before.deferred_items].filter(item => item.status !== "COMPLETED" && !afterIds.has(item.id)); return removed.length > 0 ? <p>Đã bớt {removed.length} buổi: {removed.slice(0, 3).map(item => item.action).join("; ")}{removed.length > 3 ? "…" : ""}.</p> : null; })()}
=======
  useEffect(() => { setView(null); setSetup(null); setMembers([]); setCoach(null); setNotice(""); idempotency.current = null; void refresh(); return () => { sequence.current++; }; }, [refresh]);

  function changeMember(uid: number, patch: Partial<PlanMember>) { setMembers(current => current.map(m => m.user_id === uid ? { ...m, ...patch } : m)); }

  async function run(operation: () => Promise<unknown>, message: string) {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try { await operation(); setNotice(message); await refresh(); return true; }
    catch (e) { setError(errorText(e)); return false; }
    finally { lock.current = false; setBusy(false); }
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setup?.concepts.length || members.length !== 2) { setError("Danh mục nội dung học chưa sẵn sàng. Hãy tải lại sau."); return; }
    if (members.some(m => !m.goal.trim() || !m.concept_ids.length)) { setError("Chọn mục tiêu và nội dung học cho cả hai người."); return; }
    const payload = { pair_id: pair, members, horizon_days: 7 };
    const encoded = JSON.stringify(payload);
    if (!idempotency.current || idempotency.current.payload !== encoded) idempotency.current = { payload: encoded, key: crypto.randomUUID() };
    void run(() => api.generatePlan(token, payload, idempotency.current!.key), "Đã lưu kế hoạch. Xem cảnh báo và các việc để sau nếu có.");
  }

  const timezone = view?.timezone || "Asia/Ho_Chi_Minh";
  const resources = view?.resources || {};
  const proposal = view?.proposal;

  return <section className={styles.workspace}>
    <div className="page-title"><div><h1>Kế hoạch tuần</h1></div><button className="secondary" disabled={loading || busy} onClick={() => pair ? void refresh() : setRetry(r => r + 1)}>Làm mới</button></div>
    {error && <div className={styles.error} role="alert">{error} <button className="text-link" disabled={busy} onClick={() => pair ? void refresh() : setRetry(r => r + 1)}>Thử lại</button></div>}
    {notice && <p role="status">{notice}</p>}
    {loading && <p role="status">Đang tải kế hoạch…</p>}
    {!loading && !error && !connections.length && <div className="panel"><h2>Chưa có bạn học</h2><button className="primary" onClick={onConnections}>Tìm bạn học</button></div>}
    {connections.length > 1 && <label className={styles.pair}>Bạn học<select disabled={busy} value={pair} onChange={e => setPair(Number(e.target.value))}>{connections.map(p => <option key={p.peer_match_id} value={p.peer_match_id}>{p.peer.display_name}</option>)}</select></label>}
    {setup && !view?.plan && <form className={`panel ${styles.form}`} onSubmit={generate}>
      <h2>Lập kế hoạch tuần</h2>
      {!setup.concepts.length && <p role="status">Danh mục nội dung học chưa sẵn sàng. Hãy tải lại sau.</p>}
      <fieldset disabled={busy || loading || !setup.concepts.length}><div className={styles.columns}>
        {members.map(m => <section key={m.user_id} className={styles.member}>
          <h3>{setup.members.find(p => p.user_id === m.user_id)?.display_name}{m.user_id === userId ? " · Bạn" : ""}</h3>
          <label>Mục tiêu<input required value={m.goal} onChange={e => changeMember(m.user_id, { goal: e.target.value })} /></label>
          <label>Nội dung muốn làm được<select required value={m.concept_ids[0] || ""} onChange={e => changeMember(m.user_id, { concept_ids: [e.target.value] })}><option value="">Chọn concept</option>{setup.concepts.map(c => <option key={c.id} value={c.id}>{c.action}</option>)}</select></label>
          <label>Phút cam kết mỗi tuần<input type="number" min={0} max={10080} required value={m.committed_minutes_per_week} onChange={e => changeMember(m.user_id, { committed_minutes_per_week: Number(e.target.value) })} /></label>
          <label>Nơi học<input required value={m.location} onChange={e => changeMember(m.user_id, { location: e.target.value })} /></label>
          <details><summary>Tôi đã biết gì và có thể giúp gì?</summary>{(["known_concept_ids", "can_help_concept_ids"] as const).map(field => <label key={field}>{field === "known_concept_ids" ? "Đã biết" : "Có thể hỗ trợ"}<select multiple value={m[field]} onChange={e => changeMember(m.user_id, { [field]: Array.from(e.target.selectedOptions, o => o.value) })}>{setup.concepts.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}</select></label>)}</details>
          <h4>Khung giờ rảnh</h4>
          {setup.members.find(p => p.user_id === m.user_id)?.availability.length
            ? <p>Lấy từ hồ sơ: {m.availability.length} khung giờ mỗi tuần. Đổi ở Hồ sơ của tôi.</p>
            : <AvailabilityPicker {...pickerFromWindows(m.availability)} onChange={(days, slots) => changeMember(m.user_id, { availability: windowsFromPicker(days, slots).map(w => ({ id: crypto.randomUUID(), ...w })) })}/>}
        </section>)}
      </div><button className="primary" disabled={busy || loading} type="submit">{busy ? "Đang tạo…" : "Tạo kế hoạch"}</button></fieldset>
    </form>}
    {view?.plan && <>
      <section className="commit-banner"><div><h2>{commits.both ? "Hai bạn đã cam kết" : "Chưa chốt cam kết"}</h2><p>Bạn: {commits.mine ? "đã cam kết" : "chưa"} · Bạn cặp: {commits.partner ? "đã cam kết" : "chưa"}</p></div><button className="primary" disabled={busy || commits.mine} onClick={() => void run(async () => { setCommits(await api.commitPlan(token, pair)); }, "Đã lưu cam kết của bạn.")}>{commits.mine ? "Đã cam kết" : "Cam kết"}</button></section>
      <div className={styles.columns}><section className={`panel ${styles.mySchedule}`}><h2>{view.goal}</h2>
        {view.plan.warnings.map(w => <p className={styles.warning} key={w.code}>{w.message}</p>)}
        {view.plan.items.length === 0 && <p>Chưa có việc nào được xếp lịch.</p>}
        <div className={styles.list}>{view.plan.items.map(i => <Item key={`${i.id}:${view.plan!.plan_version}`} item={i} timezone={timezone} resources={resources} busy={busy} errorMessage={error} onSave={(id,start,minutes)=>run(()=>api.editPlanSchedule(token,pair,id,view.plan!.plan_version,start,minutes),"Đã lưu lịch mới. Xem lại và cam kết với phiên bản này.")} />)}</div>
        {view.plan.deferred_items.length > 0 && <h2>Để sau ({view.plan.deferred_items.length})</h2>}<div className={styles.list}>{view.plan.deferred_items.map(i => <Item key={`${i.id}:${view.plan!.plan_version}`} item={i} timezone={timezone} resources={resources} busy={busy} errorMessage={error} onSave={(id,start,minutes)=>run(()=>api.editPlanSchedule(token,pair,id,view.plan!.plan_version,start,minutes),"Đã lưu lịch mới. Xem lại và cam kết với phiên bản này.")} />)}</div>
        <button className="secondary" disabled={busy || loading} onClick={() => void run(() => api.replan(token, pair, view.plan!.plan_version), "Đã tạo phương án. Xem trước/sau rồi xác nhận.")}>Giảm tải 20%</button>
      </section><aside className={`panel ${styles.companion}`}><h2>Bạn cặp</h2>{view.partner ? <p>{view.partner.goal} · {view.partner.completed_count}/{view.partner.scheduled_count} việc xong</p> : <p>Bạn cặp chưa có kế hoạch.</p>}<div className={styles.list}>{view.partner?.items?.map(i => <Item key={i.id} item={i} timezone={timezone} resources={resources}/>)}</div><PlanNotes token={token} pair={pair} partner={connections.find(p => p.peer_match_id === pair)?.peer.display_name || "bạn học"}/><h2>🤖 Lời khuyên cho hai bạn</h2><button className="secondary" disabled={busy || loading} onClick={() => void run(async () => { setCoach(await api.evaluateCoach(token, pair)); }, "Đã kiểm tra điều kiện hỗ trợ.")}>Gợi ý cách giữ nhịp</button>{coach && <div role="status"><small className="provider-note">{coach.message_source === "ai" && coach.selection?.provider_mode !== "fake" ? "🤖 AI gợi ý" : coach.message_source === "ai" ? "🤖 AI mô phỏng" : "🤖 Gợi ý theo mẫu"}</small><p>{coach.text || REASONS[coach.reason] || coach.reason}</p>{coach.delivery_status && <p>{DELIVERY_STATUS[coach.delivery_status] || "Chưa xác nhận trạng thái gửi thông báo"}</p>}</div>}</aside></div>
      {proposal && <section className={`panel ${styles.proposal}`}><span className="eyebrow">Phương án chưa áp dụng</span><h2>Điều chỉnh v{proposal.before.plan_version} → v{proposal.after.plan_version}</h2><p>{proposal.reason}</p><p>Ngân sách giảm tải được tính từ {date(proposal.cutoff, timezone)}.</p>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        {proposal.budget?.map(b => <p key={b.week_start}>Tuần từ {formatDate(b.week_start)}: ngân sách {b.baseline_minutes} phút, đã hoàn thành {b.completed_minutes} phút; còn {b.remaining_minutes} phút → phương án tối đa {b.proposed_limit_minutes} phút.</p>)}
        <div className={styles.compare}><table><caption>Trước và sau theo từng việc</caption><thead><tr><th>Việc</th><th>Trước</th><th>Sau</th></tr></thead><tbody>{[...proposal.after.items, ...proposal.after.deferred_items].map(i => { const old = [...proposal.before.items, ...proposal.before.deferred_items].find(p => p.id === i.id); return <tr key={i.id}><th>{i.action}</th><td>{old ? `${STATUS[old.status]} · ${date(old.scheduled_start, timezone)}` : "Mới"}</td><td>{STATUS[i.status]} · {date(i.scheduled_start, timezone)}</td></tr>; })}</tbody></table></div>{proposal.after.partial && <p className={styles.warning}>Phương án chỉ đáp ứng một phần mục tiêu; các việc còn lại chuyển sang để sau.</p>}<div className={styles.actions}><button className="primary" disabled={busy || loading} onClick={() => void run(() => api.decideReplan(token, pair, proposal.id, proposal.expected_version, true), "Đã áp dụng phương án.")}>Chấp nhận phương án</button><button className="secondary" disabled={busy || loading} onClick={() => void run(() => api.decideReplan(token, pair, proposal.id, proposal.expected_version, false), "Giữ kế hoạch đang dùng.")}>Giữ kế hoạch hiện tại</button></div></section>}
    </>}
  </section>;
}
