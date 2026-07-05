"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_TIMEZONES } from "@/lib/events";
import {
  allDayDateToUtc,
  localDateTimeToUtc,
  utcToDateInput,
  utcToLocalInput,
} from "@/lib/event-datetime";
import type { Event } from "@/types/database";

interface EventFormProps {
  profileId: string;
  event?: Event;
  onDone?: () => void;
}

export function EventForm({ profileId, event, onDone }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [timezone, setTimezone] = useState(
    event?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day ?? false);
  const [start, setStart] = useState(
    event
      ? event.is_all_day
        ? utcToDateInput(event.starts_at, event.timezone)
        : utcToLocalInput(event.starts_at, event.timezone)
      : ""
  );
  const [end, setEnd] = useState(
    event?.ends_at
      ? event.is_all_day
        ? utcToDateInput(event.ends_at, event.timezone)
        : utcToLocalInput(event.ends_at, event.timezone)
      : ""
  );
  const [isOnline, setIsOnline] = useState(event?.is_online ?? false);
  const [location, setLocation] = useState(event?.location ?? "");
  const [url, setUrl] = useState(event?.url ?? "");
  const [coverUrl, setCoverUrl] = useState(event?.cover_url ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const [communityOptIn, setCommunityOptIn] = useState(
    event?.community_opt_in ?? false
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title || !start) {
      setError("Title and start are required.");
      return;
    }

    let startsAt: string;
    let endsAt: string | null = null;

    try {
      if (isAllDay) {
        startsAt = allDayDateToUtc(start, timezone);
        if (end) endsAt = allDayDateToUtc(end, timezone);
      } else {
        startsAt = localDateTimeToUtc(start, timezone);
        if (end) endsAt = localDateTimeToUtc(end, timezone);
      }
    } catch {
      setError("Invalid date/time.");
      return;
    }

    const payload = {
      profileId,
      title,
      description,
      startsAt,
      endsAt,
      timezone,
      isAllDay,
      location: isOnline ? null : location || null,
      isOnline,
      url: url || null,
      coverUrl: coverUrl || null,
      city: city || null,
      communityOptIn,
    };

    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/events/${event!.id}` : "/api/events",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit
              ? {
                  title: payload.title,
                  description: payload.description,
                  startsAt: payload.startsAt,
                  endsAt: payload.endsAt,
                  timezone: payload.timezone,
                  isAllDay: payload.isAllDay,
                  location: payload.location,
                  isOnline: payload.isOnline,
                  url: payload.url,
                  coverUrl: payload.coverUrl,
                  city: payload.city,
                  communityOptIn: payload.communityOptIn,
                }
              : payload
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save event");
        return;
      }
      router.refresh();
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
      <div>
        <Label htmlFor="event-title">Title</Label>
        <Input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
        />
      </div>
      <div>
        <Label htmlFor="event-desc">Description</Label>
        <Textarea
          id="event-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div>
        <Label htmlFor="event-timezone">Timezone</Label>
        <select
          id="event-timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          {!COMMON_TIMEZONES.includes(timezone as (typeof COMMON_TIMEZONES)[number]) && (
            <option value={timezone}>{timezone}</option>
          )}
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isAllDay}
          onChange={(e) => setIsAllDay(e.target.checked)}
        />
        All-day event
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="event-start">Starts</Label>
          <Input
            id="event-start"
            type={isAllDay ? "date" : "datetime-local"}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="event-end">Ends (optional)</Label>
          <Input
            id="event-end"
            type={isAllDay ? "date" : "datetime-local"}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isOnline}
          onChange={(e) => setIsOnline(e.target.checked)}
        />
        Online event
      </label>
      {!isOnline && (
        <div>
          <Label htmlFor="event-location">Location</Label>
          <Input
            id="event-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="123 Main St, Los Angeles"
          />
        </div>
      )}
      <div>
        <Label htmlFor="event-url">
          {isOnline ? "Meeting / ticket URL" : "Ticket or info URL (optional)"}
        </Label>
        <Input
          id="event-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label htmlFor="event-cover">Cover image URL (optional)</Label>
        <Input
          id="event-cover"
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label htmlFor="event-city">City (for community calendar)</Label>
        <Input
          id="event-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Los Angeles"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={communityOptIn}
          onChange={(e) => setCommunityOptIn(e.target.checked)}
        />
        Show on community calendar (when available)
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : isEdit ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
