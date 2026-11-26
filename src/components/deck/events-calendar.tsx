"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  subWeeks,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import type { Card } from "@/types/cards";
import { EventCardRow } from "@/components/cards/card-primitives";
import { cn } from "@/lib/utils";

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function eventDay(card: Card): Date | null {
  if (!card.date_start) return null;
  return new Date(card.date_start);
}

function isUpcoming(card: Card, now = new Date()): boolean {
  const end = card.date_end ?? card.date_start;
  if (!end) return true;
  return new Date(end).getTime() >= now.getTime();
}

type ViewMode = "calendar" | "list";

export function EventsCalendarView({
  events,
  nextUpcoming = null,
  handle,
}: {
  events: Card[];
  nextUpcoming?: Card | null;
  handle?: string;
}) {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((c) => isUpcoming(c, now))
      .sort((a, b) => {
        const aT = a.date_start ? new Date(a.date_start).getTime() : 0;
        const bT = b.date_start ? new Date(b.date_start).getTime() : 0;
        return aT - bT;
      });
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((c) => !isUpcoming(c, now) && Boolean(c.date_start || c.date_end))
      .sort((a, b) => {
        const aT = new Date(a.date_end ?? a.date_start ?? 0).getTime();
        const bT = new Date(b.date_end ?? b.date_start ?? 0).getTime();
        return bT - aT;
      });
  }, [events]);

  const hasUpcoming = upcomingEvents.length > 0;

  const landingDay = (() => {
    if (nextUpcoming?.date_start) return new Date(nextUpcoming.date_start);
    if (upcomingEvents[0]?.date_start) return new Date(upcomingEvents[0].date_start);
    if (pastEvents[0]?.date_start) return new Date(pastEvents[0].date_start);
    return new Date();
  })();

  const [viewMode, setViewMode] = useState<ViewMode>(
    hasUpcoming ? "calendar" : "list"
  );
  const [listScope, setListScope] = useState<"future" | "past">(
    hasUpcoming ? "future" : "past"
  );
  const [weekAnchor, setWeekAnchor] = useState(() => {
    const d = new Date(landingDay);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selected, setSelected] = useState(() => landingDay);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of events) {
      const d = eventDay(card);
      if (!d) continue;
      const key = dayKey(d);
      const list = map.get(key) ?? [];
      list.push(card);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const weekDays = useMemo(() => {
    const start = new Date(weekAnchor);
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, 6);
    return eachDayOfInterval({ start, end });
  }, [weekAnchor]);

  const selectedEvents = eventsByDay.get(dayKey(selected)) ?? [];

  const futureEvents = useMemo(() => {
    const selectedStart = new Date(selected);
    selectedStart.setHours(0, 0, 0, 0);
    const dayAfter = new Date(selectedStart);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const skip = new Set(
      (eventsByDay.get(dayKey(selected)) ?? []).map((c) => c.id)
    );

    return upcomingEvents.filter((c) => {
      if (skip.has(c.id)) return false;
      const d = eventDay(c);
      if (!d) return false;
      return d.getTime() >= dayAfter.getTime();
    });
  }, [upcomingEvents, selected, eventsByDay]);

  // No upcoming events: show past list only
  if (!hasUpcoming) {
    return (
      <div>
        <div className="mb-1">
          <h2 className="font-display text-[28px] leading-none text-foreground lg:text-[34px]">
            Events
          </h2>
          <p className="mt-1 text-[13px] text-dim">
            No upcoming events — here are past ones.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {pastEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-deck-card-brd bg-deck-card py-8 text-center text-sm text-dim">
              No events yet.
            </div>
          ) : (
            pastEvents.map((c) => (
              <EventCardRow key={c.id} card={c} handle={handle} />
            ))
          )}
        </div>
      </div>
    );
  }

  const agendaTitle = format(selected, "EEE, MMM d");
  const agendaCount = `${selectedEvents.length} EVENT${selectedEvents.length === 1 ? "" : "S"}`;
  const weekLabel = `${format(weekDays[0]!, "MMM d")} – ${format(weekDays[6]!, "MMM d")}`;

  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[28px] leading-none text-foreground lg:text-[34px]">
            Events
          </h2>
          <p className="mt-1 text-[13px] text-dim">
            {viewMode === "calendar"
              ? "Week of the next upcoming event."
              : listScope === "future"
                ? "Future events coming up."
                : "Events that have already happened."}
          </p>
        </div>
        <div className="flex shrink-0 rounded-full border border-deck-card-brd bg-deck-card p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            aria-label="Calendar view"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              viewMode === "calendar"
                ? "bg-primary text-white"
                : "text-dim hover:text-foreground"
            )}
          >
            <CalendarDays className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              viewMode === "list"
                ? "bg-primary text-white"
                : "text-dim hover:text-foreground"
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <>
          <div className="mt-4 rounded-[14px] border border-deck-card-brd bg-deck-card p-4 shadow-lg backdrop-blur-xl">
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <div className="font-display text-[20px] text-foreground lg:text-[22px]">
                {weekLabel}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setWeekAnchor((d) => subWeeks(d, 1))}
                  className="flex size-8 items-center justify-center rounded-full border border-deck-card-brd text-foreground"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="size-3.5" strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
                  className="flex size-8 items-center justify-center rounded-full border border-deck-card-brd text-foreground"
                  aria-label="Next week"
                >
                  <ChevronRight className="size-3.5" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={`label-${day.toISOString()}`}
                  className="text-center text-[10px] font-semibold tracking-wide text-faint"
                >
                  {format(day, "EEEEE")}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selected);
                const hasEvents = eventsByDay.has(dayKey(day));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelected(day)}
                    className={cn(
                      "relative flex h-10 flex-col items-center justify-center rounded-xl text-[13px] font-medium transition-colors",
                      !isSelected && "text-foreground",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                    {hasEvents && (
                      <span
                        className={cn(
                          "absolute bottom-1 size-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 mb-3 flex items-baseline justify-between px-0.5">
            <div className="font-display text-[22px] text-foreground">{agendaTitle}</div>
            <span className="text-[11px] font-semibold tracking-wide text-dim uppercase">
              {agendaCount}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {selectedEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-deck-card-brd bg-deck-card py-8 text-center text-sm text-dim">
                Nothing on this day.
              </div>
            ) : (
              selectedEvents.map((c) => (
                <EventCardRow key={c.id} card={c} handle={handle} />
              ))
            )}
          </div>

          {futureEvents.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-baseline justify-between px-0.5">
                <div className="font-display text-[22px] text-foreground">Future events</div>
                <span className="text-[11px] font-semibold tracking-wide text-dim uppercase">
                  {futureEvents.length} EVENT{futureEvents.length === 1 ? "" : "S"}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {futureEvents.map((c) => (
                  <EventCardRow key={c.id} card={c} handle={handle} />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  setListScope("past");
                }}
                className="mb-3 flex w-full items-baseline justify-between px-0.5 text-left"
              >
                <div className="font-display text-[22px] text-foreground">Past events</div>
                <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                  View {pastEvents.length}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === "list" && (
        <div className="mt-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setListScope("future")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                listScope === "future"
                  ? "bg-primary text-primary-foreground"
                  : "border border-deck-card-brd text-dim"
              )}
            >
              Future events
            </button>
            <button
              type="button"
              onClick={() => setListScope("past")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                listScope === "past"
                  ? "bg-primary text-primary-foreground"
                  : "border border-deck-card-brd text-dim"
              )}
            >
              Past events
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {(listScope === "future" ? upcomingEvents : pastEvents).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-deck-card-brd bg-deck-card py-8 text-center text-sm text-dim">
                {listScope === "future" ? "No future events yet." : "No past events yet."}
              </div>
            ) : (
              (listScope === "future" ? upcomingEvents : pastEvents).map((c) => (
                <EventCardRow key={c.id} card={c} handle={handle} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
