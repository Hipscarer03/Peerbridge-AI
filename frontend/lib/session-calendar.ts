import { APP_TIMEZONE, localInputToISO, toDateTimeInput } from "./time";

type Window = { day_of_week: number; start_time: string; end_time: string; timezone: string };

export function calendarDays(now: Date, offset: number): string[] {
  const today = toDateTimeInput(now.toISOString()).slice(0, 10);
  return Array.from({ length: 3 }, (_, index) => {
    const day = new Date(`${today}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + offset + index);
    return day.toISOString().slice(0, 10);
  });
}

export function calendarSlot(day: string, hour: number): string {
  return `${day}T${String(hour).padStart(2, "0")}:00`;
}

export function isAvailable(windows: Window[], start: string, minutes: number): boolean {
  const instant = new Date(localInputToISO(start));
  const end = new Date(instant.getTime() + minutes * 60000);
  return windows.some(window => {
    try {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: window.timezone || APP_TIMEZONE, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      });
      const parts = (date: Date) => Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
      const a = parts(instant), b = parts(end);
      const minute = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(a.weekday) === window.day_of_week
        && a.year === b.year && a.month === b.month && a.day === b.day
        && minute(window.start_time) <= Number(a.hour) * 60 + Number(a.minute)
        && minute(window.end_time) >= Number(b.hour) * 60 + Number(b.minute);
    } catch (error) {
      if (error instanceof RangeError) return false;
      throw error;
    }
  });
}
