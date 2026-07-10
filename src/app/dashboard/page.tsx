import Link from "next/link";
import { redirect } from "next/navigation";
import { CommunityOptInToggle } from "@/components/community/community-opt-in-toggle";
import { SmartComposer } from "@/components/compose/smart-composer";
import { DeckMiniPreview } from "@/components/deck/deck-mini-preview";
import { DashboardHeaderActions } from "@/components/dashboard/dashboard-header-actions";
import { EditorShell } from "@/components/layout/editor-shell";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { buttonVariants } from "@/components/ui/button";
import { devAuthEnabled } from "@/lib/dev-auth";
import { publicDeckPath } from "@/lib/paths";
import { getProfileByUserId } from "@/lib/profile-query";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ theme?: string; settings?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(supabase, user.id);

  if (!profile) redirect("/onboarding");

  const { theme: themeParam, settings: settingsParam } = await searchParams;

  const [blocksRes, productsRes, linksRes, eventsRes] = await Promise.all([
    supabase
      .from("blocks")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("position"),
    supabase
      .from("products")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_links")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("starts_at", { ascending: true }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://deckk.me";
  const shareUrl = `${appUrl.replace(/\/$/, "")}${publicDeckPath(profile.handle)}`;

  return (
    <EditorShell
      hideTitle
      wide
      headerActions={
        <DashboardHeaderActions shareUrl={shareUrl} displayName={profile.display_name} />
      }
    >
      {(themeParam === "saved" || settingsParam === "saved") && (
        <p className="mb-6 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-sm text-ink">
          Deck settings saved — your name and accent are updated.
        </p>
      )}

      {devAuthEnabled() && (
        <p className="mb-6 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-sm text-ink">
          Demo mode — login bypass is on. Remove <code className="text-xs">BYPASS_AUTH</code> on
          Vercel before launch.
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
        <div className="min-w-0">
          <div className="mb-8">
            <h1 className="font-display text-[2.25rem] leading-[1.02] tracking-tight text-ink sm:text-[2.75rem]">
              What are we adding?
            </h1>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              Upload, describe, publish — your deck updates in seconds.
            </p>
          </div>

          <SmartComposer profileId={profile.id} variant="chat" showHint={false} />
        </div>

        <aside className="mx-auto w-full max-w-[220px] lg:sticky lg:top-6 lg:mx-0">
          <p className="mb-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:text-left">
            Preview
          </p>
          <DeckMiniPreview
            profile={profile}
            blocks={blocksRes.data ?? []}
            products={productsRes.data ?? []}
            paymentLinks={linksRes.data ?? []}
            events={eventsRes.data ?? []}
            variant="sidebar"
          />
        </aside>
      </div>

      <div className="mt-12 space-y-6">
        <ProfileEditor
          handle={profile.handle}
          initialDisplayName={profile.display_name}
          initialBio={profile.bio}
          initialAvatarUrl={profile.avatar_url}
          initialHeaderUrl={profile.header_url ?? null}
        />

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "outline" }))}>
            Deck settings
          </Link>
          <Link href="/dashboard/payments" className={cn(buttonVariants({ variant: "outline" }))}>
            Payments
          </Link>
          <Link href="/dashboard/events" className={cn(buttonVariants({ variant: "outline" }))}>
            Events
          </Link>
        </div>

        <CommunityOptInToggle initialOptIn={profile.community_opt_in} />

        {!profile.is_published && (
          <p className="text-base text-muted-foreground">
            Your deck is not published yet. Publish from settings when ready.
          </p>
        )}
      </div>
    </EditorShell>
  );
}
