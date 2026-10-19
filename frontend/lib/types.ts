export type Role = "STUDENT" | "INSTRUCTOR";
export type ConnectionStatus = "PENDING" | "MATCHED" | "REJECTED" | "EXPIRED";
export type ModerationAction = "ALLOW" | "GUIDE" | "WARN" | "BLOCK" | "ESCALATE";
export type Intent = "serious" | "friends" | "conversation" | "activity";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  display_name: string;
<<<<<<< HEAD
  intent: Intent;
}

export interface AuthResponse {
=======
  age: number;
  city: string;
  intent: Intent;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  user_id: number;
}

export interface Profile {
  user_id: number;
  display_name: string;
  bio: string;
<<<<<<< HEAD
  learning_style?: Record<string, string>;
  avatar_url?: string;
  study_year?: string;
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  school: string;
  major: string;
  subjects: string[];
  learning_goals: string[];
}

export interface HelpNeed {
  id?: number;
  user_id?: number;
  topic: string;
  description: string;
  current_level: string;
  target_outcome: string;
}

export interface HelpOffer {
  id?: number;
  user_id?: number;
  topic: string;
  description: string;
  proficiency_level: string;
  max_sessions_per_week: number;
}

export interface Availability {
  id?: number;
  user_id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface ProfileMeResponse {
  profile: Profile;
  needs_help_with: HelpNeed[];
  can_help_with: HelpOffer[];
  availability: Availability[];
}

export interface ProfileMeUpdate {
  profile: Omit<Profile, "user_id">;
  needs_help_with: Omit<HelpNeed, "id" | "user_id">[];
  can_help_with: Omit<HelpOffer, "id" | "user_id">[];
  availability: Omit<Availability, "id" | "user_id">[];
}

export interface MatchSearchCandidate {
<<<<<<< HEAD
  is_seed?: boolean;
  goal_topic?: string;
  goal_duration_days?: number | null;
  learning_goals?: string[];
  bio?: string;
  needs?: string[];
  strengths?: string[];
  availability?: Availability[];
  reasons?: string[];
  match_highlight?: string;
  request_id: number;
  candidate_id: number;
  display_name: string;
  learning_style?: Record<string, string>;
  avatar_url?: string;
  study_year?: string;
=======
  learning_goals?: string[]; bio?: string; needs?: string[]; strengths?: string[]; availability?: Availability[]; reasons?: string[];
  request_id: number;
  candidate_id: number;
  display_name: string;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  school: string;
  major: string;
  total_score: number;
  component_scores: Record<string, number>;
  rank: number;
<<<<<<< HEAD
  match_tier?: string;
  match_badge?: string;
  match_subtitle?: string;
  is_uncertain?: boolean;
  deadline_level?: string;
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}

export interface MatchSearchResponse {
  matching_mode?: string;
  request_id: number;
  candidates: MatchSearchCandidate[];
}

export interface ConnectionCreateRequest {
  recipient_id: number;
}

<<<<<<< HEAD
export interface FriendLinkPreview {
  owner_id: number;
  display_name: string;
  is_self: boolean;
  connected: boolean;
  pending: boolean;
}

export interface EmailConnectionPreview {
  user_id: number;
  display_name: string;
  school?: string;
  major?: string;
  bio?: string;
  avatar_url?: string;
  learning_goal?: string;
  is_self: boolean;
  connected: boolean;
  pending: boolean;
}

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
export interface ConnectionResponse {
  id: number | null;
  requester_id: number;
  recipient_id: number;
  status: ConnectionStatus;
  created_at: string | null;
  responded_at: string | null;
  peer_match_id: number | null;
}

export interface ConnectionPeerProfile {
  user_id: number;
  display_name: string;
<<<<<<< HEAD
  learning_style?: Record<string, string>;
  avatar_url?: string;
  study_year?: string;
  school: string;
  major: string;
  bio?: string;
  can_help_with?: HelpOffer[];
=======
  school: string;
  major: string;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}

export interface ConnectionRequestSummary {
  id: number;
  requester_id: number;
  recipient_id: number;
  status: ConnectionStatus;
<<<<<<< HEAD
  source: "discovery" | "friend_link";
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  created_at: string;
  responded_at: string | null;
  peer: ConnectionPeerProfile;
}

export interface ConnectedPeerSummary {
  peer_match_id: number;
  connection_request_id: number;
  requester_id: number;
  recipient_id: number;
  connected_at: string;
  peer: ConnectionPeerProfile;
}

export interface ConnectionsResponse {
  incoming: ConnectionRequestSummary[];
  sent: ConnectionRequestSummary[];
  connected: ConnectedPeerSummary[];
}

export interface StudySessionCreateRequest {
  peer_match_id: number;
  learner_id: number;
  helper_id: number;
  topic: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
}

export interface StudySession {
  id: number | null;
  peer_match_id: number;
  learner_id: number;
  helper_id: number;
  topic: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChatMessage {
  id: number | null;
  session_id: number;
  sender_id: number;
  content: string;
  created_at: string | null;
}

export interface StudySessionResponse extends StudySession {
  icebreaker_eligible?: boolean;
  chat_messages: ChatMessage[];
}

export interface StudySessionListResponse {
  items: StudySession[];
  count: number;
}

// Client input for deriving participants from a connected peer, not a REST body.
export type StudySessionFromConnectionRequest = Pick<
  StudySessionCreateRequest,
  "learner_id" | "topic" | "scheduled_start" | "scheduled_end"
>;

export interface AgentInput {
  session_id: string;
  message_id: string;
  sender_id: string;
  message: string;
  course_id: string;
  conversation_history: Array<{ sender_id: string; message: string }>;
}

export interface AgentOutput {
  action: ModerationAction;
  risk_score: number;
  reason: string;
  guidance: string | null;
  needs_human_review: boolean;
  retrieved_sources: string[];
}

export type SocketEventType =
  | "CHAT_MESSAGE"
  | "MODERATION_RESULT"
  | "GUIDANCE"
  | "WARNING"
  | "SESSION_STATUS";

export type {
  CoachDecision, GeneratePlan, GeneratePlanResult, PersonalPlan, PlanItem, PlanMember,
  PlanProposal, PlanSetup, PlanView, PlanWindow, ReplanBudget,
} from "./plan-types";
