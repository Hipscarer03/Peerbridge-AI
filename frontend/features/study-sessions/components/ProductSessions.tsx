"use client";
import {formatDateTime, localInputToISO} from "@/lib/time";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api, canJoinStudySession } from "@/lib/api";
import type { ConnectedPeerSummary, StudySession, StudySessionResponse } from "@/lib/types";
import type { PlanSetup } from "@/lib/plan-types";
import SessionCalendar from "@/features/study-sessions/components/SessionCalendar";
import FocusTimer from "@/components/common/FocusTimer";
import StudyRoom from "@/features/study-sessions/components/StudyRoom";
import SessionSummary from "@/features/study-sessions/components/SessionSummary";
import DateTimeField from "@/components/ui/DateTimeField";
import Avatar from "@/components/ui/Avatar";

type Props = { token: string; userId: number; sessionId: number | null; onSessionChange: (id: number | null) => void; onConnections: () => void; onCheckin: () => void };
export default function ProductSessions({token,userId,sessionId,onSessionChange,onConnections,onCheckin}: Props) {
  const [peers,setPeers] = useState<ConnectedPeerSummary[]>([]);
  const [sessions,setSessions] = useState<StudySession[]>([]);
  const [pair,setPair] = useState(0);
  const [setup,setSetup] = useState<PlanSetup | null>(null);
  const [duration,setDuration] = useState(50);
  const [topic,setTopic] = useState("");
  const [type,setType] = useState("parallel");
  const [quiet,setQuiet] = useState(false);
  const [start,setStart] = useState("");
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [room,setRoom] = useState<StudySessionResponse | null>(null);
  const [roomQuiet,setRoomQuiet] = useState(false);
  const alive = useRef(true), locked = useRef(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const [connections,list] = await Promise.all([api.listConnections(token),api.listSessions(token)]); if (!alive.current) return; setPeers(connections.connected); setSessions(list.items.filter(s=>canJoinStudySession(s,userId))); setPair(p=>connections.connected.some(c=>c.peer_match_id===p) ? p : connections.connected[0]?.peer_match_id || 0); setError(""); }
    catch(e) { if (alive.current) setError(e instanceof Error ? e.message : "Chưa tải được lịch học."); }
    finally { if(alive.current) setLoading(false); }
  },[token,userId]);
  useEffect(()=>{alive.current=true;void refresh();return()=>{alive.current=false;};},[refresh]);
  useEffect(()=>{let active=true;setSetup(null);if(pair) void api.planSetup(token,pair).then(s=>{if(active)setSetup(s);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[token,pair]);
  useEffect(()=>{let active=true;setRoom(null);if(sessionId) void api.session(token,sessionId).then(s=>{if(active && canJoinStudySession(s,userId)){setRoom(s);setRoomQuiet(localStorage.getItem(`peerbridge_quiet_${s.id}`)==="true");}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[token,sessionId,userId]);
  const peer = peers.find(p=>p.peer_match_id===pair);
  const roomPeer = peers.find(p=>p.peer_match_id===room?.peer_match_id)?.peer;
  function suggestGoal() { const mine = setup?.members.find(m=>m.user_id===userId); const partner = setup?.members.find(m=>m.user_id!==userId); setTopic(type === "exchange" ? `Cùng giải thích một phần ${mine?.goals[0] || "mục tiêu của tôi"} và đổi vai với ${partner?.display_name || "bạn"}`.slice(0,120) : `Dành ${duration} phút cho ${mine?.goals[0] || "một việc nhỏ trong kế hoạch hôm nay"}`.slice(0,120)); }
  async function create(e:FormEvent) {
    e.preventDefault();if(locked.current || !peer)return;
    if(!topic.trim() || !start){setError("Chọn mục tiêu phiên và giờ bắt đầu nhé.");return;}
    const date=new Date(localInputToISO(start));if(Number.isNaN(date.getTime())){setError("Giờ bắt đầu chưa hợp lệ.");return;}
    if(date.getTime() <= Date.now()){setError("Chọn giờ bắt đầu trong tương lai nhé.");return;}
    locked.current=true;setBusy(true);setError("");setNotice("");
    try { const result=await api.createSessionFromConnection(token,peer,{learner_id:userId,topic:topic.trim(),scheduled_start:date.toISOString(),scheduled_end:new Date(date.getTime()+duration*60000).toISOString()}); if(!alive.current)return;localStorage.setItem(`peerbridge_quiet_${result.id}`,String(quiet));setNotice(`Đã hẹn ${peer.peer.display_name} vào ${formatDateTime(date.toISOString())}. Phiên hiện trong lịch của cả hai.`);await refresh(); }
    catch(e){if(alive.current)setError(e instanceof Error?e.message:"Chưa đặt được phiên.");}
    finally{locked.current=false;if(alive.current)setBusy(false);}
  }
  if(sessionId !== null) return <div className="page animate-in"><div className="page-title"><div><h1>{room?.topic || "Đang mở phòng học…"}</h1></div><button className="outline" onClick={()=>onSessionChange(null)}>← Phiên học</button></div>{error && <p className="form-error">{error}</p>}{room && <><FocusTimer key={room.id} minutes={room.scheduled_end && room.scheduled_start ? Math.round((new Date(room.scheduled_end).getTime()-new Date(room.scheduled_start).getTime())/60000) : 50} goal={room.topic} onFinish={onCheckin}/>{roomQuiet ? <section className="panel" style={{marginTop:20}}><h2>Học yên lặng</h2><p>Chat đang tắt.</p><button className="secondary" onClick={()=>{setRoomQuiet(false);localStorage.setItem(`peerbridge_quiet_${room.id}`,"false");}}>Mở trao đổi</button></section> : <StudyRoom token={token} sessionId={sessionId} peerName={roomPeer?.display_name} topic={room.topic}/>}<SessionSummary token={token} sessionId={sessionId}/></>}</div>;
  return <div className="page animate-in"><header className="page-title"><div><h1>Phiên học</h1></div></header>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}{loading && <p>Đang mở lịch của hai bạn…</p>}{sessions.length > 0 && <section className="session-list-product"><h2>Lịch đã hẹn</h2>{sessions.length ? <div>{sessions.map(s=>{const p=peers.find(p=>p.peer_match_id===s.peer_match_id);return <article key={s.id}><div className="partner-identity"><Avatar seed={p?.peer.user_id || s.helper_id}/><b>{p?.peer.display_name || "Bạn đồng hành"}</b></div><h3>{s.topic}</h3><p>{s.scheduled_start?formatDateTime(s.scheduled_start) : "Chưa đặt giờ"}</p><button className="primary" onClick={()=>onSessionChange(s.id)}>Vào phòng</button></article>;})}</div> : <p>Chưa có lịch hẹn.</p>}</section>}{!loading && !peers.length ? <section className="panel"><h2>Chưa có bạn học</h2><button className="primary" onClick={onConnections}>Tìm bạn học</button></section> : <div className="booking-layout"><section className="panel booking-settings"><h2>Đặt phiên mới</h2><form onSubmit={create}><fieldset disabled={busy || loading}>{peers.length > 1 && <label>Bạn học<select value={pair} onChange={e=>setPair(Number(e.target.value))}>{peers.map(p=><option key={p.peer_match_id} value={p.peer_match_id}>{p.peer.display_name}</option>)}</select></label>}<label>Thời lượng</label><div className="duration-toggle">{[25,50,75].map(m=><button type="button" key={m} className={duration===m?"active":""} aria-pressed={duration===m} onClick={()=>setDuration(m)}>{m} phút</button>)}</div><label>Cách học<select value={type} onChange={e=>setType(e.target.value)}><option value="parallel">Học song song</option><option value="exchange">Đổi kèm</option></select></label><label className="quiet-toggle">Học yên lặng<input type="checkbox" checked={quiet} onChange={e=>setQuiet(e.target.checked)}/></label><label>Mục tiêu phiên<input required maxLength={120} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Hôm nay mình muốn làm được…"/></label><button type="button" className="secondary" onClick={suggestGoal}>Gợi ý mục tiêu</button><DateTimeField label="Ngày và giờ" value={start} onChange={setStart}/><button className="primary" disabled={!pair || !topic.trim() || !start}>{busy?"Đang lưu…":"Đặt lịch"}</button></fieldset></form></section><SessionCalendar token={token} pairId={pair} userId={userId} duration={duration} sessions={sessions} onPick={(s)=>setStart(s)}/></div>}
</div>;
}
