"use client";

import { useEffect, useId, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import type { MatchSearchCandidate } from "@/lib/types";

export function candidatePage<T>(candidates: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(candidates.length / 3));
  const currentPage = Math.max(0, Math.min(page, pageCount - 1));
  return {pageCount, currentPage, visibleCandidates: candidates.slice(currentPage * 3, currentPage * 3 + 3)};
}

export function MatchHelp({ label, children, icon = false }: {label: string; children: React.ReactNode; icon?: boolean}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!ref.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className={`match-help ${icon ? "match-help-icon" : ""}`} ref={ref}>
    <button type="button" ref={button} className="match-help-trigger" aria-label={label} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>{icon ? "?" : <><span aria-hidden="true">ⓘ</span> {label}</>}</button>
    {open && <div className="match-help-popup" id={id} role="dialog" aria-label={label}><div className="match-help-heading"><strong>{label}</strong><button type="button" aria-label="Đóng giải thích" onClick={() => { setOpen(false); button.current?.focus(); }}>×</button></div>{children}</div>}
  </div>;
}

export function goalDuration(candidate: MatchSearchCandidate) {
  if (candidate.goal_duration_days && candidate.goal_duration_days > 0) {
    const days = candidate.goal_duration_days;
    if (days % 365 === 0) return `${days / 365} năm`;
    if (days % 30 === 0) return `${days / 30} tháng`;
    if (days % 7 === 0) return `${days / 7} tuần`;
    return `${days} ngày`;
  }
  return candidate.deadline_level === "gap" ? "Trong 14 ngày" : candidate.deadline_level === "vua" ? "15–45 ngày" : candidate.deadline_level === "dai" ? "Trên 45 ngày" : "Chưa đặt thời hạn";
}

export function matchExplanation(candidate: MatchSearchCandidate) {
  if (candidate.match_tier === "tier_1_golden") return {label: "🌟 Bù trừ", text: "Bạn biết phần người kia cần và ngược lại."};
  if (candidate.match_tier === "tier_3_discipline") return {label: "⚡ Kỷ luật", text: "Hợp nhịp học và thời hạn để nhắc lịch, theo dõi tiến độ."};
  if (candidate.match_tier === "tier_4_queue") return {label: "Thử tìm hiểu", text: "Ít điểm chung hơn; xem hồ sơ trước khi quyết định kết nối."};
  return {label: "🤝 Cùng tiến", text: "Cùng học một chủ đề, luyện tập và trao đổi."};
}

export function friendlyScores(candidate: MatchSearchCandidate) {
  const weights = candidate.match_tier === "tier_1_golden" ? [35, 45, 20] : candidate.match_tier === "tier_3_discipline" ? [0, 60, 40] : [25, 50, 25];
  return [
    {key: "concept_score", label: "Hỗ trợ việc học", description: "Giúp nhau hoặc học chung chủ đề."},
    {key: "style_score", label: "Cách học hợp nhau", description: "Hợp nhịp học và cách trao đổi."},
    {key: "goal_score", label: "Mục tiêu và thời gian", description: "Gần nhau về mục tiêu và thời hạn."},
  ].map((row, index) => {
    const value = candidate.component_scores?.[row.key];
    return {...row, weight: weights[index], score: typeof value === "number" && Number.isFinite(value) ? Math.round(Math.max(0, Math.min(1, value)) * 100) : null};
  });
}

function GoalText({candidate}: {candidate: MatchSearchCandidate}) {
  const original = candidate.learning_goals?.[0];
  const parsed = original?.match(/^muốn học\.?\s+(.+?)\s+trong\s+([1-9]\d*\s+(?:ngày|tuần|tháng|năm))\.?$/i);
  const topic = candidate.goal_topic || parsed?.[1];
  const duration = candidate.goal_duration_days ? goalDuration(candidate) : parsed?.[2];
  return <h3>{topic ? <>Muốn học <mark className="goal-highlight-topic">{topic}</mark>{duration && <> trong <mark className="goal-highlight-duration">{duration}</mark></>}</> : <mark className="goal-highlight-topic">{original || "Chưa cập nhật mục tiêu"}</mark>}</h3>;
}

function CandidateDetails({candidate, onClose}: {candidate: MatchSearchCandidate; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="candidate-details-dialog" onCancel={onClose} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="candidate-details-body"><header><div className="candidate-details-identity"><Avatar seed={candidate.candidate_id} size={44}/><h2>{candidate.display_name}</h2></div><button type="button" className="outline" autoFocus onClick={onClose}>Đóng</button></header>
    <p className="candidate-details-meta">{[candidate.study_year, candidate.major, candidate.school].filter(Boolean).join(" · ")}</p>
    <section className="compact-goal"><span>MỤC TIÊU HỌC</span><GoalText candidate={candidate}/></section>
    <h3>Giới thiệu</h3><p>{candidate.bio || "Chưa có giới thiệu."}</p>
    <div className="compact-topics"><div><h3>Cần hỗ trợ</h3><p>{candidate.needs?.join(", ") || "Chưa cập nhật"}</p></div><span className="compact-swap" aria-label="Hỗ trợ hai chiều">⇄</span><div><h3>Có thể hỗ trợ</h3><p>{candidate.strengths?.join(", ") || "Chưa cập nhật"}</p></div></div>
    {candidate.learning_style && Object.keys(candidate.learning_style).length > 0 && <><h3>Cách bạn ấy thích học</h3><ul className="candidate-style-list">{Object.entries(candidate.learning_style).map(([key, value]) => <li key={key}><strong>{key.replaceAll("_", " ")}</strong>: {value}</li>)}</ul></>}
    </div>
  </dialog>;
}

export default function MatchCandidateCard({candidate, sameSchool, action, status, id, className}: {
  candidate: MatchSearchCandidate; sameSchool?: boolean; action: React.ReactNode; status?: React.ReactNode; id?: string; className?: string;
}) {
  const explanation = matchExplanation(candidate);
  const [detailsOpen, setDetailsOpen] = useState(false);
  return <article id={id} className={`candidate-card candidate-card-compact ${className || ""}`}>
    <div className="compact-identity"><Avatar seed={candidate.candidate_id} size={56}/><div><h2>{candidate.display_name}</h2><p className="major">{[candidate.major, candidate.school].filter(Boolean).join(" · ") || "Chưa cập nhật trường/ngành"}</p></div></div>
    <div className="compact-match-summary"><span className="compact-match-type">{explanation.label}</span><div className="compact-score-tools"><strong>{candidate.rank === 1 && !candidate.is_uncertain && <em>Phù hợp nhất · </em>}{Math.round(candidate.total_score)}/100 điểm</strong><MatchHelp label="Cách tính điểm" icon><p>Điểm cao hơn nghĩa là hợp hơn trong cùng kiểu ghép.</p><p>% là phần đóng góp vào điểm tổng.</p><dl className="friendly-match-scores">{friendlyScores(candidate).map(row => <div key={row.key}><dt>{row.label} · {row.weight}%</dt><dd>{row.score === null ? "Chưa đủ dữ liệu" : `${row.score}/100`}</dd><p>{row.description}</p></div>)}</dl></MatchHelp></div></div>
    <section className="compact-goal" aria-label="Mục tiêu học tập"><span>MỤC TIÊU HỌC</span><GoalText candidate={candidate}/></section>
    <div className="compact-badges">{candidate.is_seed && <span>Hồ sơ mẫu</span>}{sameSchool && <span>Cùng trường</span>}{candidate.is_uncertain && <span>Thử tìm hiểu thêm</span>}</div>
    <div className="compact-topics"><div><small>Cần hỗ trợ</small><p>{candidate.needs?.join(", ") || "Chưa cập nhật"}</p></div><span className="compact-swap" aria-label="Hỗ trợ hai chiều">⇄</span><div><small>Có thể hỗ trợ</small><p>{candidate.strengths?.join(", ") || "Chưa cập nhật"}</p></div></div>
    <div className="compact-card-bottom"><div className="compact-card-tools"><button type="button" className="match-help-trigger" onClick={() => setDetailsOpen(true)}>Xem chi tiết ↗</button></div>
    {status}
    <div className="candidate-invite">{action}</div></div>
    {detailsOpen && <CandidateDetails candidate={candidate} onClose={() => setDetailsOpen(false)}/>}
  </article>;
}
