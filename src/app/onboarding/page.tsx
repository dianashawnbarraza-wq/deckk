"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const RESERVED = new Set([
  "admin", "api", "app", "www", "help", "settings", "dashboard", "login",
  "signup", "about", "terms", "privacy", "calendar", "discover", "stripe",
  "webhook", "assets", "static", "deckk", "deck",
]);

export default function OnboardingPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Claim your handle</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="handle">Handle</Label>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">@</span>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
          </div>
          {normalized && (
            <p className="mt-1 text-xs text-muted-foreground">
              deckk.me/@{normalized}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !valid} className="w-full">
          {loading ? "Creating…" : "Create deck"}
        </Button>
      </form>
    </main>
  );
}
