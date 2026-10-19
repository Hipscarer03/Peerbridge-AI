export type StudyMeetingCreateTarget = {
  pair_id: number;
  item_id: string;
  item_user_id: number;
  goal: string;
  scheduled_start: string | null;
  minutes: number;
  meeting_id?: number;
};
