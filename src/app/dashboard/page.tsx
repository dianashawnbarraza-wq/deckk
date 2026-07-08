import Link from "next/link";
import { redirect } from "next/navigation";
import { CommunityOptInToggle } from "@/components/community/community-opt-in-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { devAuthEnabled } from "@/lib/dev-auth";
import { publicDeckPath } from "@/lib/paths";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, is_published, charges_enabled, community_opt_in")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {devAuthEnabled() && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Demo mode — login bypass is on. Remove <code className="text-xs">BYPASS_AUTH</code> on
          Vercel before launch.
        </p>
      )}
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="space-y-3">
        <Link
          href="/dashboard/payments"
          className={cn(buttonVariants(), "w-full justify-start")}
        >
          Payments
        </Link>
        <Link
          href="/dashboard/events"
          className={cn(buttonVariants(), "w-full justify-start")}
        >
          Events
        </Link>
        <Link
          href={publicDeckPath(profile.handle)}
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
        >
          View public deck
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <CommunityOptInToggle initialOptIn={profile.community_opt_in} />
        <div className="rounded-xl border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Community pages</p>
          <p className="mt-1">
            Events with &quot;Show on community calendar&quot; appear on{" "}
            <Link href="/calendar" className="underline">
              /calendar
            </Link>
            . Directory opt-in lists your deck on{" "}
            <Link href="/discover" className="underline">
              /discover
            </Link>
            .
          </p>
        </div>
      </div>

      {!profile.is_published && (
        <p className="mt-6 text-sm text-muted-foreground">
          Your deck is not published yet. Publish from settings when ready.
        </p>
      )}
    </main>
  );
}
