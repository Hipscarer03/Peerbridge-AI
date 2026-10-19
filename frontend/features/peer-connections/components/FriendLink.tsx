"use client";

import {useEffect, useState, type FormEvent} from "react";
import {api} from "@/lib/api";
import type {EmailConnectionPreview, FriendLinkPreview} from "@/lib/types";
import Toast from "@/components/ui/Toast";
import styles from "./FriendLink.module.css";

export default function FriendLink({token, onConnections, compact = false, matchingCandidateIds = [], onMatchingCandidateFound, onEmailResult}: {token:string; onConnections:()=>void; compact?:boolean; matchingCandidateIds?:number[]; onMatchingCandidateFound?:(userId:number)=>void; onEmailResult?:(result:EmailConnectionPreview|null)=>void}) {
  const [code, setCode] = useState("");
  const [linkPreview, setLinkPreview] = useState<FriendLinkPreview | null>(null);
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<EmailConnectionPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {setCode(new URLSearchParams(window.location.search).get("invite") || "");}, []);
  useEffect(() => {
    if (!code) return;
    let active = true;
    api.previewFriendLink(token, code).then(result => {if (active) setLinkPreview(result);})
      .catch(failure => {if (active) setError(failure instanceof Error ? failure.message : "Link mời không hợp lệ.");});
    return () => {active = false;};
  }, [token, code]);

  useEffect(() => {
    if (!found || !matchingCandidateIds.includes(found.user_id)) return;
    setFound(null);
    onMatchingCandidateFound?.(found.user_id);
  }, [found, matchingCandidateIds, onMatchingCandidateFound]);

  async function search(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setFound(null);
    onEmailResult?.(null);
    try {
      const result = await api.findConnectionByEmail(token, email.trim().toLowerCase());
      if (matchingCandidateIds.includes(result.user_id)) {
        setFound(null);
        onMatchingCandidateFound?.(result.user_id);
      } else {
        setFound(result);
        onEmailResult?.(result);
      }
    }
    catch (failure) {setError(failure instanceof Error ? failure.message : "Không tìm thấy tài khoản này.");}
    finally {setBusy(false);}
  }

  async function connect() {
    if (!found || found.is_self || found.connected || found.pending) return;
    setBusy(true); setError("");
    try {await api.requestConnection(token, {recipient_id: found.user_id}); setFound({...found, pending: true});}
    catch (failure) {setError(failure instanceof Error ? failure.message : "Chưa gửi được lời mời.");}
    finally {setBusy(false);}
  }

  async function claim() {
    if (!code) return;
    setBusy(true); setError("");
    try {await api.requestFriendLink(token, code); openConnections();}
    catch (failure) {setError(failure instanceof Error ? failure.message : "Chưa gửi được lời mời.");}
    finally {setBusy(false);}
  }

  function openConnections() {
    const url = new URL(window.location.href);
    url.searchParams.delete("invite");
    window.history.replaceState(null, "", url.pathname + url.search + "#connections");
    onConnections();
  }

  return <section className={`${styles.box} ${compact ? styles.compact : ""}`} aria-label="Kết nối bạn học bằng email">
    {code ? <>
      <strong>{linkPreview ? `${linkPreview.display_name} mời bạn học cùng` : "Lời mời học cùng"}</strong>
      <span>{linkPreview?.is_self ? "Đây là link của bạn." : linkPreview?.connected ? "Hai bạn đã kết nối." : linkPreview?.pending ? "Lời mời đang chờ." : ""}</span>
      {linkPreview && !linkPreview.is_self && !linkPreview.connected && !linkPreview.pending && <button type="button" className="primary" disabled={busy} onClick={() => void claim()}>Gửi lời mời</button>}
      {linkPreview?.pending && <button type="button" className="outline" onClick={openConnections}>Xem lời mời</button>}
    </> : <>
      <form className={styles.search} onSubmit={event => void search(event)}>
        <label className={styles.visuallyHidden} htmlFor="friend-email">Tìm bạn học bằng email</label>
        <input id="friend-email" type="email" autoComplete="email" required maxLength={254} placeholder="Tìm bằng email…" value={email} onChange={event => {setEmail(event.target.value); setFound(null); onEmailResult?.(null);}}/>
        <button type="submit" className="outline" disabled={busy}>{busy ? "Đang tìm…" : "Tìm"}</button>
      </form>
      {found && !compact && <div className={styles.result} aria-live="polite"><strong>{found.display_name}</strong><span>{found.is_self ? "Tài khoản của bạn" : found.connected ? "Đã kết nối" : found.pending ? "Đang chờ lời mời" : ""}</span>{!found.is_self && !found.connected && !found.pending && <button type="button" className="primary" disabled={busy} onClick={() => void connect()}>Kết nối</button>}</div>}
    </>}
    <Toast message={error} error onClose={() => setError("")}/>
  </section>;
}
