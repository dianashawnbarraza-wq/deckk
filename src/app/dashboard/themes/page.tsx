import { redirect } from "next/navigation";
import { EditorShell } from "@/components/layout/editor-shell";
import { ThemePicker } from "@/components/themes/theme-picker";
import { createClient } from "@/lib/supabase/server";
import { resolveAccentPreset } from "@/lib/theme";

export default async function ThemesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, theme")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <EditorShell title="Explore themes" backHref="/dashboard" backLabel="Dashboard">
      <ThemePicker
        initialAccent={resolveAccentPreset(profile.theme)}
        handle={profile.handle}
      />
    </EditorShell>
  );
}
