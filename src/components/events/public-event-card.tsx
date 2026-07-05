"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatEventWhen } from "@/lib/events";
import type { Event } from "@/types/database";

interface PublicEventCardProps {
  event: Event;
  variant?: "upcoming" | "archive";
}

export function PublicEventCard({
  event,
  variant = "upcoming",
}: PublicEventCardProps) {
  const when = formatEventWhen(event);
  const locationLabel = event.is_online
    ? event.url
      ? "Online"
      : "Online event"
    : event.location;

  return (
    <Card
      className={`overflow-hidden shadow-sm ${
        event.is_canceled ? "border-destructive/40 bg-destructive/5" : ""
      }`}
    >
      {event.cover_url && (
        <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.cover_url}
            alt=""
            className={`h-full w-full object-cover ${event.is_canceled ? "opacity-60" : ""}`}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle
            className={`text-lg ${event.is_canceled ? "line-through opacity-70" : ""}`}
          >
            {event.title}
          </CardTitle>
          {event.is_canceled && (
            <Badge variant="destructive">Canceled</Badge>
          )}
          {variant === "archive" && !event.is_canceled && (
            <Badge variant="secondary">Past</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{when}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        {locationLabel && (
          <p className="text-sm">
            {event.is_online && event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Join online
              </a>
            ) : (
              locationLabel
            )}
          </p>
        )}
        {event.url && !event.is_online && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline-offset-4 hover:underline"
          >
            Event link
          </a>
        )}
        {!event.is_canceled && variant === "upcoming" && (
          <Link
            href={`/api/events/${event.id}/ics`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Add to calendar
          </Link>
        )}
        {event.is_canceled && (
          <p className="text-sm font-medium text-destructive">
            This event has been canceled. Your downloaded calendar entry may be
            out of date.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
