"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icons";
import { api } from "@/lib/api";
import type { AppPage, HomeOverview } from "@/lib/home-types";
import styles from "./Overview.module.css";

function greeting(name: string) {
  const h = new Date().getHours();
  const part = h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  return `${part}, ${name}`;
}
function when(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", { weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}
const KIND_ICON: Record<string, IconName> = {
  checkin: "check", reaction: "spark", comment: "message", nudge: "bell",
  connection_request: "users", connection_accepted: "users", plan: "calendar", system: "spark",
};

const COACH_PAGE: Record<string, AppPage> = { reminder: "checkin", replan: "plan", pair_replan: "plan", offer_support: "sessions" };
const COACH_CTA: Record<string, string> = { reminder: "Check-in ngay", replan: "Xem phương án giảm tải", pair_replan: "Xem phương án giảm tải", offer_support: "Hẹn phiên học" };

function Pace({ label, side }: { label: string; side: { pacing: number | null; completed_minutes: number; due_minutes: number } }) {
  const pct = side.pacing === null ? null : Math.round(side.pacing * 100);
  return <div className={styles.pace}>
    <span>{label}</span>
    <div className={styles.bar}><i style={{ width: `${Math.min(100, pct ?? 0)}%` }} className={pct !== null && pct < 70 ? styles.low : ""} /></div>
    <b>{pct === null ? "Chưa đến hạn" : `${pct}%`}</b>
    <small>{side.completed_minutes}/{side.due_minutes} phút</small>
  </div>;
}

<<<<<<< HEAD
=======
/** Thẻ "Nhịp học của hai bạn" + "Coach gợi ý" (vòng AI: check-in → đo tiến độ → coach). */
export function LoopCards({ data, go }: { data: HomeOverview; go: (p: AppPage) => void }) {
  if (!data.pair || (!data.progress && !data.coach)) return null;
  return <div className={styles.loop}>
    {data.progress && <section className="panel" aria-label="Nhịp học của hai bạn">
      <div className={styles.sectionHead}><h2>Nhịp học của hai bạn</h2>
        {data.progress.available && <span className={data.progress.needs_attention ? styles.badgeWarn : styles.badgeOk}>
          {data.progress.needs_attention ? "Cần chú ý" : "Đang đúng nhịp"}</span>}</div>
      {!data.progress.available ? <p className={styles.muted}>{data.progress.reason}</p> : <>
        <Pace label="Bạn" side={data.progress.me} />
        <Pace label={data.pair.partner_name} side={data.progress.partner} />
        <p className={styles.muted}>
          {data.progress.i_am_lagging ? "Bạn đang chậm hơn bạn cặp. Làm một việc nhỏ hôm nay để bắt kịp nhé."
            : data.progress.needs_attention ? "Một trong hai bạn đang chậm so với kế hoạch."
            : "Hai bạn đang theo kịp kế hoạch đã đặt."}
          {" "}Nhịp = phút đã xong ÷ phút đáng lẽ xong tới hôm nay.
        </p>
      </>}
    </section>}
    {data.coach && data.coach.text && <section className={`panel ${styles.coach}`} aria-label="Lời khuyên của coach">
      <div className={styles.sectionHead}><h2>Coach gợi ý</h2><small>{data.coach.source === "ai" ? "AI viết" : "Theo quy tắc"}</small></div>
      <p>{data.coach.text}</p>
      <button type="button" className="secondary" onClick={() => go(COACH_PAGE[data.coach!.action] || "plan")}>{COACH_CTA[data.coach.action] || "Mở kế hoạch"}</button>
    </section>}
  </div>;
}

>>>>>>> 29066618049be865e9daa585fed068c149bc780f
function Skeleton() {
  return <div className="page" aria-busy="true" aria-label="Đang tải tổng quan">
    <div className={styles.skelTitle} />
    <div className={styles.tiles}>{[0, 1, 2, 3].map(i => <div key={i} className={styles.skelTile} />)}</div>
    <div className={styles.grid}><div className={styles.skelBlock} /><div className={styles.skelBlock} /></div>
  </div>;
}

export default function Overview({ token, go }: { token: string; go: (p: AppPage) => void }) {
  const [data, setData] = useState<HomeOverview | null>(null);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [demoScenario, setDemoScenario] = useState<"late" | "missed" | null>(null);
  const [missReason, setMissReason] = useState("");
  const [suggestionShown, setSuggestionShown] = useState(false);
  const [rescheduleAccepted, setRescheduleAccepted] = useState(false);
  const [shortSessionReady, setShortSessionReady] = useState(false);
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  const load = useCallback(async () => {
    try { setData(await api.home(token)); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Không tải được dữ liệu."); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);
<<<<<<< HEAD
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  if (!data && error) return <div className="page animate-in"><section className={`panel ${styles.state}`}>
    <h2>Chưa tải được trang tổng quan</h2><p>{error}</p>
    <button type="button" className="primary" onClick={() => void load()}>Thử lại</button>
  </section></div>;
  if (!data) return <Skeleton />;

  const stepsDone = data.steps.filter(s => s.done).length;
  const nextStep = data.steps.find(s => !s.done);
  const p = data.plan, c = data.checkin;
  const weekPct = p.week_total ? Math.round(p.week_done * 100 / p.week_total) : 0;
<<<<<<< HEAD
  const missedTask = p.overdue_yesterday?.[0] || null;
  const lateTask = !c.checked_in_today ? p.next.find(item => item.status === "SCHEDULED" && item.due_now && item.scheduled_start && clockNow - new Date(item.scheduled_start).getTime() >= 3 * 60_000) || null : null;
  const activeScenario = demoScenario || (missedTask ? "missed" : lateTask ? "late" : null);
  const scenarioTask = activeScenario === "missed" ? missedTask : lateTask;
  const scenarioLabel = scenarioTask?.label || (activeScenario === "missed" ? "Ôn lại nội dung đã học" : "Ôn từ vựng tiếng Anh");

  function startDemo(scenario: "late" | "missed") {
    setDemoScenario(scenario);
    setMissReason("");
    setSuggestionShown(false);
    setRescheduleAccepted(false);
    setShortSessionReady(false);
  }

  function chooseReason(reason: string) {
    setMissReason(reason);
    setSuggestionShown(true);
  }
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  return <div className="page animate-in">
    <div className={styles.head}>
      <div>
        <h1>{greeting(data.display_name)}</h1>
        <p>{data.pair
          ? c.checked_in_today ? `Hôm nay bạn đã check-in. ${c.partner_checked_in_today ? `${data.pair.partner_name} cũng vậy.` : `${data.pair.partner_name} chưa check-in.`}`
            : `Bạn và ${data.pair.partner_name} đang học cùng nhau. Hôm nay bạn chưa check-in.`
          : "Kết nối với một bạn học để bắt đầu học cùng nhau."}</p>
      </div>
      <button type="button" className="primary" onClick={() => go(data.pair ? "checkin" : "matching")}>
        <Icon name={data.pair ? "check" : "search"} />{data.pair ? "Check-in ngay" : "Tìm bạn học"}
      </button>
    </div>

<<<<<<< HEAD
    {!activeScenario && <div className={styles.demoTools}><button type="button" onClick={() => startDemo("late")}>Xem demo quá giờ</button><button type="button" onClick={() => startDemo("missed")}>Xem demo lỡ một ngày</button></div>}
    {activeScenario && <section className={styles.overdueCard} aria-live="polite">
      <div className={styles.overdueTop}><span>{demoScenario ? "MÔ PHỎNG" : activeScenario === "missed" ? "BUỔI HỌC HÔM QUA" : "ĐÃ QUÁ GIỜ 3 PHÚT"}</span>
        {demoScenario && <button type="button" aria-label="Đóng demo" onClick={() => {setDemoScenario(null); setMissReason(""); setSuggestionShown(false); setRescheduleAccepted(false); setShortSessionReady(false);}}>Đóng</button>}
      </div>
      {shortSessionReady ? <>
        <h2>Phiên rút gọn 15 phút đã sẵn sàng</h2>
        <p>Mình sẽ tập trung vào phần quan trọng nhất của <b>{scenarioLabel}</b>.</p>
        <button type="button" className="primary" onClick={() => go("checkin")}>Vào phiên học</button>
        <small>Bản demo · kế hoạch gốc chưa thay đổi.</small>
      </> : rescheduleAccepted ? <>
        <h2>Đã dời buổi học trong bản demo</h2>
        <p><b>{scenarioLabel}</b> được chuyển sang ngày mai lúc 19:00. Chuỗi {Math.max(c.streak, 1)} ngày được giữ trong tình huống mô phỏng.</p>
        <small>Đây là bản demo; lịch thật và streak hiện tại chưa thay đổi.</small>
      </> : suggestionShown ? <>
        <h2>{missReason === "Lịch học quá sức" ? "Mình sẽ giúp bạn giảm tải" : "Hôm nay bạn mệt cũng không sao"}</h2>
        <p>Đã ghi nhận: {missReason}.</p>
        <p>AI gợi ý chuyển <b>{scenarioLabel}</b> sang ngày mai lúc 19:00 để lịch nhẹ hơn.</p>
        <p className={styles.streakNote}>Nếu chọn phương án này, chuỗi {Math.max(c.streak, 1)} ngày được giữ trong bản demo.</p>
        <div className={styles.overdueActions}><button type="button" className="primary" onClick={() => setRescheduleAccepted(true)}>Dời sang ngày mai · 19:00</button><button type="button" className="outline" onClick={() => setSuggestionShown(false)}>Chọn lý do khác</button></div>
        <small>Gợi ý mô phỏng, chưa cập nhật kế hoạch thật.</small>
      </> : <>
        <h2>{activeScenario === "missed" ? "Hôm qua bạn chưa kịp học" : "Bạn chưa bắt đầu buổi học này"}</h2>
        <p><b>{scenarioLabel}</b>{activeScenario === "missed" ? " đã lỡ lịch một hôm. Điều gì khiến bạn chưa học được?" : " đã quá giờ. Bạn muốn làm gì?"}</p>
        <div className={styles.overdueActions}>
          {activeScenario === "late" && <button type="button" className="secondary" onClick={() => go("checkin")}>Vào học ngay</button>}
          {activeScenario === "late" && <button type="button" className="outline" onClick={() => setShortSessionReady(true)}>Rút gọn còn 15 phút</button>}
          <button type="button" className="outline" onClick={() => chooseReason("Hôm nay mình mệt")}>Hôm nay mình mệt</button>
          <button type="button" className="outline" onClick={() => chooseReason("Lịch học quá sức")}>Lịch học quá sức</button>
          <button type="button" className="outline" onClick={() => chooseReason("Có việc phát sinh")}>Có việc phát sinh</button>
        </div>
        {missReason && <small>Lý do: {missReason}</small>}
        {demoScenario === "late" && <button type="button" className={styles.demoSwitch} onClick={() => startDemo("missed")}>Mô phỏng tình huống lỡ lịch hôm qua</button>}
        {!demoScenario && <small>Chọn một lý do để xem gợi ý điều chỉnh.</small>}
      </>}
    </section>}

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    {stepsDone < data.steps.length && <section className={`panel ${styles.steps}`} aria-label="Các bước bắt đầu">
      <div className={styles.stepsHead}>
        <div><h2>Bắt đầu với PeerBridge</h2><p>{stepsDone}/{data.steps.length} bước đã xong</p></div>
        <div className={styles.ring} style={{ ["--p" as string]: `${stepsDone * 25}` }} aria-hidden="true"><span>{stepsDone * 25}%</span></div>
      </div>
      <ol>{data.steps.map((s, i) => <li key={s.key} className={s.done ? styles.done : s === nextStep ? styles.current : ""}>
        <span className={styles.num}>{s.done ? <Icon name="check" /> : i + 1}</span>
        <div><b>{s.title}</b><small>{s.hint}</small></div>
        {!s.done && <button type="button" className={s === nextStep ? "primary" : "ghost"} onClick={() => go(s.page)}>{s === nextStep ? "Làm ngay" : "Mở"}</button>}
      </li>)}</ol>
    </section>}

    <div className={styles.tiles}>
      <div className={styles.tile}><small>Chuỗi ngày học cùng</small><b>{c.streak}<em> ngày</em></b><span>{c.streak ? "Giữ lửa bằng một check-in hôm nay" : "Cả hai cùng check-in để bắt đầu chuỗi"}</span></div>
      <div className={styles.tile}><small>Kế hoạch tuần này</small><b>{p.week_done}<em>/{p.week_total} việc</em></b>
        <div className={styles.bar}><i style={{ width: `${weekPct}%` }} /></div></div>
      <div className={styles.tile}><small>Check-in đã ghi nhận</small><b>{c.total_done}</b><span>{c.checked_in_today ? "Hôm nay: đã check-in" : "Hôm nay: chưa check-in"}</span></div>
      <div className={styles.tile}><small>Kết nối</small><b>{data.connections}</b>
        <span>{data.pending_invites ? <button type="button" className={styles.link} onClick={() => go("connections")}>{data.pending_invites} lời mời đang chờ</button> : "Không có lời mời mới"}</span></div>
    </div>

    {data.pair && (data.progress || data.coach) && <div className={styles.loop}>
      {data.progress && <section className="panel" aria-label="Nhịp học của hai bạn">
        <div className={styles.sectionHead}><h2>Nhịp học của hai bạn</h2>
          {data.progress.available && <span className={data.progress.needs_attention ? styles.badgeWarn : styles.badgeOk}>
            {data.progress.needs_attention ? "Cần chú ý" : "Đang đúng nhịp"}</span>}</div>
        {!data.progress.available ? <p className={styles.muted}>{data.progress.reason}</p> : <>
          <Pace label="Bạn" side={data.progress.me} />
          <Pace label={data.pair.partner_name} side={data.progress.partner} />
          <p className={styles.muted}>
            {data.progress.i_am_lagging ? "Bạn đang chậm hơn bạn cặp. Làm một việc nhỏ hôm nay để bắt kịp nhé."
              : data.progress.needs_attention ? "Một trong hai bạn đang chậm so với kế hoạch."
              : "Hai bạn đang theo kịp kế hoạch đã đặt."}
            {" "}Nhịp = phút đã xong ÷ phút đáng lẽ xong tới hôm nay.
          </p>
        </>}
      </section>}
      {data.coach && data.coach.text && <section className={`panel ${styles.coach}`} aria-label="Lời khuyên của coach">
        <div className={styles.sectionHead}><h2>Coach gợi ý</h2><small>{data.coach.source === "ai" ? "AI viết" : "Theo quy tắc"}</small></div>
        <p>{data.coach.text}</p>
        <button type="button" className="secondary" onClick={() => go(COACH_PAGE[data.coach!.action] || "plan")}>{COACH_CTA[data.coach.action] || "Mở kế hoạch"}</button>
      </section>}
    </div>}

    <div className={styles.grid}>
      <section className="panel">
        <div className={styles.sectionHead}><h2>Việc sắp tới</h2>{p.has_plan && <button type="button" className={styles.link} onClick={() => go("plan")}>Xem kế hoạch</button>}</div>
        {!data.pair ? <div className={styles.empty}><p>Bạn cần một bạn học trước khi lập kế hoạch.</p><button type="button" className="secondary" onClick={() => go("matching")}>Tìm bạn học</button></div>
          : !p.has_plan ? <div className={styles.empty}><p>Chưa có kế hoạch. Hai bạn chốt mục tiêu và giờ rảnh, hệ thống chia việc giúp.</p><button type="button" className="secondary" onClick={() => go("plan")}>Lập kế hoạch</button></div>
          : p.next.length === 0 ? <div className={styles.empty}><p>Bạn đã xong hết việc đã xếp. Tuyệt vời.</p></div>
          : <ul className={styles.list}>{p.next.map(i => <li key={i.id}>
              <span className={styles.when}>{i.due_now ? "Đến giờ" : when(i.scheduled_start)}</span>
              <div><b>{i.label}</b><small>{i.est_minutes} phút</small></div>
              {i.due_now && <button type="button" className="secondary" onClick={() => go("checkin")}>Check-in</button>}
            </li>)}</ul>}
        {data.sessions.length > 0 && <>
          <h3 className={styles.sub}>Phiên học đã hẹn</h3>
          <ul className={styles.list}>{data.sessions.map(s => <li key={s.id}><span className={styles.when}>{when(s.scheduled_start)}</span><div><b>{s.topic}</b></div>
            <button type="button" className="ghost" onClick={() => go("sessions")}>Mở</button></li>)}</ul>
        </>}
      </section>

      <section className="panel">
        <div className={styles.sectionHead}><h2>Hoạt động gần đây</h2></div>
        {data.pair && c.partner_latest && <button type="button" className={styles.partner} onClick={() => go("checkin")}>
          <span className="avatar small">{data.pair.partner_name.slice(0, 2).toUpperCase()}</span>
          <div><b>{c.partner_latest.headline}</b><small>{c.partner_latest.relative}</small></div>
        </button>}
        {data.activity.length === 0 ? <div className={styles.empty}><p>Chưa có hoạt động. Khi bạn học check-in, gửi lời mời hay thả cảm xúc, bạn sẽ thấy ở đây.</p></div>
          : <ul className={styles.activity}>{data.activity.map(a => <li key={a.id} className={a.unread ? styles.unread : ""}>
              <span className={styles.kind}><Icon name={KIND_ICON[a.kind] || "spark"} /></span>
              <button type="button" onClick={() => go(a.page)}><b>{a.title}</b>{a.body && <small>{a.body}</small>}<em>{a.relative}</em></button>
            </li>)}</ul>}
      </section>
    </div>
  </div>;
}
