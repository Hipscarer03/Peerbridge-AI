"use client";
import RequiredLabel from "@/components/ui/RequiredLabel";

import { useEffect, useRef, useState } from "react";
import type { LessonInput, PlanItem, PlanSetup, PlanView } from "@/lib/plan-types";
import type {PlanNavigationTarget} from "@/lib/home-types";
import type {StudyMeetingCreateTarget} from "@/lib/study-meeting-navigation";
import type {StudyMeetingSummary} from "@/lib/study-meetings";
import { formatClock, formatDate, localInputToISO } from "@/lib/time";
import {calendarDate, dayKind} from "@/lib/plan-calendar";
import styles from "./StudyPlan.module.css";
import Avatar from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/icons";
import StudySchedule from "./StudySchedule";
import Sheet from "@/components/ui/Sheet";
import PlanNotes from "./PlanNotes";
import {timelineFromText} from "@/features/study-meetings/timeline-from-text";

type Props = {
  view: PlanView; setup: PlanSetup | null; userId: number; partnerName: string; token: string; busy: boolean; commitmentReady: boolean; meetings: StudyMeetingSummary[];
  navigationTarget?: PlanNavigationTarget | null;
  onSave: (item: PlanItem, start: string, confirmBuffer: boolean, timelineText: string) => Promise<boolean>;
  onBatchSchedule: (items: {item_id: string; scheduled_start: string}[], confirmBuffer: boolean) => Promise<boolean>;
  onEdit: (item: PlanItem | null, payload: LessonInput, timelineText: string) => Promise<boolean>;
  onReorder: (itemIds: string[]) => Promise<boolean>;
  onDelete: (item: PlanItem) => Promise<boolean>;
  onError: (message: string) => void;
  onComment: (context: string) => void;
  onReduce: () => void;
  onTogether: (item: PlanItem, enabled: boolean) => Promise<boolean>;
  onOpenMeeting: (target: StudyMeetingCreateTarget) => void;
};
function key(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const get = (name: string) => parts.find(p => p.type === name)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function shift(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10);
}

export default function PlanCalendar({ view, setup, userId, partnerName, token, busy, commitmentReady, meetings, navigationTarget, onSave, onBatchSchedule, onEdit, onReorder, onDelete, onComment, onReduce, onTogether, onOpenMeeting, onError }: Props) {
  const timezone = view.timezone || "Asia/Ho_Chi_Minh";
  const [mode, setMode] = useState<"single" | "dual">("dual");
  const [owner, setOwner] = useState<"mine" | "partner">("mine");
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [anchor, setAnchor] = useState(() => key(new Date().toISOString(), timezone));
  const [selected, setSelected] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [clock, setClock] = useState("");
  const [confirmBuffer, setConfirmBuffer] = useState(false);
  const [detail, setDetail] = useState<PlanItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [deleting, setDeleting] = useState<PlanItem | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [bulkClock, setBulkClock] = useState("");
  const [bulkConfirmBuffer, setBulkConfirmBuffer] = useState(false);
  const [action, setAction] = useState("");
  const [output, setOutput] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [timelineText, setTimelineText] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const openedNotification = useRef<number | null>(null);
  const ownItems = [...(view.plan?.items || []), ...(view.plan?.deferred_items || [])];
  const selectedItem = ownItems.find(i => i.id === selected);
  useEffect(() => {
    if (!detail) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [detail]);
  useEffect(() => {
    if (!navigationTarget || !view.plan || view.plan.pair_id !== navigationTarget.pair_id || busy || openedNotification.current === navigationTarget.request_id) return;
    openedNotification.current = navigationTarget.request_id;
    setSelected(null); setAdding(false); setDeleting(null); setTarget(""); setDetail(null);
    if (!navigationTarget.item_id) return;
    const item = [...view.plan.items, ...view.plan.deferred_items, ...(view.partner?.items || [])].find(item => item.id === navigationTarget.item_id);
    if (!item) {onError("Buổi học trong thông báo không còn trong kế hoạch hiện tại."); return;}
    setDetail(item);
    setOwner(item.user_id === userId ? "mine" : "partner");
    const day = item.scheduled_start ? calendarDate(item.scheduled_start, timezone) : item.planned_date;
    if (day) setAnchor(day);
  }, [navigationTarget, view, busy, userId, timezone, onError]);
  const togetherIds = new Set((view.study_together || []).map(registration => registration.item_id));
  function meetingIssue(item: PlanItem, together = true) {
    if (item.status === "COMPLETED") return "Buổi học đã hoàn thành.";
    if (together && !commitmentReady) return "Cả hai cần chốt kế hoạch ban đầu một lần trước khi đề nghị học chung.";
    if (!item.scheduled_start || !item.scheduled_end) return "Cần chốt giờ cho buổi học trước.";
    const start = Date.parse(item.scheduled_start);
    const end = Date.parse(item.scheduled_end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return "Giờ học không hợp lệ; hãy chọn lại giờ.";
    if (end <= now) return "Khung giờ học đã kết thúc; hãy đổi giờ trong Kế hoạch trước khi lên chi tiết.";
    if (end - start < 10 * 60000 || end - start > 180 * 60000) return "Buổi học cần dài từ 10 đến 180 phút.";
    return "";
  }
  function meetingTarget(item: PlanItem): StudyMeetingCreateTarget {
    return {pair_id: view.plan!.pair_id, item_id: item.id, item_user_id: item.user_id,
      goal: `${item.action}. ${item.expected_output}`.slice(0, 300),
      scheduled_start: item.scheduled_start,
      minutes: Math.round((Date.parse(item.scheduled_end!) - Date.parse(item.scheduled_start!)) / 60000)};
  }
  async function inviteTogether(item: PlanItem) {
    const issue = meetingIssue(item);
    if (issue) {onError(issue); return;}
    if (!await onTogether(item, true)) return;
    if (Date.parse(item.scheduled_end!) <= Date.now()) {
      await onTogether(item, false);
      onError("Khung giờ học đã kết thúc trong lúc đăng ký; hãy chọn giờ mới để học chung.");
      return;
    }
    openMeeting(meetingTarget(item));
  }
  function togetherBadge(item: PlanItem) {
    if (!togetherIds.has(item.id)) return null;
    return <span className={styles.togetherBadge} title={item.user_id === userId ? `${partnerName} đã đề nghị học chung` : "Bạn đã đề nghị học chung"}><span aria-hidden="true">🤝</span> Học chung</span>;
  }
  function navigate(direction: number) {
    if (period !== "month") setAnchor(shift(anchor, direction * (period === "week" ? 7 : 1)));
    else { const date = new Date(`${anchor.slice(0, 7)}-01T12:00:00Z`); date.setUTCMonth(date.getUTCMonth() + direction); setAnchor(date.toISOString().slice(0, 10)); }
  }
  function closeEditor() {setDetail(null); setSelected(null); setAdding(false); setDeleting(null); setBulkOpen(false); setTarget(""); setTimelineText("");}
  function openMeeting(target: StudyMeetingCreateTarget) {
    if (!target.meeting_id && (!target.scheduled_start || Date.parse(target.scheduled_start) + target.minutes * 60000 <= Date.now())) {
      onError("Khung giờ học đã kết thúc; hãy đổi giờ trong Kế hoạch trước khi lên chi tiết.");
      return;
    }
    // Let the Radix sheet finish its exit before unmounting this page's portal.
    closeEditor();
    window.setTimeout(() => onOpenMeeting(target), 220);
  }
  const bulkCandidates = ownItems.filter(item => item.status !== "COMPLETED" && !item.scheduled_start && !!item.planned_date);
  function openBulkSchedule() {
    closeEditor();
    setBulkIds(bulkCandidates.map(item => item.id));
    setBulkClock(""); setBulkConfirmBuffer(false); setBulkOpen(true);
  }
  async function saveBulkSchedule() {
    if (busy || !bulkClock || !bulkIds.length) return;
    const entries = bulkCandidates.filter(item => bulkIds.includes(item.id)).map(item => ({
      item_id: item.id,
      scheduled_start: localInputToISO(`${item.planned_date}T${bulkClock}`),
    }));
    if (entries.some(entry => !entry.scheduled_start)) return onError("Không thể đọc giờ đã chọn.");
    if (await onBatchSchedule(entries, bulkConfirmBuffer)) closeEditor();
  }
  function openDetail(item: PlanItem) {closeEditor(); setDetail(item);}
  function chooseDate(day: string) {setTarget(day); setConfirmBuffer(false);}
  function select(item: PlanItem, content = false) {
    if (busy || item.status === "COMPLETED") return;
    closeEditor(); setSelected(item.id); setEditingContent(content);
    const started = !!item.scheduled_start && Date.parse(item.scheduled_start) <= Date.now();
    const previousDay = item.planned_date || (item.scheduled_start ? calendarDate(item.scheduled_start, timezone) : "");
    const day = previousDay && previousDay >= calendarDate() ? previousDay : "";
    setTarget(day); setClock(started ? "" : item.scheduled_start ? formatClock(item.scheduled_start, timezone) : "");
    setConfirmBuffer(!!day && dayKind(view.calendar, day) === "buffer");
    setAction(item.action); setOutput(item.expected_output); setMinutes(item.est_minutes);
  }
  function add() {closeEditor(); setAdding(true); setEditingContent(true); setAction(""); setOutput(""); setMinutes(45); setClock(""); setConfirmBuffer(false);}
  function askDelete(item: PlanItem) {closeEditor(); setDeleting(item);}
  async function save() {
    if (busy) return;
    if (target && dayKind(view.calendar, target) === "buffer" && !confirmBuffer) return onError("Xác nhận nếu bạn muốn dùng ngày đệm để học.");
    if (timelineText.trim()) {
      if (!target || !clock) return onError("Chọn ngày và giờ trước khi thêm timeline.");
      try {timelineFromText(timelineText, adding || editingContent ? minutes : selectedItem?.est_minutes ?? minutes, []);}
      catch (failure) {return onError((failure as Error).message);}
    }
    try {
      if (adding || editingContent) {
        if (action.trim().length < 5 || output.trim().length < 3 || minutes < 10 || minutes > 90) return onError("Nhập nội dung, đầu ra và thời lượng từ 10–90 phút.");
        if (clock && !target) return onError("Chọn ngày trước khi chọn giờ học.");
        if (await onEdit(adding ? null : selectedItem || null, {action: action.trim(), expected_output: output.trim(), minutes, planned_date: target || null, scheduled_start: target && clock ? localInputToISO(target + "T" + clock) : null, confirm_buffer: confirmBuffer}, timelineText)) {
          const savedItem = selectedItem;
          closeEditor();
          if (savedItem && target && clock) setDetail(savedItem);
        }
      } else if (selectedItem && target && clock) {
        if (await onSave(selectedItem, localInputToISO(target + "T" + clock), confirmBuffer, timelineText)) {
          const savedItem = selectedItem;
          closeEditor();
          setDetail(savedItem);
        }
      }
    } catch {onError("Chưa lưu được buổi học. Hãy kiểm tra ngày và giờ.");}
  }
  async function remove() {if (deleting && !busy && await onDelete(deleting)) closeEditor();}
  function orderedItems(mine: boolean) {
    const unsorted = mine ? ownItems : view.partner?.items || [];
    const hasDisplayOrder = mine && unsorted.some(item => item.display_order != null);
    const fallbackOrder = Math.max(-1, ...unsorted.map(item => item.display_order ?? -1)) + 1;
    const preferredOrder = hasDisplayOrder
      ? [...unsorted].sort((a, b) => (a.display_order ?? fallbackOrder) - (b.display_order ?? fallbackOrder))
      : [...unsorted].sort((a, b) => Number(!!a.is_custom) - Number(!!b.is_custom));
    const items: PlanItem[] = [];
    const visited = new Set<string>();
    function visit(item: PlanItem) {
      if (visited.has(item.id)) return;
      visited.add(item.id);
      const prerequisites = setup?.concepts.find(c => c.id === item.concept_id)?.prerequisites || [];
      preferredOrder.filter(i => !item.is_custom && !i.is_custom && (prerequisites.includes(i.concept_id) || (i.concept_id === item.concept_id && (i.session_index || 1) < (item.session_index || 1)))).sort((a,b) => (a.session_index || 1) - (b.session_index || 1)).forEach(visit);
      items.push(item);
    }
    preferredOrder.forEach(visit);
    return items;
  }
  function canMoveLesson(items: PlanItem[], index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    const current = items[index];
    const adjacent = items[nextIndex];
    if (!current || !adjacent || current.status === "COMPLETED" || adjacent.status === "COMPLETED") return false;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    const positions = new Map(reordered.map((item, position) => [item.id, position]));
    return reordered.every(item => {
      if (item.is_custom) return true;
      const prerequisites = setup?.concepts.find(concept => concept.id === item.concept_id)?.prerequisites || [];
      return reordered.every(prerequisite => {
        if (prerequisite.is_custom || prerequisite.id === item.id) return true;
        const required = prerequisites.includes(prerequisite.concept_id) ||
          (prerequisite.concept_id === item.concept_id && (prerequisite.session_index || 1) < (item.session_index || 1));
        return !required || (positions.get(prerequisite.id) ?? Infinity) < (positions.get(item.id) ?? -Infinity);
      });
    });
  }
  function moveLesson(items: PlanItem[], index: number, direction: -1 | 1) {
    if (busy || !canMoveLesson(items, index, direction)) return;
    const itemIds = items.map(item => item.id);
    [itemIds[index], itemIds[index + direction]] = [itemIds[index + direction], itemIds[index]];
    void onReorder(itemIds);
  }
  function renderQueue(mine: boolean) {
    const items = orderedItems(mine);
    const concepts = setup?.concepts || [];
    return <aside className={styles.queue}>{mine && <div className={styles.queueTools}><button type="button" className={styles.addLesson} disabled={busy} onClick={add}>＋ Thêm buổi học</button><button type="button" className={styles.bulkScheduleButton} disabled={busy || bulkCandidates.length === 0} onClick={openBulkSchedule}><Icon name="calendar"/> Đặt giờ nhiều buổi</button></div>}<h3>{mine ? "Buổi học của tôi" : `Buổi học của ${partnerName}`} <small>({items.length})</small></h3>{items.length === 0 && <p>Chưa có buổi học.</p>}{items.map((item, index) => {
          const prerequisites = item.is_custom ? [] : concepts.find(c => c.id === item.concept_id)?.prerequisites || [];
          return <div className={styles.flowStep} key={item.id}><article className={`${styles.flowCard} ${selected === item.id && mine ? styles.selected : ""}`} onDoubleClick={() => mine ? select(item) : openDetail(item)}>
            <small>Buổi {index + 1} · {item.est_minutes} phút{item.is_custom ? " · Bạn thêm" : ""}</small>{togetherBadge(item)}<h3>{item.action}</h3>
            <span className={styles.sessionStatus}>{item.status === "COMPLETED" ? "Đã hoàn thành" : item.scheduled_start ? formatDate(item.scheduled_start, timezone) : item.planned_date ? `${formatDate(item.planned_date)} · Chưa chọn giờ` : "Chưa chọn ngày"}</span>
            {prerequisites.length > 0 && <small>Học trước: {prerequisites.map(id => concepts.find(c => c.id === id)?.action || "Nội dung cần học trước").join(", ")}</small>}
            <div className={styles.cardActions} aria-label={`Thao tác buổi học ${index + 1}`}>
              <button type="button" className={styles.iconButton} aria-label="Xem chi tiết buổi học" data-tooltip="Xem chi tiết" onClick={() => openDetail(item)}><Icon name="file-text"/></button>
              {mine && item.status !== "COMPLETED" && <>
                <button type="button" className={styles.iconButton} aria-label={item.planned_date ? "Đổi lịch buổi học" : "Chọn lịch buổi học"} data-tooltip={item.planned_date ? "Đổi lịch" : "Chọn lịch"} disabled={busy} onClick={() => select(item)}><Icon name="calendar"/></button>
                <button type="button" className={styles.iconButton} aria-label="Sửa nội dung buổi học" data-tooltip="Sửa nội dung" disabled={busy} onClick={() => select(item, true)}><Icon name="edit"/></button>
                <button type="button" className={`${styles.iconButton} ${styles.deleteIconButton}`} aria-label="Xóa buổi học" data-tooltip="Xóa buổi học" disabled={busy} onClick={() => askDelete(item)}><Icon name="trash"/></button>
              </>}
            </div>
            {mine && <div className={styles.orderFooter} aria-label={`Sắp xếp buổi ${index + 1}`}>
              <button type="button" className={styles.iconButton} aria-label={`Đưa buổi ${index + 1} lên trước`} data-tooltip="Đưa lên" disabled={busy || !canMoveLesson(items, index, -1)} onClick={() => moveLesson(items, index, -1)}><Icon name="arrow-up"/></button>
              <button type="button" className={styles.iconButton} aria-label={`Đưa buổi ${index + 1} xuống sau`} data-tooltip="Đưa xuống" disabled={busy || !canMoveLesson(items, index, 1)} onClick={() => moveLesson(items, index, 1)}><Icon name="arrow-down"/></button>
            </div>}
          </article></div>;
        })}</aside>;
  }
  function renderPerson(mine: boolean) {
    const items = orderedItems(mine);
    const name = mine ? "Lịch của tôi" : `Lịch của ${partnerName}`;

    return <section className={`${styles.calendarPerson} ${mine ? styles.ownCalendar : ""}`} key={mine ? "mine" : "partner"}>
      <header className={styles.personHeading}><Avatar seed={mine ? userId : view.partner?.user_id || 0} size={32}/><div><h2>{name}</h2><p>{mine ? view.goal : view.partner?.goal || "Chưa có kế hoạch"}</p></div><span className={styles.countBadge}>{items.filter(i => i.status === "COMPLETED").length}/{items.length} buổi</span></header>
      <div className={styles.calendarOnly}>

        <StudySchedule items={items} togetherIds={togetherIds} calendar={mine ? view.calendar : view.partner?.calendar} anchor={anchor} period={period} timezone={timezone} mine={mine} selected={!!selectedItem}
          onDate={day => {if (mine) {if (selectedItem && !busy) chooseDate(day);} else onComment(`${name} · ${formatDate(day)}`);}}
          onDetail={openDetail} onSelect={item => {if (mine) select(item);}}/>
      </div>
      <footer className={styles.calendarFooter}>
        {mine ? <button type="button" className="secondary" disabled={busy} onClick={onReduce}>Điều chỉnh kế hoạch</button>
          : <button type="button" className="secondary" disabled={busy} onClick={() => onComment("")}>Góp ý kế hoạch cho {partnerName}</button>}
      </footer>
    </section>;
  }
  const currentDetail = detail ? [...ownItems, ...(view.partner?.items || [])].find(item => item.id === detail.id) : null;
  const detailEnded = !!currentDetail?.scheduled_end && Date.parse(currentDetail.scheduled_end) <= now;
  const currentMeetingIssue = currentDetail ? meetingIssue(currentDetail, currentDetail.user_id !== userId) : "";
  const currentMeeting = currentDetail ? meetings.find(item => item.plan_item_id === currentDetail.id && ["INVITED", "CONFIRMED", "ACTIVE", "NEEDS_RECONFIRMATION"].includes(item.status)) : undefined;
  return <section className={styles.calendarWorkspace}>
    <div className={styles.calendarToolbar}><div className={styles.calendarViewControls}><div className={styles.segments} aria-label="Chế độ xem">{(["single", "dual"] as const).map(m => <button type="button" key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setSelected(null); setTarget(""); }}>{m === "single" ? "Xem riêng" : "Lịch chung"}</button>)}</div>{mode === "single" && <div className={`${styles.segments} ${styles.ownerSegments}`} aria-label="Chọn lịch xem"><button type="button" aria-pressed={owner === "mine"} onClick={() => { setOwner("mine"); setSelected(null); setTarget(""); }}>Của tôi</button><button type="button" title={`Của ${partnerName}`} aria-pressed={owner === "partner"} onClick={() => { setOwner("partner"); setSelected(null); setTarget(""); }}>Của {partnerName}</button></div>}</div><div className={styles.segments} aria-label="Khoảng thời gian">{(["day", "week", "month"] as const).map(p => <button type="button" key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>{{ day: "Ngày", week: "Tuần", month: "Tháng" }[p]}</button>)}</div><div className={styles.actions}><button type="button" className="secondary" aria-label="Khoảng trước" onClick={() => navigate(-1)}>←</button><span>{period === "month" ? `Tháng ${anchor.slice(5, 7)}/${anchor.slice(0, 4)}` : formatDate(period === "week" ? shift(anchor, -((new Date(`${anchor}T12:00:00Z`).getUTCDay() + 6) % 7)) : anchor)}</span><button type="button" className="secondary" aria-label="Khoảng tiếp theo" onClick={() => navigate(1)}>→</button><button type="button" className="text-link" onClick={() => setAnchor(key(new Date().toISOString(), timezone))}>Hôm nay</button></div></div>
    <div className={styles.calendarLegend} aria-label="Chú thích lịch"><span><i className={styles.studyDot}/>Ngày học</span><span><i className={styles.bufferDot}/>Ngày đệm · nghỉ hoặc học bù</span><span><i className={styles.unknownDot}/>Chưa khai báo lịch</span><span>Buổi chưa chọn giờ nằm ở hàng cả ngày.</span></div>

    <div className={`${styles.learningLayout} ${styles.planLayout}`}>
      {renderQueue(mode === "dual" || owner === "mine")}
      <div className={mode === "dual" ? styles.dualCalendars : styles.singleCalendar}>{mode === "dual" ? <>{renderPerson(true)}{renderPerson(false)}</> : renderPerson(owner === "mine")}</div>
    </div>
    <Sheet open={!!detail || !!selectedItem || adding || !!deleting || bulkOpen} title={bulkOpen ? "Đặt giờ nhiều buổi" : deleting ? "Xóa buổi học" : adding ? "Thêm buổi học" : selectedItem ? editingContent ? "Sửa buổi học" : "Chọn giờ học" : "Chi tiết buổi học"} onOpenChange={open => {if (!open) closeEditor();}}>
    {bulkOpen && <section className={styles.bulkSchedule}>
      <p>Chọn các buổi đã có ngày rồi đặt cùng một giờ. Ngày của từng buổi sẽ được giữ nguyên.</p>
      <label className={styles.bulkTime}>Giờ bắt đầu<input type="time" required value={bulkClock} onChange={event => setBulkClock(event.target.value)}/></label>
      <div className={styles.bulkListHeading}><strong>Buổi học ({bulkIds.length}/{bulkCandidates.length})</strong><button type="button" className="text-link" onClick={() => setBulkIds(bulkIds.length === bulkCandidates.length ? [] : bulkCandidates.map(item => item.id))}>{bulkIds.length === bulkCandidates.length ? "Bỏ chọn" : "Chọn tất cả"}</button></div>
      <div className={styles.bulkList}>{bulkCandidates.map(item => <label key={item.id} className={styles.bulkItem}><input type="checkbox" checked={bulkIds.includes(item.id)} onChange={event => setBulkIds(ids => event.target.checked ? [...ids, item.id] : ids.filter(id => id !== item.id))}/><span><b>{item.action}</b><small>{formatDate(item.planned_date || "", timezone)} · {item.est_minutes} phút</small></span></label>)}{bulkCandidates.length === 0 && <p>Không còn buổi nào đang chờ chọn giờ.</p>}</div>
      {bulkIds.some(id => {const item = bulkCandidates.find(candidate => candidate.id === id); return !!item?.planned_date && dayKind(view.calendar, item.planned_date) === "buffer";}) && <label className={styles.bulkConfirm}><input type="checkbox" checked={bulkConfirmBuffer} onChange={event => setBulkConfirmBuffer(event.target.checked)}/>Xác nhận dùng ngày đệm đã chọn.</label>}
      <div className={styles.actions}><button type="button" className="primary" disabled={busy || !bulkClock || !bulkIds.length || (bulkIds.some(id => {const item = bulkCandidates.find(candidate => candidate.id === id); return !!item?.planned_date && dayKind(view.calendar, item.planned_date) === "buffer";}) && !bulkConfirmBuffer)} onClick={() => void saveBulkSchedule()}>{busy ? "Đang lưu…" : `Đặt giờ cho ${bulkIds.length} buổi`}</button><button type="button" className="secondary" disabled={busy} onClick={closeEditor}>Hủy</button></div>
    </section>}
    {currentDetail && <section className={styles.drawerDetail}>
      <h3>{currentDetail.action}</h3>
      <p>{currentDetail.est_minutes} phút · {currentDetail.scheduled_start ? `${formatDate(currentDetail.scheduled_start, timezone)} · ${formatClock(currentDetail.scheduled_start, timezone)}` : currentDetail.planned_date ? `${formatDate(currentDetail.planned_date)} · Chưa chọn giờ` : "Chưa gán lịch"}</p>
      <p>Nội dung / đầu ra: {currentDetail.expected_output}</p>
      {currentDetail.if_then_text && <p>{currentDetail.if_then_text}</p>}
      {currentDetail.user_id === userId && currentDetail.status !== "COMPLETED" && <div className={styles.detailActions}>
        <button type="button" className={styles.iconButton} aria-label="Chọn giờ hoặc đổi lịch" data-tooltip="Chọn giờ / đổi lịch" disabled={busy} onClick={() => select(currentDetail)}><Icon name="calendar"/></button>
        <button type="button" className={styles.iconButton} aria-label="Sửa nội dung buổi học" data-tooltip="Sửa nội dung" disabled={busy} onClick={() => select(currentDetail, true)}><Icon name="edit"/></button>
        <button type="button" className={`${styles.iconButton} ${styles.deleteIconButton}`} aria-label="Xóa buổi học" data-tooltip="Xóa buổi học" disabled={busy} onClick={() => askDelete(currentDetail)}><Icon name="trash"/></button>
      </div>}
      {currentDetail.user_id === userId && togetherIds.has(currentDetail.id) && <p className={styles.togetherStatus}><span aria-hidden="true">🤝</span> {partnerName} đã đề nghị học chung buổi này.</p>}
      {currentDetail.user_id !== userId && !currentMeeting && (!detailEnded || togetherIds.has(currentDetail.id)) && <div className={styles.togetherActions}>
        {togetherIds.has(currentDetail.id) ? <><span className={styles.togetherBadge}><span aria-hidden="true">🤝</span> Đã đề nghị học chung</span><button type="button" className="text-link" disabled={busy} onClick={() => void onTogether(currentDetail, false)}>Rút đề nghị</button></>
          : <button type="button" className="secondary" title={currentMeetingIssue || undefined} disabled={busy || !!currentMeetingIssue} onClick={() => void inviteTogether(currentDetail)}><span aria-hidden="true">🤝</span> Đề nghị học chung</button>}
      </div>}
      {currentMeeting ? <div className={styles.meetingAction}>{currentDetail.user_id === userId && currentMeeting.mode === "solo" && <p>{commitmentReady ? `Timeline đã sẵn sàng. Bạn có thể mời ${partnerName} học cùng.` : "Timeline đã sẵn sàng. Cả hai cần chốt kế hoạch trước khi gửi lời mời."}</p>}<button type="button" className="primary" disabled={busy} onClick={() => openMeeting({...meetingTarget(currentDetail), meeting_id: currentMeeting.id})}>{currentDetail.user_id !== userId && currentMeeting.mode === "solo" ? "Đề xuất tham gia →" : currentDetail.user_id === userId && currentMeeting.mode === "solo" && commitmentReady ? "Mở buổi học để mời bạn →" : "Mở timeline buổi học →"}</button></div>
        : detailEnded && currentDetail.user_id === userId && currentDetail.status !== "COMPLETED" ? <div className={styles.meetingAction}><button type="button" className="primary" disabled={busy} onClick={() => select(currentDetail)}>Đổi giờ để tạo timeline →</button></div>
        : !detailEnded && (currentDetail.user_id === userId || togetherIds.has(currentDetail.id)) && <div className={styles.meetingAction}>{currentDetail.user_id === userId && currentDetail.scheduled_start && <p>{commitmentReady ? `Tiếp theo: tạo timeline, rồi mời ${partnerName} học cùng.` : "Tiếp theo: tạo timeline. Cả hai cần chốt kế hoạch trước khi mời học chung."}</p>}<button type="button" className="primary" title={currentMeetingIssue || undefined} disabled={busy || !!currentMeetingIssue} onClick={() => openMeeting(meetingTarget(currentDetail))}>Tạo timeline buổi học →</button></div>}
      {!currentMeeting && !detailEnded && currentMeetingIssue && <p role="status">{currentMeetingIssue}</p>}
      {currentDetail.user_id !== userId && <section className={styles.lessonNotes}>
        <PlanNotes token={token} pair={view.plan!.pair_id} partner={partnerName} context={`Buổi học: ${currentDetail.action}`} itemId={currentDetail.id} compact/>
      </section>}
    </section>}
      {deleting && <section className={styles.drawerDetail}><p>Xóa buổi này khỏi kế hoạch?</p><h3>{deleting.action}</h3><div className={styles.actions}><button className={styles.deleteConfirm} disabled={busy} onClick={() => void remove()}>{busy ? "Đang xóa…" : "Xóa buổi học"}</button><button className="secondary" disabled={busy} onClick={closeEditor}>Hủy</button></div></section>}
      {(selectedItem || adding) && <form className={styles.drawerAssignment} onSubmit={event => {event.preventDefault(); void save();}}>
        <fieldset disabled={busy} className={styles.lessonFields}>
          {(adding || editingContent) ? <>
            <label><RequiredLabel>Nội dung buổi học</RequiredLabel><textarea rows={3} required minLength={5} maxLength={600} value={action} onChange={event => setAction(event.target.value)}/></label>
            <label><RequiredLabel>Đầu ra cần hoàn thành</RequiredLabel><textarea rows={2} required minLength={3} maxLength={500} value={output} onChange={event => setOutput(event.target.value)}/></label>
            <label><RequiredLabel>Thời lượng (phút)</RequiredLabel><input type="number" min={10} max={90} required value={minutes} onChange={event => setMinutes(Number(event.target.value))}/></label>
          </> : <strong>{selectedItem?.action}</strong>}
          <label>{adding || editingContent ? "Ngày học (có thể chọn sau)" : <RequiredLabel>Ngày học</RequiredLabel>}<input type="date" required={!adding && !editingContent} min={calendarDate()} max={view.calendar?.end_date} value={target} onChange={event => chooseDate(event.target.value)}/></label>
          <label>{adding || editingContent ? "Giờ học (có thể chọn sau)" : <RequiredLabel>Giờ học</RequiredLabel>}<input className={styles.lessonTimeInput} type="time" aria-label="Giờ bắt đầu" required={!adding && !editingContent} value={clock} onChange={event => setClock(event.target.value)}/></label>
          {dayKind(view.calendar, target) === "buffer" && <label className={styles.confirmBuffer}><input type="checkbox" checked={confirmBuffer} onChange={event => setConfirmBuffer(event.target.checked)}/>Dùng ngày đệm này để học.</label>}
          {(adding || selectedItem && !meetings.some(meeting => meeting.plan_item_id === selectedItem.id && !["CANCELLED", "EXPIRED", "MISSED", "ENDED"].includes(meeting.status))) && <label>Timeline (không bắt buộc)<textarea rows={2} maxLength={1300} value={timelineText} onChange={event => setTimelineText(event.target.value)} placeholder="Mỗi dòng một hoạt động, ví dụ: Ôn bài — 10 phút"/><small>Có thể thêm hoặc sửa sau. Cú sẽ nhắc trước buổi học.</small></label>}
          <div className={styles.actions}><button type="submit" className="primary" disabled={busy || ((!adding && !editingContent) && (!target || !clock)) || (dayKind(view.calendar, target) === "buffer" && !confirmBuffer)}>{busy ? "Đang lưu…" : adding ? "Thêm buổi học" : "Lưu thay đổi"}</button><button type="button" className="secondary" disabled={busy} onClick={closeEditor}>Hủy</button></div>
        </fieldset>
      </form>}
    </Sheet>
  </section>;
}
