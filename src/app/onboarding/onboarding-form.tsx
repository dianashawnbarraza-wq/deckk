"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { ThemeSwatch } from "@/components/profile/theme-swatch";
import { createClient } from "@/lib/supabase/client";
import type { AccentPreset } from "@/lib/theme";

const RESERVED = new Set([
  "admin", "api", "app", "www", "help", "settings", "dashboard", "login",
  "signup", "about", "terms", "privacy", "calendar", "discover", "stripe",
  "webhook", "assets", "static", "deckk", "deck",
]);

export default function OnboardingForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accent, setAccent] = useState<AccentPreset>("poppy");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalized = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const valid = /^[a-z0-9_]{3,30}$/.test(normalized) && !RESERVED.has(normalized);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("Handle must be 3–30 characters (letters, numbers, underscore).");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      handle: normalized,
      display_name: displayName || normalized,
      is_published: true,
      theme: { accent },
    });

    if (insertError) {
      setError(insertError.message.includes("unique")
        ? "That handle is taken."
        : insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AuthShell
      title="Claim your handle"
      subtitle="This is your address. Make it memorable — you can't change it later."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="handle">Handle</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">deckk.me/</span>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourname"
              required
            />
          </div>
          {normalized && valid && (
            <p className="text-sm text-brand-accent-strong">deckk.me/{normalized}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you want to appear"
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label>Page accent</Label>
          <ThemeSwatch value={accent} onChange={setAccent} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !valid} className="w-full">
          {loading ? "Creating…" : "Create deck"}
        </Button>
      </form>
    </AuthShell>
  );
}
