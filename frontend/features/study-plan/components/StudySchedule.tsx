"use client";
import {useEffect, useRef} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import luxonPlugin from "@fullcalendar/luxon3";
import viLocale from "@fullcalendar/core/locales/vi";
import type {PlanItem, StudyCalendar} from "@/lib/plan-types";
import {calendarDate, dayKind} from "@/lib/plan-calendar";

const calendarPlugins = [timeGridPlugin, dayGridPlugin, interactionPlugin, luxonPlugin];
function element(tag: string, className: string, text: string) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function scheduleEvents(items: PlanItem[], month: boolean, timezone = "Asia/Ho_Chi_Minh") {
  const scheduled = items.filter(item => item.scheduled_start || item.planned_date);
  if (month) {
    return scheduled.map(item => ({id: item.id, title: item.action, start: item.scheduled_start || item.planned_date!, allDay: true, extendedProps: {item}, classNames: !item.scheduled_start ? ["study-event-awaiting-time"] : []}));
  }
  return scheduled.map(item => ({id: item.id, title: item.action, start: item.scheduled_start || item.planned_date!, end: item.scheduled_end || undefined, allDay: !item.scheduled_start, extendedProps: {item}, classNames: item.status === "COMPLETED" ? ["study-event-completed"] : !item.scheduled_start ? ["study-event-awaiting-time"] : []}));
}

export default function StudySchedule({items, togetherIds, calendar, anchor, period, timezone, mine, selected, onDate, onDetail, onSelect}: {
  togetherIds?: Set<string>;
  calendar?: StudyCalendar | null;
  items: PlanItem[]; anchor: string; period: "day" | "week" | "month"; timezone: string; mine: boolean; selected: boolean;
  onDate: (day: string) => void; onDetail: (item: PlanItem) => void; onSelect: (item: PlanItem) => void;
}) {
  const ref = useRef<FullCalendar>(null);
  const viewName = period === "day" ? "timeGridDay" : period === "week" ? "timeGridWeek" : "dayGridMonth";
  const navigationKey = `${viewName}:${anchor}`;
  const previousNavigation = useRef(navigationKey);
  useEffect(() => {
    if (previousNavigation.current === navigationKey) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const api = ref.current?.getApi();
      if (api) {api.changeView(viewName, anchor); previousNavigation.current = navigationKey;}
    });
    return () => {active = false;};
  }, [anchor, viewName, navigationKey]);
  return <div className={`study-fullcalendar ${mine ? "study-fullcalendar-mine" : "study-fullcalendar-peer"}`}>
    <FullCalendar ref={ref} plugins={calendarPlugins} locale={viLocale} timeZone={timezone}
      initialDate={anchor} initialView={viewName} headerToolbar={false} firstDay={1} height={period === "month" ? 540 : 580}
      slotMinTime="00:00:00" slotMaxTime="24:00:00" scrollTime="18:00:00" slotDuration="00:30:00" allDaySlot allDayText="Trong ngày" nowIndicator
      dayCellClassNames={info => [`study-day-${dayKind(calendar, calendarDate(info.date.toISOString(), timezone))}`]}
      dayHeaderContent={info => {const kind = dayKind(calendar, calendarDate(info.date.toISOString(), timezone)); const node = document.createElement("span"); node.append(info.text); if (kind !== "outside") node.append(element("small", `study-day-label study-day-label-${kind}`, {study: "Ngày học", buffer: "Ngày đệm", unknown: "Chưa khai báo"}[kind])); return {domNodes: [node]};}}
      dayCellContent={info => {const kind = dayKind(calendar, calendarDate(info.date.toISOString(), timezone)); const node = document.createElement("span"); node.append(info.dayNumberText); if (period === "month" && kind !== "outside") node.append(element("small", `study-day-label study-day-label-${kind}`, {study: "Học", buffer: "Đệm", unknown: "Chưa rõ"}[kind])); return {domNodes: [node]};}}
      events={scheduleEvents(items, period === "month", timezone)} editable={false} selectable={false} dayMaxEvents={2}
      eventContent={info => {
        const item = info.event.extendedProps.item as PlanItem;
        const node = document.createElement("div"); node.className = "study-event-content";
        if (info.timeText) node.append(element("span", "study-event-time", info.timeText));
        const title = element("span", "study-event-title", "");
        if (togetherIds?.has(item.id)) {const together = element("span", "study-event-together", "🤝 "); together.setAttribute("role", "img"); together.setAttribute("aria-label", "Có đề nghị học chung"); together.title = "Có đề nghị học chung"; title.append(together);}
        title.append(item.action); node.append(title);
        if (!item.scheduled_start) {const footer = element("small", "study-event-footer", ""); footer.append(element("mark", "study-event-status-highlight", "Chưa chọn giờ")); node.append(footer);}
        return {domNodes: [node]};
      }}
      eventTimeFormat={{hour: "2-digit", minute: "2-digit", hour12: false}} slotLabelFormat={{hour: "2-digit", minute: "2-digit", hour12: false}}
      dateClick={info => { if (!mine || selected) onDate(info.dateStr.slice(0, 10)); }}
      eventClick={info => onDetail(info.event.extendedProps.item as PlanItem)}
      eventDidMount={info => { if (!mine || !onSelect) return; const handler = (event: MouseEvent) => {event.stopPropagation(); onSelect(info.event.extendedProps.item as PlanItem);}; info.el.addEventListener("dblclick", handler); (info.el as HTMLElement & {studyCleanup?: () => void}).studyCleanup = () => info.el.removeEventListener("dblclick", handler); }}
      eventWillUnmount={info => (info.el as HTMLElement & {studyCleanup?: () => void}).studyCleanup?.()}
    />
  </div>;
}
