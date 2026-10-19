"use client";
<<<<<<< HEAD

import {useEffect, useMemo, useRef, useState} from "react";
import type {KeyboardEvent} from "react";
import type {AppPage, PlanNotificationTarget} from "@/lib/home-types";
import type {HomeOverview} from "@/lib/home-types";
import {api, type CoachCase} from "@/lib/api";
import styles from "./ProductOverview.module.css";

type Tab = "today" | "journey";
type Journey = "paired" | "new" | "waiting";
type Scenario = {id: string; switchLabel: string; label: string; title: string; body: string; actions: string[]; tone: "pink" | "blue" | "yellow"};

const scenarios: Scenario[] = [
  {id:"review",switchLabel:"Quên đánh giá buổi hôm qua",label:"Đánh giá buổi hôm qua",title:"Giải thích vấn đề bằng tiếng Anh",body:"Bạn thấy nhịp học buổi hôm qua thế nào?",actions:["🥰 Ổn","⏱ Ngắn hơn","😅 Dễ hơn"],tone:"pink"},
  {id:"reschedule",switchLabel:"Buddy đề xuất đổi giờ học chung",label:"Xác nhận lịch chung",title:"Hùng muốn dời buổi 21:00 → 21:30",body:"Hôm nay có lịch học chung, bạn đồng ý chứ?",actions:["Đồng ý 21:30","Giữ 21:00","Giờ khác"],tone:"pink"},
  {id:"goal",switchLabel:"Có lịch chung, chưa lên mục tiêu",label:"Chốt mục tiêu buổi chung",title:"Buổi học tối nay cần một mục tiêu",body:"Hai bạn có thể chốt nội dung và timeline trước khi bắt đầu.",actions:["Chốt mục tiêu"],tone:"blue"},
  {id:"time",switchLabel:"2 buổi tự học chưa chốt giờ",label:"Chốt giờ tự học",title:"2 buổi tự học chưa chốt giờ",body:"Ngữ pháp giao tiếp · 17/10 / Từ vựng công việc · 18/10",actions:["Chọn giờ"],tone:"blue"},
  {id:"late",switchLabel:"Buddy báo đến muộn / vắng",label:"Buddy báo đến muộn",title:"Hùng sẽ vào sau khoảng 10 phút",body:"Bạn muốn đợi hay tự học trước?",actions:["Đợi Hùng","Học trước"],tone:"blue"},
  {id:"checkin",switchLabel:"Chưa check-in ảnh hôm nay",label:"Check-in hôm nay",title:"Thêm một kỷ niệm cho hành trình",body:"Chụp góc học để Hùng thấy bạn đã bắt đầu.",actions:["📸 Check-in"],tone:"yellow"},
  {id:"affirm",switchLabel:"Câu khẳng định cần nói to",label:"Luyện nói hôm nay",title:"Một câu khẳng định đang đợi bạn",body:"Nói thành tiếng để bắt đầu buổi học tự tin hơn.",actions:["Bắt đầu nói"],tone:"blue"},
  {id:"badge",switchLabel:"Sắp đạt huy hiệu",label:"Cột mốc tiếp theo",title:"Còn 3 buổi học chung",body:"Hai bạn đang tiến gần huy hiệu Đôi bạn cùng tiến.",actions:[],tone:"yellow"},
];
const journeyStates: {id: Journey; label: string}[] = [
  {id:"paired",label:"Đang có buddy"}, {id:"new",label:"Vừa đổi buddy (giữ kỷ niệm)"}, {id:"waiting",label:"Chưa có buddy (chờ match)"},
];
const ownGoals = ["Học 5 từ mới tiếng Anh", "Tự học ngữ pháp mới", "Học chung cùng Hùng để luyện giao tiếp lúc 21h"];
const buddyGoals = ["Thực tập khám phá user", "Tham gia workshop PM", "Cùng giao tiếp tiếng Anh với bạn lúc 21h"];
const bufferDayLabel = (day: string) => new Intl.DateTimeFormat("vi-VN", {weekday: "short", day: "2-digit", month: "2-digit"}).format(new Date(`${day}T12:00:00`));

function Count({value, active, reduced}: {value: number; active: boolean; reduced: boolean}) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!active || reduced) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1300);
      setShown(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    setShown(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, active, reduced]);
  return <>{shown}</>;
}

export default function ProductOverview({token, go}: {token: string; go: (page: AppPage, target?: PlanNotificationTarget) => void}) {
  const [tab, setTab] = useState<Tab>("today");
  const [journey, setJourney] = useState<Journey>("paired");
  const [enabled, setEnabled] = useState<string[]>(scenarios.map(s => s.id));
  const [ownDone, setOwnDone] = useState<number[]>([0]);
  const [dev, setDev] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [cycle, setCycle] = useState(0);
  const remainingMs = useRef(9000);
  const timerStartedAt = useRef<number | null>(null);
  const [toast, setToast] = useState("");
  const [liveCases, setLiveCases] = useState<CoachCase[]>([]);
  const [home, setHome] = useState<HomeOverview | null>(null);
  const [backupDay, setBackupDay] = useState<string | null | undefined>(undefined);
  const [caseError, setCaseError] = useState("");
  const [caseBusy, setCaseBusy] = useState("");
  const [reply, setReply] = useState<Record<string, string>>({});
  const selected = useMemo(() => scenarios.filter(s => enabled.includes(s.id)), [enabled]);
  const actionable = selected.filter(s => s.id !== "badge");
  const visible = actionable.slice(0, 3);
  if (visible.length < 3) {const badge = selected.find(s => s.id === "badge"); if (badge) visible.push(badge);}
  const overflow = selected.length - visible.length;
  const paused = hover || focus || hidden || reduced || (!dev && liveCases.some(item => item.priority >= 85));

  useEffect(() => {
    let active = true;
    const load = () => {if (document.hidden) return; void Promise.all([api.coachCases(token), api.home(token)]).then(([cases, snapshot]) => {if (active) {setLiveCases(cases.items); setHome(snapshot); setCaseError("");}}).catch(() => {if (active) setCaseError("Chưa tải được lời nhắc. Thử mở lại trang.");});};
    load();
    const timer = window.setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    return () => {active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", load);};
  }, [token]);
  useEffect(() => {if (!dev && liveCases.some(item => item.priority >= 85)) setTab("today");}, [dev, liveCases]);
  useEffect(() => {
    const pairId = home?.pair?.pair_id;
    if (!pairId || !home?.plan.has_plan) {setBackupDay(null); return;}
    let active = true;
    setBackupDay(undefined);
    void api.plan(token, pairId).then(view => {
      if (active) setBackupDay(view.calendar?.buffer_dates.find(day => day >= (home.today ?? new Date().toISOString().slice(0, 10))) ?? null);
    }).catch(() => {if (active) setBackupDay(null);});
    return () => {active = false;};
  }, [token, home?.pair?.pair_id, home?.plan.has_plan, home?.today]);

  async function stage(item: CoachCase, action: string, detail = "") {
    setCaseBusy(item.id); setCaseError("");
    try {const result = await api.coachCaseAction(token, item.id, action, detail); setLiveCases(result.items);}
    catch (error) {setCaseError(error instanceof Error ? error.message : "Chưa cập nhật được. Thử lại nhé.");}
    finally {setCaseBusy("");}
  }
  async function sendCare(item: CoachCase) {
    const content = (reply[item.id] || "").trim();
    if (!content) return;
    setCaseBusy(item.id); setCaseError("");
    try {
      await api.sendPeerStudyMessage(token, item.pair_id, content, `owl-${item.kind === "waiting_peer" ? "care" : item.kind === "missed_shared" ? "reply" : "pacing"}:${item.meeting_id || item.id}`);
      const result = await api.coachCaseAction(token, item.id, "sent");
      setLiveCases(result.items);
    } catch (error) {setCaseError(error instanceof Error ? error.message : "Chưa gửi được lời nhắn. Thử lại nhé.");}
    finally {setCaseBusy("");}
  }
  function openReplan(item: CoachCase) {void stage(item, "plan_opened"); go("plan", {pair_id: item.pair_id, item_id: item.item_id, replan: true});}
  function liveCard(item: CoachCase, index: number) {
    const busy = caseBusy === item.id;
    const care = item.kind === "waiting_peer" || (item.kind === "missed_shared" && item.stage.startsWith("reason_")) || item.kind === "pacing_fast";
    const hint = item.kind === "waiting_peer" ? `Mong bạn ổn nhé, ${item.peer_name}. Mình hẹn học bù khi bạn rảnh.`
      : item.kind === "missed_shared" ? `Xin lỗi ${item.peer_name}, hôm đó mình không tham gia được. Mình vẫn muốn học cùng bạn, mình hẹn lại nhé?`
      : `${item.peer_name} ơi, mình có thể cùng học phần khó nhất trong tuần này nếu bạn muốn.`;
    return <article key={item.id} className={`${styles.caseCard} ${styles[item.tone]}`} style={{animationDelay:`${index * 90}ms`}}>
      <span className={styles.caseLabel}>{item.label}</span><h2>{item.title}</h2><p>{item.body}</p>
      {item.care_message && <p className={styles.careNote}>{item.peer_name} nhắn: {item.care_message}</p>}
      {item.kind === "missed_shared" && !item.stage && <div className={styles.actions}><button disabled={busy} onClick={() => void stage(item,"reason_busy","Bận đột xuất")}>Mình bận đột xuất</button><button disabled={busy} onClick={() => void stage(item,"reason_forgot","Quên lịch")}>Mình quên lịch</button><button disabled={busy} onClick={() => void stage(item,"reason_other","Lý do khác")}>Lý do khác</button></div>}
      {item.kind === "missed_shared" && item.stage.startsWith("reason_") && <p className={styles.careNote}>Cảm ơn bạn đã chia sẻ. Một buổi lỡ hẹn không làm mất công sức hai bạn đã có. Cú giúp bạn gửi lời nhắn để cùng tiếp tục nhé.</p>}
      {care && <div className={styles.caseReply}><input aria-label={`Lời nhắn cho ${item.peer_name}`} value={reply[item.id] ?? hint} onChange={event => setReply(old => ({...old,[item.id]:event.target.value}))}/><div className={styles.actions}><button disabled={busy} onClick={() => void sendCare(item)}>Gửi cho {item.peer_name}</button><button disabled={busy} onClick={() => go("study-meetings")}>Xem trò chuyện</button></div></div>}
      {(item.kind === "late_lesson" || item.kind === "overload") && item.stage === "short_start" && <><p className={styles.careNote}>Thử 15 phút: chỉ làm một phần nhỏ của “{item.action}”, rồi xem bạn đã làm được gì.</p><div className={styles.actions}><button disabled={busy} onClick={() => void stage(item,"short_done")}>Mình đã thử</button><button disabled={busy} onClick={() => void stage(item,"short_more")}>Để lần sau</button></div></>}
      {(item.kind === "late_lesson" || item.kind === "overload") && item.stage === "too_hard" && <div className={styles.actions}><button disabled={busy} onClick={() => openReplan(item)}>Điều chỉnh buổi còn lại</button><button disabled={busy} onClick={() => go("study-meetings")}>Nói với Cú</button></div>}
      {(item.kind === "late_lesson" || item.kind === "overload") && !item.stage && <div className={styles.actions}><button disabled={busy} onClick={() => void stage(item,"short_start")}>Thử bản 15 phút</button><button disabled={busy} onClick={() => void stage(item,"too_hard")}>Nội dung quá sức</button><button disabled={busy} onClick={() => openReplan(item)}>Đổi kế hoạch</button></div>}
      {item.kind === "pacing_slow" && <div className={styles.actions}><button disabled={busy} onClick={() => openReplan(item)}>Làm nhẹ kế hoạch</button><button disabled={busy} onClick={() => go("study-meetings")}>Nói với Cú</button></div>}
      {item.kind === "timeline_reminder" && <div className={styles.actions}><button disabled={busy} onClick={() => {void stage(item, "plan_opened"); go("plan", {pair_id: item.pair_id, item_id: item.item_id});}}>Thêm timeline</button><button disabled={busy} onClick={() => void stage(item, "dismiss")}>Để sau</button></div>}
    </article>;
  }
  const ownMember = home?.members?.[0];
  const peerMember = home?.members?.[1];
  const realGoals = [ownMember, peerMember].map(member => member?.today_items?.slice(0, 3) ?? []);
  const missingGoal = !!home?.profile_missing.includes("Mục tiêu học tập");
  const missingPlan = !!home && !home.plan.has_plan;
  const backupItem = ownMember?.overdue_yesterday?.[0] ?? ownMember?.next?.[0];
  const backupPairId = home?.pair?.pair_id;

  useEffect(() => {
    setDev(new URLSearchParams(window.location.search).get("dev") === "1");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {media.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility);};
  }, []);
  useEffect(() => {
    if (paused) {
      if (timerStartedAt.current !== null) {
        remainingMs.current = Math.max(0, remainingMs.current - (performance.now() - timerStartedAt.current));
        timerStartedAt.current = null;
      }
      return;
    }
    timerStartedAt.current = performance.now();
    const timer = window.setTimeout(() => {
      timerStartedAt.current = null;
      remainingMs.current = 9000;
      setTab(old => old === "today" ? "journey" : "today");
      setCycle(old => old + 1);
    }, remainingMs.current);
    return () => {
      window.clearTimeout(timer);
      if (timerStartedAt.current !== null) {
        remainingMs.current = Math.max(0, remainingMs.current - (performance.now() - timerStartedAt.current));
        timerStartedAt.current = null;
      }
    };
  }, [paused, tab, cycle]);
  const switchTab = (next: Tab) => {
    remainingMs.current = 9000;
    timerStartedAt.current = null;
    setTab(next);
    setCycle(old => old + 1);
  };
  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, current: Tab) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault(); const next = current === "today" ? "journey" : "today";
    switchTab(next); document.getElementById(`hero-tab-${next}`)?.focus();
  };
  const toggle = (id: string) => setEnabled(old => old.includes(id) ? old.filter(value => value !== id) : [...old, id]);
  const resolve = (id: string, action: string) => {
    setEnabled(old => old.filter(value => value !== id));
    setToast(`${action} · Đã cập nhật bản xem trước`);
    window.setTimeout(() => setToast(""), 3200);
  };
  const share = async () => {
    const summary = "Hành trình học cùng: 12 ngày giữ nhịp, 10 giờ học chung và 15 hình check-in.";
    try {await navigator.clipboard.writeText(summary); setToast("Đã sao chép tóm tắt hành trình.");}
    catch {setToast(summary);}
    window.setTimeout(() => setToast(""), 3500);
  };

  return <div className={styles.page}>
    <section className={styles.hero} aria-label="Hành trình và hôm nay" onMouseEnter={() => setHover(true)} onMouseLeave={() => {setHover(false); setFocus(false);}} onFocusCapture={() => setFocus(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocus(false);}}>
      <div className={styles.topbar}>
        <div className={styles.tabs} role="tablist" aria-label="Xem tổng quan">
          <button id="hero-tab-journey" type="button" role="tab" aria-selected={tab === "journey"} aria-controls="hero-panel-journey" className={tab === "journey" ? styles.selected : ""} onClick={() => switchTab("journey")} onKeyDown={event => tabKey(event, "journey")}>Hành trình đã qua</button>
          <button id="hero-tab-today" type="button" role="tab" aria-selected={tab === "today"} aria-controls="hero-panel-today" className={tab === "today" ? styles.selected : ""} onClick={() => switchTab("today")} onKeyDown={event => tabKey(event, "today")}>Hôm nay</button>
        </div>
        <div className={styles.cycleTrack} aria-hidden="true"><span key={`${cycle}-${tab}`} className={paused ? styles.progressPaused : styles.progressRunning}/></div>
        <span className={styles.cycleLabel}>{paused ? "Đang tạm dừng" : "Tự chuyển tab"}</span>
      </div>

      {tab === "today" ? <div key="today" className={`${styles.panel} ${styles.panelEnter}`} id="hero-panel-today" role="tabpanel" aria-labelledby="hero-tab-today">
        <div className={styles.kicker}>PEERBRIDGE · HÔM NAY {dev && <span className={styles.previewBadge}>Bản xem trước</span>}</div>
        <h1 className={styles.headline}>{!dev && missingGoal ? <>Chọn một <mark>mục tiêu nhỏ</mark> để bắt đầu</> : !dev && missingPlan ? <>Mục tiêu đã có, <mark>cùng lên kế hoạch</mark></> : <>Hôm nay còn <mark>{dev ? actionable.length : liveCases.length} việc</mark> cần bạn chốt</>}</h1>
        <div className={styles.todayGrid}>
          <div className={styles.goals}>{!dev && missingPlan ? <div className={styles.starterGoals}><strong>{missingGoal ? "Bạn chưa có mục tiêu học" : "Chưa có kế hoạch học"}</strong><span>{missingGoal ? "Điều bạn muốn học sẽ xuất hiện ở đây." : "Các buổi học sẽ hiện ở đây sau khi bạn tạo kế hoạch."}</span></div> : <div className={styles.goalColumns}>
            <div className={styles.goalColumn}><h2>Bạn</h2>{dev ? ownGoals.map((goal, index) => <button type="button" key={goal} className={styles.goalRow} aria-pressed={ownDone.includes(index)} onClick={() => setOwnDone(old => old.includes(index) ? old.filter(n => n !== index) : [...old, index])}><span className={`${styles.check} ${ownDone.includes(index) ? styles.checked : ""}`}>{ownDone.includes(index) ? "✓" : ""}</span><span>{goal}</span></button>) : realGoals[0].length ? realGoals[0].map(item => <div className={styles.goalRow} key={item.id}><span className={`${styles.check} ${item.status === "COMPLETED" ? styles.checked : ""}`}>{item.status === "COMPLETED" ? "✓" : ""}</span><span>{item.label}</span></div>) : <div className={styles.goalRow}>Hôm nay chưa có buổi học.</div>}<div className={styles.goalProgress}><span style={{width:`${dev ? ownDone.length / 3 * 100 : ownMember?.today_total ? (ownMember.today_done ?? 0) / ownMember.today_total * 100 : 0}%`}}/></div></div>
            <div className={styles.goalColumn}><h2>{dev ? "Hùng" : peerMember?.display_name || "Bạn học"}</h2>{dev ? buddyGoals.map((goal, index) => <div className={styles.goalRow} key={goal}><span className={`${styles.check} ${index === 1 ? styles.checked : ""}`}>{index === 1 ? "✓" : ""}</span><span>{goal}</span></div>) : realGoals[1].length ? realGoals[1].map(item => <div className={styles.goalRow} key={item.id}><span className={`${styles.check} ${item.status === "COMPLETED" ? styles.checked : ""}`}>{item.status === "COMPLETED" ? "✓" : ""}</span><span>{item.label}</span></div>) : <div className={styles.goalRow}>Hôm nay chưa có buổi học.</div>}<div className={styles.goalProgress}><span style={{width:`${dev ? 33 : peerMember?.today_total ? (peerMember.today_done ?? 0) / peerMember.today_total * 100 : 0}%`}}/></div></div>
          </div>}</div>
          <div className={styles.caseColumn} aria-live="polite">{!dev && missingPlan ? <article className={`${styles.caseCard} ${styles.blue}`}><span className={styles.caseLabel}>Bắt đầu từ đây</span><h2>{missingGoal ? "Bạn muốn học điều gì?" : home?.pair ? "Chia mục tiêu thành từng buổi" : "Tìm một bạn đồng hành"}</h2><p>{missingGoal ? "Viết mục tiêu và thời hạn để Cú giúp bạn bắt đầu." : home?.pair ? "Lập kế hoạch rồi chọn ngày học phù hợp với bạn." : "Kết nối với một bạn để lập kế hoạch và hẹn học chung."}</p><div className={styles.actions}><button type="button" onClick={() => go(missingGoal ? "profile" : home?.pair ? "plan" : "matching")}>{missingGoal ? "Thêm mục tiêu" : home?.pair ? "Lập kế hoạch" : "Tìm bạn học"}</button></div></article> : dev ? <>{visible.length ? visible.map((item, index) => <article key={item.id} className={`${styles.caseCard} ${styles[item.tone]}`} style={{animationDelay:`${index * 90}ms`}}><span className={styles.caseLabel}>{item.label}</span><h2>{item.title}</h2><p>{item.body}</p>{item.actions.length > 0 && <div className={styles.actions}>{item.actions.map(action => <button type="button" key={action} onClick={() => resolve(item.id, action)}>{action}</button>)}</div>}</article>) : <div className={styles.allDone}>Bạn đã chốt xong mọi việc hôm nay ✨</div>}{overflow > 0 && <p className={styles.more}>+{overflow} việc khác sẽ hiện khi bạn chốt xong</p>}</> : <>{liveCases.slice(0, 3).map(liveCard)}{!liveCases.length && <div className={styles.allDone}>Hôm nay Cú chưa có việc cần nhắc bạn.</div>}{liveCases.length > 3 && <p className={styles.more}>+{liveCases.length - 3} việc khác</p>}{caseError && <p role="alert" className={styles.caseError}>{caseError}</p>}</>}</div>
        </div>
        {!dev && home?.plan.has_plan && backupPairId && (home.plan.total_items ?? 0) > (home.plan.done_items ?? 0) && <div className={styles.backupCard}><div><span>PHƯƠNG ÁN DỰ PHÒNG</span><strong>{backupDay ? `Ngày đệm gần nhất: ${bufferDayLabel(backupDay)}` : backupDay === undefined ? "Đang xem ngày đệm…" : "Chưa có ngày đệm sắp tới"}</strong><p>{backupDay ? "Lỡ một buổi? Bạn có thể dời lịch sang ngày đệm hoặc làm nhẹ các buổi còn lại." : "Nếu lịch thay đổi, bạn vẫn có thể dời buổi hoặc làm nhẹ kế hoạch."}</p></div><div className={styles.backupActions}>{backupItem && <button type="button" onClick={() => go("plan", {pair_id: backupPairId, item_id: backupItem.id})}>Dời buổi</button>}<button type="button" onClick={() => go("plan", {pair_id: backupPairId, replan: true})}>Làm nhẹ kế hoạch</button></div></div>}
      </div> : <div key="journey" className={`${styles.panel} ${styles.panelEnter}`} id="hero-panel-journey" role="tabpanel" aria-labelledby="hero-tab-journey">{!dev && missingGoal ? <div className={styles.journeyStart}><div className={styles.kicker}>PEERBRIDGE · HÀNH TRÌNH CỦA BẠN</div><h1 className={styles.storyTitle}>Hành trình bắt đầu từ <mark>một mục tiêu nhỏ</mark></h1><p>Chọn điều bạn muốn học. Các buổi học và khoảnh khắc check-in sẽ dần hiện ở đây.</p><div className={styles.startSteps}><span>1 · Chọn mục tiêu</span><span>2 · Tìm bạn học</span><span>3 · Cùng giữ nhịp</span></div><button type="button" onClick={() => go("profile")}>Thêm mục tiêu</button></div> : <div className={styles.journeyGrid}>
        <div className={styles.story}><div className={styles.kicker}>PEERBRIDGE · HÀNH TRÌNH ĐỒNG HÀNH <span className={styles.previewBadge}>Bản xem trước</span></div><h1 className={styles.storyTitle}>{journey === "paired" ? <>Mỗi người một mục tiêu, <mark>cùng giữ một nhịp học</mark> 🏅</> : <>Hành trình của bạn vẫn được giữ, <mark>bạn đồng hành mới đang đến</mark></>}</h1><div className={styles.avatars}><span className={styles.avatar}>🤖</span><span className={styles.bond}>{journey === "paired" ? "🤝" : "+"}</span><span className={`${styles.avatar} ${journey !== "paired" ? styles.unknown : ""}`}>{journey === "paired" ? "🐼" : "?"}</span></div><p className={styles.names}>Bạn {journey === "paired" ? "× Hùng" : "· đang tìm bạn đồng hành mới"}</p><div className={styles.polaroids} aria-label="Kỷ niệm học tập giả lập"><div className={`${styles.polaroid} ${styles.photoBack}`}><img src="/images/checkin-mock/study-talk.jpg" alt=""/><span>Buổi học chung · 09/10</span></div><div className={`${styles.polaroid} ${styles.photoMiddle}`}><img src="/images/checkin-mock/study-desk.jpg" alt=""/><span>Check-in · 11/10 · 21:02</span></div><div className={`${styles.polaroid} ${styles.photoFront}`}><img src="/images/checkin-mock/library-study.jpg" alt=""/><span>Check-in · 10/10 · 20:58</span></div></div></div>
        <div className={styles.journeyRight}><div className={styles.statsCard}><div className={styles.stats}><div><strong><Count value={journey === "paired" ? 12 : 9} active reduced={reduced}/></strong><span>Ngày cùng giữ nhịp</span></div><div><strong><Count value={journey === "paired" ? 10 : 6} active reduced={reduced}/>h</strong><span>Giờ học chung</span></div><div><strong><Count value={journey === "paired" ? 15 : 9} active reduced={reduced}/></strong><span>Hình đã check-in</span></div></div><p className={styles.badgeText}>🏅 {journey === "paired" ? <>Cột mốc tiếp theo: còn <mark>3 buổi</mark> học chung</> : "Kỷ niệm cũ vẫn là một phần hành trình của bạn"}</p><div className={styles.badgeProgress}><span style={{width:journey === "paired" ? "70%" : "16%"}}/></div><p className={styles.motto}>Mỗi người có mục tiêu riêng nhưng chúng ta đã đồng hành giữ nhịp cùng nhau</p><div className={styles.timeline} aria-label="Các mốc hành trình giả lập"><svg className={styles.timelineLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className={styles.partnerPath} d="M 15 22 L 30 50 L 50 22 L 70 50 L 85 22"/><path className={styles.ownPath} d="M 15 78 L 30 50 L 50 78 L 70 50 L 85 78"/></svg><div className={`${styles.lane} ${styles.partnerLane}`}><span>Buổi 11/10</span><span>Buổi 12/10</span><span>Buổi 13/10</span></div><div className={styles.jointLane}><span>Buổi học chung 1</span><span>Buổi học chung 2</span></div><div className={`${styles.lane} ${styles.ownLane}`}><span>Buổi 11/10</span><span>Buổi 13/10</span><span>Buổi 14/10</span></div></div><div className={styles.chapter}>{journey === "paired" ? "Hùng · đang đồng hành · 12 buổi" : journey === "new" ? "Chương cũ đã khép lại → Đang tìm bạn mới" : "Đang tìm bạn đồng hành mới"}</div><div className={styles.percentages}>{journey === "paired" && <div><strong>36%</strong><span>Mục tiêu của Hùng</span></div>}<div><strong>39%</strong><span>Mục tiêu của Bạn</span></div></div></div><button type="button" className={styles.share} onClick={() => void share()}>✨ Chia sẻ hành trình</button></div>
      </div>}</div>}
    </section>
    {toast && <div className={styles.toast} role="status">{toast}</div>}
    {dev && <section className={styles.devPanel} aria-label="Giả lập tình huống"><h2>Giả lập tình huống</h2><p>Hero chỉ hiện tối đa 3 việc cần chốt theo độ ưu tiên, phần còn lại gom vào “+N việc khác”. Bật/tắt để xem slot tự lấp đầy.</p><div className={styles.devChips}>{scenarios.map(s => <button type="button" key={s.id} aria-pressed={enabled.includes(s.id)} onClick={() => toggle(s.id)}>{s.switchLabel}</button>)}</div><h2>Trạng thái hành trình</h2><div className={styles.devChips}>{journeyStates.map(s => <button type="button" key={s.id} aria-pressed={journey === s.id} onClick={() => setJourney(s.id)}>{s.label}</button>)}</div></section>}
=======
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AppPage, HomeOverview } from "@/lib/home-types";
import Avatar from "@/components/ui/Avatar";
import JourneyCard from "@/components/common/JourneyCard";
import { LoopCards } from "@/features/overview/components/Overview";

export default function ProductOverview({ token, go }: { token: string; go: (p: AppPage) => void }) {
  const [data, setData] = useState<HomeOverview | null>(null);
  const [myId, setMyId] = useState(0);
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const [home, profile] = await Promise.all([api.home(token), api.profile(token)]); setData(home); setGoal(profile.profile.learning_goals[0] || ""); setMyId(profile.profile.user_id); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Chưa tải được tiến độ."); }
  }, [token]);
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 30000); return () => clearInterval(timer); }, [load]);
  if (!data) return <div className="page"><section className="panel"><p>{error || "Đang mở góc học tập của bạn…"}</p>{error && <button className="primary" onClick={() => void load()}>Thử lại</button>}</section></div>;
  const name = data.display_name.includes("@") ? data.display_name.split("@")[0] : data.display_name.split(" ").slice(-2).join(" ");
  const next = data.steps.find(s => !s.done);
  const todayTotal = data.plan.today_total ?? 0, todayDone = data.plan.today_done ?? 0;
  const ready = !!data.pair && data.plan.has_plan;
  const nextTask = data.plan.next.find(x => x.due_now) || data.plan.next[0];
  return <div className="page animate-in product-overview">
    <header className="overview-head"><h1>Chào {name}</h1>{data.pending_invites > 0 && <button className="text-link" onClick={() => go("connections")}>{data.pending_invites} lời mời mới</button>}</header>
    {error && <p className="form-error">{error}</p>}
    <div className="overview-top">
      {ready ? <section className="panel today-card">
        <span className="soft-label">Hôm nay</span>
        <div className="today-score"><b>{todayDone}</b><small>/{todayTotal} việc</small></div>
        <div className="product-progress"><i style={{ width: `${todayTotal ? todayDone / todayTotal * 100 : 0}%`, background: "var(--accent)" }}/></div>
        {nextTask && todayDone < todayTotal && <p className="today-next">Tiếp theo: {nextTask.label}</p>}
        <div className="product-actions"><button className="primary" onClick={() => go("checkin")}>Check-in</button><button className="outline" onClick={() => go("plan")}>Kế hoạch</button></div>
      </section> : next && <section className="panel today-card">
        <span className="soft-label">Bước tiếp theo</span>
        <h2>{next.title}</h2>
        <button className="primary" onClick={() => go(next.page)}>Bắt đầu</button>
      </section>}
      {(data.pair || ready || !next) && <section className="panel partner-mini">
        <span className="soft-label">Bạn cặp</span>
        {data.pair ? <>
          <div className="partner-identity"><Avatar seed={data.pair.partner_id} size={48}/><div><h3>{data.pair.partner_name}</h3><span>{data.checkin.partner_checked_in_today ? "Đã học hôm nay" : "Chưa học hôm nay"}</span></div></div>
          {data.checkin.partner_latest && <p className="partner-latest">{data.checkin.partner_latest.headline} · {data.checkin.partner_latest.relative}</p>}
          <button className="outline" onClick={() => go("sessions")}>Nhắn tin</button>
        </> : <button className="primary" onClick={() => go("matching")}>Tìm bạn học</button>}
      </section>}
    </div>
    {ready && <p className="week-line">Tuần này {data.plan.week_done}/{data.plan.week_total} việc · {data.plan.minutes_done} phút · chuỗi {data.checkin.streak} ngày</p>}
    {data.coach?.text && <section className="panel coach-line"><p>{data.coach.text}</p></section>}
    {data.pair && <details className="overview-more"><summary>Xem nhịp học và hành trình</summary>
      <LoopCards data={{ ...data, coach: null }} go={go} />
      <JourneyCard me={data.display_name} partner={data.pair.partner_name} meId={myId} partnerId={data.pair.partner_id} streak={data.checkin.streak} minutes={data.plan.minutes_done} tasks={data.plan.week_done}/>
    </details>}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  </div>;
}
