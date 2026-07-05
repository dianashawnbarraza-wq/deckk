import type { Event } from "@/types/database";

/** Event is past when its end (or start if no end) is before now. */
export function isEventPast(event: Event, now = new Date()): boolean {
  const cutoff = event.ends_at ?? event.starts_at;
  return new Date(cutoff) < now;
}

export function partitionEvents(events: Event[], now = new Date()) {
  const upcoming: Event[] = [];
  const past: Event[] = [];

  for (const event of events) {
    if (isEventPast(event, now)) {
      past.push(event);
    } else {
      upcoming.push(event);
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );
  past.sort(
    (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  );

  return { upcoming, past };
}

export function formatEventWhen(event: Event): string {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  const tz = event.timezone;

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  });

  if (event.is_all_day) {
    const startStr = dateFmt.format(start);
    if (end) {
      const endStr = dateFmt.format(end);
      return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
    }
    return startStr;
  }

  const startStr = `${dateFmt.format(start)} · ${timeFmt.format(start)}`;
  if (end) {
    return `${startStr} – ${timeFmt.format(end)}`;
  }
  return startStr;
}

export const COMMON_TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;
