"use client";
<<<<<<< HEAD

import {ChangeEvent, ClipboardEvent, FormEvent, useCallback, useEffect, useRef, useState} from "react";
import Avatar from "@/components/ui/Avatar";
import Toast from "@/components/ui/Toast";
import {api, ApiError, API_URL} from "@/lib/api";
import type {Checkin, CheckinFeed} from "@/lib/checkin-types";
import type {PlanItem} from "@/lib/plan-types";
import {formatDateTime} from "@/lib/time";
import CheckinImage from "./CheckinImage";
import styles from "./StudyCheckin.module.css";

const MAX_EDGE = 1280;
const REACTIONS = ["👏", "💪", "❤️"];

function imageSrc(url: string | null) { return url ? url.startsWith("http") ? url : `${API_URL}${url}` : null; }
function errorText(error: unknown) { return error instanceof Error ? error.message : "Chưa kết nối được. Hãy thử lại."; }
function newId() { return crypto.randomUUID(); }

async function compress(file: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) { bitmap.close(); return file; }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob || file), "image/jpeg", 0.82));
  } catch { return file; }
}

function Entry({checkin, token, mine, busy, onReact}: {
  checkin: Checkin; token: string; mine: boolean; busy: boolean;
  onReact: (checkin: Checkin, body: {emoji?: string; comment?: string}) => void;
}) {
  const [comment, setComment] = useState("");
  const src = imageSrc(checkin.image_url);
  return <article className={styles.entry}>
    <div className={styles.entryHead}><Avatar seed={checkin.owner_id} size={32}/><strong>{mine ? "Bạn" : checkin.owner_name}</strong><time>{formatDateTime(checkin.created_at)}</time></div>
    {src ? <CheckinImage src={src} token={token} alt={`Ảnh check-in của ${checkin.owner_name}`} thumbnail/>
      : <div className={styles.textEntry}>{checkin.note || checkin.plan_item_label || "Đã học hôm nay"}</div>}
    {(checkin.plan_item_label || checkin.note) && <p className={styles.entryNote}>{checkin.plan_item_label && <strong>{checkin.plan_item_label}</strong>}{checkin.note && <span>{checkin.note}</span>}</p>}
    {checkin.reactions.length > 0 && <div className={styles.reactions}>{checkin.reactions.map((reaction, index) => <span key={index}>{reaction.emoji} {reaction.comment || reaction.display_name}</span>)}</div>}
    {!mine && <details className={styles.reply}><summary>Phản hồi</summary><div className={styles.replyChoices}>{REACTIONS.map(emoji => <button key={emoji} type="button" disabled={busy} aria-label={`Thả ${emoji}`} onClick={() => onReact(checkin, {emoji})}>{emoji}</button>)}</div><form onSubmit={event => {event.preventDefault(); if (comment.trim()) {onReact(checkin, {comment: comment.trim()}); setComment("");}}}><input value={comment} onChange={event => setComment(event.target.value)} maxLength={200} placeholder="Nhắn một câu…" aria-label="Nhắn cho bạn học"/><button type="submit" disabled={busy || !comment.trim()}>Gửi</button></form></details>}
  </article>;
}

export default function StudyCheckin({token, onConnections, onPlan}: {token: string; onConnections: () => void; onPlan: () => void}) {
  const [feed, setFeed] = useState<CheckinFeed | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [noPair, setNoPair] = useState(false);
=======
import CheckinImage from "@/features/checkin/components/CheckinImage";
import {formatDateTime} from "@/lib/time";

import Avatar from "@/components/ui/Avatar";
import type { PlanItem } from "@/lib/plan-types";

import { ChangeEvent, ClipboardEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { CHECKIN_EMOJIS, type Checkin, type CheckinFeed, type PersonProgress } from "@/lib/checkin-types";
import styles from "./StudyCheckin.module.css";

const SENT_NOTICE = "Đã lưu. Đang đối chiếu với kế hoạch…";
const UNSETTLED = new Set<Checkin["status"]>(["needs_confirm", "failed", "not_study"]);
const MAX_EDGE = 1280, QUALITY = 0.82, POLL_MS = 2000, POLL_MAX_MS = 30000;
const STATUS_LABEL: Record<Checkin["status"], string> = {
  processing: "Đang phân tích…",
  needs_confirm: "Cần bạn chọn mục",
  done: "Đã ghi nhận",
  not_study: "Chưa giống ảnh học",
  failed: "Chưa phân tích được",
};

function errorText(error: unknown) { return error instanceof Error ? error.message : "Không kết nối được. Hãy thử lại."; }
function imageSrc(url: string | null) { return url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null; }
function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16));
}

/** Thu ảnh về cạnh dài 1280px, JPEG: gửi nhanh hơn, rẻ hơn khi AI đọc. */
async function compress(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b || file), "image/jpeg", QUALITY));
}

function Progress({ person, me }: { person: PersonProgress; me: boolean }) {
  const pct = person.total_items ? Math.round((person.done_items / person.total_items) * 100) : 0;
  return <div className={styles.progressRow}>
    <b>{person.display_name}{me ? " (bạn)" : ""}{person.checked_in_today && <span className={styles.dot} title="Đã check-in hôm nay" />}</b>
    <div className={styles.bar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
    <small>{person.done_items}/{person.total_items} việc tuần này{person.pacing !== null ? ` · tiến độ ${Math.round(person.pacing * 100)}%` : ""}</small>
  </div>;
}

function Card({ token, checkin, mine, busy, onConfirm, onReact }: {
  token: string; checkin: Checkin; mine: boolean; busy: boolean;
  onConfirm: (c: Checkin, planItemId: string | null) => void;
  onReact: (c: Checkin, body: { emoji?: string; comment?: string }) => void;
}) {
  const [comment, setComment] = useState("");
  const src = imageSrc(checkin.image_url);
  return <article className={`${styles.card} ${styles[checkin.status] || ""}`} style={{ background: "white", borderRadius: "24px", padding: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "24px", border: "1px solid var(--border-soft)" }}>
    <div className="locket-owner" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
      <Avatar seed={checkin.owner_id} size={48}/>
      <div style={{ flex: 1 }}>
        <b style={{ fontSize: "1.05rem", color: "var(--text-strong)", display: "block" }}>{mine ? "Góc học tập của tôi" : checkin.owner_name}</b>
        <small style={{ color: "var(--text-soft)", display: "flex", alignItems: "center", gap: "4px" }}>
          {checkin.kind === "photo" ? "📸" : "✓"} {formatDateTime(checkin.created_at)}
        </small>
      </div>
    </div>
    <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "16px", background: "var(--surface)", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
      {src ? <CheckinImage src={src} token={token} alt={`Ảnh check-in của ${checkin.owner_name}`}/> : <div className={styles.textOnly} style={{ padding: "32px", textAlign: "center", fontSize: "1.1rem", color: "#fff" }}>{checkin.note || checkin.description || "Check-in bằng ghi chú"}</div>}
    </div>
    <div className={styles.cardBody}>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "4px", color: "var(--text-strong)" }}>{checkin.headline}</h3>
      {checkin.description && checkin.description !== checkin.headline && <p style={{ color: "var(--text)", marginBottom: "12px" }}>{checkin.description}</p>}
      {checkin.concept_names.length > 0 && <div className={styles.tags} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>{checkin.concept_names.map(n => <span key={n} style={{ background: "var(--surface-sunken)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.85rem", color: "var(--text-strong)", border: "1px solid var(--border)" }}>{n}</span>)}</div>}
      
      {mine && checkin.status === "processing" && <p className={styles.muted} aria-live="polite">AI đang xem ảnh, chờ vài giây…</p>}
      {mine && UNSETTLED.has(checkin.status) && <div className={styles.options} role="group" aria-label="Chọn mục bạn vừa học" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {checkin.options.length > 0 && <p className={styles.muted} style={{ fontSize: "0.9rem" }}>Chọn mục trong kế hoạch bạn vừa học:</p>}
        {checkin.options.map(o => <button key={o.plan_item_id} type="button" className="secondary" disabled={busy} onClick={() => onConfirm(checkin, o.plan_item_id)} style={{ textAlign: "left", justifyContent: "flex-start" }}>
          {o.label}{o.concept_name ? ` · ${o.concept_name}` : ""}
        </button>)}
        <button type="button" className={checkin.options.length ? "ghost" : "secondary"} disabled={busy} onClick={() => onConfirm(checkin, null)} style={{ textAlign: "left", justifyContent: "flex-start" }}>
          {checkin.options.length ? "Mình học thứ khác" : checkin.status === "not_study" ? "Ảnh này đúng là mình đang học" : "Ghi nhận buổi học này"}
        </button>
      </div>}
      
      {checkin.reactions.length > 0 && <ul className={styles.reactions} style={{ listStyle: "none", padding: 0, marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>{checkin.reactions.map((r, i) => <li key={i} style={{ background: "var(--surface-sunken)", padding: "8px 12px", borderRadius: "12px", fontSize: "0.95rem" }}><b style={{ color: "var(--text-strong)" }}>{r.display_name}</b> {r.emoji} {r.comment}</li>)}</ul>}
      
      {!mine && checkin.status === "done" && <div className={styles.react} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
        {CHECKIN_EMOJIS.map(e => <button key={e} type="button" aria-label={`Thả ${e}`} disabled={busy} onClick={() => onReact(checkin, { emoji: e })} style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: "100px", padding: "6px 12px", fontSize: "1.2rem", cursor: "pointer", transition: "all 0.2s" }}>{e}</button>)}
        <form style={{ flex: 1, minWidth: "200px", display: "flex", gap: "8px" }} onSubmit={(ev: FormEvent) => { ev.preventDefault(); if (comment.trim()) { onReact(checkin, { comment: comment.trim() }); setComment(""); } }}>
          <input value={comment} maxLength={200} onChange={e => setComment(e.target.value)} placeholder="Nhắn gì đó..." aria-label="Bình luận" style={{ flex: 1, padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--border)", outline: "none" }} />
          <button type="submit" className="primary" disabled={busy || !comment.trim()} style={{ borderRadius: "100px", padding: "8px 16px" }}>Gửi</button>
        </form>
      </div>}
    </div>
  </article>;
}

export default function StudyCheckin({ token, onConnections, onPlan }: { token: string; onConnections: () => void; onPlan: () => void }) {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [feed, setFeed] = useState<CheckinFeed | null>(null);
  const [noPair, setNoPair] = useState(false);
  const [loading, setLoading] = useState(true);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [file, setFile] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
<<<<<<< HEAD
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = useRef<string | null>(null);
  const alive = useRef(true);
=======
  const pending = useRef<string | null>(null);  // id giữ nguyên khi gửi lại, tránh tạo trùng
  const polling = useRef<Set<string>>(new Set());
  const alive = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  const load = useCallback(async () => {
    try {
      const data = await api.checkinFeed(token);
      if (!alive.current) return;
      setFeed(data); setNoPair(false); setError("");
      void api.plan(token, data.pair_id).then(view => {
        if (!alive.current) return;
<<<<<<< HEAD
        setItems(view.plan?.items.filter(item => item.status === "SCHEDULED" && (!item.scheduled_start || Date.parse(item.scheduled_start) <= Date.now())) || []);
      }).catch(() => {});
    } catch (failure) {
      if (!alive.current) return;
      if (failure instanceof ApiError && failure.status === 403) setNoPair(true);
      else setError(errorText(failure));
    } finally { if (alive.current) setLoading(false); }
  }, [token]);

  useEffect(() => {alive.current = true; void load(); return () => {alive.current = false;};}, [load]);
  useEffect(() => () => {if (preview) URL.revokeObjectURL(preview);}, [preview]);

  function pick(blob: Blob | null) {
    if (!blob) return;
    if (!blob.type.startsWith("image/")) {setError("Hãy chọn một ảnh."); return;}
    setFile(blob); setError(""); pending.current = null;
    setPreview(previous => {if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(blob);});
  }
  function paste(event: ClipboardEvent) {
    const image = [...event.clipboardData.items].find(item => item.type.startsWith("image/"));
    if (image) {event.preventDefault(); pick(image.getAsFile());}
  }
  function clearPhoto() {
    setFile(null); setNote(""); setSelectedItem(""); pending.current = null;
    setPreview(previous => {if (previous) URL.revokeObjectURL(previous); return "";});
    if (fileInput.current) fileInput.current.value = "";
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !file) return;
    setBusy(true); setError(""); setNotice("");
    pending.current ||= newId();
    try {
      await api.createPhotoCheckin(token, pending.current, await compress(file), note, selectedItem || undefined);
      clearPhoto(); setNotice("Đã lưu ảnh. Bạn học có thể xem trong nhật ký chung.");
      await load();
    } catch (failure) {setError(errorText(failure));}
    finally {setBusy(false);}
  }
  async function react(checkin: Checkin, body: {emoji?: string; comment?: string}) {
    setBusy(true); setError("");
    try {await api.reactCheckin(token, checkin.id, body); await load();}
    catch (failure) {setError(errorText(failure));}
    finally {setBusy(false);}
  }

  const legacyPending = feed ? [feed.my_latest, ...feed.my_pending].filter((item): item is Checkin => !!item && ["needs_confirm", "failed", "not_study"].includes(item.status)) : [];
  if (loading) return <div className="page animate-in"><p className={styles.muted}>Đang mở nhật ký…</p></div>;
  return <div className={`${styles.page} page animate-in`} onPaste={paste}>
    <Toast message={error || notice} error={!!error} onClose={() => {setError(""); setNotice("");}}/>
    {noPair ? <section className="panel"><h1>Check-in cùng bạn học</h1><p>Hãy kết nối với một bạn để bắt đầu nhật ký chung.</p><button type="button" className="primary" onClick={onConnections}>Tìm bạn học</button></section> : feed && <>
      <header className={styles.heading}><div><h1>Check-in cùng {feed.partner.display_name}</h1><p>Chụp một ảnh sau khi học. Hai bạn đều xem được trong nhật ký này.</p></div><span>{feed.history.length} lần gần đây</span></header>
      <section className={styles.composer} aria-label="Tạo check-in"><form onSubmit={event => void submit(event)}>
        <label className={styles.photoPicker}>{preview ? <img src={preview} alt="Ảnh sắp đăng"/> : <span>📷 <strong>Chụp hoặc chọn ảnh</strong><small>Có thể dán ảnh bằng Ctrl+V</small></span>}<input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={(event: ChangeEvent<HTMLInputElement>) => pick(event.target.files?.[0] || null)}/></label>
        <div className={styles.composerFields}><label>Ghi chú <span>(tùy chọn)</span><input value={note} onChange={event => setNote(event.target.value)} maxLength={300} placeholder="Hôm nay bạn học được gì?"/></label>
          {items.length > 0 && <label>Gắn với việc đã học <span>(tùy chọn)</span><select value={selectedItem} onChange={event => setSelectedItem(event.target.value)}><option value="">Chỉ đăng ảnh</option>{items.map(item => <option key={item.id} value={item.id}>{item.action}</option>)}</select></label>}
          <button type="submit" className="primary" disabled={!file || busy}>{busy ? "Đang lưu…" : "Đăng check-in"}</button>
        </div>
      </form></section>
      {feed.me.total_items === 0 && <p className={styles.planHint}>Muốn đánh dấu việc đã hoàn thành? <button type="button" onClick={onPlan}>Mở kế hoạch</button></p>}
      {legacyPending.length > 0 && <div className={styles.oldPending}><span>Bạn có ảnh cũ cần xác nhận.</span>{legacyPending.map(item => <button key={item.id} type="button" disabled={busy} onClick={() => {setBusy(true); void api.confirmCheckin(token, item.id, null).then(load).catch(failure => setError(errorText(failure))).finally(() => setBusy(false));}}>Ghi nhận ảnh cũ</button>)}</div>}
      <section className={styles.journal} aria-label="Lịch sử check-in của hai bạn"><div className={styles.journalHeading}><h2>Nhật ký của hai bạn</h2><span>Mới nhất trước</span></div>{feed.history.length ? <div className={styles.grid}>{feed.history.map(checkin => <Entry key={checkin.id} checkin={checkin} token={token} mine={checkin.owner_id === feed.me.user_id} busy={busy} onReact={react}/>)}</div> : <p className={styles.empty}>Chưa có ảnh nào. Bắt đầu bằng một tấm ảnh sau buổi học nhé.</p>}</section>
    </>}
=======
        const pendingItems = view.plan?.items.filter(i => i.status !== "COMPLETED" && (!i.scheduled_start || new Date(i.scheduled_start).getTime() <= Date.now())) || [];
        setItems(pendingItems);
        setSelectedItem(old => pendingItems.some(i => i.id === old) ? old : pendingItems[0]?.id || "");
      }).catch(() => {});
      for (const c of [data.my_latest, ...data.my_pending]) if (c?.status === "processing") void poll(c.id);
    } catch (e) {
      if (!alive.current) return;
      if (e instanceof ApiError && e.status === 403) setNoPair(true);
      else setError(errorText(e));
    } finally {
      if (alive.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const poll = useCallback(async (id: string) => {
    if (polling.current.has(id)) return;
    polling.current.add(id);
    const started = Date.now();
    try {
      while (alive.current && Date.now() - started < POLL_MAX_MS) {
        await new Promise(r => setTimeout(r, POLL_MS));
        const c = await api.checkin(token, id);
        if (c.status !== "processing") break;
      }
    } catch { /* lần tải feed sau sẽ hiện lỗi nếu có */ } finally {
      polling.current.delete(id);
      if (alive.current) { setNotice(n => (n === SENT_NOTICE ? "" : n)); await load(); }
    }
  }, [token, load]);

  useEffect(() => {
    alive.current = true;
    void load();
    return () => { alive.current = false; };
  }, [load]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(blob: Blob | null) {
    if (!blob || !blob.type.startsWith("image/")) { setError("Hãy chọn một file ảnh."); return; }
    setError(""); setFile(blob); pending.current = null;
    setPreview(old => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
  }
  function onPaste(e: ClipboardEvent) {
    const item = [...e.clipboardData.items].find(i => i.type.startsWith("image/"));
    if (item) { e.preventDefault(); pick(item.getAsFile()); }
  }
  function clearForm() {
    setFile(null); setNote(""); pending.current = null;
    setPreview(old => { if (old) URL.revokeObjectURL(old); return ""; });
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(textOnly: boolean) {
    if (busy) return;
    if (textOnly ? false : !file) {
      setError(textOnly ? "Ghi chú cần ít nhất 3 ký tự." : "Hãy chụp hoặc chọn một ảnh.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    pending.current = pending.current || newId();
    try {
      const c = textOnly
        ? await api.createTextCheckin(token, pending.current, (note.trim() || "Đã hoàn thành buổi học hôm nay"), selectedItem)
        : await api.createPhotoCheckin(token, pending.current, await compress(file as Blob), note);
      clearForm();
      setNotice(c.status === "done" ? "Đã ghi nhận. Bạn cặp đã thấy." : SENT_NOTICE);
      await load();
      if (c.status === "processing") void poll(c.id);
    } catch (e) {
      setError(errorText(e));  // giữ pending.current để bấm gửi lại không tạo check-in trùng
    } finally {
      setBusy(false);
    }
  }

  async function act(fn: () => Promise<unknown>, ok?: string) {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); if (ok) setNotice(ok); await load(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  const confirm = (c: Checkin, planItemId: string | null) => act(() => api.confirmCheckin(token, c.id, planItemId), "Đã ghi nhận check-in.");
  const react = (c: Checkin, body: { emoji?: string; comment?: string }) => act(() => api.reactCheckin(token, c.id, body));
  const nudge = () => feed && act(async () => setNotice((await api.nudgePartner(token, feed.pair_id)).message));

  if (loading) return <div className="page animate-in"><p className={styles.muted}>Đang tải check-in…</p></div>;

  return <div className="page animate-in" onPaste={onPaste}>
    <div className="page-title"><div><h1>Check-in</h1></div></div>

    {noPair && <section className="panel">
      <h2>Chưa có bạn học</h2>
      <button type="button" className="primary" onClick={onConnections}>Tìm bạn học</button>
    </section>}

    {error && <p className={styles.error} role="alert">{error}</p>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}

    {feed && <><div className={styles.layout}>
      <div className={styles.main}>
        <section className="panel">
          <h2>Gửi ảnh buổi học</h2>
          <form className={styles.form} onSubmit={(e: FormEvent) => { e.preventDefault(); void submit(false); }}>
            {items.length > 0 && <label className={styles.note}>Việc đã xong<select className="checkin-task-select" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>{items.map(i => <option key={i.id} value={i.id}>{i.action}</option>)}<option value="">Việc khác</option></select></label>}
            <label className={styles.drop}>
              {preview ? <img src={preview} alt="Ảnh sẽ gửi" /> : <span>Chụp hoặc chọn ảnh<br /><small>hoặc dán ảnh (Ctrl+V)</small></span>}
              <input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={(e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0] || null)} />
            </label>
            <label className={styles.note}>Ghi chú
              <textarea rows={2} maxLength={300} value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: vướng chỗ chọn kích thước chunk" />
            </label>
            <div className={styles.actions}>
              <button type="submit" className="primary" disabled={busy || !file}>{busy ? "Đang gửi…" : "Gửi"}</button>
              <button type="button" className="ghost" disabled={busy} onClick={() => void submit(true)}>Đánh dấu đã học, không cần ảnh</button>
            </div>
          </form>
        </section>


        {(feed.my_latest || feed.my_pending.length > 0) && <section className={styles.list} aria-label="Check-in của bạn">
          <h2>Của bạn</h2>
          {[feed.my_latest, ...feed.my_pending].filter((c): c is Checkin => Boolean(c)).map(c =>
            <Card token={token} key={c.id} checkin={c} mine busy={busy} onConfirm={confirm} onReact={react} />)}
        </section>}
        <section className="panel">
          <div className={styles.head}>
            <h2>{feed.me.display_name} &amp; {feed.partner.display_name}</h2>
            {feed.streak > 0 && <span className={styles.streak}>{feed.streak} ngày liên tiếp</span>}
          </div>
          <Progress person={feed.me} me />
          <Progress person={feed.partner} me={false} />
          {feed.me.total_items === 0 && <p className={styles.muted}>Chưa có kế hoạch tuần này. <button type="button" className={styles.inlineLink} onClick={onPlan}>Lập kế hoạch</button></p>}
          <div className={styles.actions}>
            <button type="button" className="outline" disabled={busy || !feed.can_nudge} title={feed.nudge_hint || ""} onClick={nudge}>Nhắc {feed.partner.display_name}</button>
            {!feed.can_nudge && feed.nudge_hint && <small className={styles.muted}>{feed.nudge_hint}</small>}
          </div>
        </section>
      </div>

      <aside className={styles.side}>
        <section className={styles.list} aria-label="Check-in mới nhất của bạn cặp">
          <div className="partner-identity"><Avatar seed={feed.partner.user_id}/><h2>{feed.partner.display_name}</h2></div>
          {feed.partner_latest
            ? <Card token={token} checkin={feed.partner_latest} mine={false} busy={busy} onConfirm={confirm} onReact={react} />
            : <p className={styles.muted}>{feed.partner.display_name} chưa có check-in nào.</p>}
        </section>
        {feed.history.length > 0 && <section className="panel">
          <h2>Nhật ký</h2>
          <ol className={styles.history}>{feed.history.map(c => {
            const src = imageSrc(c.image_url);
            return <li key={c.id} title={c.headline}>
              {src ? <CheckinImage src={src} token={token} alt={c.headline} thumbnail/> : <span>{c.note || c.description}</span>}
              <small>{c.owner_name} · {formatDateTime(c.created_at)}</small>
            </li>;
          })}</ol>
        </section>}
      </aside>
    </div></>}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  </div>;
}
