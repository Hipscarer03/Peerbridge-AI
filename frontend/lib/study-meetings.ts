export type StudySegment = { title: string; minutes: number; outcome: string; role_a: "learner" | "guide" | "peer"; role_b: "learner" | "guide" | "peer" };
export type StudyMember = { meeting_id: number; user_id: number; display_name: string; invitation: "INVITED" | "ACCEPTED" | "DECLINED" | "SOLO" | "REQUESTED"; role: "learner" | "guide" | "peer"; learning_goal: string; attendance: string; eta: string | null; joined_at: string | null; last_seen: string | null; waiting_action: string | null; finished_at: string | null; outcome: string; feedback: string | null };
export type StudyTimeline = { meeting_id: number; version: number; goal: string; starts_at: string; ends_at: string; segments: StudySegment[]; proposer_id: number; created_at: string };
export type StudyMessage = { id: number; sender_id: number; content: string; created_at: string };
export type PeerStudyMessage = StudyMessage & {
  peer_match_id: number;
  client_key: string;
  attachment_path?: string | null;
  attachment_mime?: string | null;
};
export type PeerUnread = {total: number; by_pair: Record<string, number>};
export type StudySuggestion = { id: number; recipient_id: number; kind: string; content: string; status: string; activity_version: number | null; request_key: string; created_at: string };
export type StudyPreparation = {opening_questions: string[]; private_questions: string[]; transfer_task: string; source: "AI" | "TEMPLATE"};
export type StudyAssistantState = {context: {topic: string; progress: string; blocker: string}; level: "dễ" | "vừa" | "khó"; improve: string; catchup_action: "none" | "summary" | "quiz" | "read"};
export type StudyFacilitatorResponse = {trigger: "quiz_dau_gio" | "quiz_cuoi_gio" | "tre_gio"; messages: string[]; chips: string[]; quiz: {question:string;options:[string,string,string];correct:number;why:string} | null; form: null; save: null};
export type StudyMeetingSummary = {
  id: number; peer_match_id: number; plan_item_id: string | null; goal: string; starts_at: string; ends_at: string; status: string; mode: string;
  my_feedback?: string | null; my_finished_at?: string | null; feedback_pending?: boolean;
};
export type StudyMeeting = StudyMeetingSummary & {
  peer_match_id: number; creator_id: number; plan_item_id: string | null; source_text: string; active_version: number | null; pending_version: number | null;
  current_segment: number; activity_started_at: string | null; server_now: string; members: StudyMember[];
  preparation: StudyPreparation | null; next_time_tip: string | null;
  assistant_state: StudyAssistantState | null;
  peer_catchup_action: StudyAssistantState["catchup_action"];
  timelines: StudyTimeline[]; confirmations: {version: number; user_id: number}[];
  messages: StudyMessage[]; suggestions: StudySuggestion[]; waiting_card: string | null;
  can_stop_waiting: boolean; current_activity: StudySegment | null; peer_disconnected: boolean;
  late_join_note: string | null; coordination_tip: string | null;
  my_id: number; my_role: StudyMember["role"]; peer_role: StudyMember["role"];
};
export type CreateStudyMeeting = {peer_match_id: number; client_key: string; plan_item_id?: string | null; goal: string; mode: "solo" | "parallel" | "together"; starts_at: string; ends_at: string; source_text: string; segments: StudySegment[]};
