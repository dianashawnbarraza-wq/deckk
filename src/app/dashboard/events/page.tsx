import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardEventList } from "@/components/events/dashboard-event-list";
import { EditorShell } from "@/components/layout/editor-shell";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";

export default async function EventsDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("profile_id", profile.id)
    .order("starts_at", { ascending: true });

  return (
    <EditorShell title="Events" backHref="/dashboard" backLabel="Dashboard">
      <p className="mb-8 text-base leading-relaxed text-muted-foreground">
        Post markets, shows, and online sessions. Visitors can add events to
        their calendar with timezone-correct .ics files.
      </p>

      <DashboardEventList profileId={profile.id} events={events ?? []} />

      <p className="mt-10 text-base text-muted-foreground">
        Preview:{" "}
        <Link
          href={publicDeckPath(profile.handle, { tab: "events" })}
          className="text-brand-accent-strong underline-offset-4 hover:underline"
        >
          deckk.me/{profile.handle}?tab=events
        </Link>
      </p>
    </EditorShell>
  );
}
