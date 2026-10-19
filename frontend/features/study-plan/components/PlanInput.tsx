"use client";
import RequiredLabel from "@/components/ui/RequiredLabel";
import {FormEvent, useState} from "react";
import Avatar from "@/components/ui/Avatar";
import type {PlanSetup, PersonalPlanInput} from "@/lib/plan-types";
import {calendarDate, monday, shiftDate} from "@/lib/plan-calendar";
import {formatDate} from "@/lib/time";
export type {PersonalPlanInput} from "@/lib/plan-types";
import styles from "./StudyPlan.module.css";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
function BufferChoice({checked, onChange}: {checked: boolean; onChange: (value: boolean) => void}) {
  return <div className={styles.bufferChoice}>
    <label className={styles.completeChoice}><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/>Dùng ngày còn lại làm ngày đệm</label>
    <details className={styles.bufferHelp}><summary aria-label="Ngày đệm dùng để làm gì?" title="Ngày đệm dùng để làm gì?">?</summary><p>Ngày không chọn học được giữ làm dự phòng. Nếu lỡ một buổi, bạn có thể dời sang ngày này. Hệ thống sẽ hỏi trước khi dùng.</p></details>
  </div>;
}
export default function PlanInput({setup, userId, pair, busy, onSubmit, onError}: {setup: PlanSetup; userId: number; pair: number; busy: boolean; onSubmit: (payload: PersonalPlanInput) => void; onError: (message: string) => void}) {
  const me = setup.members.find(member => member.user_id === userId);
  const today = calendarDate();
  const firstWeek = monday(today);
  const [goal, setGoal] = useState(me?.goals.join("; ") || "");
  const [editing, setEditing] = useState(!goal);
  const [target, setTarget] = useState(me?.target_date || "");
  const [tier, setTier] = useState<PersonalPlanInput["learner_tier"] | "">("");
  const [days, setDays] = useState<number[]>(Array.from(new Set(me?.availability.map(w => w.day_of_week) || [])));
  const [recurring, setRecurring] = useState(true);
  const [complete, setComplete] = useState(false);
  const [weeks, setWeeks] = useState<PersonalPlanInput["weeks"]>([{start_date: firstWeek, days: [], complete: false}]);
  const toggle = (current: number[], day: number) => current.includes(day) ? current.filter(d => d !== day) : [...current, day];
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!goal.trim() || !target || !tier) return onError("Bổ sung mục tiêu, hạn chót và nền tảng của bạn.");
    if (target < today || target > shiftDate(today, 365)) return onError("Chọn hạn hoàn thành từ hôm nay đến một năm tới.");
    const activeWeeks = weeks.filter(w => w.start_date <= target && shiftDate(w.start_date, 6) >= today).map(w => ({...w, days: w.days.filter(d => shiftDate(w.start_date, d) >= today && shiftDate(w.start_date, d) <= target)}));
    onSubmit({pair_id: pair, goal: goal.trim(), target_date: target + "T23:59:59+07:00", learner_tier: tier, days: recurring ? days : [], recurring, calendar_complete: recurring && complete, weeks: recurring ? [] : activeWeeks});
  }
  function choices(start: string, selected: number[], change: (index: number) => void, fixed = false) {
    return <div className={styles.dayChoices}>{weekdays.map((label, index) => {
      const day = shiftDate(start, index);
      const nextOccurrence = day < today ? shiftDate(day, 7) : day;
      const disabled = fixed ? !!target && nextOccurrence > target : day < today || (!!target && day > target);
      return <label key={label} className={[selected.includes(index) ? styles.dayChosen : "", disabled ? styles.dayDisabled : ""].join(" ")}><span><input type="checkbox" checked={selected.includes(index)} disabled={disabled} onChange={() => change(index)}/>{label}</span>{!fixed && <small>{formatDate(day).slice(0, 5)}</small>}</label>;
    })}</div>;
  }
  return <form className={["panel", styles.form, styles.personalInput].join(" ")} onSubmit={submit} noValidate>
    <header className={styles.inputIdentity}><Avatar seed={userId} size={36}/><div><h2>Kế hoạch của bạn</h2><small>{me?.display_name} · Bạn học có thể xem sau khi tạo</small></div></header>
    <fieldset disabled={busy}>
      <section className={styles.inputSection}><div className={styles.personHeading}><h3>1. Mục tiêu và hạn chót</h3><button type="button" className="text-link" onClick={() => setEditing(value => !value)}>{editing ? "Xong" : "Sửa mục tiêu"}</button></div>
        {editing ? <label><RequiredLabel>Bạn muốn học gì?</RequiredLabel><textarea rows={2} required maxLength={500} value={goal} onChange={event => setGoal(event.target.value)}/></label> : <p className={styles.profileGoal}>{goal}</p>}
        <label><RequiredLabel>Ngày muốn hoàn thành</RequiredLabel><input type="date" required min={today} max={shiftDate(today, 365)} value={target} onChange={event => setTarget(event.target.value)}/></label>
      </section>
      <section className={styles.inputSection}><h3><RequiredLabel>2. Nền tảng hiện tại</RequiredLabel></h3><div className={styles.tierOptions}>{([{value: "NEWBIE", title: "Bắt đầu từ cơ bản", description: "Học kiến thức nền rồi thực hành."}, {value: "TRANSFER", title: "Có nền tảng môn gần", description: "Tập trung điểm khác biệt và thực hành."}, {value: "REFRESHER", title: "Đã học, cần ôn lại", description: "Ôn phần chính và luyện bài tập."}] as const).map(option => <label key={option.value}><input type="radio" name="learner-tier" required checked={tier === option.value} onChange={() => setTier(option.value)}/><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</div></section>
      <section className={styles.inputSection}><h3>3. Ngày có thể học</h3>
        <div className={styles.repeatChoice}><strong>Lặp lại hằng tuần?</strong>{[true, false].map(value => <label key={String(value)}><input type="radio" name="repeat-calendar" checked={recurring === value} onChange={() => setRecurring(value)}/>{value ? "Có" : "Không"}</label>)}</div>
        {recurring ? <>{choices(firstWeek, days, index => setDays(current => toggle(current, index)), true)}<BufferChoice checked={complete} onChange={setComplete}/></> : <div className={styles.weekRows}>{weeks.map((week, index) => <div key={week.start_date} className={styles.weekRow}><div className={styles.weekHeading}><strong>Tuần {formatDate(week.start_date).slice(0, 5)} – {formatDate(shiftDate(week.start_date, 6)).slice(0, 5)}</strong>{index > 0 && <button type="button" className="text-link" onClick={() => setWeeks(current => current.filter((_, row) => row !== index))}>Xóa tuần</button>}</div>{choices(week.start_date, week.days, day => setWeeks(current => current.map((row, i) => i === index ? {...row, days: toggle(row.days, day)} : row)))}<BufferChoice checked={week.complete} onChange={value => setWeeks(current => current.map((row, i) => i === index ? {...row, complete: value} : row))}/></div>)}<button type="button" className={styles.addWeek} disabled={!target || shiftDate(weeks[weeks.length - 1].start_date, 7) > target || weeks.length >= 54} onClick={() => setWeeks(current => [...current, {start_date: shiftDate(current[current.length - 1].start_date, 7), days: [], complete: false}])}>＋ Thêm tuần</button></div>}
        <p className={styles.help}>Chọn giờ sau khi tạo kế hoạch.</p>
      </section>
      <button type="submit" className="primary" disabled={busy}>{busy ? "Đang tạo…" : "Tạo kế hoạch của tôi"}</button>
    </fieldset>
  </form>;
}
