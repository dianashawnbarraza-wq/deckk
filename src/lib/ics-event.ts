import { formatInTimeZone } from "date-fns-tz";
import type { Event } from "@/types/database";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, max));
  rest = rest.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join("\r\n");
}

function formatLocalParts(date: Date, timezone: string) {
  return {
    date: formatInTimeZone(date, timezone, "yyyyMMdd"),
    dateTime: formatInTimeZone(date, timezone, "yyyyMMdd'T'HHmmss"),
  };
}

export function buildEventIcs(event: Event, creatorName: string): string {
  const uid = `${event.id}@deckk.me`;
  const now = formatInTimeZone(new Date(), "UTC", "yyyyMMdd'T'HHmmss'Z'");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//deckk.me//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
  ];

  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;

  if (event.is_all_day) {
    const startParts = formatLocalParts(start, event.timezone);
    lines.push(`DTSTART;VALUE=DATE:${startParts.date}`);
    if (end) {
      const endParts = formatLocalParts(end, event.timezone);
      lines.push(`DTEND;VALUE=DATE:${endParts.date}`);
    } else {
      const nextDay = new Date(start);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const endParts = formatLocalParts(nextDay, event.timezone);
      lines.push(`DTEND;VALUE=DATE:${endParts.date}`);
    }
  } else {
    const startParts = formatLocalParts(start, event.timezone);
    lines.push(`DTSTART;TZID=${event.timezone}:${startParts.dateTime}`);
    if (end) {
      const endParts = formatLocalParts(end, event.timezone);
      lines.push(`DTEND;TZID=${event.timezone}:${endParts.dateTime}`);
    } else {
      const defaultEnd = new Date(start.getTime() + 60 * 60 * 1000);
      const endParts = formatLocalParts(defaultEnd, event.timezone);
      lines.push(`DTEND;TZID=${event.timezone}:${endParts.dateTime}`);
    }
  }

  lines.push(foldLine(`SUMMARY:${escapeIcsText(event.title)}`));

  const descriptionParts = [event.description];
  if (event.is_canceled) descriptionParts.unshift("CANCELED");
  if (creatorName) descriptionParts.push(`Hosted by ${creatorName}`);
  lines.push(
    foldLine(`DESCRIPTION:${escapeIcsText(descriptionParts.filter(Boolean).join("\\n"))}`)
  );

  const location = event.is_online
    ? event.url ?? "Online"
    : event.location ?? event.url;
  if (location) {
    lines.push(foldLine(`LOCATION:${escapeIcsText(location)}`));
  }
  if (event.url) {
    lines.push(foldLine(`URL:${event.url}`));
  }
  if (event.is_canceled) {
    lines.push("STATUS:CANCELLED");
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
