"use client";

<<<<<<< HEAD
import MatchCandidateCard, { MatchHelp, candidatePage } from "./MatchCandidateCard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  ConnectedPeerSummary,
  ConnectionRequestSummary,
  ConnectionResponse,
  ConnectionStatus,
  EmailConnectionPreview,
  MatchSearchCandidate,
  MatchSearchResponse,
} from "@/lib/types";
import { connectionStatusLabels, errorMessage, LoadingState, StatusBadge } from "./shared";
import { useConnections } from "../hooks/useConnections";
import Toast from "@/components/ui/Toast";
import FriendLink from "./FriendLink";
import Avatar from "@/components/ui/Avatar";

export function Matching({
  token,
  notify,
  onConnections,
}: {
=======
import Avatar from "@/components/ui/Avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { ConnectionResponse, ConnectionStatus, MatchSearchCandidate, MatchSearchResponse } from "@/lib/types";
import { connectionStatusLabels, errorMessage, LoadingState } from "@/features/peer-connections/components/shared";
import { useConnections } from "@/features/peer-connections/hooks/useConnections";

const PAGE_SIZE = 3;
const DAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const componentLabels: Record<string, string> = {
  skill_complementarity: "Kiến thức bổ trợ",
  topic_compatibility: "Chủ đề học tập",
  availability_overlap: "Thời gian phù hợp",
  preference_compatibility: "Mục tiêu học tập",
};

export function Matching({ token, notify, onConnections }: {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  token: string;
  notify: (message: string) => void;
  onConnections: () => void;
}) {
  const [result, setResult] = useState<MatchSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [dismissedConnectionsError, setDismissedConnectionsError] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [invitations, setInvitations] = useState<Record<number, ConnectionResponse>>({});
  const [invitationErrors, setInvitationErrors] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [expandMessage, setExpandMessage] = useState("");
  const [expandError, setExpandError] = useState(false);
  const [mySchool, setMySchool] = useState<string>("");
  const [inviteMode, setInviteMode] = useState(false);
  const [prioritizeSchool, setPrioritizeSchool] = useState<boolean>(false);
  const [emailMatchedCandidateId, setEmailMatchedCandidateId] = useState<number | null>(null);
  const [emailResult, setEmailResult] = useState<EmailConnectionPreview | null>(null);
  const [emailSending, setEmailSending] = useState(false);

=======
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [invitations, setInvitations] = useState<Record<number, ConnectionResponse>>({});
  const [invitationErrors, setInvitationErrors] = useState<Record<number, string>>({});
  // Mỗi lần chỉ hiện 3 bạn; "Đổi gợi ý" chuyển sang 3 bạn tiếp theo.
  const [page, setPage] = useState(0);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const mounted = useRef(true);
  const searchInFlight = useRef(false);
  const sendInFlight = useRef(false);
  const connections = useConnections(token);
<<<<<<< HEAD
  const atCapacity = (connections.data?.connected.length ?? 0) >= 2;
  useEffect(() => {setInviteMode(new URLSearchParams(window.location.search).has("invite"));}, []);
  const invitationError = Object.values(invitationErrors).find(Boolean) || "";
  const connectionError = connections.error && connections.error !== dismissedConnectionsError ? `Chưa tải được lời mời: ${connections.error}` : "";
  const toastMessage = error || connectionError || invitationError || (expandError ? expandMessage : "");

  useEffect(() => {
    let active = true;
    api
      .profile(token)
      .then((res) => {
        if (active && res?.profile?.school) {
          setMySchool(res.profile.school.trim());
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

  useEffect(() => {
    if (connections.data) setInvitations({});
  }, [connections.data]);

  const search = useCallback(async () => {
    if (searchInFlight.current) return;
<<<<<<< HEAD
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("invite")) {
      setLoading(false);
      return;
    }
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    searchInFlight.current = true;
    setLoading(true);
    setError("");
    setResult(null);
<<<<<<< HEAD
    setPage(0);
    setExpanded(false);
    setExpandMessage("");
    setExpandError(false);
    try {
      const response = await api.searchMatches(token);
      if (mounted.current) setResult(response);
=======
    try {
      const response = await api.searchMatches(token);
      if (mounted.current) { setResult(response); setPage(0); }
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    } catch (failure) {
      if (mounted.current) setError(errorMessage(failure));
    } finally {
      searchInFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [token]);

<<<<<<< HEAD
  const expandMatches = useCallback(async () => {
    if (expanding || loading || expanded) return;
    const currentCount = result?.candidates.length ?? 0;
    const currentCandidates = result?.candidates ?? [];
    setExpanding(true);
    setExpandMessage("");
    setExpandError(false);
    try {
      const response = await api.searchMatches(token, true);
      if (!mounted.current) return;
      const currentIds = new Set(currentCandidates.map(candidate => candidate.candidate_id));
      const added = response.candidates.filter(candidate => !currentIds.has(candidate.candidate_id));
      setResult({...response, candidates: [...currentCandidates, ...added].slice(0, 20)});
      setExpanded(true);
      if (added.length > 0) {
        setPage(Math.floor(currentCount / 3));
      } else {
        setExpandMessage("Chưa có thêm hồ sơ phù hợp trong lượt mở rộng này.");
      }
    } catch (failure) {
      if (mounted.current) {setExpandMessage(errorMessage(failure)); setExpandError(true);}
    } finally {
      if (mounted.current) setExpanding(false);
    }
  }, [expanding, loading, expanded, result, token]);

  useEffect(() => {
    mounted.current = true;
    void search();
    return () => {
      mounted.current = false;
    };
  }, [search]);

  function statusFor(candidateId: number): ConnectionStatus | null {
    if (connections.data?.connected.some((item: ConnectedPeerSummary) => item.peer.user_id === candidateId)) {
      return "MATCHED";
    }
    const pending = [...(connections.data?.incoming ?? []), ...(connections.data?.sent ?? [])].find(
      (item: ConnectionRequestSummary) => item.peer.user_id === candidateId && item.status === "PENDING"
    );
=======
  useEffect(() => {
    mounted.current = true;
    void search();
    return () => { mounted.current = false; };
  }, [search]);

  function statusFor(candidateId: number): ConnectionStatus | null {
    if (connections.data?.connected.some((item) => item.peer.user_id === candidateId)) return "MATCHED";
    const pending = [...(connections.data?.incoming ?? []), ...(connections.data?.sent ?? [])]
      .find((item) => item.peer.user_id === candidateId && item.status === "PENDING");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return pending?.status ?? invitations[candidateId]?.status ?? null;
  }

  async function invite(candidate: MatchSearchCandidate) {
    const status = statusFor(candidate.candidate_id);
<<<<<<< HEAD
    if (
      sendInFlight.current ||
      loading ||
      connections.loading ||
      connections.error ||
      !connections.data ||
      status === "PENDING" ||
      status === "MATCHED"
    ) {
      return;
    }
=======
    if (sendInFlight.current || loading || connections.loading || connections.error || !connections.data
      || status === "PENDING" || status === "MATCHED") return;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    sendInFlight.current = true;
    setSendingId(candidate.candidate_id);
    setInvitationErrors((current) => ({ ...current, [candidate.candidate_id]: "" }));
    try {
      const response = await api.requestConnection(token, { recipient_id: candidate.candidate_id });
      if (!mounted.current) return;
      setInvitations((current) => ({ ...current, [candidate.candidate_id]: response }));
      notify(`Đã gửi lời mời tới ${candidate.display_name}.`);
      await connections.refresh();
    } catch (failure) {
      if (!mounted.current) return;
      setInvitationErrors((current) => ({ ...current, [candidate.candidate_id]: errorMessage(failure) }));
<<<<<<< HEAD
      if (failure instanceof ApiError && failure.status === 404) {
        setResult(current => current ? {...current, candidates: current.candidates.filter(item => item.candidate_id !== candidate.candidate_id)} : current);
        notify(errorMessage(failure));
      }
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      if (failure instanceof ApiError && failure.status === 409) await connections.refresh();
    } finally {
      sendInFlight.current = false;
      if (mounted.current) setSendingId(null);
    }
  }

<<<<<<< HEAD
  const displayedCandidates = useMemo(() => {
    if (!result?.candidates) return [];
    if (!prioritizeSchool || !mySchool) return result.candidates;
    const mySchoolNorm = mySchool.toLowerCase();
    const sameSchool = result.candidates.filter(
      (c) => c.school && c.school.trim().toLowerCase() === mySchoolNorm
    );
    const otherSchool = result.candidates.filter(
      (c) => !c.school || c.school.trim().toLowerCase() !== mySchoolNorm
    );
    return [...sameSchool, ...otherSchool];
  }, [result?.candidates, prioritizeSchool, mySchool]);

  const sameSchoolCount = useMemo(() => {
    if (!result?.candidates || !mySchool) return 0;
    const mySchoolNorm = mySchool.toLowerCase();
    return result.candidates.filter(
      (c) => c.school && c.school.trim().toLowerCase() === mySchoolNorm
    ).length;
  }, [result?.candidates, mySchool]);

  const {pageCount, currentPage, visibleCandidates} = candidatePage(displayedCandidates, page);

  useEffect(() => {
    if (emailMatchedCandidateId === null) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`candidate-card-${emailMatchedCandidateId}`)?.scrollIntoView({behavior: "smooth", block: "center"});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [emailMatchedCandidateId, currentPage]);

  function showMatchingCandidate(userId: number) {
    const index = displayedCandidates.findIndex(candidate => candidate.candidate_id === userId);
    if (index < 0) return;
    setEmailMatchedCandidateId(userId);
    setEmailResult(null);
    setPage(Math.floor(index / 3));
    void connections.refresh();
  }

  async function connectEmail() {
    if (!emailResult || emailResult.is_self || emailResult.connected || emailResult.pending) return;
    setEmailSending(true);
    try {
      await api.requestConnection(token, {recipient_id: emailResult.user_id});
      setEmailResult(current => current?.user_id === emailResult.user_id ? {...current, pending: true} : current);
      void connections.refresh();
    } catch (failure) {setError(errorMessage(failure));}
    finally {setEmailSending(false);}
  }

  return (
    <div className="page animate-in peer-workspace matching-compact">
      <div className="page-title">
        <div><h1>Tìm bạn học</h1><div className="matching-intro"><MatchHelp label="Ba loại ghép cặp" icon><ol><li><strong>🌟 Bù trừ:</strong> Bạn biết phần người kia cần và ngược lại.</li><li><strong>🤝 Cùng tiến:</strong> Cùng học một chủ đề, luyện tập và trao đổi.</li><li><strong>⚡ Kỷ luật:</strong> Hợp nhịp học và thời hạn để nhắc lịch, theo dõi tiến độ.</li></ol><p>Ưu tiên Bù trừ → Cùng tiến → Kỷ luật. Trong mỗi loại, điểm cao hơn được xếp trước.</p></MatchHelp></div></div>
        {!atCapacity && <FriendLink token={token} onConnections={onConnections} compact matchingCandidateIds={result?.candidates.map(candidate => candidate.candidate_id)} onMatchingCandidateFound={showMatchingCandidate} onEmailResult={setEmailResult}/>}
        <div className="page-actions"><button className="outline" onClick={onConnections}>Xem kết nối</button>{!inviteMode && !atCapacity && <button className="primary" disabled={loading || expanding || sendingId !== null} onClick={() => { void search(); void connections.refresh(); }}>{loading ? "Đang tìm…" : "Tìm lại"}</button>}</div>
      </div>
      {loading && !atCapacity && <LoadingState message="Đang tìm bạn học…"/>}
      <Toast message={atCapacity ? connectionError : toastMessage} error onClose={() => {setError(""); setDismissedConnectionsError(connections.error || ""); setInvitationErrors({}); setExpandError(false);}} action={!atCapacity && error ? {label:"Thử lại",onClick:() => void search()} : connectionError ? {label:"Thử lại",onClick:() => {setDismissedConnectionsError(""); void connections.refresh();}} : undefined}/>
      {connections.loading && <LoadingState message="Đang cập nhật lời mời…"/>}
      {!connections.loading && atCapacity && <section className="panel peer-empty" role="status"><h2>Đã có 2 bạn đồng hành</h2><p>Với mục tiêu học tập hiện tại, mục Tìm bạn tạm dừng ghép thêm để bạn tập trung học chung và theo dõi tiến độ hiệu quả. Bạn có thể tiếp tục cùng hai bạn trong Kết nối của tôi.</p></section>}
      {!atCapacity && !loading && !error && result && <>
        <div className="matching-compact-toolbar"><span className="matching-range" aria-live="polite">Đang xem <b>{displayedCandidates.length ? currentPage * 3 + 1 : 0}–{Math.min((currentPage + 1) * 3, displayedCandidates.length)}</b> trên <strong>{displayedCandidates.length}</strong> gợi ý</span><label><input type="checkbox" checked={prioritizeSchool} disabled={!mySchool} onChange={e => { setPrioritizeSchool(e.target.checked); setPage(0); }}/>Ưu tiên cùng trường{prioritizeSchool && sameSchoolCount > 0 ? ` (${sameSchoolCount})` : ""}</label><nav className="matching-pagination" aria-label="Trang hồ sơ"><button type="button" className="outline" aria-label="Ba hồ sơ trước" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>‹</button><span aria-live="polite">{currentPage + 1} / {pageCount}</span><button type="button" className="outline" aria-label="Ba hồ sơ tiếp theo" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>›</button></nav></div>
        {emailResult && <div className="candidate-grid matching-email-grid" aria-live="polite"><article className="candidate-card candidate-card-compact matching-email-card"><div className="compact-identity"><Avatar seed={emailResult.user_id} src={emailResult.avatar_url} size={56}/><div><h2>{emailResult.display_name}</h2><p className="major">{[emailResult.major, emailResult.school].filter(Boolean).join(" · ") || "Chưa cập nhật trường/ngành"}</p></div></div><span className="matching-email-label">Kết quả tìm theo email</span><p className="matching-email-goal">{emailResult.learning_goal || "Chưa cập nhật mục tiêu học"}</p>{emailResult.bio && <p className="compact-bio">{emailResult.bio}</p>}<div className="candidate-invite"><button type="button" className={emailResult.is_self || emailResult.connected || emailResult.pending ? "secondary" : "primary"} disabled={emailSending || emailResult.is_self || emailResult.connected || emailResult.pending} onClick={() => void connectEmail()}>{emailResult.is_self ? "Tài khoản của bạn" : emailResult.connected ? "Đã kết nối" : emailResult.pending ? "Đang chờ phản hồi" : emailSending ? "Đang gửi…" : "Cùng học nhé →"}</button></div></article></div>}
        {displayedCandidates.length === 0 ? <div className="panel peer-empty"><h2>Chưa có hồ sơ có thể kết nối</h2><p>Thử lại sau hoặc xem các kết nối hiện có.</p></div> : <div className="candidate-grid" key={currentPage}>
          {visibleCandidates.map(candidate => {
            const status = statusFor(candidate.candidate_id);
            const unavailable = status === "PENDING" || status === "MATCHED";
            const sameSchool = !!(mySchool && candidate.school && candidate.school.trim().toLowerCase() === mySchool.toLowerCase());
            return <MatchCandidateCard key={candidate.candidate_id} candidate={candidate} sameSchool={sameSchool} id={`candidate-card-${candidate.candidate_id}`} className={emailMatchedCandidateId === candidate.candidate_id ? "candidate-card-email-match" : undefined} status={status ? <StatusBadge status={status}/> : undefined}
              action={<button className={unavailable ? "secondary" : "primary"} disabled={unavailable || sendingId !== null || connections.loading || !!connections.error || !connections.data} onClick={() => void invite(candidate)}>{sendingId === candidate.candidate_id ? "Đang gửi…" : unavailable ? connectionStatusLabels[status] : "Cùng học nhé →"}</button>}/>;
          })}
        </div>}
        {!expanded && displayedCandidates.length > 0 && currentPage === pageCount - 1 && <div className="matching-expand"><button type="button" className="outline matching-expand-button" disabled={expanding || loading} onClick={() => void expandMatches()}>{expanding ? "Đang mở rộng…" : "Chưa tìm được ai phù hợp? Mở rộng thêm"}</button></div>}
        {expandMessage && !expandError && <p className="provider-note" role="status">{expandMessage}</p>}
      </>}
    </div>
  );
=======
  const candidates = result?.candidates ?? [];
  const pages = Math.max(1, Math.ceil(candidates.length / PAGE_SIZE));
  const shown = candidates.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return <div className="page animate-in peer-workspace">
    <div className="page-title">
      <div><h1>Gợi ý bạn học</h1></div>
      <div className="page-actions">
        <button className="primary" disabled={loading || sendingId !== null || pages < 2} onClick={() => setPage((page + 1) % pages)}>Đổi gợi ý</button>
        <button className="outline" onClick={onConnections}>Kết nối của tôi</button>
      </div>
    </div>
    {loading && <LoadingState message="Đang tìm người phù hợp..."/>}
    {error && <div className="peer-error" role="alert"><p>{error}</p><button className="outline" disabled={loading} onClick={() => void search()}>Thử lại</button></div>}
    {connections.error && <div className="peer-error" role="alert"><p>Không tải được trạng thái kết nối: {connections.error}</p><button className="outline" disabled={connections.loading || sendingId !== null} onClick={() => void connections.refresh()}>Thử lại</button></div>}
    {!loading && !error && result && <>
      {candidates.length === 0 ? <div className="panel peer-empty"><h2>Chưa có gợi ý</h2><p>Thêm điều bạn cần học và giờ rảnh trong hồ sơ rồi tìm lại.</p></div> :
        <div className="candidate-grid">{shown.map((candidate) => {
          const status = statusFor(candidate.candidate_id);
          const unavailable = status === "PENDING" || status === "MATCHED";
          return <article className="candidate-card compact" key={candidate.candidate_id}>
            <div className="candidate-head">
              <Avatar seed={candidate.candidate_id} size={56}/>
              <div><h2>{candidate.display_name}</h2><span className="match-score">{Math.round(candidate.total_score)} điểm hợp</span></div>
            </div>
            <p className="match-reason">{candidate.reasons?.[0] || "Chưa có lý do phù hợp"}</p>
            {invitationErrors[candidate.candidate_id] && <p className="form-error" role="alert">{invitationErrors[candidate.candidate_id]}</p>}
            <button className={unavailable ? "secondary" : "primary"} disabled={unavailable || sendingId !== null || connections.loading || !!connections.error || !connections.data} onClick={() => void invite(candidate)}>{sendingId === candidate.candidate_id ? "Đang gửi..." : unavailable ? connectionStatusLabels[status] : "Mời học cùng"}</button>
            <details className="candidate-more"><summary>Xem thêm</summary>
              {candidate.learning_goals?.[0] && <p><b>Mục tiêu:</b> {candidate.learning_goals[0]}</p>}
              <p><b>Cần hỗ trợ:</b> {candidate.needs?.join(", ") || "Chưa ghi"}</p>
              <p><b>Có thể giúp:</b> {candidate.strengths?.join(", ") || "Chưa ghi"}</p>
              {candidate.availability?.length ? <p><b>Giờ rảnh:</b> {candidate.availability.slice(0, 3).map(w => `${DAY_SHORT[w.day_of_week]} ${w.start_time.slice(0, 5)}–${w.end_time.slice(0, 5)}`).join(" · ")}</p> : null}
              {candidate.reasons?.slice(1).map(r => <p key={r}>✓ {r}</p>)}
              <dl>{Object.entries(candidate.component_scores).map(([name, score]) => <div key={name}><dt>{componentLabels[name] ?? name}</dt><dd>{Math.round(score * (score <= 1 ? 100 : 1))}</dd></div>)}</dl>
            </details>
          </article>;
        })}</div>}
      {pages > 1 && <p className="match-page">Nhóm {page + 1}/{pages}</p>}
    </>}
  </div>;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}
