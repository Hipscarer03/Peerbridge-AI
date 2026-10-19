"use client";
import {APP_TIMEZONE, formatDate, localInputToISO} from "@/lib/time";
import {calendarDays, calendarSlot, isAvailable} from "@/lib/session-calendar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PlanSetup } from "@/lib/plan-types";
import type { StudySession } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

export default function SessionCalendar({ token, pairId, userId, duration, sessions, onPick }: { token: string; pairId: number; userId: number; duration: number; sessions: StudySession[]; onPick: (start: string, end: string) => void }) {
  const [setup, setSetup] = useState<PlanSetup | null>(null);
  const [offset, setOffset] = useState(0);
  const [chosen, setChosen] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { let active = true; setSetup(null); setError(""); if (pairId) void api.planSetup(token, pairId).then(s => { if (active) setSetup(s); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [token, pairId]);
  const days = calendarDays(new Date(), offset);
  const me = setup?.members.find(m => m.user_id === userId), partner = setup?.members.find(m => m.user_id !== userId);
  function free(member: PlanSetup["members"][number] | undefined, day: string, hour: number) {
    return isAvailable(member?.availability || [], calendarSlot(day, hour), duration);
  }
  function pick(day: string, hour: number) {
    const start = calendarSlot(day, hour);
    const iso = localInputToISO(start);
    if (new Date(iso).getTime() <= Date.now()) return;
    setChosen(iso);
    onPick(start, new Date(new Date(iso).getTime() + duration * 60000).toISOString());
  }
  return <section className="panel session-calendar"><header><div><span className="soft-label">🗓️ LỊCH CỦA HAI BẠN</span><h2>Chọn một giờ cùng rảnh</h2></div><div className="product-actions"><button className="outline" aria-label="Ba ngày trước" onClick={() => setOffset(o => o-3)}>←</button><button className="outline" onClick={() => setOffset(0)}>Hôm nay</button><button className="outline" aria-label="Ba ngày sau" onClick={() => setOffset(o => o+3)}>→</button></div></header><div className="calendar-legend"><span><i className="legend-me"/>Bạn rảnh</span><span><i className="legend-partner"/>{partner?.display_name || "Bạn đồng hành"} rảnh</span><span><i className="legend-both"/>Cả hai cùng rảnh</span></div>{error && <p className="form-error">{error}</p>}{!pairId ? <p>Chọn một bạn đã kết nối để xem giờ rảnh của hai người.</p> : setup && !partner?.availability.length ? <p className="provider-note">Bạn đồng hành chưa lưu giờ rảnh. Bạn vẫn có thể chọn giờ và trao đổi trong phòng học.</p> : null}<div className="calendar-scroll"><div className="calendar-table"><div className="calendar-corner">Giờ VN</div>{days.map(d => <div className="calendar-date" key={d}>{new Date(localInputToISO(calendarSlot(d, 12))).toLocaleDateString("vi-VN", {timeZone:APP_TIMEZONE,weekday:"short", day:"2-digit",month:"2-digit"})}</div>)}{Array.from({length:15},(_, i) => i+8).map(hour => <div className="calendar-row" key={hour}><div className="calendar-hour">{String(hour).padStart(2,"0")}:00</div>{days.map(d => { const mine = free(me,d,hour), theirs = free(partner,d,hour); const date = new Date(localInputToISO(calendarSlot(d, hour))); const past = date.getTime() <= Date.now(); const booked = sessions.find(s => s.scheduled_start && s.scheduled_end && new Date(s.scheduled_start) < new Date(date.getTime()+duration*60000) && new Date(s.scheduled_end) > date && (s.learner_id === userId || s.helper_id === userId || s.learner_id === partner?.user_id || s.helper_id === partner?.user_id)); return <button key={d} type="button" disabled={!!booked || past || !setup} aria-label={`${formatDate(d)} ${String(hour).padStart(2,"0")}:00 ${mine && theirs ? "cả hai rảnh" : theirs ? "bạn đồng hành rảnh" : "chọn giờ"}`} className={`calendar-slot ${mine ? "free-me" : ""} ${theirs ? "free-partner" : ""} ${mine && theirs ? "free-both" : ""} ${chosen === date.toISOString() ? "chosen" : ""}`} onClick={() => pick(d,hour)}>{past ? <small>Đã qua giờ</small> : booked ? <small>Đã có lịch học</small> : <>{theirs && <Avatar seed={partner!.user_id} size={25}/>}<small>{mine && theirs ? "Cùng rảnh" : mine ? "Bạn rảnh" : theirs ? "Bạn ấy rảnh" : ""}</small>{chosen === date.toISOString() && <b>✓</b>}</>}</button>; })}</div>)}</div></div><small>Lịch rảnh lấy từ hồ sơ · Chọn ô lịch để điền giờ đặt phiên.</small></section>;
}
