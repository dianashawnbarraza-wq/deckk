"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventWhen, isEventPast } from "@/lib/events";
import { EventForm } from "@/components/events/event-form";
import type { Event } from "@/types/database";

export function DashboardEventList({
  profileId,
  events,
}: {
  profileId: string;
  events: Event[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const editing = events.find((e) => e.id === editingId);

  async function cancelEvent(id: string) {
    setLoadingId(id);
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCanceled: true }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event permanently?")) return;
    setLoadingId(id);
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setLoadingId(null);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setEditingId(null)}>
          ← Back to list
        </Button>
        <EventForm
          profileId={profileId}
          event={editing}
          onDone={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EventForm profileId={profileId} />
      {events.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-medium">Your events</h3>
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  {event.is_canceled && (
                    <Badge variant="destructive">Canceled</Badge>
                  )}
                  {isEventPast(event) && !event.is_canceled && (
                    <Badge variant="secondary">Past</Badge>
                  )}
                  {event.community_opt_in && (
                    <Badge variant="outline">Community</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatEventWhen(event)}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(event.id)}
                >
                  Edit
                </Button>
                {!event.is_canceled && !isEventPast(event) && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === event.id}
                    onClick={() => cancelEvent(event.id)}
                  >
                    Cancel event
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loadingId === event.id}
                  onClick={() => deleteEvent(event.id)}
                >
                  Delete
                </Button>
                <a
                  href={`/api/events/${event.id}/ics`}
                  className="inline-flex h-7 items-center rounded-lg border px-2.5 text-sm hover:bg-muted"
                >
                  Download .ics
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
