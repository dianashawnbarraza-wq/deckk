"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function EventsCalendarView({ events }: { events: Card[] }) {
  const [cursor, setCursor] = useState(() => {
    const first = events.map(eventDay).find(Boolean);
    return first ? startOfMonth(first) : startOfMonth(new Date());
  });
  const [selected, setSelected] = useState(() => {
    const first = events.map(eventDay).find(Boolean);
    return first ?? new Date();
  });

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

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [cursor]);

  const selectedEvents = eventsByDay.get(dayKey(selected)) ?? [];
  const upcoming =
    selectedEvents.length > 0
      ? selectedEvents
      : events
          .filter((c) => {
            const d = eventDay(c);
            return d && d >= new Date(new Date().setHours(0, 0, 0, 0));
          })
          .slice(0, 6);

  const showingSelected = selectedEvents.length > 0;
  const agendaTitle = showingSelected
    ? format(selected, "EEE, MMM d")
    : "Upcoming";
  const agendaCount = `${upcoming.length} EVENT${upcoming.length === 1 ? "" : "S"}`;

  return (
    <div>
      <h2 className="font-display text-[30px] leading-none text-foreground">Events</h2>
      <p className="mt-1 mb-4 text-[13px] text-dim">Tap a date to see what&apos;s on.</p>

      <div className="rounded-[22px] border border-deck-card-brd bg-deck-card p-4 shadow-lg backdrop-blur-xl">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="font-display text-[22px] text-foreground">
            {format(cursor, "MMMM yyyy")}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setCursor((c) => subMonths(c, 1))}
              className="flex size-8 items-center justify-center rounded-full border border-deck-card-brd text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-3.5" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              className="flex size-8 items-center justify-center rounded-full border border-deck-card-brd text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="size-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={`${d}-${i}`}
              className="text-center text-[10px] font-semibold tracking-wide text-faint"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const inMonth = isSameMonth(day, cursor);
                const isSelected = isSameDay(day, selected);
                const hasEvents = eventsByDay.has(dayKey(day));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelected(day);
                      if (!isSameMonth(day, cursor)) setCursor(startOfMonth(day));
                    }}
                    className={cn(
                      "relative flex h-9 flex-col items-center justify-center rounded-xl text-[13px] font-medium transition-colors",
                      !inMonth && "text-faint/50",
                      inMonth && !isSelected && "text-foreground",
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
          ))}
        </div>
      </div>

      <div className="mt-5 mb-3 flex items-baseline justify-between px-0.5">
        <div className="font-display text-[22px] text-foreground">{agendaTitle}</div>
        <span className="text-[11px] font-semibold tracking-wide text-dim uppercase">
          {agendaCount}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-deck-card-brd bg-deck-card py-8 text-center text-sm text-dim">
            Nothing on this day.
          </div>
        ) : (
          upcoming.map((c) => <EventCardRow key={c.id} card={c} />)
        )}
      </div>
    </div>
  );
}
