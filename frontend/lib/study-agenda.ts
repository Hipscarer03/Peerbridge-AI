import type { StudySegment } from "./study-meetings";

const makeSegment = (title: string, minutes: number): StudySegment => ({
  title, minutes, outcome: "", role_a: "peer", role_b: "peer",
});

/** A small deterministic parser for the structured agenda users write in chat. */
export function parseStudyAgenda(input: string, localStart: string): {start: string; segments: StudySegment[]} {
  const lines = input.split(/\r?\n|->/).map(s => s.trim()).filter(Boolean);
  if (lines.length < 2 || lines.length > 13) throw new Error("Timeline cần 2–13 mốc hoặc hoạt động.");
  const durationPattern = /^(\d{1,3})\s*(?:phút|ph|p)\s*[:：-]\s*(.{2,100})$/i;
  const durations = lines.map(line => durationPattern.exec(line));
  if (durations.every(Boolean)) {
    const segments = durations.map(match => makeSegment(match![2].trim(),Number(match![1])));
    const total = segments.reduce((sum,s) => sum+s.minutes,0);
    if (segments.some(s => s.minutes < 1 || s.minutes > 120) || total < 15 || total > 180)
      throw new Error("Tổng thời lượng phải trong 15–180 phút; mỗi hoạt động tối đa 120 phút.");
    return {start:localStart,segments};
  }
  const clockPattern = /^(\d{1,2})\s*(?:h|:)\s*(\d{0,2})\s*[:：-]?\s*(.{2,100})$/i;
  const marks = lines.map(line => clockPattern.exec(line));
  if (!marks.every(Boolean)) throw new Error("Dùng '5 phút: Tự thử' hoặc '20h00: Tự thử' trên mỗi dòng.");
  const first = marks[0]!;
  const day = localStart.slice(0,10);
  const startHour=Number(first[1]),startMinute=Number(first[2]||0);
  if (startHour>23 || startMinute>59) throw new Error("Giờ trong timeline không hợp lệ.");
  const start=`${day}T${String(startHour).padStart(2,"0")}:${String(startMinute).padStart(2,"0")}`;
  let previous=startHour*60+startMinute;
  const times=[previous];
  for (const mark of marks.slice(1)) {
    const hour=Number(mark![1]),minute=Number(mark![2]||0);
    if (hour>23 || minute>59) throw new Error("Giờ trong timeline không hợp lệ.");
    let current=hour*60+minute;
    if (current<=previous && previous>=22*60 && current<3*60) current+=24*60;
    if (current<=previous) throw new Error("Các mốc giờ phải tăng dần và có mốc kết thúc.");
    times.push(current);previous=current;
  }
  const segments=marks.slice(0,-1).map((mark,i)=>makeSegment(mark![3].trim(),times[i+1]-times[i]));
  const total=times[times.length-1]-times[0];
  if (total<15 || total>180 || segments.some(s=>s.minutes>120)) throw new Error("Tổng thời lượng phải trong 15–180 phút; mỗi hoạt động tối đa 120 phút.");
  return {start,segments};
}
