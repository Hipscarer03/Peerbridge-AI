import type {Activity, Phase} from "./session-flow";

export const totalMinutes = (activities: Activity[]) => activities.reduce((total, item) => total + item.minutes, 0);
export const lockedCount = (phase: Phase, activityIndex: number) => phase === "lobby" || phase === "idle" ? 0 : Math.min(activityIndex + 1, 8);

export function validateTimeline(original: Activity[], candidate: Activity[], budgetMinutes: number, locked = 0): string | null {
  if (!candidate.length) return "Cần ít nhất một hoạt động.";
  if (candidate.length > 8) return "Tối đa 8 hoạt động.";
  if (candidate.some(item => !item.title.trim() || !Number.isFinite(item.minutes) || item.minutes < 5)) return "Mỗi hoạt động cần tên và ít nhất 5 phút.";
  if (candidate.some(item => item.minutes > 120)) return "Mỗi hoạt động tối đa 120 phút.";
  if (candidate.some((item, index) => index < locked && (item.id !== original[index]?.id || item.title !== original[index]?.title || item.minutes !== original[index]?.minutes || item.type !== original[index]?.type))) return "Hoạt động đã bắt đầu cần được giữ nguyên.";
  if (totalMinutes(candidate) > budgetMinutes) return "Timeline vượt giờ kết thúc đã hẹn.";
  return null;
}

export function autoShorten(candidate: Activity[], budgetMinutes: number, locked = 0): Activity[] | null {
  const next = candidate.map(item => ({...item}));
  let excess = totalMinutes(next) - budgetMinutes;
  if (excess <= 0) return next;
  const soloIndexes = next.map((item, index) => item.type === "solo" && index >= locked ? index : -1).filter(index => index >= 0);
  if (soloIndexes.reduce((capacity, index) => capacity + next[index].minutes - 5, 0) < excess) return null;
  while (excess > 0) {
    for (const index of soloIndexes) {
      if (next[index].minutes <= 5) continue;
      next[index].minutes -= 1;
      excess -= 1;
      if (excess === 0) break;
    }
  }
  return next;
}

export function timelineDiff(original: Activity[], candidate: Activity[]): string {
  const lines: string[] = [];
  candidate.forEach((item, index) => {
    const before = original.findIndex(previous => previous.id === item.id);
    if (before < 0) lines.push(`+ ${index + 1}. ${item.title} ${item.minutes}′`);
    else if (before !== index || original[before].title !== item.title || original[before].minutes !== item.minutes || original[before].type !== item.type) {
      lines.push(`${before + 1}→${index + 1}. ${original[before].title} ${original[before].minutes}′ → ${item.title} ${item.minutes}′`);
    }
  });
  original.forEach((item, index) => {if (!candidate.some(next => next.id === item.id)) lines.push(`− ${index + 1}. ${item.title} ${item.minutes}′`);});
  return lines.join("\n");
}

export function canUndo(current: Activity[], previous: Activity[], locked = 0): boolean {
  return current.slice(0, locked).every((item, index) => {
    const prior = previous[index];
    return !!prior && item.id === prior.id && item.title === prior.title && item.minutes === prior.minutes && item.type === prior.type;
  });
}
