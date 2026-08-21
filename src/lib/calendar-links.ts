/** Build deep links for popular calendar apps (no .ics download required). */

function utcStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

export type CalendarEventInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  startIso: string;
  endIso?: string | null;
};

function detailsText(input: CalendarEventInput): string {
  return [input.description?.trim(), input.url?.trim()]
    .filter(Boolean)
    .join("\n\n");
}

function resolvedEnd(input: CalendarEventInput): Date {
  if (input.endIso) return new Date(input.endIso);
  return new Date(new Date(input.startIso).getTime() + 60 * 60 * 1000);
}

/** Google Calendar “create event” template URL. */
export function googleCalendarUrl(input: CalendarEventInput): string {
  const start = new Date(input.startIso);
  const end = resolvedEnd(input);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
  });
  const details = detailsText(input);
  if (details) params.set("details", details);
  if (input.location?.trim()) params.set("location", input.location.trim());
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Outlook.com / Hotmail web compose URL. */
export function outlookCalendarUrl(input: CalendarEventInput): string {
  const start = new Date(input.startIso);
  const end = resolvedEnd(input);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  const details = detailsText(input);
  if (details) params.set("body", details);
  if (input.location?.trim()) params.set("location", input.location.trim());
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
