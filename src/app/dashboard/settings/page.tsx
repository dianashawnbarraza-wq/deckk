import { redirect } from "next/navigation";
import { DeckSettingsForm } from "@/components/deck/deck-settings-form";
import { EditorShell } from "@/components/layout/editor-shell";
import { createClient } from "@/lib/supabase/server";
import { resolveAccentPreset } from "@/lib/theme";

export default async function DeckSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, theme")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <EditorShell
      title="Deck settings"
      subtitle="Same choices as onboarding — update your name and page accent anytime."
      contentBackHref="/dashboard"
      contentBackLabel="Dashboard"
    >
      <DeckSettingsForm
        mode="edit"
        initialHandle={profile.handle}
        initialDisplayName={profile.display_name}
        initialAccent={resolveAccentPreset(profile.theme)}
      />
    </EditorShell>
  );
}
