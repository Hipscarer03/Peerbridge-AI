import type {StudySegment} from "@/lib/study-meetings";

const segment = (title: string, minutes: number): StudySegment => ({
  title, minutes, outcome: "", role_a: "peer", role_b: "peer",
});

const splitLines = (text: string) => text.split(/\r?\n|;/).map(line => line.trim()).filter(Boolean);
const isBufferLine = (line: string) => /^(?:phần\s+)?đệm\b/i.test(line);

export function timelineBufferMinutes(text: string): number {
  const bufferLines = splitLines(text).filter(isBufferLine);
  if (bufferLines.length > 1) throw new Error("Chỉ thêm một dòng thời gian đệm.");
  if (!bufferLines.length) return 0;
  const match = bufferLines[0].match(/^(?:phần\s+)?đệm\s*(?:[-–—:]\s*)?(\d{1,3})\s*(?:phút|p|′|')$/i);
  if (!match || Number(match[1]) < 1) throw new Error("Ghi thời gian đệm theo dạng: Đệm - 5 phút.");
  return Number(match[1]);
}

export function syncTimelineBufferLine(text: string, minutes: number): string {
  const activities = splitLines(text).filter(line => !isBufferLine(line));
  if (minutes > 0) {
    const bufferLine = `Đệm - ${minutes} phút`;
    const bodyLimit = Math.max(0, 1300 - bufferLine.length - 1);
    const body = activities.join("\n").slice(0, bodyLimit).trimEnd();
    return [body, bufferLine].filter(Boolean).join("\n");
  }
  return activities.join("\n");
}

/** Activity lines may reserve part of the session with a line such as “Đệm - 5 phút”. */
export function timelineFromText(text: string, totalMinutes: number, fallback: StudySegment[]): StudySegment[] {
  const allLines = splitLines(text);
  const bufferMinutes = timelineBufferMinutes(text);
  const availableMinutes = totalMinutes - bufferMinutes;
  if (availableMinutes < 5) throw new Error("Phần đệm cần để lại ít nhất 5 phút cho hoạt động.");
  const lines = allLines.filter(line => !isBufferLine(line));
  if (!lines.length) {
    if (!fallback.length) {
      if (bufferMinutes > 0) throw new Error("Cần có ít nhất một hoạt động ngoài phần đệm.");
      return fallback;
    }
    let remainingBuffer = bufferMinutes;
    const result = fallback.map(item => ({...item}));
    for (let index = result.length - 1; index >= 0 && remainingBuffer > 0; index--) {
      const reduction = Math.min(remainingBuffer, result[index].minutes - 5);
      result[index].minutes -= reduction;
      remainingBuffer -= reduction;
    }
    if (remainingBuffer) throw new Error("Không đủ thời lượng trong timeline để dành phần đệm.");
    return result;
  }
  if (lines.length > 8) throw new Error("Timeline có tối đa 8 hoạt động.");
  if (availableMinutes < lines.length * 5) throw new Error("Mỗi hoạt động cần ít nhất 5 phút sau khi trừ phần đệm.");

  const parsed = lines.map(line => {
    const match = line.match(/^(.*?)\s*(?:[-–—:]\s*)?(\d{1,3})\s*(?:phút|p|′|')$/i);
    return {title: (match?.[1] || line).trim().slice(0, 100), minutes: match ? Number(match[2]) : null};
  });
  if (parsed.some(item => !item.title)) throw new Error("Mỗi hoạt động cần có tên.");
  const explicit = parsed.some(item => item.minutes !== null);
  if (explicit && parsed.some(item => item.minutes === null)) {
    throw new Error("Hãy ghi số phút cho tất cả hoạt động hoặc bỏ số phút ở tất cả dòng.");
  }
  if (explicit) {
    if (parsed.some(item => (item.minutes ?? 0) < 5)) throw new Error("Mỗi hoạt động cần ít nhất 5 phút.");
    if (parsed.some(item => (item.minutes ?? 0) > 120)) throw new Error("Mỗi hoạt động dài tối đa 120 phút.");
    if (parsed.reduce((sum, item) => sum + (item.minutes ?? 0), 0) !== availableMinutes) {
      throw new Error(`Tổng thời lượng hoạt động và phần đệm cần bằng ${totalMinutes} phút.`);
    }
    return parsed.map(item => segment(item.title, item.minutes!));
  }
  const spare = availableMinutes - parsed.length * 5;
  const perActivity = Math.floor(spare / parsed.length);
  const extra = spare % parsed.length;
  const result = parsed.map((item, index) => segment(item.title, 5 + perActivity + (index < extra ? 1 : 0)));
  if (result.some(item => item.minutes > 120)) throw new Error("Hãy chia nội dung thành ít nhất hai hoạt động.");
  return result;
}
