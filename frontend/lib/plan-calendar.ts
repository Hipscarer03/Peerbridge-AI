import type {StudyCalendar} from "./plan-types";

export function calendarDate(value = new Date().toISOString(), timezone = "Asia/Ho_Chi_Minh") {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date(value));
  const get = (name: string) => parts.find(p => p.type === name)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function shiftDate(day: string, amount: number) {
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
export function monday(day: string) {
  return shiftDate(day, -((new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7));
}
export function dayKind(calendar: StudyCalendar | null | undefined, day: string): "outside" | "buffer" | "study" | "unknown" {
  if (!calendar || day < calendar.start_date || day > calendar.end_date) return "outside";
  if (calendar.buffer_dates.includes(day)) return "buffer";
  if (calendar.study_dates.includes(day)) return "study";
  return "unknown";
}
