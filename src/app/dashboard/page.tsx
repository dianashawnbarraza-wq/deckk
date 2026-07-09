import Link from "next/link";
import { redirect } from "next/navigation";
import { CommunityOptInToggle } from "@/components/community/community-opt-in-toggle";
import { EditorShell } from "@/components/layout/editor-shell";
import { LinkCard } from "@/components/profile/link-card";
import { buttonVariants } from "@/components/ui/button";
import { devAuthEnabled } from "@/lib/dev-auth";
import { publicDeckPath } from "@/lib/paths";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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
    <EditorShell title="Your deck">
      {devAuthEnabled() && (
        <p className="mb-6 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-sm text-ink">
          Demo mode — login bypass is on. Remove <code className="text-xs">BYPASS_AUTH</code> on
          Vercel before launch.
        </p>
      )}

      <div className="space-y-3">
        <Link
          href="/dashboard/payments"
          className={cn(buttonVariants(), "w-full justify-center")}
        >
          Payments
        </Link>
        <Link
          href="/dashboard/events"
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
        >
          Events
        </Link>
      </div>

      <section className="mt-10">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Preview
        </p>
        <LinkCard
          title="View public deck"
          subtitle={`deckk.me/${profile.handle}`}
          href={publicDeckPath(profile.handle)}
          variant="row"
          external={false}
        />
      </section>

      <div className="mt-10 space-y-4">
        <CommunityOptInToggle initialOptIn={profile.community_opt_in} />
        <div className="rounded-[1rem] border border-line p-5 text-base text-muted-foreground">
          <p className="font-medium text-ink">Community pages</p>
          <p className="mt-2 leading-relaxed">
            Events with &quot;Show on community calendar&quot; appear on{" "}
            <Link href="/calendar" className="text-brand-accent-strong underline-offset-4 hover:underline">
              /calendar
            </Link>
            . Directory opt-in lists your deck on{" "}
            <Link href="/discover" className="text-brand-accent-strong underline-offset-4 hover:underline">
              /discover
            </Link>
            .
          </p>
        </div>
      </div>

      {!profile.is_published && (
        <p className="mt-6 text-base text-muted-foreground">
          Your deck is not published yet. Publish from settings when ready.
        </p>
      )}
    </EditorShell>
  );
}
