import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarFilters } from "@/components/community/calendar-filters";
import { CommunityNav } from "@/components/community/community-nav";
import { ReportButton } from "@/components/community/report-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCommunityCities, getCommunityEvents } from "@/lib/community";
import { formatEventWhen } from "@/lib/events";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Calendar — deckk.me",
  description:
    "Discover markets, shows, and online sessions from creators on deckk.me. Filter by city and date.",
  openGraph: {
    title: "Community Calendar — deckk.me",
    description: "Upcoming creator events across the deckk.me community.",
  },
};

interface PageProps {
  searchParams: Promise<{
    city?: string;
    online?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const online =
    params.online === "true"
      ? true
      : params.online === "false"
        ? false
        : undefined;

  const fromIso = params.from
    ? new Date(`${params.from}T00:00:00`).toISOString()
    : undefined;
  const toIso = params.to
    ? new Date(`${params.to}T23:59:59`).toISOString()
    : undefined;

  const [events, cities] = await Promise.all([
    getCommunityEvents({
      city: params.city,
      online,
      from: fromIso,
      to: toIso,
    }),
    getCommunityCities(),
  ]);

  return (
    <>
      <CommunityNav active="calendar" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Community calendar</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Markets, shows, and sessions from creators who opted in. Past events
            are hidden automatically.
          </p>
        </header>

        <Suspense fallback={<div className="mb-8 h-32 animate-pulse rounded-xl bg-muted" />}>
          <div className="mb-8">
            <CalendarFilters
              cities={cities}
              initial={{
                city: params.city,
                online: params.online,
                from: params.from,
                to: params.to,
              }}
            />
          </div>
        </Suspense>

        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground">
            No upcoming community events match your filters.
          </p>
        ) : (
          <ol className="space-y-4">
            {events.map((event) => (
              <li key={event.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          <Link
                            href={`/@${event.profile.handle}?tab=events`}
                            className="hover:underline"
                          >
                            {event.title}
                          </Link>
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by{" "}
                          <Link
                            href={`/@${event.profile.handle}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {event.profile.display_name}
                          </Link>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.is_online ? (
                          <Badge variant="secondary">Online</Badge>
                        ) : (
                          event.city && <Badge variant="outline">{event.city}</Badge>
                        )}
                        <ReportButton
                          targetType="event"
                          targetId={event.id}
                          targetLabel={event.title}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium">{formatEventWhen(event)}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    {(event.location || event.url) && (
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
                          event.location
                        )}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href={`/@${event.profile.handle}?tab=events`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        View deck
                      </Link>
                      <a
                        href={`/api/events/${event.id}/ics`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Add to calendar
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}
