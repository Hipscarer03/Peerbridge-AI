import type {
<<<<<<< HEAD
  ConnectionCreateRequest,
  ConnectionResponse,
  EmailConnectionPreview,
  FriendLinkPreview,
=======
  ConnectedPeerSummary,
  ConnectionCreateRequest,
  ConnectionResponse,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  ConnectionsResponse,
  CoachDecision,
  GeneratePlan,
  GeneratePlanResult,
  LoginRequest,
  MatchSearchResponse,
  ProfileMeResponse,
  ProfileMeUpdate,
  PlanProposal,
  PlanSetup,
  PlanView,
  RegisterRequest,
<<<<<<< HEAD
  AuthResponse,
} from "@/lib/types";
import type { Checkin, CheckinFeed } from "@/lib/checkin-types";
import type { AiStats, HomeOverview, NotificationList } from "@/lib/home-types";
import type { CreateStudyMeeting, PeerStudyMessage, PeerUnread, StudyFacilitatorResponse, StudyMeeting, StudyMeetingSummary, StudySegment, StudySuggestion } from "@/lib/study-meetings";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
export const COOKIE_SESSION_TOKEN = "__cookie_session__";

export type CoachChatMessage = {id: number; role: "user" | "assistant"; content: string; created_at: string};
export type CoachChatResponse = {items: CoachChatMessage[]; context?: Record<string, unknown>; reply?: CoachChatMessage};
export type CoachCase = {id: string; kind: "late_lesson" | "overload" | "missed_shared" | "waiting_peer" | "pacing_slow" | "pacing_fast" | "timeline_reminder"; pair_id: number; item_id: string | null; meeting_id: number | null; peer_name: string; label: string; title: string; body: string; action: string; priority: number; tone: "pink" | "blue" | "yellow"; stage: string; reason: string; care_message: string | null};
=======
  StudySession,
  StudySessionCreateRequest,
  StudySessionFromConnectionRequest,
  StudySessionListResponse,
  StudySessionResponse,
  TokenResponse,
} from "@/lib/types";
import type { Checkin, CheckinFeed } from "@/lib/checkin-types";
import type { AiStats, HomeOverview, NotificationList } from "@/lib/home-types";
import type { AdminOverview, AdminSessionDetail, AdminSessionRow, SessionReview, WhoAmI } from "@/lib/admin-types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

type ApiOptions = RequestInit & { token?: string };

const unauthorizedListeners = new Set<(token: string) => void>();

export function subscribeToUnauthorized(listener: (token: string) => void): () => void {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

<<<<<<< HEAD
const fieldNames: Record<string, string> = {
  email: "Email", password: "Mật khẩu", new_password: "Mật khẩu mới",
  display_name: "Tên hiển thị", learning_goals: "Mục tiêu học tập",
  content: "Nội dung", topic: "Chủ đề", note: "Ghi chú",
};

function validationMessage(item: unknown): string {
  if (!item || typeof item !== "object") return "Thông tin chưa hợp lệ. Hãy kiểm tra lại.";
  const error = item as { loc?: unknown; msg?: unknown; type?: unknown; ctx?: unknown };
  const key = Array.isArray(error.loc) ? String(error.loc[error.loc.length - 1]) : "";
  const field = fieldNames[key] || "Thông tin này";
  const type = String(error.type || "");
  const ctx = error.ctx && typeof error.ctx === "object" ? error.ctx as Record<string, unknown> : {};
  if (type === "missing") return `Hãy nhập ${field.toLowerCase()}.`;
  if (type === "string_too_short") return `${field} cần ít nhất ${ctx.min_length ?? 1} ký tự.`;
  if (type === "string_too_long") return `${field} không được quá ${ctx.max_length ?? 128} ký tự.`;
  if (type === "value_error" && typeof error.msg === "string" && /[À-ỹ]/u.test(error.msg)) return error.msg.replace(/^Value error,\s*/i, "");
  return `${field} chưa hợp lệ. Hãy kiểm tra lại.`;
}

function formatApiError(body: unknown, status: number) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") {
      if (detail === "Not Found") return "Không tìm thấy chức năng này. Hãy tải lại trang hoặc thử sau.";
      if (detail === "Method Not Allowed") return "Chức năng này chưa sẵn sàng. Hãy thử lại sau.";
      if (detail === "Internal Server Error") return "Máy chủ đang gặp lỗi. Hãy thử lại sau.";
      if (!/[À-ỹ]/u.test(detail)) return "Chưa thực hiện được. Hãy kiểm tra thông tin và thử lại.";
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map(validationMessage).join("; ");
    }
  }
  if (status === 404) return "Không tìm thấy thông tin cần xem. Hãy thử lại.";
  if (status === 422) return "Thông tin chưa hợp lệ. Hãy kiểm tra lại.";
  if (status === 429) return "Bạn thao tác quá nhanh. Hãy chờ một lúc rồi thử lại.";
  if (status >= 500) return "Máy chủ đang gặp lỗi. Hãy thử lại sau.";
  return "Chưa thực hiện được. Hãy thử lại.";
=======
function formatApiError(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) return String((item as { msg: unknown }).msg);
          return String(item);
        })
        .join("; ");
    }
  }
  if (typeof body === "string" && body.trim()) return body;
  return fallback;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...init } = options;
  // FormData (ảnh) tự đặt Content-Type multipart; chỉ JSON mới cần header này.
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
<<<<<<< HEAD
    credentials: "include",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token && token !== COOKIE_SESSION_TOKEN ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }).catch(() => { throw new ApiError(0, "Không kết nối được máy chủ. Hãy thử lại."); });
=======
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) as unknown : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedListeners.forEach((listener) => listener(token));
    }
<<<<<<< HEAD
    throw new ApiError(response.status, formatApiError(body, response.status));
=======
    throw new ApiError(response.status, formatApiError(body, `API ${response.status}`));
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  }
  return body as T;
}

export const api = {
<<<<<<< HEAD
  coachChat: (token: string) => request<CoachChatResponse>("/api/v1/coach/0/chat", {token}),
  coachCases: (token: string) => request<{items: CoachCase[]}>("/api/v1/coach/cases", {token}),
  coachCaseAction: (token: string, id: string, action: string, detail = "") => request<{items: CoachCase[]}>(`/api/v1/coach/cases/${encodeURIComponent(id)}/action`, {token, method: "POST", body: JSON.stringify({action, detail})}),
  sendCoachMessage: (token: string, message: string) => request<CoachChatResponse>("/api/v1/coach/0/chat", {token, method: "POST", body: JSON.stringify({message})}),
  studyMeetings: (token: string) => request<StudyMeetingSummary[]>("/api/v1/study-meetings", {token}),
  peerStudyMessages: (token: string, pair: number) => request<PeerStudyMessage[]>(`/api/v1/study-meetings/peers/${pair}/messages`, {token}),
  peerStudyUnread: (token: string) => request<PeerUnread>("/api/v1/study-meetings/peers/unread", {token}),
  markPeerStudyRead: (token: string, pair: number, through_id: number) => request<{last_read_message_id:number}>(`/api/v1/study-meetings/peers/${pair}/read`, {token, method:"POST", body:JSON.stringify({through_id})}),
  sendPeerStudyMessage: (token: string, pair: number, content: string, client_key: string) => request<PeerStudyMessage>(`/api/v1/study-meetings/peers/${pair}/messages`, {token, method:"POST", body:JSON.stringify({content,client_key})}),
  sendPeerStudyImage: (token: string, pair: number, file: File, content: string, client_key: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("content", content);
    body.append("client_key", client_key);
    return request<PeerStudyMessage>(`/api/v1/study-meetings/peers/${pair}/images`, {token, method:"POST", body});
  },
  studyMeeting: (token: string, id: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}`, {token}),
  createStudyMeeting: (token: string, payload: CreateStudyMeeting) => request<StudyMeeting>("/api/v1/study-meetings", {token, method:"POST", body:JSON.stringify(payload)}),
  studyParticipation: (token: string, id: number, action: "invite" | "request" | "accept" | "decline") => request<StudyMeeting>(`/api/v1/study-meetings/${id}/participation`, {token, method:"POST", body:JSON.stringify({action})}),
  studyInvitation: (token: string, id: number, accept: boolean) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/invitation`, {token, method:"POST", body:JSON.stringify({accept})}),
  studyTimeline: (token: string, id: number, payload: {expected_version:number;goal:string;source_text?:string;starts_at:string;ends_at:string;segments:StudySegment[]}) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/timeline`, {token, method:"PUT", body:JSON.stringify(payload)}),
  confirmStudyTimeline: (token: string, id: number, version: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/timeline/${version}/confirm`, {token, method:"POST"}),
  rejectStudyTimeline: (token: string, id: number, version: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/timeline/${version}/reject`, {token, method:"POST"}),
  reconfirmStudyMeeting: (token: string, id: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/reconfirm`, {token, method:"POST"}),
  studyAttendance: (token: string, id: number, status: string, eta?: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/attendance`, {token, method:"POST", body:JSON.stringify({status,eta:eta || null})}),
  joinStudyMeeting: (token: string, id: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/join`, {token, method:"POST"}),
  studyHeartbeat: (token: string, id: number) => request<{server_now:string}>(`/api/v1/study-meetings/${id}/heartbeat`, {token, method:"POST"}),
  studyPersonalGoal: (token: string, id: number, goal: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/my-goal`, {token, method:"POST", body:JSON.stringify({goal})}),
  advanceStudyActivity: (token: string, id: number, expected_segment: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/advance`, {token, method:"POST", body:JSON.stringify({expected_segment})}),
  studyWaiting: (token: string, id: number, action: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/waiting`, {token, method:"POST", body:JSON.stringify({action})}),
  studyAssistantState: (token: string, id: number, payload: {context:{topic:string;progress:string;blocker:string};level:"dễ"|"vừa"|"khó";improve:string;catchup_action?:"none"|"summary"|"quiz"|"read"}) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/assistant-state`, {token, method:"POST", body:JSON.stringify(payload)}),
  studyFacilitatorQuiz: (token: string, id: number, payload: {trigger:"quiz_dau_gio"|"quiz_cuoi_gio"|"tre_gio";index:number;level:"dễ"|"vừa"|"khó";context:{topic:string;progress:string;blocker:string};chat_tail:string[];asked:string[]}) => request<StudyFacilitatorResponse>(`/api/v1/study-meetings/${id}/facilitator-quiz`, {token, method:"POST", body:JSON.stringify(payload)}),
  studyFacilitatorQuestions: (token: string, id: number) => request<{questions:string[];source:"chat"|"activity"}>(`/api/v1/study-meetings/${id}/facilitator-questions`, {token, method:"POST"}),
  shiftStudyMilestone: (token: string, id: number, expected_segment: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/shift-current`, {token, method:"POST", body:JSON.stringify({expected_segment})}),
  sendStudyMessage: (token: string, id: number, content: string, client_key: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/messages`, {token, method:"POST", body:JSON.stringify({content,client_key})}),
  studySuggestion: (token: string, id: number, kind: string, selected_input: string, request_key: string) => request<StudySuggestion>(`/api/v1/study-meetings/${id}/suggestions`, {token, method:"POST", body:JSON.stringify({kind,selected_input,request_key})}),
  shareStudySuggestion: (token: string, id: number, suggestion: number, content: string, client_key: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/suggestions/${suggestion}/share`, {token, method:"POST", body:JSON.stringify({content,client_key})}),
  reportStudySuggestion: (token: string, id: number, suggestion: number) => request<{reported:boolean}>(`/api/v1/study-meetings/${id}/suggestions/${suggestion}/report`, {token, method:"POST", body:JSON.stringify({reason:""})}),
  studyOutcome: (token: string, id: number, text: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/outcome`, {token, method:"POST", body:JSON.stringify({text})}),
  studyFeedback: (token: string, id: number, choice: string) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/feedback`, {token, method:"POST", body:JSON.stringify({choice})}),
  finishStudyMeeting: (token: string, id: number) => request<StudyMeeting>(`/api/v1/study-meetings/${id}/finish`, {token, method:"POST"}),
  cancelStudyMeeting: (token: string, id: number, message = "") => request<StudyMeeting>(`/api/v1/study-meetings/${id}/cancel`, {token, method:"POST", body:JSON.stringify({message})}),
  uploadAvatar: (token: string, file: File) => { const body = new FormData(); body.append("file", file); return request<{avatar_url: string}>("/api/v1/profiles/me/avatar", {token, method: "POST", body}); },
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  home: (token: string) => request<HomeOverview>("/api/v1/home", { token }),
  notifications: (token: string) => request<NotificationList>("/api/v1/notifications?limit=20", { token }),
  readNotifications: (token: string, ids?: number[]) => request<{ unread: number }>("/api/v1/notifications/read", { token, method: "POST", body: JSON.stringify({ ids: ids ?? null }) }),
  aiStats: (token: string, days = 7) => request<AiStats>(`/api/v1/checkins/stats?days=${days}`, { token }),
  checkinFeed: (token: string) => request<CheckinFeed>("/api/v1/pairs/me/feed", { token }),
  checkin: (token: string, id: string) => request<Checkin>(`/api/v1/checkins/${encodeURIComponent(id)}`, { token }),
<<<<<<< HEAD
  createPhotoCheckin: (token: string, id: string, image: Blob, note: string, planItemId?: string) => {
=======
  createPhotoCheckin: (token: string, id: string, image: Blob, note: string) => {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    const form = new FormData();
    form.append("id", id);
    form.append("image", image, "checkin.jpg");
    if (note.trim()) form.append("note", note.trim());
<<<<<<< HEAD
    if (planItemId) form.append("plan_item_id", planItemId);
    return request<Checkin>("/api/v1/checkins", { token, method: "POST", body: form });
  },
  createTextCheckin: (token: string, id: string, note: string, planItemId?: string) => request<Checkin>("/api/v1/checkins/text", { token, method: "POST", body: JSON.stringify({ id, note, plan_item_id: planItemId || null }) }),
  planNotes: (token: string, pair: number, itemId?: string) => request<{items: {id: number; user_id: number; display_name: string; text: string; created_at: string; plan_item_id?: string | null}[]}>(`/api/v1/plans/${pair}/notes${itemId ? `?item_id=${encodeURIComponent(itemId)}` : ""}`, { token }),
  generatePersonalPlan: (token: string, payload: import("./plan-types").PersonalPlanInput, key: string) => request("/api/v1/plans/generate-personal", {token, method: "POST", headers: {"Idempotency-Key": key}, body: JSON.stringify(payload)}),
  expandPlanLessons: (token: string, pair: number, version: number) => request(`/api/v1/plans/${pair}/expand-lessons`, {token, method: "POST", body: JSON.stringify({expected_version: version})}),
  addPlanLesson: (token: string, pair: number, version: number, payload: import("./plan-types").LessonInput) => request<{item_id: string}>(`/api/v1/plans/${pair}/items`, {token, method: "POST", body: JSON.stringify({expected_version: version, ...payload})}),
  reorderPlanLessons: (token: string, pair: number, version: number, item_ids: string[]) => request(`/api/v1/plans/${pair}/items/order`, {token, method: "PUT", body: JSON.stringify({expected_version: version, item_ids})}),
  editPlanLesson: (token: string, pair: number, item: string, version: number, payload: import("./plan-types").LessonInput) => request<{item_id: string}>(`/api/v1/plans/${pair}/items/${item}`, {token, method: "PATCH", body: JSON.stringify({expected_version: version, ...payload})}),
  deletePlanLesson: (token: string, pair: number, item: string, version: number) => request(`/api/v1/plans/${pair}/items/${item}`, {token, method: "DELETE", body: JSON.stringify({expected_version: version})}),
  addPlanNote: (token: string, pair: number, text: string, itemId?: string) => request(`/api/v1/plans/${pair}/notes`, { token, method: "POST", body: JSON.stringify({text, plan_item_id: itemId || null}) }),
  registerStudyTogether: (token: string, pair: number, item: string, enabled: boolean) => request(`/api/v1/plans/${pair}/items/${encodeURIComponent(item)}/together`, {token, method: "PUT", body: JSON.stringify({enabled})}),
=======
    return request<Checkin>("/api/v1/checkins", { token, method: "POST", body: form });
  },
  createTextCheckin: (token: string, id: string, note: string, planItemId?: string) => request<Checkin>("/api/v1/checkins/text", { token, method: "POST", body: JSON.stringify({ id, note, plan_item_id: planItemId || null }) }),
  planNotes: (token: string, pair: number) => request<{items: {id: number; user_id: number; display_name: string; text: string; created_at: string}[]}>(`/api/v1/plans/${pair}/notes`, { token }),
  addPlanNote: (token: string, pair: number, text: string) => request(`/api/v1/plans/${pair}/notes`, { token, method: "POST", body: JSON.stringify({text}) }),
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  confirmCheckin: (token: string, id: string, planItemId: string | null) => request<Checkin>(`/api/v1/checkins/${encodeURIComponent(id)}/confirm`, { token, method: "POST", body: JSON.stringify({ plan_item_id: planItemId }) }),
  reactCheckin: (token: string, id: string, body: { emoji?: string; comment?: string }) => request<Checkin>(`/api/v1/checkins/${encodeURIComponent(id)}/reactions`, { token, method: "POST", body: JSON.stringify(body) }),
  nudgePartner: (token: string, pairId: number) => request<{ message: string }>(`/api/v1/pairs/${pairId}/nudge`, { token, method: "POST" }),
  planCommitments: (token: string, pair: number) => request<{mine: boolean; partner: boolean; both: boolean}>(`/api/v1/plans/${pair}/commitments`, { token }),
  commitPlan: (token: string, pair: number) => request<{mine: boolean; partner: boolean; both: boolean}>(`/api/v1/plans/${pair}/commit`, { token, method: "POST" }),
  planSetup: (token: string, pair: number) => request<PlanSetup>(`/api/v1/plans/${pair}/setup`, { token }),
  plan: (token: string, pair: number) => request<PlanView>(`/api/v1/plans/${pair}`, { token }),
  generatePlan: (token: string, payload: GeneratePlan, key: string) => request<GeneratePlanResult>("/api/v1/plans/generate", { token, method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(payload) }),
<<<<<<< HEAD
  editPlanSchedule: (token: string, pair: number, item: string, version: number, scheduled_start: string, minutes: number, confirm_buffer = false) => request(`/api/v1/plans/${pair}/items/${item}/schedule`, {token, method: "PATCH", body: JSON.stringify({expected_version:version,scheduled_start,minutes,confirm_buffer})}),
  editPlanSchedules: (token: string, pair: number, version: number, items: {item_id: string; scheduled_start: string}[], confirm_buffer = false) => request(`/api/v1/plans/${pair}/schedule`, {token, method: "PATCH", body: JSON.stringify({expected_version:version,items,confirm_buffer})}),
  replan: (token: string, pair: number, version: number, choice: import("./plan-types").ReplanChoice = {mode: "weekly"}) => request<PlanProposal>(`/api/v1/plans/${pair}/replan`, { token, method: "POST", body: JSON.stringify({ expected_version: version, reduce_load: choice.mode === "weekly", ...choice }) }),
  decideReplan: (token: string, pair: number, proposal: number, version: number, accept: boolean) => request<{ applied: boolean; duplicate: boolean }>(`/api/v1/plans/${pair}/proposals/${proposal}/${accept ? "accept" : "reject"}`, { token, method: "POST", body: JSON.stringify({ expected_version: version }) }),
  evaluateCoach: (token: string, pair: number) => request<CoachDecision>(`/api/v1/coach/${pair}/evaluate`, { token, method: "POST" }),
  register: (payload: RegisterRequest) => request<AuthResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: LoginRequest) => request<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  requestPasswordReset: (email: string) => request<{message: string}>("/api/v1/auth/password-reset/request", { method: "POST", body: JSON.stringify({email}) }),
  confirmPasswordReset: (token: string, new_password: string) => request<void>("/api/v1/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({token, new_password}) }),
  restoreSession: () => request<AuthResponse>("/api/v1/auth/session"),
  upgradeSession: (token: string) => request<AuthResponse>("/api/v1/auth/session", { method: "POST", token }),
  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),
  profile: (token: string) => request<ProfileMeResponse>("/api/v1/profiles/me", { token }),
  updateProfile: (token: string, payload: ProfileMeUpdate) => request<ProfileMeResponse>("/api/v1/profiles/me", { method: "PUT", token, body: JSON.stringify(payload) }),
  searchMatches: (token: string, expanded = false) => request<MatchSearchResponse>(`/api/v1/matches/search${expanded ? "?expanded=true" : ""}`, { method: "POST", token }),
  matchResult: (token: string, requestId: number) => request<MatchSearchResponse>(`/api/v1/matches/${requestId}`, { token }),
  listConnections: (token: string) => request<ConnectionsResponse>("/api/v1/connections", { token }),
  findConnectionByEmail: (token: string, email: string) => request<EmailConnectionPreview>("/api/v1/connections/email/lookup", {method:"POST", token, body:JSON.stringify({email})}),
  createFriendLink: (token: string) => request<{token:string}>("/api/v1/connections/invite-link", {method:"POST", token}),
  previewFriendLink: (token: string, code: string) => request<FriendLinkPreview>(`/api/v1/connections/invite-link/${encodeURIComponent(code)}`, {token}),
  requestFriendLink: (token: string, code: string) => request<ConnectionResponse>(`/api/v1/connections/invite-link/${encodeURIComponent(code)}/request`, {method:"POST", token}),
  requestConnection: (token: string, payload: ConnectionCreateRequest) => request<ConnectionResponse>("/api/v1/connections", { method: "POST", token, body: JSON.stringify(payload) }),
  acceptConnection: (token: string, id: number) => request<ConnectionResponse>(`/api/v1/connections/${id}/accept`, { method: "POST", token }),
  rejectConnection: (token: string, id: number) => request<ConnectionResponse>(`/api/v1/connections/${id}/reject`, { method: "POST", token }),
  moderationQueue: (token: string) => request("/instructor/moderation", { token }),
  reviewModeration: (token: string, id: string, payload: unknown) => request(`/instructor/moderation/${id}/review`, { method: "POST", token, body: JSON.stringify(payload) }),
};
=======
  editPlanSchedule: (token: string, pair: number, item: string, version: number, scheduled_start: string, minutes: number) => request(`/api/v1/plans/${pair}/items/${item}/schedule`, {token, method: "PATCH", body: JSON.stringify({expected_version:version,scheduled_start,minutes})}),
  replan: (token: string, pair: number, version: number) => request<PlanProposal>(`/api/v1/plans/${pair}/replan`, { token, method: "POST", body: JSON.stringify({ expected_version: version, reduce_load: true }) }),
  decideReplan: (token: string, pair: number, proposal: number, version: number, accept: boolean) => request<{ applied: boolean; duplicate: boolean }>(`/api/v1/plans/${pair}/proposals/${proposal}/${accept ? "accept" : "reject"}`, { token, method: "POST", body: JSON.stringify({ expected_version: version }) }),
  evaluateCoach: (token: string, pair: number) => request<CoachDecision>(`/api/v1/coach/${pair}/evaluate`, { token, method: "POST" }),
  register: (payload: RegisterRequest) => request<TokenResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  demoInfo: () => request<{ enabled: boolean; accounts: { slug: string; name: string }[] }>("/api/v1/demo"),
  demoLogin: (slug: string) => request<TokenResponse>(`/api/v1/demo/login/${slug}`, { method: "POST" }),
  login: (payload: LoginRequest) => request<TokenResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  profile: (token: string) => request<ProfileMeResponse>("/api/v1/profiles/me", { token }),
  updateProfile: (token: string, payload: ProfileMeUpdate) => request<ProfileMeResponse>("/api/v1/profiles/me", { method: "PUT", token, body: JSON.stringify(payload) }),
  searchMatches: (token: string) => request<MatchSearchResponse>("/api/v1/matches/search", { method: "POST", token }),
  matchResult: (token: string, requestId: number) => request<MatchSearchResponse>(`/api/v1/matches/${requestId}`, { token }),
  listConnections: (token: string) => request<ConnectionsResponse>("/api/v1/connections", { token }),
  requestConnection: (token: string, payload: ConnectionCreateRequest) => request<ConnectionResponse>("/api/v1/connections", { method: "POST", token, body: JSON.stringify(payload) }),
  acceptConnection: (token: string, id: number) => request<ConnectionResponse>(`/api/v1/connections/${id}/accept`, { method: "POST", token }),
  rejectConnection: (token: string, id: number) => request<ConnectionResponse>(`/api/v1/connections/${id}/reject`, { method: "POST", token }),
  listSessions: (token: string) => request<StudySessionListResponse>("/api/v1/sessions", { token }),
  createSession: (token: string, payload: StudySessionCreateRequest) => request<StudySessionResponse>("/api/v1/sessions", { method: "POST", token, body: JSON.stringify(payload) }),
  createSessionFromConnection: async (token: string, connection: ConnectedPeerSummary, details: StudySessionFromConnectionRequest): Promise<StudySessionResponse> => {
    const { peer_match_id, requester_id, recipient_id } = connection;
    if (![peer_match_id, requester_id, recipient_id].every(isPositiveInteger) || requester_id === recipient_id) {
      throw new TypeError("A valid connected peer is required to create a study session.");
    }
    if (details.learner_id !== requester_id && details.learner_id !== recipient_id) {
      throw new TypeError("The learner must be a member of the connected peer match.");
    }
    // The backend still validates the authenticated user's membership and role.
    return api.createSession(token, {
      peer_match_id,
      learner_id: details.learner_id,
      helper_id: details.learner_id === requester_id ? recipient_id : requester_id,
      topic: details.topic,
      scheduled_start: details.scheduled_start,
      scheduled_end: details.scheduled_end,
    });
  },
  session: (token: string, id: string | number) => request<StudySessionResponse>(`/api/v1/sessions/${encodeURIComponent(String(id))}`, { token }),
  whoami: (token: string) => request<WhoAmI>("/api/v1/admin/me", { token }),
  sessionReview: (token: string, id: number) => request<{ review: SessionReview | null }>(`/api/v1/sessions/${id}/review`, { token }),
  createSessionReview: (token: string, id: number) => request<{ review: SessionReview | null }>(`/api/v1/sessions/${id}/review`, { method: "POST", token }),
  adminOverview: (token: string) => request<AdminOverview>("/api/v1/admin/overview", { token }),
  adminSessions: (token: string) => request<{ items: AdminSessionRow[]; count: number }>("/api/v1/admin/sessions", { token }),
  adminSession: (token: string, id: number) => request<AdminSessionDetail>(`/api/v1/admin/sessions/${id}`, { token }),
  adminReviewSession: (token: string, id: number) => request<{ review: SessionReview | null }>(`/api/v1/admin/sessions/${id}/review`, { method: "POST", token }),
  moderationQueue: (token: string) => request("/instructor/moderation", { token }),
  reviewModeration: (token: string, id: string, payload: unknown) => request(`/instructor/moderation/${id}/review`, { method: "POST", token, body: JSON.stringify(payload) }),
};

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/** UI eligibility only: the WebSocket backend remains the authorization authority. */
export function canJoinStudySession(session: StudySession, userId: number): boolean {
  return session.id !== null && isPositiveInteger(session.id)
    && isPositiveInteger(userId)
    && (session.learner_id === userId || session.helper_id === userId);
}

export function studyRoomSocket(sessionId: string, token: string) {
  const base = API_URL.replace(/^http/, "ws");
  return new WebSocket(`${base}/ws/sessions/${sessionId}?token=${encodeURIComponent(token)}`);
}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
