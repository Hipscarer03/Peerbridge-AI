"use client";
<<<<<<< HEAD
import RequiredLabel from "@/components/ui/RequiredLabel";
import {formatDateTime} from "@/lib/time";
import {FormEvent, useCallback, useEffect, useState} from "react";
import {api} from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Toast from "@/components/ui/Toast";
import styles from "./PlanNotes.module.css";

type Note = {id: number; user_id: number; display_name: string; text: string; created_at: string};

export default function PlanNotes({token, pair, partner, context = "", itemId, compact = false}: {token: string; pair: number; partner: string; context?: string; itemId?: string; compact?: boolean}) {
  const contextLabel = context.length > 120 ? context.slice(0, 117) + "…" : context;
  const limit = 280 - (contextLabel && !compact ? contextLabel.length + 3 : 0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const load = useCallback(async () => {
    try {setNotes((await api.planNotes(token, pair, itemId)).items);}
    catch (failure) {setError(failure instanceof Error ? failure.message : "Chưa tải được góp ý.");}
  }, [token, pair, itemId]);
  useEffect(() => {void load(); const timer = window.setInterval(() => void load(), 15000); return () => window.clearInterval(timer);}, [load]);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (busy || !text.trim() || text.length > limit) return;
    setBusy(true); setError(""); setSent(false);
    try {
      await api.addPlanNote(token, pair, (contextLabel && !compact ? "[" + contextLabel + "]\n" : "") + text.trim(), itemId);
      setText(""); setSent(true); await load();
    } catch (failure) {setError(failure instanceof Error ? failure.message : "Chưa gửi được góp ý.");}
    finally {setBusy(false);}
  }
  return <section className={`${styles.notes} ${compact ? styles.compact : ""}`}>
    {contextLabel && !compact && <p className={styles.context}>Về: {contextLabel}</p>}
    <form onSubmit={send}>
      <label className={styles.label}><RequiredLabel>{compact ? `Góp ý nội dung học này cho ${partner}` : "Nội dung góp ý"}</RequiredLabel><textarea rows={compact ? 3 : 5} maxLength={limit} value={text} onChange={event => {setText(event.target.value); setSent(false);}} placeholder={compact ? "Nhập góp ý của bạn…" : "Bạn muốn góp ý gì cho " + partner + "?"} required disabled={busy}/></label>
      <div className={styles.sendRow}><small>{text.length}/{limit}</small><button type="submit" className="primary" disabled={busy || !text.trim() || text.length > limit}>{busy ? "Đang gửi…" : "Gửi góp ý"}</button></div>
    </form>
    <Toast message={error || (sent ? "Đã gửi góp ý." : "")} error={!!error} onClose={() => {setError(""); setSent(false);}}/>
    <div className={styles.history}><h3>Trao đổi gần đây</h3>{!notes.length && <p className={styles.empty}>Chưa có góp ý.</p>}{notes.map(note => <article className={styles.note} key={note.id}><Avatar seed={note.user_id} size={30}/><div><strong>{note.display_name}</strong><p>{note.text}</p><small>{formatDateTime(note.created_at)}</small></div></article>)}</div>
  </section>;
=======
import {formatDateTime} from "@/lib/time";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
type Note = {id: number; user_id: number; display_name: string; text: string; created_at: string};
export default function PlanNotes({ token, pair, partner }: {token:string;pair:number;partner:string}) {
  const [notes,setNotes]=useState<Note[]>([]), [text,setText]=useState("");
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{try{setNotes((await api.planNotes(token,pair)).items);setError("");}catch(e){setError(e instanceof Error?e.message:"Chưa tải được lời nhắn.");}},[token,pair]);
  useEffect(()=>{void load();const id=setInterval(()=>void load(),15000);return()=>clearInterval(id);},[load]);
  async function send(e:FormEvent){e.preventDefault();if(busy||!text.trim())return;setBusy(true);try{await api.addPlanNote(token,pair,text.trim());setText("");await load();}catch(e){setError(e instanceof Error?e.message:"Chưa gửi được lời nhắn.");}finally{setBusy(false);}}
  return <section className="plan-notes"><h3>💬 Nhắn gửi về kế hoạch</h3><p>Trao đổi việc đang vướng hoặc gửi một lời động viên cho {partner}.</p><button type="button" className="text-link" onClick={()=>setText("Mình thấy kế hoạch này vừa sức đó. Nếu có phần nào vướng, mình cùng thử một ví dụ nhỏ nhé!")}>🤖 Gợi ý lời động viên · Theo mẫu</button><form onSubmit={send}><textarea rows={3} maxLength={280} value={text} onChange={e=>setText(e.target.value)} placeholder="Bạn muốn nhắn gì cho người đồng hành?" aria-label="Lời nhắn về kế hoạch"/><div className="product-actions"><small>{text.length}/280</small><button className="primary" disabled={busy||!text.trim()}>{busy?"Đang gửi…":"Gửi lời nhắn"}</button></div></form>{error&&<p className="form-error">{error}</p>}{notes.map(n=><article className="plan-note" key={n.id}><Avatar seed={n.user_id} size={35}/><div><b>{n.display_name}</b><p>{n.text}</p><small>{formatDateTime(n.created_at)}</small></div></article>)}</section>;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}
