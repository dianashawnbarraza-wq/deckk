import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardEventList } from "@/components/events/dashboard-event-list";
import { buttonVariants } from "@/components/ui/button";
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          ← Dashboard
        </Link>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Post markets, shows, and online sessions. Visitors can add events to
        their calendar with timezone-correct .ics files.
      </p>

      <DashboardEventList
        profileId={profile.id}
        events={events ?? []}
      />

      <p className="mt-8 text-sm text-muted-foreground">
        Preview:{" "}
        <Link href={publicDeckPath(profile.handle, { tab: "events" })} className="underline">
          deckk.me/@{profile.handle}?tab=events
        </Link>
      </p>
    </main>
  );
}
