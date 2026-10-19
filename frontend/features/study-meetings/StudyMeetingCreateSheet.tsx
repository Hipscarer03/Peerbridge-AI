"use client";

import {useRef, useState, type FormEvent} from "react";
import Sheet from "@/components/ui/Sheet";
import {api} from "@/lib/api";
import type {StudyMeetingCreateTarget} from "@/lib/study-meeting-navigation";
import type {CreateStudyMeeting, StudyMeeting, StudySegment} from "@/lib/study-meetings";
import {formatDateTime} from "@/lib/time";
import {presets, segment} from "./meeting-presets";
import {timelineBufferMinutes, timelineFromText} from "./timeline-from-text";
import styles from "./StudyMeetings.module.css";

export default function StudyMeetingCreateSheet({token, userId, target, canInvite, onClose, onCreated}: {
  token: string;
  userId: number;
  target: StudyMeetingCreateTarget;
  canInvite: boolean;
  onClose: () => void;
  onCreated: (meeting: StudyMeeting) => void;
}) {
  const [goal, setGoal] = useState(target.goal);
  const [timelineText, setTimelineText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientKey = useRef("");
  const mode = target.item_user_id === userId ? "solo" : "together";
  const startTime = target.scheduled_start ? Date.parse(target.scheduled_start) : NaN;
  const canCreate = Number.isFinite(startTime) && startTime + target.minutes * 60000 > Date.now();
  const customTimeline = (() => {
    if (!timelineText.trim()) return null;
    try {return {segments: timelineFromText(timelineText, target.minutes, []), buffer: timelineBufferMinutes(timelineText), error: ""};}
    catch (failure) {return {segments: [], buffer: 0, error: String((failure as Error).message)};}
  })();

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal.trim()) return;
    if (!Number.isFinite(startTime) || startTime + target.minutes * 60000 <= Date.now()) {
      setError("Khung giờ học đã kết thúc. Hãy đổi giờ trong Kế hoạch trước khi lên chi tiết.");
      return;
    }
    let segments: StudySegment[];
    try {
      const fallback = presets[target.minutes] ?? (target.minutes <= 120
        ? [segment(mode === "solo" ? "Tự học" : "Học cùng", target.minutes)]
        : [segment(mode === "solo" ? "Tự học phần 1" : "Học cùng phần 1", Math.floor(target.minutes / 2)), segment(mode === "solo" ? "Tự học phần 2" : "Học cùng phần 2", Math.ceil(target.minutes / 2))]);
      segments = timelineFromText(timelineText, target.minutes, fallback);
    } catch (failure) {setError(String((failure as Error).message)); return;}
    const starts_at = new Date(startTime).toISOString();
    const payload: CreateStudyMeeting = {
      peer_match_id: target.pair_id,
      client_key: clientKey.current ||= crypto.randomUUID(),
      plan_item_id: target.item_id,
      goal: goal.trim(),
      mode,
      starts_at,
      ends_at: new Date(startTime + target.minutes * 60000).toISOString(),
      source_text: timelineText.trim(),
      segments,
    };
    setBusy(true); setError("");
    try {onCreated(await api.createStudyMeeting(token, payload));}
    catch (failure) {setError(failure instanceof Error ? failure.message : "Không tạo được timeline. Hãy thử lại.");}
    finally {setBusy(false);}
  }

  return <Sheet open onOpenChange={open => {if (!open && !busy) onClose();}} title="Tạo timeline buổi học" initialFocusSelector="input">
    <form className={styles.form} onSubmit={event => void create(event)}>
      <label>Mục tiêu<input value={goal} onChange={event => setGoal(event.target.value)} required minLength={3} maxLength={300} placeholder="Bạn muốn hoàn thành điều gì?"/></label>
      <div><strong>Giờ học</strong><p className={styles.note}>{formatDateTime(target.scheduled_start)} · {target.minutes} phút</p></div>
      {!canCreate && <p className={styles.note} role="status">Khung giờ học đã kết thúc. Hãy đổi giờ trong Kế hoạch để lên chi tiết buổi mới.</p>}
      <label>Nội dung để tạo timeline<textarea rows={4} maxLength={1300} value={timelineText} onChange={event => setTimelineText(event.target.value)} placeholder={"Mỗi dòng một hoạt động, ví dụ:\nÔn bài cũ — 10 phút\nLàm bài tập — 25 phút\nTổng kết — 10 phút\nĐệm — 5 phút"}/></label>
      {mode === "solo" && <p className={styles.note}>{canInvite ? "Tạo xong timeline, bạn có thể mời bạn đồng hành học cùng." : "Tạo xong timeline, cả hai cần chốt kế hoạch trước khi gửi lời mời học cùng."}</p>}
      <p className={styles.note}>Dòng “Đệm - 5 phút” chừa thời gian dự phòng; khi cần thêm giờ, phần này tự giảm.</p>
      {customTimeline && <div className={styles.timelinePreview}><strong>Timeline tùy chỉnh</strong>{customTimeline.error ? <span className={styles.timelinePreviewError}>{customTimeline.error}</span> : <>{customTimeline.segments.map((item, index) => <span key={index}>{item.title} · {item.minutes} phút</span>)}{customTimeline.buffer > 0 && <span className={styles.timelineBufferPreview}>Đệm · {customTimeline.buffer} phút</span>}</>}</div>}
      {error && <p className={styles.timelinePreviewError} role="alert">{error}</p>}
      <button className={styles.primary} disabled={busy || !canCreate || !goal.trim() || !!customTimeline?.error}>{busy ? "Đang tạo..." : mode === "solo" ? "Lưu timeline buổi học" : "Gửi đề nghị học chung"}</button>
    </form>
  </Sheet>;
}
