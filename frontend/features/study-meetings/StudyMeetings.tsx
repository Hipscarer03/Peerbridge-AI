"use client";

import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {api} from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import OwlAvatar from "@/components/ui/OwlAvatar";
import Select from "@/components/ui/Select";
import Sheet from "@/components/ui/Sheet";
import Toast from "@/components/ui/Toast";
import type {StudyMeetingCreateTarget} from "@/lib/study-meeting-navigation";
import type {ConnectedPeerSummary} from "@/lib/types";
import type {CreateStudyMeeting, PeerStudyMessage, PeerUnread, StudyAssistantState, StudyMeeting, StudyMeetingSummary, StudySegment} from "@/lib/study-meetings";
import {advanceMinutes, advanceSeconds, alignToElapsed, answerQuiz, askContext, chooseChip, createFlow, createFlowAtElapsed, decideTimeline, endFlow, fallbackQuiz, proposeTimeline, saveContext, saveCritique, saveImprove, setPartner, syncActivities, unavailableQuiz, undoTimeline, SPEED, type Activity, type FlowMessage, type Quiz, type SessionFlow} from "./session-flow";
import {autoShorten, lockedCount, timelineDiff, totalMinutes, validateTimeline} from "./timeline-edit";
import {decodeTimelineWire, encodeTimelineWire, isTimelineWire} from "./timeline-wire";
import PeerChatImage from "./PeerChatImage";
import CoachConversation from "./CoachConversation";
import {presets, segment} from "./meeting-presets";
import {syncTimelineBufferLine, timelineBufferMinutes, timelineFromText} from "./timeline-from-text";
import styles from "./StudyMeetings.module.css";

type Props = {token: string; userId: number; initialMeetingId?: number | null; initialPeerId?: number | null; initialCreate?: StudyMeetingCreateTarget | null; unread: PeerUnread; onUnreadChange: () => Promise<void>; realtimeConnected: boolean; realtimeMessage: PeerStudyMessage | null; onCheckin?: () => void};
const formatWhen = (value: string) => new Intl.DateTimeFormat("vi-VN", {dateStyle: "short", timeStyle: "short"}).format(new Date(value));
const formatDuration = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}` : `${minutes}′`;
const formatClock = (value: number) => new Intl.DateTimeFormat("vi-VN", {hour: "2-digit", minute: "2-digit"}).format(new Date(value));
const localValue = (value: string) => {const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);};
const initialStart = () => {const date = new Date(); date.setMinutes(0, 0, 0); date.setHours(date.getHours() + 1); return localValue(date.toISOString());};
const personName = (value: string) => value.includes("@") ? value.split("@")[0] : value;
const activityType = (title: string): Activity["type"] => /nghỉ|break/i.test(title) ? "break" : /tự|cá nhân|solo|brain\s*storm/i.test(title) ? "solo" : "joint";
const toActivities = (segments: StudySegment[]): Activity[] => segments.map((item, index) => {
  const type = activityType(item.title);
  return {id: `${type}-${index}`, title: item.title, minutes: Math.max(1, item.minutes), type};
});
const demoActivities = toActivities(presets[50]);
const restoreAssistant = (flow: SessionFlow, state: StudyAssistantState | null): SessionFlow => state
  ? {...flow, context: state.context, contextAsked: state.context.topic ? [flow.activityIndex] : [], level: state.level, improve: state.improve} : flow;
function SidebarChevron({direction}: {direction: "left" | "right"}) {
  return <svg className={styles.sidebarChevron} viewBox="0 0 24 24" aria-hidden="true" style={{transform: direction === "right" ? "rotate(180deg)" : undefined}}>
    <path d="M13.5 6.5 8 12l5.5 5.5" />
    <path d="M19 6.5 13.5 12l5.5 5.5" />
  </svg>;
}
function mergeMessages(current: PeerStudyMessage[], incoming: PeerStudyMessage[], pairId: number) {
  const byId = new Map<number, PeerStudyMessage>();
  for (const item of [...current, ...incoming]) if (item.peer_match_id === pairId) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => a.id - b.id).slice(-100);
}

export default function StudyMeetings({token, userId, initialMeetingId, initialPeerId, initialCreate, unread, onUnreadChange, realtimeConnected, realtimeMessage, onCheckin}: Props) {
  const [peers, setPeers] = useState<ConnectedPeerSummary[]>([]);
  const [items, setItems] = useState<StudyMeetingSummary[]>([]);
  const [activePeerId, setActivePeerId] = useState(initialCreate?.pair_id ?? initialPeerId ?? 0);
  const [meetingId, setMeetingId] = useState<number | null>(initialMeetingId ?? null);
  const [meeting, setMeeting] = useState<StudyMeeting | null>(null);
  const [planCommitments, setPlanCommitments] = useState<{mine:boolean; partner:boolean; both:boolean} | null>(null);
  const [commitmentsLoading, setCommitmentsLoading] = useState(false);
  const [timelinePreviewOpen, setTimelinePreviewOpen] = useState(false);
  const [peerMessages, setPeerMessages] = useState<PeerStudyMessage[]>([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [note, setNote] = useState("");
  const [contextDraft, setContextDraft] = useState({topic: "", progress: "mới bắt đầu", blocker: "không"});
  const [critiqueDraft, setCritiqueDraft] = useState("");
  const [quizLoadingKey, setQuizLoadingKey] = useState("");
  const [flow, setFlow] = useState<SessionFlow | null>(null);
  const [sessionExpanded, setSessionExpanded] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineDraft, setTimelineDraft] = useState<Activity[]>([]);
  const [timelineDescription, setTimelineDescription] = useState("");
  const [timelineGoal, setTimelineGoal] = useState("");
  const [timelineError, setTimelineError] = useState("");
  const [reviewMeetingId, setReviewMeetingId] = useState<number | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(!!initialCreate);
  const [peerId, setPeerId] = useState(initialCreate?.pair_id ?? initialPeerId ?? 0);
  const [planItemId, setPlanItemId] = useState(initialCreate?.item_id ?? "");
  const [goal, setGoal] = useState(initialCreate?.goal ?? "");
  const [start, setStart] = useState(initialCreate?.scheduled_start ? localValue(initialCreate.scheduled_start) : initialStart());
  const [duration, setDuration] = useState(50);
  const createMode = initialCreate?.item_user_id === userId ? "solo" : "together";
  const [timelineText, setTimelineText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [questions, setQuestions] = useState<{key:string;items:string[]} | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [dev, setDev] = useState(false);
  const messageKey = useRef("");
  const createKey = useRef("");
  const chatBody = useRef<HTMLDivElement>(null);
  const assistantPanelRef = useRef<HTMLElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const flowRef = useRef<SessionFlow | null>(null);
  const processedTimelineMessages = useRef(new Set<string>());
  const requestedQuiz = useRef(new Set<string>());
  const readInFlight = useRef(false);
  const previousPeerJoin = useRef<{meetingId:number;joinedAt:string | null} | null>(null);
  const clearError = useCallback(() => setError(""), []);

  const refreshList = useCallback(async () => {
    const [connections, meetings] = await Promise.all([api.listConnections(token), api.studyMeetings(token)]);
    setPeers(connections.connected);
    setItems(meetings);
  }, [token]);

  useEffect(() => {setDev(new URLSearchParams(window.location.search).get("dev") === "1");}, []);
  useEffect(() => {
    if (!imageFile) {setImagePreview(""); return;}
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  useEffect(() => {flowRef.current = flow;}, [flow]);
  useEffect(() => {if (!flow || flow.phase === "idle") setSessionExpanded(false);}, [flow]);
  useEffect(() => {
    if (!sessionExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !timelinePreviewOpen && !timelineOpen && !formOpen && reviewMeetingId === null) setSessionExpanded(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown);};
  }, [sessionExpanded, timelinePreviewOpen, timelineOpen, formOpen, reviewMeetingId]);
  useEffect(() => {
    let alive = true;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {await refreshList();}
      catch (e) {if (alive) setError(String((e as Error).message ?? e));}
      if (alive) timeout = setTimeout(poll, 20000);
    };
    void poll();
    return () => {alive = false; clearTimeout(timeout);};
  }, [refreshList]);
  useEffect(() => {if (initialPeerId) setActivePeerId(initialPeerId);}, [initialPeerId]);
  useEffect(() => {if (initialMeetingId) setMeetingId(initialMeetingId);}, [initialMeetingId]);
  useEffect(() => {
    if (!initialCreate) return;
    setPeerId(initialCreate.pair_id); setActivePeerId(initialCreate.pair_id); setPlanItemId(initialCreate.item_id); setGoal(initialCreate.goal);
    if (initialCreate.scheduled_start) setStart(localValue(initialCreate.scheduled_start));
    setDuration(initialCreate.minutes);
    setTimelineText("");
    setFormOpen(true);
  }, [initialCreate, userId]);

  useEffect(() => {
    if (!activePeerId) return;
    let alive = true;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {const rows = await api.peerStudyMessages(token, activePeerId); if (alive) setPeerMessages(current => mergeMessages(current, rows, activePeerId));}
      catch (e) {if (alive) setError(String((e as Error).message ?? e));}
      if (alive) timeout = setTimeout(poll, realtimeConnected ? 30000 : flowRef.current ? 3000 : 5000);
    };
    void poll();
    return () => {alive = false; clearTimeout(timeout);};
  }, [token, activePeerId, realtimeConnected]);

  useEffect(() => {
    if (realtimeMessage?.peer_match_id !== activePeerId) return;
    setPeerMessages(current => mergeMessages(current, [realtimeMessage], activePeerId));
    if (realtimeMessage.sender_id !== userId && !isTimelineWire(realtimeMessage.content) &&
        document.visibilityState === "visible" && !readInFlight.current) {
      readInFlight.current = true;
      void api.markPeerStudyRead(token, activePeerId, realtimeMessage.id)
        .then(onUnreadChange).catch(() => undefined)
        .finally(() => {readInFlight.current = false;});
    }
  }, [realtimeMessage, activePeerId, userId, token, onUnreadChange]);

  useEffect(() => {
    if (!activePeerId || !unread.by_pair[String(activePeerId)]) return;
    const markVisible = () => {
      if (document.visibilityState !== "visible") return;
      const latest = peerMessages.filter(item => item.peer_match_id === activePeerId && item.sender_id !== userId && !isTimelineWire(item.content)).at(-1);
      if (latest && !readInFlight.current) {
        readInFlight.current = true;
        void api.markPeerStudyRead(token, activePeerId, latest.id)
          .then(onUnreadChange).catch(() => undefined)
          .finally(() => {readInFlight.current = false;});
      }
    };
    markVisible();
    document.addEventListener("visibilitychange", markVisible);
    return () => document.removeEventListener("visibilitychange", markVisible);
  }, [activePeerId, peerMessages, unread, token, userId, onUnreadChange]);

  useEffect(() => {
    if (!meetingId) {setMeeting(null); return;}
    let alive = true;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const data = await api.studyMeeting(token, meetingId);
        if (alive) {
          if (data.status === "CANCELLED") {
            setItems(current => current.map(item => item.id === data.id ? {...item, status: "CANCELLED"} : item));
            setMeeting(null); setMeetingId(null); setFlow(null);
          } else {
            setMeeting(data); setActivePeerId(data.peer_match_id);
          }
        }
      } catch (e) {if (alive) setError(String((e as Error).message ?? e));}
      if (alive) timeout = setTimeout(poll, 2000);
    };
    void poll();
    return () => {alive = false; clearTimeout(timeout);};
  }, [token, meetingId]);

  useEffect(() => {
    if (!meeting || !meeting.plan_item_id) {setPlanCommitments(null); return;}
    let alive = true;
    setPlanCommitments(null);
    setCommitmentsLoading(true);
    const sync = () => {void api.planCommitments(token, meeting.peer_match_id)
      .then(value => {if (alive) setPlanCommitments(value);})
      .catch(() => undefined)
      .finally(() => {if (alive) setCommitmentsLoading(false);});};
    sync();
    const timer = window.setInterval(sync, 15000);
    return () => {alive = false; window.clearInterval(timer);};
  }, [token, meeting?.id, meeting?.mode, meeting?.plan_item_id, meeting?.peer_match_id]);

  const activePeer = peers.find(item => item.peer_match_id === activePeerId);
  const peerName = personName(activePeer?.peer.display_name ?? meeting?.members.find(item => item.user_id !== userId)?.display_name ?? "Bạn học");
  const peerMeetings = items.filter(item => item.peer_match_id === activePeerId);
  const openMeetings = peerMeetings.filter(item => !["CANCELLED", "ENDED", "MISSED", "EXPIRED"].includes(item.status));
  const ongoingMeeting = openMeetings
    .filter(item => Date.parse(item.starts_at) <= now && Date.parse(item.ends_at) > now)
    .sort((a, b) => Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE") || Date.parse(a.ends_at) - Date.parse(b.ends_at))[0];
  const upcomingMeeting = openMeetings
    .filter(item => Date.parse(item.starts_at) > now)
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const pendingReviews = peerMeetings.filter(item => item.feedback_pending).sort((a, b) => Date.parse(b.ends_at) - Date.parse(a.ends_at));
  const currentSummary = ongoingMeeting ?? upcomingMeeting ?? pendingReviews[0];
  const currentMeetingId = currentSummary?.id ?? null;
  const compactReviews = pendingReviews.filter(item => item.id !== currentMeetingId);
  const reviewMeeting = items.find(item => item.id === reviewMeetingId);
  const partnerJoined = !!meeting?.members.find(member => member.user_id !== userId)?.joined_at;
  const myMember = meeting?.members.find(member => member.user_id === userId);
  const peerMember = meeting?.members.find(member => member.user_id !== userId);
  const questionContextKey = `${meeting?.id ?? 0}:${meeting?.current_segment ?? 0}:${peerMessages.at(-1)?.id ?? 0}`;
  const joinedTimes = meeting?.members.map(member => member.joined_at).filter((value):value is string => !!value).sort() ?? [];
  const sharedStudyStarted = meeting?.mode !== "solo" && joinedTimes.length === 2 && !meeting?.members.some(member => member.waiting_action === "SOLO");
  const actualStart = sharedStudyStarted ? joinedTimes[1] : joinedTimes[0];
  const sessionStartAt = meeting ? new Date(Math.max(Date.parse(meeting.starts_at), actualStart ? Date.parse(actualStart) : Date.parse(meeting.starts_at))).toISOString() : "";
  const pendingConfirmedByMe = !!meeting?.confirmations.some(item => item.version === meeting.pending_version && item.user_id === userId);
  const bothMeetingAccepted = !!meeting && meeting.members.every(member => member.invitation === "ACCEPTED");
  const sessionNeedsMyConfirmation = !!meeting && meeting.mode !== "solo" && !!meeting.pending_version && !pendingConfirmedByMe && bothMeetingAccepted;
  const pendingTimeline = meeting?.timelines.find(item => item.version === meeting.pending_version);
  const previewTimeline = meeting?.timelines.find(item => item.version === (meeting.pending_version ?? meeting.active_version)) ?? meeting?.timelines.at(-1);
  const previewIsPending = !!previewTimeline && meeting?.pending_version === previewTimeline.version && meeting.active_version !== previewTimeline.version;
  const previewActivityMinutes = previewTimeline?.segments.reduce((sum, item) => sum + item.minutes, 0) ?? 0;
  const previewTotalMinutes = previewTimeline ? Math.round((Date.parse(previewTimeline.ends_at) - Date.parse(previewTimeline.starts_at)) / 60000) : 0;
  const previewBufferMinutes = Math.max(0, previewTotalMinutes - previewActivityMinutes);
  const activities = useMemo(() => toActivities(meeting?.timelines.find(item => item.version === (meeting.active_version ?? meeting.pending_version))?.segments ?? presets[50]), [meeting]);

  useEffect(() => {
    for (const item of peerMessages) {
      const key = `${activePeerId}:${item.id}`;
      if (processedTimelineMessages.current.has(key)) continue;
      processedTimelineMessages.current.add(key);
      if (item.sender_id === userId) continue;
      const wire = decodeTimelineWire(item.content);
      if (!wire) continue;
      if (wire.kind === "proposal") {
        if (Date.now() - wire.sentAt > 60000) continue;
        setFlow(current => {
          const sessionBudget = meeting ? Math.round((Date.parse(meeting.ends_at) - Date.parse(meeting.starts_at)) / 60000) : activities.reduce((sum, item) => sum + item.minutes, 0);
          const base = current ?? createFlow(activities, meeting?.mode === "solo" || partnerJoined ? "present" : "absent", 15, sessionBudget, meeting?.goal ?? "", meeting?.mode === "solo");
          return proposeTimeline(base, wire.activities, timelineDiff(base.activities, wire.activities), "partner", wire.id, wire.goal ?? base.goal);
        });
      } else if (wire.kind === "decision") {
        setFlow(current => current?.proposal?.id === wire.id && current.proposal.by === "me" ? decideTimeline(current, wire.accepted) : current);
      } else {
        setFlow(current => current?.proposal?.id === wire.id ? undoTimeline(current) : current);
      }
    }
  }, [peerMessages, activePeerId, userId, activities, partnerJoined]);

  useEffect(() => {
    if (currentMeetingId && meetingId !== currentMeetingId) {setMeetingId(currentMeetingId); setFlow(null);}
  }, [currentMeetingId, meetingId]);
  useEffect(() => {
    if (!meeting || meeting.id !== meetingId) return;
    if (meeting.mode === "solo" && meeting.creator_id !== userId) {setFlow(null); return;}
    if (meeting.mode !== "solo" && meeting.creator_id !== userId && meeting.confirmations.filter(item => item.version === meeting.active_version).length < 2) {setFlow(null); return;}
    const minutesToStart = Math.ceil((Date.parse(meeting.starts_at) - now) / 60000);
    const joinedAt = myMember?.joined_at ?? null;
    if (!dev && minutesToStart <= 0 && !joinedAt) {setFlow(null); return;}
    if (dev || (["CONFIRMED", "ACTIVE"].includes(meeting.status) && minutesToStart <= 15 && now < Date.parse(meeting.ends_at))) {
      const budget = Math.round((Date.parse(meeting.ends_at) - Date.parse(meeting.starts_at)) / 60000);
      setFlow(current => current && current.solo === (meeting.mode === "solo") && current.joinedAt === joinedAt ? current
        : joinedAt && !dev
          ? restoreAssistant(createFlowAtElapsed(activities, meeting.mode === "solo" || partnerJoined ? "present" : "absent", budget, meeting.goal, meeting.mode === "solo", sessionStartAt, joinedAt, peerMember?.waiting_action === "SOLO" ? peerMember.joined_at : null, now), meeting.assistant_state)
          : restoreAssistant({...createFlow(activities, meeting.mode === "solo" || partnerJoined ? "present" : "absent", dev ? 15 : Math.max(1, minutesToStart), budget, meeting.goal, meeting.mode === "solo"),
            untilStartSeconds: dev ? 900 : Math.max(1, Math.ceil((Date.parse(meeting.starts_at) - now) / 1000))}, meeting.assistant_state));
    }
  }, [meeting?.id, meeting?.mode, meeting?.creator_id, meeting?.status, meeting?.active_version, meeting?.confirmations, meeting?.starts_at, meeting?.ends_at, myMember?.joined_at, peerMember?.joined_at, meetingId, activities, partnerJoined, dev, now, userId, sessionStartAt]);
  useEffect(() => {if (meeting && !dev && !["CONFIRMED", "ACTIVE", "ENDED"].includes(meeting.status)) setFlow(null);}, [meeting?.status, dev]);
  useEffect(() => {if (meeting && now >= Date.parse(meeting.ends_at)) setFlow(current => current ? endFlow(current) : current);}, [meeting?.ends_at, now]);
  useEffect(() => {if (partnerJoined) setFlow(current => current ? alignToElapsed(setPartner(current, "present"), sessionStartAt, Date.now()) : current);}, [partnerJoined, sessionStartAt]);
  useEffect(() => {
    if (!meeting || meeting.mode === "solo") return;
    const previous = previousPeerJoin.current;
    const joinedAt = peerMember?.joined_at ?? null;
    if (previous?.meetingId === meeting.id && !previous.joinedAt && joinedAt && myMember?.joined_at) setNotice(`${peerName} đã vào phòng học`);
    previousPeerJoin.current = {meetingId: meeting.id, joinedAt};
  }, [meeting?.id, meeting?.mode, peerMember?.joined_at, myMember?.joined_at, peerName]);
  useEffect(() => {
    if (!meeting?.active_version || !flow) return;
    setFlow(current => current ? syncActivities(current, activities, sessionStartAt, Date.now()) : current);
  }, [meeting?.active_version, sessionStartAt, activities, flow?.activities]);
  useEffect(() => {
    const timer = window.setInterval(() => {setNow(Date.now()); setFlow(current => current ? advanceSeconds(current, dev ? SPEED : 1) : current);}, 1000);
    return () => window.clearInterval(timer);
  }, [dev]);
  useEffect(() => {
    if (!meeting?.starts_at || dev) return;
    const resync = () => {if (document.visibilityState === "visible") setFlow(current => current ? alignToElapsed(current, sessionStartAt, Date.now()) : current);};
    document.addEventListener("visibilitychange", resync);
    return () => document.removeEventListener("visibilitychange", resync);
  }, [sessionStartAt, dev]);
  useEffect(() => {if (chatBody.current) chatBody.current.scrollTop = chatBody.current.scrollHeight;}, [peerMessages.length, activePeerId]);
  useEffect(() => {if (["wrap", "done"].includes(flow?.phase ?? "") || currentSummary?.feedback_pending) {if (chatBody.current) chatBody.current.scrollTop = chatBody.current.scrollHeight;}}, [flow?.phase, currentSummary?.id, currentSummary?.feedback_pending]);
  useEffect(() => {if (assistantPanelRef.current) assistantPanelRef.current.scrollTop = assistantPanelRef.current.scrollHeight;}, [flow?.messages.length, meeting?.waiting_card, meeting?.peer_catchup_action]);
  useEffect(() => {
    const latest = flow?.messages.at(-1);
    if (!flow?.quizKind || !latest?.quiz || latest.quiz.question) return;
    const key = `${meetingId ?? "preview"}:${myMember?.joined_at ?? "lobby"}:${latest.id}`;
    if (requestedQuiz.current.has(key)) return;
    requestedQuiz.current.add(key);
    setQuizLoadingKey(key);
    const resolve = (generated: Quiz | null) => setFlow(current => {
      if (!current?.quizKind || current.messages.at(-1)?.id !== latest.id || current.messages.at(-1)?.quiz?.question) return current;
      const question = generated ?? fallbackQuiz(current, current.quizIndex);
      return question ? {...current, messages: current.messages.map(item => item.id === latest.id ? {...item, quiz: question} : item)} : unavailableQuiz(current);
    });
    if (!meetingId || dev) {resolve(null); setQuizLoadingKey(""); requestedQuiz.current.delete(key); return;}
    const payload = {
      trigger: flow.quizKind === "closing" ? "quiz_cuoi_gio" as const : flow.quizKind === "catchup" ? "tre_gio" as const : "quiz_dau_gio" as const,
      index: flow.quizIndex, level: flow.level, context: flow.context,
      chat_tail: peerMessages.filter(item => !isTimelineWire(item.content) && item.content.trim()).slice(-20).map(item => item.content),
      asked: flow.messages.filter(item => item.quiz && item.id !== latest.id).map(item => item.quiz!.question).slice(-4),
    };
    void api.studyFacilitatorQuiz(token, meetingId, payload).then(response => resolve(response.quiz)).catch(() => resolve(null)).finally(() => {setQuizLoadingKey(current => current === key ? "" : current); requestedQuiz.current.delete(key);});
  }, [meetingId, token, dev, myMember?.joined_at, flow?.messages, flow?.quizKind, flow?.quizIndex, flow?.level, flow?.context, peerMessages]);

  function openCreate(pairId = activePeerId) {setPeerId(pairId); setPlanItemId(""); setStart(initialStart()); setFormOpen(true); setMenuOpen(false);}
  function openTimeline() {
    if (!flow || flow.phase === "done" || flow.phase === "wrap") return;
    setTimelineDraft(flow.activities.map(item => ({...item})));
    setTimelineDescription(meeting?.source_text || "");
    setTimelineGoal(flow.goal || "Mục tiêu buổi học");
    setTimelineError("");
    setTimelineOpen(true);
  }
  function changeTimeline(index: number, change: Partial<Activity>) {
    setTimelineDraft(rows => rows.map((row, rowIndex) => rowIndex === index ? {...row, ...change, ...(change.title !== undefined ? {type: activityType(change.title)} : {})} : row));
    setTimelineError("");
  }
  function generateTimelineDraft() {
    if (!flow || flow.phase !== "lobby") return;
    try {
      const segments = timelineFromText(timelineDescription, flow.budgetMinutes, []);
      setTimelineDraft(segments.map(item => ({id: crypto.randomUUID(), title: item.title,
        minutes: item.minutes, type: activityType(item.title)})));
      setTimelineError("");
    } catch (failure) {setTimelineError(String((failure as Error).message));}
  }
  function moveTimeline(index: number, direction: -1 | 1) {
    if (!flow) return;
    if (!timelineGoal.trim()) {setTimelineError("Cần có mục tiêu cho buổi học."); return;}
    if (flow.phase !== "lobby" && timelineGoal.trim() !== flow.goal.trim()) {setTimelineError("Mục tiêu chỉ được sửa trước giờ bắt đầu."); return;}
    const target = index + direction;
    if (target < lockedCount(flow.phase, flow.activityIndex) || target < 0 || target >= timelineDraft.length) return;
    setTimelineDraft(rows => {const next = [...rows]; [next[index], next[target]] = [next[target], next[index]]; return next;});
  }
  async function submitTimeline(draft = timelineDraft, nextGoal = timelineGoal) {
    if (!flow) return;
    const issue = validateTimeline(flow.activities, draft, flow.budgetMinutes, lockedCount(flow.phase, flow.activityIndex));
    if (issue) {setTimelineError(issue); return;}
    if (flow.proposal?.status === "pending") {setTimelineError("Đang chờ phản hồi cho đề xuất trước."); return;}
    if (JSON.stringify(flow.activities) === JSON.stringify(draft) && nextGoal.trim() === flow.goal.trim()) {setTimelineError("Timeline chưa thay đổi."); return;}
    const proposalId = crypto.randomUUID();
    const diff = [nextGoal.trim() !== flow.goal.trim() ? `Mục tiêu: ${flow.goal || "chưa chốt"} → ${nextGoal.trim()}` : "", timelineDiff(flow.activities, draft)].filter(Boolean).join("\n");
    if (!meetingId || !meeting) {setTimelineError("Không tìm thấy phiên học để chỉnh timeline."); return;}
    const source = meeting.timelines.find(item => item.version === (meeting.active_version ?? meeting.pending_version));
    const startsAt = Date.parse(meeting.starts_at);
    const segments = draft.map((activity, index) => ({
      title: activity.title, minutes: activity.minutes, outcome: source?.segments[index]?.outcome ?? "",
      role_a: source?.segments[index]?.role_a ?? "peer" as const, role_b: source?.segments[index]?.role_b ?? "peer" as const,
    }));
    const sourceText = syncTimelineBufferLine(timelineDescription, Math.max(0, flow.budgetMinutes - totalMinutes(draft)));
    setBusy(true); setTimelineError("");
    try {
      const updated = await api.studyTimeline(token, meetingId, {expected_version: meeting.pending_version ?? meeting.active_version ?? 1,
        goal: nextGoal.trim(), source_text: sourceText, starts_at: new Date(startsAt).toISOString(), ends_at: meeting.ends_at, segments});
      setMeeting(updated);
      setTimelineDescription(sourceText);
      if (meeting.mode === "solo") {
        setFlow(current => current ? {...current, activities: draft, goal: nextGoal.trim(),
          timelineHistory: [...current.timelineHistory, current.activities].slice(-10)} : current);
      } else {
        setFlow(current => current ? proposeTimeline(current, draft, diff, "me", proposalId, nextGoal.trim()) : current);
        await sendMessage(encodeTimelineWire({kind: "proposal", id: proposalId, sentAt: Date.now(), activities: draft, goal: nextGoal.trim()}));
      }
      setTimelineOpen(false);
    } catch (e) {setTimelineError(String((e as Error).message ?? e)); setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!peerId || !planItemId || !goal.trim()) return;
    if (!Number.isFinite(Date.parse(start)) || Date.parse(start) + duration * 60000 <= Date.now()) {
      setError("Khung giờ học đã kết thúc; hãy đổi giờ trong Kế hoạch trước khi lên chi tiết.");
      return;
    }
    let segments: StudySegment[];
    try {
      const fallback = presets[duration] ?? (duration <= 120
        ? [segment(createMode === "solo" ? "Tự học" : "Học cùng", duration)]
        : [segment(createMode === "solo" ? "Tự học phần 1" : "Học cùng phần 1", Math.floor(duration / 2)), segment(createMode === "solo" ? "Tự học phần 2" : "Học cùng phần 2", Math.ceil(duration / 2))]);
      segments = timelineFromText(timelineText, duration, fallback);
    } catch (failure) {setError(String((failure as Error).message)); return;}
    setBusy(true); setError("");
    const starts_at = new Date(start).toISOString();
    const payload: CreateStudyMeeting = {peer_match_id: peerId, client_key: createKey.current ||= crypto.randomUUID(), plan_item_id: planItemId, goal: goal.trim(), mode: createMode, starts_at, ends_at: new Date(Date.parse(starts_at) + duration * 60000).toISOString(), source_text: timelineText.trim(), segments};
    try {
      const created = await api.createStudyMeeting(token, payload);
      createKey.current = ""; setMeeting(created); setMeetingId(created.id); setActivePeerId(created.peer_match_id); setFlow(null); setFormOpen(false); await refreshList();
    } catch (e) {setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function sendMessage(content: string) {
    if (!activePeerId || !content.trim()) return;
    setBusy(true); setError("");
    try {
      messageKey.current ||= crypto.randomUUID();
      const sent = await api.sendPeerStudyMessage(token, activePeerId, content.trim(), messageKey.current);
      messageKey.current = "";
      setPeerMessages(rows => mergeMessages(rows, [sent], activePeerId));
    } catch (e) {setError(String((e as Error).message ?? e)); throw e;}
    finally {setBusy(false);}
  }
  async function askOwl() {
    if (!meetingId || !myMember?.joined_at || questionsLoading) return;
    const key = questionContextKey;
    if (questions?.key === key) return;
    setQuestionsLoading(true); setError("");
    try {
      const result = await api.studyFacilitatorQuestions(token, meetingId);
      setQuestions({key, items: result.questions.slice(0, 2)});
    } catch (failure) {setError(String((failure as Error).message ?? failure));}
    finally {setQuestionsLoading(false);}
  }
  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    const content = text.trim();
    const selectedImage = imageFile;
    if (!content && !selectedImage) return;
    setText(""); setImageFile(null);
    if (imageInput.current) imageInput.current.value = "";
    try {
      if (selectedImage) {
        setBusy(true); setError("");
        messageKey.current ||= crypto.randomUUID();
        const sent = await api.sendPeerStudyImage(token, activePeerId, selectedImage, content, messageKey.current);
        messageKey.current = "";
        setPeerMessages(rows => mergeMessages(rows, [sent], activePeerId));
      } else {
        await sendMessage(content);
      }
    } catch (e) {
      setText(content); setImageFile(selectedImage);
      setError(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }
  function chooseImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh phải nhỏ hơn 5 MB.");
      return;
    }
    setError(""); setImageFile(file);
  }
  async function selectChip(message: FlowMessage, key: string) {
    if (!flow) return;
    const latest = [...flow.messages].reverse().find(item => item.from === "ai");
    if (latest?.id !== message.id || message.chosen) return;
    if (key === "undo_timeline") {
      const previous = flow.timelineHistory.at(-1);
      if (previous) await submitTimeline(previous, flow.goal);
      return;
    }
    if (meetingId && !dev) {
      try {
        let updated: StudyMeeting | null = null;
        if (key === "accept_timeline" || key === "keep_timeline") {
          const latestMeeting = await api.studyMeeting(token, meetingId);
          if (!latestMeeting.pending_version) throw new Error("Đề xuất timeline đã hết hiệu lực.");
          updated = key === "accept_timeline"
            ? await api.confirmStudyTimeline(token, meetingId, latestMeeting.pending_version)
            : await api.rejectStudyTimeline(token, meetingId, latestMeeting.pending_version);
        }
        if (key === "on_time") updated = await api.studyAttendance(token, meetingId, "ON_TIME");
        if (key === "late10") updated = await api.studyAttendance(token, meetingId, "DELAYED", new Date(Math.max(Date.now() + 60000, Date.parse(meeting?.starts_at ?? "") + 10 * 60000)).toISOString());
        if (key === "cannot") updated = await api.studyAttendance(token, meetingId, "DECLINED");
        if (key === "solo25") updated = await api.studyWaiting(token, meetingId, "SOLO");
        if (key === "shift5" || key === "extend") updated = await api.shiftStudyMilestone(token, meetingId, flow.activityIndex);
        if (updated) setMeeting(updated);
        if (key === "done" && meeting?.status === "ACTIVE" && (meeting.mode === "solo" || peerMember?.joined_at)) {
          updated = await api.finishStudyMeeting(token, meetingId);
          await refreshList();
        }
        if (key === "done" && meeting?.mode !== "solo" && myMember?.joined_at && peerMember?.joined_at && !myMember.feedback
            && (updated?.status === "ENDED" || meeting?.status === "ENDED" || now >= Date.parse(meeting?.ends_at ?? ""))) {
          updated = await api.studyFeedback(token, meetingId, flow.level === "khó" ? "easier" : flow.level === "dễ" ? "harder" : "same");
          await refreshList();
        }
      } catch (e) {setError(String((e as Error).message ?? e)); return;}
    }
    const chatTail = peerMessages.filter(item => !isTimelineWire(item.content) && item.content.trim()).slice(-20).map(item => item.content);
    setFlow(current => current ? chooseChip(["easy", "medium", "hard"].includes(key) ? saveImprove(current, note) : current, message.id, key, chatTail) : current);
    if (meetingId && !dev && ["easy", "medium", "hard"].includes(key)) {
      const level = key === "easy" ? "dễ" : key === "hard" ? "khó" : "vừa";
      try {setMeeting(await api.studyAssistantState(token, meetingId, {context: flow.context, level, improve: note.trim()}));}
      catch (e) {setError(String((e as Error).message ?? e));}
    }
    if (meetingId && !dev && ["catchup_summary", "catchup_quiz", "read_chat"].includes(key)) {
      const catchup_action = key === "catchup_summary" ? "summary" : key === "catchup_quiz" ? "quiz" : "read";
      try {setMeeting(await api.studyAssistantState(token, meetingId, {context: flow.context, level: flow.level, improve: flow.improve, catchup_action}));}
      catch (failure) {setError(String((failure as Error).message ?? failure));}
    }
    if (key === "edit_timeline") openTimeline();
    if ((key === "accept_timeline" || key === "keep_timeline") && flow.proposal?.by === "partner") {
      void sendMessage(encodeTimelineWire({kind: "decision", id: flow.proposal.id, sentAt: Date.now(), accepted: key === "accept_timeline"})).catch(() => undefined);
    }
    if (key === "cannot" || key === "reschedule" || key === "rebook") openCreate();
    if (key === "share") {
      const summary = message.text.startsWith("Bạn đã có phần tự học");
      const edited = window.prompt(summary ? "Viết tóm tắt để gửi bạn học" : "Sửa câu trước khi gửi cho bạn học", summary ? "" : message.text);
      if (edited?.trim()) {try {await sendMessage(edited);} catch { /* Lỗi đã hiển thị trên màn chat. */ }}
    }
    if (key === "done") {
      setNote("");
    }
  }
  async function submitAssistantContext(event: FormEvent) {
    event.preventDefault();
    if (!contextDraft.topic.trim() || !flow) return;
    setFlow(current => current ? saveContext(current, contextDraft) : current);
    if (meetingId && !dev) {
      try {setMeeting(await api.studyAssistantState(token, meetingId, {context: contextDraft, level: flow.level, improve: flow.improve}));}
      catch (failure) {setError(String((failure as Error).message ?? failure));}
    }
  }
  async function submitReview(id: number, choice: "same" | "shorter" | "easier") {
    setBusy(true); setError("");
    try {
      await api.studyFeedback(token, id, choice);
      await refreshList();
      setReviewMeetingId(null);
      if (meetingId === id) {setMeetingId(null); setMeeting(null); setFlow(null);}
    } catch (e) {setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function cancelMeeting() {
    setMenuOpen(false);
    if (!meetingId) return;
    setBusy(true); setError("");
    try {await api.cancelStudyMeeting(token, meetingId); setFlow(null); setMeeting(null); setMeetingId(null); await refreshList();}
    catch (e) {setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function meetingAction(action: "accept" | "decline" | "confirm" | "keep" | "reconfirm") {
    if (!meetingId || !meeting) return;
    setBusy(true); setError("");
    try {
      const updated = action === "reconfirm" ? await api.reconfirmStudyMeeting(token, meetingId)
        : action === "confirm" ? await api.confirmStudyTimeline(token, meetingId, meeting.pending_version!)
        : action === "keep" ? await api.rejectStudyTimeline(token, meetingId, meeting.pending_version!)
        : await api.studyInvitation(token, meetingId, action === "accept");
      setMeeting(updated);
      if ((action === "confirm" || action === "keep") && flow?.proposal?.by === "partner" && flow.proposal.status === "pending") {
        setFlow(current => current ? decideTimeline(current, action === "confirm") : current);
        void sendMessage(encodeTimelineWire({kind: "decision", id: flow.proposal.id, sentAt: Date.now(), accepted: action === "confirm"})).catch(() => undefined);
      }
      await refreshList();
    } catch (e) {setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function commitCurrentPlan() {
    if (!meeting || !meeting.plan_item_id) return;
    setBusy(true); setError("");
    try {setPlanCommitments(await api.commitPlan(token, meeting.peer_match_id));}
    catch (failure) {setError(String((failure as Error).message ?? failure));}
    finally {setBusy(false);}
  }
  async function participationAction(action: "invite" | "request" | "accept" | "decline") {
    if (!meetingId) return;
    if (action !== "decline" && meeting?.plan_item_id && !planCommitments?.both) {
      setError("Cả hai cần chốt kế hoạch ban đầu một lần trước khi tham gia buổi học.");
      return;
    }
    setBusy(true); setError("");
    try {setMeeting(await api.studyParticipation(token, meetingId, action)); await refreshList();}
    catch (failure) {setError(String((failure as Error).message ?? failure));}
    finally {setBusy(false);}
  }
  async function joinMeeting() {
    if (!meetingId) return;
    setBusy(true); setError("");
    try {setMeeting(await api.joinStudyMeeting(token, meetingId)); await refreshList();}
    catch (e) {setError(String((e as Error).message ?? e));}
    finally {setBusy(false);}
  }
  async function reportLateArrival() {
    if (!meetingId) return;
    setBusy(true); setError("");
    try {
      const eta = new Date(Math.max(Date.now() + 10 * 60000, Date.parse(meeting?.starts_at ?? "") + 10 * 60000)).toISOString();
      setMeeting(await api.studyAttendance(token, meetingId, "DELAYED", eta));
    } catch (failure) {setError(String((failure as Error).message ?? failure));}
    finally {setBusy(false);}
  }

  const latestAiId = [...(flow?.messages ?? [])].reverse().find(item => item.from === "ai")?.id;
  const latestAi = [...(flow?.messages ?? [])].reverse().find(item => item.from === "ai" && !item.chosen && (item.form || item.quiz || item.chips?.some(chip => ["accept_timeline", "keep_timeline", "catchup_summary", "read_chat", "easy", "medium", "hard", "done"].includes(chip.key))));
  const chatItems = peerMessages.filter(item => !isTimelineWire(item.content));
  const currentActivity = flow?.activities[flow.activityIndex];
  const activityTitle = flow?.partner === "absent" && flow.phase === "running" ? flow.soloWhileWaiting ? "Tự học" : "Chờ bạn học" : currentActivity?.title ?? "Tổng kết";
  const timerSeconds = flow?.phase === "lobby" ? flow.untilStartSeconds : flow?.phase === "running" && !flow.solo && flow.partner === "absent" && !flow.soloWhileWaiting ? flow.waitingSeconds : flow?.remainingSec ?? 0;
  const timerText = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;
  const draftTotal = totalMinutes(timelineDraft);
  const draftBuffer = flow ? Math.max(0, flow.budgetMinutes - draftTotal) : 0;
  const draftLocked = flow ? lockedCount(flow.phase, flow.activityIndex) : 0;
  const overBudget = !!flow && draftTotal > flow.budgetMinutes;
  const customTimeline = (() => {
    if (!timelineText.trim()) return null;
    try {return {segments: timelineFromText(timelineText, duration, []), buffer: timelineBufferMinutes(timelineText), error: ""};}
    catch (failure) {return {segments: [] as StudySegment[], buffer: 0, error: String((failure as Error).message)};}
  })();
  const needsJoin = !!meeting && meeting.id === currentSummary?.id && ["CONFIRMED", "ACTIVE"].includes(meeting.status)
    && myMember?.invitation === "ACCEPTED" && (meeting.mode !== "solo" || meeting.creator_id === userId)
    && (meeting.mode === "solo" || meeting.creator_id === userId || meeting.confirmations.filter(item => item.version === meeting.active_version).length === 2)
    && !myMember?.joined_at && now >= Date.parse(meeting.starts_at) && now < Date.parse(meeting.ends_at);
  const participationDecisionPending = meeting?.mode === "solo" && (meeting.creator_id === userId
    ? peerMember?.invitation === "REQUESTED" : myMember?.invitation === "INVITED");

  return <div className={styles.page}>
    <Toast message={error || notice} error={!!error} onClose={() => {clearError(); setNotice("");}}/>
    <div className={`${styles.inbox} ${!sidebarVisible ? styles.inboxExpanded : ""}`}>
      <aside id="study-chat-sidebar" className={styles.inboxSidebar} hidden={!sidebarVisible}>
        <div className={styles.sidebarHeading}><h2>Trò chuyện</h2><button type="button" className={styles.sidebarToggle} aria-label="Ẩn danh sách chat" aria-expanded={sidebarVisible} aria-controls="study-chat-sidebar" onClick={() => setSidebarVisible(false)}><SidebarChevron direction="left" /></button></div>
        <button type="button" className={`${styles.peerRow} ${activePeerId === 0 ? styles.peerRowActive : ""}`} aria-pressed={activePeerId === 0} onClick={() => {setActivePeerId(0); setMeetingId(null); setMeeting(null); setFlow(null); setReviewMeetingId(null); setSessionExpanded(false);}}><OwlAvatar size={42}/><span><strong>Cú Bridge</strong><small>Kế hoạch và tiến độ</small></span></button>
        {!peers.length && <p className={styles.note}>Khi kết nối với bạn học, cuộc trò chuyện sẽ hiện ở đây.</p>}
        {peers.map(item => {
          const pairAppointments = items.filter(session => session.peer_match_id === item.peer_match_id && ["INVITED", "CONFIRMED", "ACTIVE", "NEEDS_RECONFIRMATION"].includes(session.status) && Date.parse(session.ends_at) > now);
          const appointment = pairAppointments.find(session => Date.parse(session.starts_at) <= now)
            ?? pairAppointments.sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
          const unreadCount = unread.by_pair[String(item.peer_match_id)] || 0;
          return <button key={item.peer_match_id} className={`${styles.peerRow} ${activePeerId === item.peer_match_id ? styles.peerRowActive : ""}`} aria-pressed={activePeerId === item.peer_match_id} onClick={() => {setActivePeerId(item.peer_match_id); setMeetingId(null); setMeeting(null); setFlow(null); setReviewMeetingId(null); setPeerMessages([]); setImageFile(null); if (imageInput.current) imageInput.current.value = "";}}><Avatar seed={item.peer.user_id} src={item.peer.avatar_url} size={42}/><span><strong>{personName(item.peer.display_name)}</strong>{appointment && <small>{appointment.status === "INVITED" ? "📌 Có đề nghị học chung" : appointment.mode === "solo" ? "Tự học" : "📌 Phiên học chung"} · {formatWhen(appointment.starts_at)}</small>}</span>{unreadCount > 0 && <span className={styles.unreadBadge} aria-label={`${unreadCount} tin nhắn chưa đọc`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>;
        })}
      </aside>
      <section className={`${styles.conversation} ${sessionExpanded ? styles.conversationExpanded : ""}`}>
        {activePeerId === 0 ? <CoachConversation token={token} sidebarVisible={sidebarVisible} onShowSidebar={() => setSidebarVisible(true)}/> : activePeer ? <>
          <header className={styles.conversationHeader}>{!sidebarVisible && !sessionExpanded && <button type="button" className={styles.sidebarToggle} aria-label="Hiện danh sách chat" aria-expanded={sidebarVisible} aria-controls="study-chat-sidebar" onClick={() => setSidebarVisible(true)}><SidebarChevron direction="right" /></button>}<Avatar seed={activePeer.peer.user_id} src={activePeer.peer.avatar_url} size={38}/><div><strong>{peerName}</strong></div>{flow && flow.phase !== "idle" && <button type="button" className={styles.fullscreenButton} aria-pressed={sessionExpanded} onClick={() => setSessionExpanded(value => !value)}>{sessionExpanded ? "Thu nhỏ" : "Toàn màn hình"}</button>}<div className={styles.moreWrap}><button type="button" className={styles.moreButton} aria-label="Tùy chọn buổi học" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>⋯</button>{menuOpen && <div className={styles.moreMenu}><button type="button" onClick={() => openCreate()}>Hẹn buổi mới</button>{meetingId && meeting && currentSummary && !currentSummary.feedback_pending && (meeting.mode !== "solo" || meeting.creator_id === userId) && <button type="button" onClick={() => void cancelMeeting()} disabled={busy}>Hủy buổi học</button>}</div>}</div></header>
          {flow && flow.phase !== "idle" && <div className={styles.sessionStrip}>
            <div className={styles.sessionStripTop}><span className={styles.sessionTimer} role="timer">{timerText}</span><strong>{flow.phase === "lobby" ? "Sắp bắt đầu" : activityTitle}</strong>{!flow.solo && <span className={`${styles.partnerStatus} ${flow.partner === "present" ? styles.partnerPresent : ""}`}><i className={flow.partner === "present" ? styles.presentDot : styles.absentDot}/>{peerName} {flow.partner === "present" ? "đã vào phòng" : "chưa vào"}</span>}{!flow.solo && myMember?.joined_at && flow.phase === "running" && flow.partner === "present" && <button type="button" className={styles.owlSuggestButton} disabled={questionsLoading} onClick={() => void askOwl()} title="Khi muốn Cú gợi ý hoạt động, ấn vào đây" aria-label="Khi muốn Cú gợi ý hoạt động, ấn vào đây"><OwlAvatar size={25}/><span>{questionsLoading ? "Đang nghĩ…" : "Gợi ý"}</span></button>}</div>
            <button type="button" className={styles.sessionTimeline} aria-label="Xem và chỉnh timeline buổi học" onClick={openTimeline}><span className={styles.timelinePosition}>Mục {Math.min(flow.activityIndex + 1, flow.activities.length)}/{flow.activities.length}</span><span className={styles.timelineBars}>{flow.activities.map((activity, index) => {
              const finished = index < flow.activityIndex || ["wrap", "done"].includes(flow.phase);
              const current = index === flow.activityIndex && ["running", "break"].includes(flow.phase) && (flow.solo || flow.partner === "present" || flow.soloWhileWaiting);
              const progress = finished ? 100 : current ? Math.max(0, Math.min(100, (1 - flow.remainingSec / (activity.minutes * 60)) * 100)) : 0;
              return <span key={activity.id} style={{flexGrow: Math.max(1, activity.minutes)}} className={`${styles.timelineBar} ${finished ? styles.timelineDone : current ? styles.timelineCurrent : ""}`} title={`${activity.title} · ${activity.minutes} phút`}><span style={{width: `${progress}%`}}/></span>;
            })}</span><span className={styles.timelineEditLabel}>Chỉnh ›</span></button>
          </div>}
          {currentSummary && !currentSummary.feedback_pending && (!flow || !!currentSummary.plan_item_id && (!planCommitments?.both || !!meeting?.pending_version)) && <section className={styles.pinnedSession} aria-label="Phiên học sắp tới">
            <div><strong>📌 {meeting?.id === currentSummary.id && meeting.status === "INVITED" && myMember?.invitation === "INVITED" ? "Bạn nhận được đề nghị học chung" : ongoingMeeting?.id === currentSummary.id ? currentSummary.mode === "solo" ? "Buổi tự học đang diễn ra" : "Phiên học chung đang diễn ra" : currentSummary.mode === "solo" ? "Buổi tự học đã hẹn" : "Phiên học chung đã hẹn"}</strong><span>{currentSummary.goal} · {formatWhen(currentSummary.starts_at)}</span></div>
            {currentSummary.plan_item_id && meeting?.id === currentSummary.id && <div className={styles.commitmentActions}>
              <span>{commitmentsLoading ? "Đang kiểm tra…" : !planCommitments ? "Chưa kiểm tra được cam kết" : !planCommitments.both ? `${planCommitments.mine ? "Bạn đã cam kết" : "Bạn chưa cam kết"} · ${planCommitments.partner ? `${peerName} đã cam kết` : `${peerName} chưa cam kết`}` : meeting.mode === "solo" ? "Timeline tự học đã sẵn sàng" : meeting.pending_version ? !bothMeetingAccepted ? "Đang chờ nhận lời học chung" : pendingConfirmedByMe ? `Đang chờ ${peerName} chốt mục tiêu và timeline` : "Cần chốt mục tiêu và timeline buổi học" : "Mục tiêu và timeline đã chốt ✓"}</span>
              {!planCommitments?.mine && <button type="button" className={styles.commitButton} disabled={busy || commitmentsLoading} onClick={() => void commitCurrentPlan()}>Chốt kế hoạch ban đầu</button>}
              {sessionNeedsMyConfirmation && planCommitments?.both && <button type="button" className={styles.commitButton} disabled={busy} onClick={() => void meetingAction("confirm")}>Chốt mục tiêu & timeline</button>}
              {sessionNeedsMyConfirmation && !!meeting.active_version && meeting.pending_version !== meeting.active_version && <button type="button" className={styles.planLink} disabled={busy} onClick={() => void meetingAction("keep")}>Giữ bản đang dùng</button>}
              <button type="button" className={styles.planLink} onClick={() => setTimelinePreviewOpen(true)}>Xem timeline</button>
            </div>}
            {meeting?.id === currentSummary.id && meeting.pending_version && pendingTimeline && <div className={styles.sessionAgreement}><b>Mục tiêu đề xuất: {pendingTimeline.goal}</b><span>Giờ học: {formatWhen(pendingTimeline.starts_at)} · {Math.round((Date.parse(pendingTimeline.ends_at) - Date.parse(pendingTimeline.starts_at)) / 60000)} phút</span><span>Timeline: {pendingTimeline.segments.map(segment => `${segment.title} ${segment.minutes}′`).join(" · ")}</span></div>}
          </section>}
          {(needsJoin || latestAi || questions?.key === questionContextKey || (meeting && currentSummary && meeting.id === currentSummary.id && (["INVITED", "NEEDS_RECONFIRMATION"].includes(meeting.status) || meeting.mode === "solo" && ["CONFIRMED", "ACTIVE"].includes(meeting.status)))) && <section ref={assistantPanelRef} className={styles.assistantPanel} aria-label="Cú Bridge điều phối buổi học">
            <strong className={styles.assistantTitle}><OwlAvatar size={25}/>Cú Bridge</strong>
            {questions?.key === questionContextKey && !needsJoin && <div className={styles.owlQuestions}><strong>Thử hỏi {peerName}</strong>{questions.items.map((question, index) => <button type="button" key={`${index}-${question}`} onClick={() => setText(question)}>{question}<span>Chọn ›</span></button>)}</div>}
            {questions?.key !== questionContextKey && !needsJoin && meeting && currentSummary && meeting.id === currentSummary.id && meeting.mode === "solo" && ["CONFIRMED", "ACTIVE"].includes(meeting.status) && now < Date.parse(meeting.ends_at) && <div className={`${styles.bubble} ${styles.aiMessage}`}><small><OwlAvatar size={21}/>Cú Bridge</small>
              {meeting.creator_id === userId ? peerMember?.invitation === "REQUESTED" ? <><p>{peerName} muốn tham gia buổi học này.</p><div className={styles.aiChips}><button type="button" disabled={busy || commitmentsLoading || !planCommitments?.both} onClick={() => void participationAction("accept")}>Đồng ý học chung</button><button type="button" disabled={busy} onClick={() => void participationAction("decline")}>Giữ tự học</button></div></> : peerMember?.invitation === "INVITED" ? <p>Đã đề nghị {peerName} học chung; đang chờ phản hồi.</p> : <><p>Timeline tự học đã sẵn sàng. Bạn có thể đề nghị {peerName} học chung.</p><div className={styles.aiChips}><button type="button" disabled={busy || commitmentsLoading || !planCommitments?.both} onClick={() => void participationAction("invite")}>Đề nghị học chung</button></div></>
                : myMember?.invitation === "INVITED" ? <><p>{peerName} đề nghị học chung với bạn.</p><div className={styles.aiChips}><button type="button" disabled={busy || commitmentsLoading || !planCommitments?.both} onClick={() => void participationAction("accept")}>Tham gia</button><button type="button" disabled={busy} onClick={() => void participationAction("decline")}>Để dịp khác</button></div></> : myMember?.invitation === "REQUESTED" ? <p>Đã gửi đề xuất tham gia; đang chờ {peerName} trả lời.</p> : <><p>{peerName} đã lên timeline tự học. Bạn có thể đề xuất học chung.</p><div className={styles.aiChips}><button type="button" disabled={busy || commitmentsLoading || !planCommitments?.both} onClick={() => void participationAction("request")}>Đề xuất tham gia</button></div></>}
              {meeting.plan_item_id && !commitmentsLoading && !planCommitments?.both && <p className={styles.commitmentHint}>Cả hai cần chốt kế hoạch ban đầu một lần trước khi đề nghị hoặc tham gia.</p>}
            </div>}
            {!flow && meeting && meeting.id === currentSummary?.id && ["INVITED", "NEEDS_RECONFIRMATION"].includes(meeting.status) && <div className={`${styles.bubble} ${styles.aiMessage}`}><small><OwlAvatar size={21}/>Cú Bridge</small>{myMember?.invitation === "INVITED" ? <><p>{peerName} đề nghị học chung. Bạn muốn tham gia không?</p><div className={styles.aiChips}><button type="button" disabled={busy} onClick={() => void meetingAction("accept")}>Nhận lời</button><button type="button" disabled={busy} onClick={() => void meetingAction("decline")}>Để dịp khác</button></div></> : meeting.status === "NEEDS_RECONFIRMATION" ? <><p>Lịch học đã đổi. Xác nhận lại giờ học để tiếp tục.</p><div className={styles.aiChips}><button type="button" disabled={busy || (meeting.mode !== "solo" && peerMember?.invitation !== "ACCEPTED")} onClick={() => void meetingAction("reconfirm")}>Xác nhận giờ mới</button></div></> : <p>Đã gửi đề nghị. Bạn học có thể nhận lời khi khung giờ còn tiếp diễn.</p>}</div>}
            {needsJoin && <div className={`${styles.bubble} ${styles.aiMessage}`}><small><OwlAvatar size={21}/>Cú Bridge</small><p>{meeting?.mode === "solo" ? "Đã đến giờ tự học." : peerMember?.joined_at ? `${peerName} đã vào phòng. Vào học cùng nhé.` : "Đã đến giờ học cùng."}</p><div className={styles.aiChips}><button type="button" disabled={busy} onClick={() => void joinMeeting()}>Vào phòng học</button>{meeting?.mode !== "solo" && myMember?.attendance !== "DELAYED" && <button type="button" disabled={busy} onClick={() => void reportLateArrival()}>Báo vào sau 10 phút</button>}</div></div>}
            {!needsJoin && questions?.key !== questionContextKey && (latestAi ? [latestAi] : []).map(item => <div key={item.id} className={styles.assistantMessage}><p>{item.text}</p>{!participationDecisionPending && item.chips && <div className={styles.aiChips}>{item.chips.slice(0, 3).map(chip => <button key={chip.key} type="button" disabled={busy} onClick={() => void selectChip(item, chip.key)}>{chip.label}</button>)}</div>}
              {item.id === latestAiId && item.quiz && !item.chosen && <div className={styles.assistantQuiz}>{!item.quiz.question || quizLoadingKey === `${meetingId ?? "preview"}:${myMember?.joined_at ?? "lobby"}:${item.id}` ? <span>Đang soạn câu hỏi…</span> : <><strong>{item.quiz.question}</strong>{item.quiz.options.map((option, index) => <button key={option} type="button" onClick={() => setFlow(current => current ? answerQuiz(current, item.id, index) : current)}>{option}</button>)}</>}</div>}
              {item.id === latestAiId && item.form === "context" && <form className={styles.assistantForm} onSubmit={event => void submitAssistantContext(event)}><input value={contextDraft.topic} onChange={event => setContextDraft(value => ({...value, topic: event.target.value}))} maxLength={120} required placeholder="Đang trao đổi phần nào?" aria-label="Phần đang trao đổi"/><select value={contextDraft.progress} onChange={event => setContextDraft(value => ({...value, progress: event.target.value}))} aria-label="Tiến độ"><option value="mới bắt đầu">Mới bắt đầu</option><option value="giữa chừng">Giữa chừng</option><option value="gần xong">Gần xong</option></select><select value={contextDraft.blocker} onChange={event => setContextDraft(value => ({...value, blocker: event.target.value}))} aria-label="Khó khăn"><option value="không">Không vướng</option><option value="hơi vướng">Hơi vướng</option><option value="đang bí">Đang bí</option></select><button type="submit">Gửi cho Cú</button></form>}
              {item.id === latestAiId && item.form === "critique" && <form className={styles.assistantForm} onSubmit={event => {event.preventDefault(); setFlow(current => current ? saveCritique(current, critiqueDraft) : current); setCritiqueDraft("");}}><textarea value={critiqueDraft} onChange={event => setCritiqueDraft(event.target.value)} rows={2} maxLength={400} required placeholder="Giải thích ý của bạn trong 2 câu…" aria-label="Giải thích ý của bạn"/><button type="submit">Gửi cho Cú</button></form>}
              {flow?.phase === "wrap" && item.id === latestAiId && item.chips?.some(chip => ["easy", "medium", "hard"].includes(chip.key)) && <input className={styles.wrapNote} value={note} onChange={event => setNote(event.target.value)} maxLength={160} placeholder="Cần cải thiện điều gì? (tùy chọn)" aria-label="Điểm cần cải thiện"/>}
            </div>)}
          </section>}
          <div className={styles.conversationBody} ref={chatBody} aria-live="polite">
            {compactReviews.length > 0 && <button type="button" className={styles.reviewNudge} onClick={() => setReviewMeetingId(compactReviews[0].id)}>Đánh giá buổi trước{compactReviews.length > 1 ? ` · ${compactReviews.length}` : ""}</button>}
            {!flow && currentSummary && !currentSummary.feedback_pending && <div className={styles.inlineSchedule}><strong>{ongoingMeeting?.id === currentSummary.id ? "Đang học" : currentSummary.mode === "solo" ? "Tự học" : "Học cùng"} · {formatWhen(currentSummary.starts_at)}</strong><span>{currentSummary.goal}</span></div>}
            {!flow && !currentSummary && <p className={styles.emptyChat}>Nhắn cho {peerName} hoặc hẹn một buổi học qua menu ⋯.</p>}
            {chatItems.map(item => <div key={item.id} className={`${styles.bubble} ${item.sender_id === userId ? styles.mine : ""}`}>{item.attachment_mime && <PeerChatImage messageId={item.id} token={token}/>} {item.content ? <p>{item.content}</p> : null}</div>)}
            {flow && !flow.solo && meeting && ["wrap", "done"].includes(flow.phase) && onCheckin && <div className={styles.endCheckin}><span>Học xong rồi. Lưu lại buổi học cùng {peerName} bằng một ảnh nhé.</span><button type="button" onClick={onCheckin}>Check-in cuối buổi</button></div>}
            {!flow && currentSummary?.feedback_pending && <div className={styles.reviewCard}><small>Buổi học đã hoàn thành</small><strong>{currentSummary.goal}</strong><span>Bạn thấy nhịp học thế nào?</span><div className={styles.reviewChoices}><button type="button" disabled={busy} onClick={() => void submitReview(currentSummary.id, "same")}>😊 Ổn</button><button type="button" disabled={busy} onClick={() => void submitReview(currentSummary.id, "shorter")}>😐 Ngắn hơn</button><button type="button" disabled={busy} onClick={() => void submitReview(currentSummary.id, "easier")}>😩 Dễ hơn</button></div>{currentSummary.mode !== "solo" && onCheckin && <div className={styles.reviewCheckin}><span>Lưu ảnh của buổi học này vào nhật ký chung.</span><button type="button" onClick={onCheckin}>Check-in cuối buổi</button></div>}</div>}
          </div>
          <form className={styles.messageForm} onSubmit={event => void submitMessage(event)}>
            {imageFile && <div className={styles.imagePreview}>{imagePreview && <img src={imagePreview} alt="Ảnh sắp gửi"/>}<span>{imageFile.name}</span><button type="button" aria-label="Bỏ ảnh đã chọn" onClick={() => {setImageFile(null); if (imageInput.current) imageInput.current.value = "";}}>✕</button></div>}
            <input ref={imageInput} className={styles.attachmentInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => chooseImage(event.target.files?.[0])}/>
            <button type="button" className={styles.attachButton} aria-label="Chọn ảnh" title="Chọn ảnh" disabled={busy} onClick={() => imageInput.current?.click()}>🖼️</button>
            <input value={text} onChange={event => setText(event.target.value)} maxLength={2000} placeholder={imageFile ? "Thêm lời nhắn (tùy chọn)" : "Nhắn cho bạn học..."} aria-label={`Nhắn cho ${peerName}`}/>
            <button className={styles.primary} disabled={busy || (!text.trim() && !imageFile)}>Gửi</button>
          </form>
        </> : <div className={styles.emptyChat}>{!sidebarVisible && <button type="button" className={styles.sidebarToggle} aria-label="Hiện danh sách chat" aria-expanded={sidebarVisible} aria-controls="study-chat-sidebar" onClick={() => setSidebarVisible(true)}><SidebarChevron direction="right" /></button>}<p>Chọn một cuộc trò chuyện để tiếp tục.</p></div>}
      </section>
    </div>
    {dev && <div className={styles.devBar}><span>DEV</span><button type="button" onClick={() => setFlow(current => advanceMinutes(current ?? createFlow(demoActivities), 5))}>Tua +5 phút</button><button type="button" onClick={() => setFlow(current => setPartner(current ?? createFlow(demoActivities), current?.partner === "present" ? "absent" : "present"))}>Bạn vào/ra</button><button type="button" onClick={() => setFlow(current => {const base = current ?? createFlow(demoActivities); const index = Math.min(lockedCount(base.phase, base.activityIndex), base.activities.length - 1); const suggested = base.activities.map((item, position) => position === index ? {...item, title: `${item.title} (đổi cách học)`} : item); return proposeTimeline(base, suggested, timelineDiff(base.activities, suggested), "partner");})}>Bạn đề xuất</button><button type="button" disabled={flow?.proposal?.status !== "pending" || flow.proposal.by !== "me"} onClick={() => setFlow(current => current ? decideTimeline(current, true) : current)}>Bạn đồng ý</button><button type="button" disabled={flow?.proposal?.status !== "pending" || flow.proposal.by !== "me"} onClick={() => setFlow(current => current ? decideTimeline(current, false) : current)}>Bạn từ chối</button><button type="button" onClick={() => {setFlow(createFlow(meeting ? activities : demoActivities)); setNote("");}}>Reset</button></div>}
    <Sheet open={timelinePreviewOpen} onOpenChange={setTimelinePreviewOpen} title="Timeline buổi học">
      {previewTimeline ? <div className={styles.timelineView}>
        <div className={styles.timelineViewIntro}><strong>{previewTimeline.goal}</strong><span>{formatWhen(previewTimeline.starts_at)} · {formatDuration(previewTotalMinutes)} · {meeting?.mode === "solo" ? "Tự học" : `Học cùng ${peerName}`}</span>{previewIsPending && <small>Timeline đề xuất · Đang chờ chốt</small>}</div>
        <ol className={styles.timelineViewSteps}>{previewTimeline.segments.map((item, index) => {
          const offset = previewTimeline.segments.slice(0, index).reduce((sum, step) => sum + step.minutes, 0);
          const startAt = Date.parse(previewTimeline.starts_at) + offset * 60000;
          const isCurrent = previewTimeline.version === meeting?.active_version && (flow?.phase === "running" || flow?.phase === "break") && flow.activityIndex === index;
          const isDone = previewTimeline.version === meeting?.active_version && !!flow && (index < flow.activityIndex || ["wrap", "done"].includes(flow.phase));
          return <li key={`${previewTimeline.version}-${index}`} aria-current={isCurrent ? "step" : undefined} className={`${styles.timelineViewStep} ${isCurrent ? styles.timelineViewCurrent : isDone ? styles.timelineViewDone : ""}`}>
            <span className={styles.timelineViewClock}>{formatClock(startAt)}<small>{formatClock(startAt + item.minutes * 60000)}</small></span>
            <span className={styles.timelineViewDot}>{index + 1}</span>
            <span className={styles.timelineViewContent}><strong>{item.title}</strong>{item.outcome && <small>{item.outcome}</small>}</span>
            <b>{item.minutes}′</b>
          </li>;
        })}{previewBufferMinutes > 0 && <li className={`${styles.timelineViewStep} ${styles.timelineViewBuffer}`}><span className={styles.timelineViewClock}>{formatClock(Date.parse(previewTimeline.starts_at) + previewActivityMinutes * 60000)}<small>{formatClock(Date.parse(previewTimeline.ends_at))}</small></span><span className={styles.timelineViewDot}>·</span><span className={styles.timelineViewContent}><strong>Thời gian đệm</strong></span><b>{previewBufferMinutes}′</b></li>}</ol>
      </div> : <p className={styles.note}>Buổi học này chưa có timeline.</p>}
    </Sheet>
    <Sheet open={timelineOpen} onOpenChange={setTimelineOpen} title="Chỉnh timeline" placement="bottom" initialFocusSelector="input">
      {flow && <div className={styles.timelineEditor}>
        <label className={styles.timelineGoal}><span>Mục tiêu buổi học</span><input value={timelineGoal} maxLength={300} disabled={flow.phase !== "lobby"} onChange={event => {setTimelineGoal(event.target.value); setTimelineError("");}}/></label>
        {flow.phase === "lobby" && <label className={styles.timelineDescription}><span>Mô tả các hoạt động</span><textarea rows={3} maxLength={1300} value={timelineDescription} onChange={event => setTimelineDescription(event.target.value)} placeholder="Mỗi dòng một hoạt động, có thể thêm thời lượng: Ôn bài — 10 phút"/><button type="button" className={styles.secondary} disabled={!timelineDescription.trim()} onClick={generateTimelineDraft}>Tạo timeline từ mô tả</button></label>}
        <p className={styles.timelineTotal}>Tổng: {formatDuration(totalMinutes(flow.activities))} → <strong>{formatDuration(draftTotal)}</strong> / {formatDuration(flow.budgetMinutes)} · Đệm còn {formatDuration(draftBuffer)}</p>
        {timelineDraft.map((item, index) => {const locked = index < draftLocked; return <div key={item.id} className={styles.timelineEditRow}>
          <span className={styles.timelineNumber}>{index + 1}</span>
          <input aria-label={`Tên hoạt động ${index + 1}`} value={item.title} disabled={locked} maxLength={60} onChange={event => changeTimeline(index, {title: event.target.value})}/>
          <button type="button" aria-label={`Giảm 5 phút hoạt động ${index + 1}`} disabled={locked || item.minutes <= 5} onClick={() => changeTimeline(index, {minutes: item.minutes - 5})}>−5</button>
          <span className={styles.timelineMinutes}>{item.minutes}′</span>
          <button type="button" aria-label={`Tăng 5 phút hoạt động ${index + 1}`} disabled={locked} onClick={() => changeTimeline(index, {minutes: item.minutes + 5})}>+5</button>
          <button type="button" aria-label={`Chuyển hoạt động ${index + 1} lên`} disabled={locked || index <= draftLocked} onClick={() => moveTimeline(index, -1)}>↑</button>
          <button type="button" aria-label={`Chuyển hoạt động ${index + 1} xuống`} disabled={locked || index === timelineDraft.length - 1} onClick={() => moveTimeline(index, 1)}>↓</button>
          <button type="button" aria-label={`Xóa hoạt động ${index + 1}`} disabled={locked} onClick={() => setTimelineDraft(rows => rows.filter(row => row.id !== item.id))}>✕</button>
        </div>;})}
        <div className={styles.timelineAdd}><span>+ Thêm</span>{([["Brain storm", "solo", 10], ["Thảo luận", "joint", 10], ["Nghỉ 5′", "break", 5]] as const).map(([title, type, minutes]) => <button key={title} type="button" disabled={timelineDraft.length >= 8} onClick={() => setTimelineDraft(rows => [...rows, {id: `${type}-${crypto.randomUUID()}`, title, minutes, type}])}>{title}</button>)}</div>
        {overBudget && <div className={styles.timelineWarning}>Vượt giờ kết thúc đã hẹn {draftTotal - flow.budgetMinutes} phút. <button type="button" onClick={() => {const shortened = autoShorten(timelineDraft, flow.budgetMinutes, draftLocked); if (shortened) {setTimelineDraft(shortened); setTimelineError("");} else setTimelineError("Không thể rút gọn đủ từ các hoạt động cá nhân. Hãy tự giảm hoặc bỏ bớt hoạt động.");}}>Rút gọn tự động</button></div>}
        {timelineError && <p className={styles.timelineError} role="alert">{timelineError}</p>}
        {flow.proposal?.status === "pending" && <p className={styles.note}>Đang chờ phản hồi cho một đề xuất khác.</p>}
        <div className={styles.timelineActions}><button type="button" className={styles.primary} disabled={busy || flow.proposal?.status === "pending" || !!validateTimeline(flow.activities, timelineDraft, flow.budgetMinutes, draftLocked)} onClick={() => void submitTimeline()}>{flow.solo ? "Lưu timeline" : "Gửi đề xuất"}</button><button type="button" className={styles.secondary} onClick={() => setTimelineOpen(false)}>Hủy</button></div>
      </div>}
    </Sheet>
    <Sheet open={reviewMeetingId !== null} onOpenChange={open => {if (!open) setReviewMeetingId(null);}} title="Đánh giá buổi học" placement="bottom">
      {reviewMeeting && <div className={styles.reviewSheet}><strong>{reviewMeeting.goal}</strong><span>{formatWhen(reviewMeeting.starts_at)}</span><p>Bạn thấy nhịp học thế nào?</p><div className={styles.reviewChoices}><button type="button" disabled={busy} onClick={() => void submitReview(reviewMeeting.id, "same")}>😊 Ổn</button><button type="button" disabled={busy} onClick={() => void submitReview(reviewMeeting.id, "shorter")}>😐 Ngắn hơn</button><button type="button" disabled={busy} onClick={() => void submitReview(reviewMeeting.id, "easier")}>😩 Dễ hơn</button></div>{reviewMeeting.mode !== "solo" && onCheckin && <div className={styles.reviewCheckin}><span>Lưu ảnh của buổi học này vào nhật ký chung.</span><button type="button" onClick={() => {setReviewMeetingId(null); onCheckin();}}>Check-in cuối buổi</button></div>}</div>}
    </Sheet>
    <Sheet open={formOpen} onOpenChange={setFormOpen} title="Lên chi tiết buổi học" initialFocusSelector="input"><form className={styles.form} onSubmit={event => void create(event)}>
      {!planItemId && <p className={styles.note}>Mở một buổi đã chốt giờ trong Kế hoạch để lên timeline.</p>}
      <label>Bạn học<Select className={styles.formSelect} ariaLabel="Bạn học" value={String(peerId)} options={[{value: "0", label: "Chọn bạn học"}, ...peers.map(item => ({value: String(item.peer_match_id), label: personName(item.peer.display_name), icon: <Avatar seed={item.peer.user_id} src={item.peer.avatar_url} size={28}/> }))]} onValueChange={value => setPeerId(Number(value))}/></label>
      <label>Mục tiêu<input value={goal} onChange={event => setGoal(event.target.value)} required minLength={3} maxLength={300} placeholder="Bạn muốn hoàn thành điều gì?"/></label>
      <label>Giờ bắt đầu<input type="datetime-local" value={start} onChange={event => setStart(event.target.value)} required disabled={!!planItemId}/></label>
      {(initialCreate?.scheduled_start ? Date.parse(initialCreate.scheduled_start) + duration * 60000 <= now : !!start && Date.parse(start) + duration * 60000 <= now) && <p className={styles.note} role="status">Khung giờ học đã kết thúc. Hãy đổi giờ trong Kế hoạch để lên chi tiết buổi mới.</p>}
      <label>Thời lượng<Select className={styles.formSelect} ariaLabel="Thời lượng" value={String(duration)} options={[...new Set([25, 50, 75, duration])].map(value => ({value: String(value), label: `${value} phút`}))} disabled={!!planItemId} onValueChange={value => setDuration(Number(value))}/></label>
      <label>Nội dung để tạo timeline<textarea rows={4} maxLength={1300} value={timelineText} onChange={event => setTimelineText(event.target.value)} placeholder={"Mỗi dòng một hoạt động, ví dụ:\nÔn bài cũ — 10 phút\nLàm bài tập — 25 phút\nTổng kết — 10 phút\nĐệm — 5 phút"}/></label>
      <p className={styles.note}>Dòng “Đệm - 5 phút” chừa thời gian dự phòng; khi cần thêm giờ, phần này tự giảm.</p>
      {customTimeline && <div className={styles.timelinePreview}><strong>Timeline tùy chỉnh</strong>{customTimeline.error ? <span className={styles.timelinePreviewError}>{customTimeline.error}</span> : <>{customTimeline.segments.map((item, index) => <span key={index}>{item.title} · {item.minutes} phút</span>)}{customTimeline.buffer > 0 && <span className={styles.timelineBufferPreview}>Đệm · {customTimeline.buffer} phút</span>}</>}</div>}
      <button className={styles.primary} disabled={busy || !peerId || !planItemId || !goal.trim() || !!customTimeline?.error || (initialCreate?.scheduled_start ? Date.parse(initialCreate.scheduled_start) + duration * 60000 <= now : Date.parse(start) + duration * 60000 <= now)}>{busy ? "Đang tạo..." : createMode === "solo" ? "Lưu timeline buổi học" : "Gửi đề nghị học chung"}</button>
    </form></Sheet>
  </div>;
}
