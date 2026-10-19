"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminSessionDetail, AdminSessionRow } from "@/lib/admin-types";
import { formatDateTime } from "@/lib/time";
import styles from "./Admin.module.css";

const ACTION_LABEL: Record<string, string> = {
  ALLOW: "Cho qua", GUIDE: "Gợi mở", WARN: "Cảnh báo", BLOCK: "Chặn", ESCALATE: "Chờ Admin",
};

function percent(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;
}

function VerdictBadges({ row }: { row: Pick<AdminSessionRow, "verdict" | "pending_review"> }) {
  const v = row.verdict;
  return <div className={styles.badgeRow}>
    {!v.has_chat ? <span className={`${styles.badge} ${styles.badgeMuted}`}>Chưa trao đổi</span>
      : v.answer_leaked ? <span className={`${styles.badge} ${styles.badgeBad}`}>Lộ đáp án</span>
        : <span className={styles.badge}>Không lộ đáp án</span>}
    {v.has_chat && <span className={`${styles.badge} ${styles.badgeMuted}`}>Socratic {percent(v.socratic_score)} · {v.mode === "ai" ? "AI chấm" : "chấm bằng luật"}</span>}
    {row.pending_review > 0 && <span className={`${styles.badge} ${styles.badgeWarn}`}>{row.pending_review} chờ xử lý</span>}
  </div>;
}

export default function AdminSessions({ token, onModeration }: { token: string; onModeration: () => void }) {
  const [rows, setRows] = useState<AdminSessionRow[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminSessionDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const data = await api.adminSessions(token);
      setRows(data.items);
      setSelected(current => current ?? data.items[0]?.id ?? null);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Chưa tải được danh sách phiên."); }
  }, [token]);
  const loadDetail = useCallback(async (id: number) => {
    try { setDetail(await api.adminSession(token, id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Chưa tải được phiên."); }
  }, [token]);
  useEffect(() => { void loadList(); }, [loadList]);
  useEffect(() => { setDetail(null); if (selected !== null) void loadDetail(selected); }, [selected, loadDetail]);

  async function judge() {
    if (selected === null || busy) return;
    setBusy(true); setError("");
    try { await api.adminReviewSession(token, selected); await Promise.all([loadDetail(selected), loadList()]); }
    catch (e) { setError(e instanceof Error ? e.message : "Chưa chấm được phiên."); }
    finally { setBusy(false); }
  }

  const row = rows.find(r => r.id === selected);
  return <div className="page animate-in">
    <header className="page-title">
      <div><h1>Phiên học</h1>
        <p>Để giữ riêng tư, Admin chỉ xem được tin bị AI cảnh báo. Các tin khác chỉ hiện số lượng.</p></div>
      <button className="outline" onClick={() => void loadList()}>Cập nhật</button>
    </header>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!rows.length ? <section className="panel"><p>Chưa có phiên học nào.</p></section> :
      <div className={styles.sessionsLayout}>
        <section className="panel" aria-label="Danh sách phiên">
          {rows.map(item => <button key={item.id} className={`${styles.sessionItem} ${item.id === selected ? styles.active : ""}`}
            onClick={() => setSelected(item.id)}>
            <b>#{item.id} · {item.topic}</b>
            <small>{item.learner.name || `#${item.learner.id}`} (người học) · {item.helper.name || `#${item.helper.id}`} (hỗ trợ)</small>
            <small>{item.message_count} tin · {item.held_count} bị giữ · {item.last_activity ? formatDateTime(item.last_activity) : "—"}</small>
            <VerdictBadges row={item} />
          </button>)}
        </section>
        <section className="panel" aria-label="Chi tiết phiên">
          {!detail || !row ? <p>Đang mở phiên…</p> : <>
            <div className={styles.actions} style={{ justifyContent: "space-between" }}>
              <div><h2>#{detail.session.id} · {detail.session.topic}</h2>
                <p className={styles.note}>{detail.session.learner_name} (người học) với {detail.session.helper_name} (hỗ trợ)</p></div>
              <div className={styles.actions}>
                {row.pending_review > 0 && <button className="secondary" onClick={onModeration}>Xử lý tin chờ duyệt</button>}
                <button className="primary" disabled={busy || !detail.verdict.has_chat} onClick={() => void judge()}>
                  {busy ? "Đang chấm…" : "🤖 Chấm phiên bằng AI"}</button>
              </div>
            </div>
            <div style={{ marginTop: 12 }}><VerdictBadges row={{ verdict: detail.verdict, pending_review: row.pending_review }} /></div>
            {detail.review?.ai_error && <p className={styles.note} style={{ marginTop: 14 }}>AI chưa chấm được ({detail.review.ai_error}), đang dùng chấm bằng luật.</p>}
            <h3 style={{ marginTop: 18, fontSize: 15 }}>Tin bị AI cảnh báo</h3>
            <p className={styles.note}>{detail.session.hidden_count ?? 0} tin khác được ẩn để giữ riêng tư.</p>
            <div className={styles.transcript}>
              {detail.session.messages.length === 0 && <p className={styles.note}>Không có tin nào bị cảnh báo.</p>}
              {detail.session.messages.map(m => {
                const leaked = detail.review?.leak_message_ids?.includes(m.id);
                return <article key={m.id} className={`${styles.line} ${!m.delivered ? styles.held : ""}`}>
                  <div className={styles.meta}>
                    <b>{m.sender_name || `#${m.sender_id}`}</b>
                    <span>{m.sender_role === "learner" ? "người học" : "người hỗ trợ"} · {formatDateTime(m.created_at)}</span>
                    {m.final_action && <span className={`${styles.badge} ${m.delivered ? "" : styles.badgeBad}`}>{ACTION_LABEL[m.final_action] || m.final_action}</span>}
                    {m.review_action && <span className={`${styles.badge} ${styles.badgeWarn}`}>Admin đã xử lý</span>}
                    {m.prefiltered && <span className={`${styles.badge} ${styles.badgeMuted}`}>không gọi AI</span>}
                    {leaked && <span className={`${styles.badge} ${styles.badgeBad}`}>AI chấm: lộ đáp án</span>}
                  </div>
                  <p>{m.content}</p>
                  {m.guidance && m.final_action === "GUIDE" && <p className={styles.guide}>🤖 Gợi mở: {m.guidance}</p>}
                  {!m.delivered && m.reason && <p className={styles.note}>Lý do: {m.reason}</p>}
                  {m.review_notes && <p className={styles.note}>Ghi chú Admin: {m.review_notes}</p>}
                </article>;
              })}
            </div>
          </>}
        </section>
      </div>}
  </div>;
}
