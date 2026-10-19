"use client";

// Chọn giờ rảnh bằng nút (ngày + buổi), không phải gõ giờ. Không chọn gì thì dùng mặc định buổi tối cả tuần.

export const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const SLOTS = [
  { key: "sang", label: "Sáng", hint: "7–11h", start: "07:00", end: "11:00" },
  { key: "chieu", label: "Chiều", hint: "13–17h", start: "13:00", end: "17:00" },
  { key: "toi", label: "Tối", hint: "19–22h", start: "19:00", end: "22:00" },
] as const;
export type SlotKey = (typeof SLOTS)[number]["key"];
export type Window = { day_of_week: number; start_time: string; end_time: string };

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const QUICK_DAYS = [
  { label: "Ngày thường", days: [0, 1, 2, 3, 4] },
  { label: "Cuối tuần", days: [5, 6] },
  { label: "Cả tuần", days: ALL_DAYS },
];
export const DEFAULT_DAYS = ALL_DAYS;
export const DEFAULT_SLOTS: SlotKey[] = ["toi"];

export function windowsFromPicker(days: number[], slots: SlotKey[]): Window[] {
  const useDays = days.length ? [...days].sort() : DEFAULT_DAYS;
  const useSlots = slots.length ? slots : DEFAULT_SLOTS;
  return useDays.flatMap(day => SLOTS.filter(s => useSlots.includes(s.key))
    .map(s => ({ day_of_week: day, start_time: s.start, end_time: s.end })));
}

export function pickerFromWindows(windows: Window[]): { days: number[]; slots: SlotKey[] } {
  const days = [...new Set(windows.map(w => w.day_of_week))].sort();
  // Một buổi được chọn nếu có khung giờ nào chạm vào buổi đó.
  const slots = SLOTS.filter(s => windows.some(w => w.start_time.slice(0, 5) < s.end && w.end_time.slice(0, 5) > s.start)).map(s => s.key);
  return { days, slots };
}

export default function AvailabilityPicker({ days, slots, onChange, disabled }: {
  days: number[]; slots: SlotKey[]; disabled?: boolean;
  onChange: (days: number[], slots: SlotKey[]) => void;
}) {
  const toggleDay = (day: number) => onChange(days.includes(day) ? days.filter(d => d !== day) : [...days, day], slots);
  const toggleSlot = (key: SlotKey) => onChange(days, slots.includes(key) ? slots.filter(s => s !== key) : [...slots, key]);
  const same = (a: number[], b: number[]) => a.length === b.length && a.every(d => b.includes(d));
  return <div className="availability-quick">
    <div className="day-chips" role="group" aria-label="Nhóm ngày">
      {QUICK_DAYS.map(q => <button key={q.label} type="button" disabled={disabled} aria-pressed={same(days, q.days)} className={same(days, q.days) ? "active" : ""} onClick={() => onChange(q.days, slots)}>{q.label}</button>)}
    </div>
    <div className="day-chips" role="group" aria-label="Ngày trong tuần">
      {DAY_LABELS.map((label, i) => <button key={label} type="button" disabled={disabled} aria-pressed={days.includes(i)} className={days.includes(i) ? "active" : ""} onClick={() => toggleDay(i)}>{label}</button>)}
    </div>
    <div className="day-chips" role="group" aria-label="Buổi trong ngày">
      {SLOTS.map(s => <button key={s.key} type="button" disabled={disabled} aria-pressed={slots.includes(s.key)} className={slots.includes(s.key) ? "active" : ""} onClick={() => toggleSlot(s.key)}>{s.label} <small>{s.hint}</small></button>)}
    </div>
    <p>Không chọn thì mặc định buổi tối cả tuần. Đổi lại lúc nào cũng được.</p>
  </div>;
}
