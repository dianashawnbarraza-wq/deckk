import Link from "next/link";
import { redirect } from "next/navigation";
import { CommunityOptInToggle } from "@/components/community/community-opt-in-toggle";
import { SmartComposer } from "@/components/compose/smart-composer";
import { EditorShell } from "@/components/layout/editor-shell";
import { ProfileEditor } from "@/components/profile/profile-editor";
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
    .select("id, handle, display_name, bio, avatar_url, is_published, community_opt_in")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <EditorShell hideTitle>
      {devAuthEnabled() && (
        <p className="mb-6 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-sm text-ink">
          Demo mode — login bypass is on. Remove <code className="text-xs">BYPASS_AUTH</code> on
          Vercel before launch.
        </p>
      )}

      <div className="mb-10 text-center">
        <h1 className="font-display text-[2.25rem] leading-[1.02] tracking-tight text-ink sm:text-[2.75rem]">
          What are we adding?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          Upload, describe, publish — your deck updates in seconds.
        </p>
      </div>

      <SmartComposer profileId={profile.id} variant="chat" />

      <div className="mt-12 space-y-6">
        <ProfileEditor
          handle={profile.handle}
          initialDisplayName={profile.display_name}
          initialBio={profile.bio}
          initialAvatarUrl={profile.avatar_url}
        />

        <section>
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

        <div className="flex flex-wrap gap-3">
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
