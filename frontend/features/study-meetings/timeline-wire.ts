import type {Activity} from "./session-flow";

const PREFIX = "[peerbridge.timeline.v1]";
export type TimelineWire =
  | {kind: "proposal"; id: string; sentAt: number; activities: Activity[]; goal?: string}
  | {kind: "decision"; id: string; sentAt: number; accepted: boolean}
  | {kind: "undo"; id: string; sentAt: number};

export const isTimelineWire = (content: string) => content.startsWith(PREFIX);
export const encodeTimelineWire = (message: TimelineWire) => `${PREFIX}${JSON.stringify(message)}`;

export function decodeTimelineWire(content: string): TimelineWire | null {
  if (!isTimelineWire(content)) return null;
  try {
    const item: unknown = JSON.parse(content.slice(PREFIX.length));
    if (!item || typeof item !== "object") return null;
    const wire = item as Record<string, unknown>;
    if (typeof wire.id !== "string" || wire.id.length > 100 || typeof wire.sentAt !== "number") return null;
    if (wire.kind === "proposal" && (wire.goal === undefined || (typeof wire.goal === "string" && wire.goal.length <= 300)) && Array.isArray(wire.activities) && wire.activities.length > 0 && wire.activities.length <= 8 && wire.activities.every(value => {
      if (!value || typeof value !== "object") return false;
      const activity = value as Record<string, unknown>;
      return typeof activity.id === "string" && typeof activity.title === "string" && activity.title.length <= 60 && typeof activity.minutes === "number" && Number.isFinite(activity.minutes) && ["solo", "joint", "break"].includes(String(activity.type));
    })) return wire as TimelineWire;
    if (wire.kind === "decision" && typeof wire.accepted === "boolean") return wire as TimelineWire;
    if (wire.kind === "undo") return wire as TimelineWire;
  } catch { /* Tin nhắn thường không phải lệnh timeline. */ }
  return null;
}
