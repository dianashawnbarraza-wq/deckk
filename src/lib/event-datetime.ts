import { fromZonedTime } from "date-fns-tz";

/** Convert a datetime-local input value in the event timezone to UTC ISO. */
export function localDateTimeToUtc(localValue: string, timezone: string): string {
  return fromZonedTime(localValue, timezone).toISOString();
}

/** Convert a date input (YYYY-MM-DD) to UTC midnight in the event timezone. */
export function allDayDateToUtc(dateValue: string, timezone: string): string {
  return fromZonedTime(`${dateValue}T00:00:00`, timezone).toISOString();
}

/** Format a UTC ISO string back to datetime-local in the event timezone. */
export function utcToLocalInput(iso: string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function utcToDateInput(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}
