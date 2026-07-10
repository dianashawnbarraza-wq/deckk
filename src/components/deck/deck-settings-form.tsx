"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSwatch } from "@/components/profile/theme-swatch";
import { createClient } from "@/lib/supabase/client";
import type { AccentPreset } from "@/lib/theme";

const RESERVED = new Set([
  "admin", "api", "app", "www", "help", "settings", "dashboard", "login",
  "signup", "about", "terms", "privacy", "calendar", "discover", "stripe",
  "webhook", "assets", "static", "deckk", "deck",
]);

interface DeckSettingsFormProps {
  mode: "create" | "edit";
  initialHandle?: string;
  initialDisplayName?: string;
  initialAccent?: AccentPreset;
}

export function DeckSettingsForm({
  mode,
  initialHandle = "",
  initialDisplayName = "",
  initialAccent = "poppy",
}: DeckSettingsFormProps) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialHandle);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [accent, setAccent] = useState<AccentPreset>(initialAccent);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalized = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const valid =
    mode === "edit" || (/^[a-z0-9_]{3,30}$/.test(normalized) && !RESERVED.has(normalized));

  const unchanged =
    mode === "edit" &&
    displayName.trim() === initialDisplayName.trim() &&
    accent === initialAccent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("Handle must be 3–30 characters (letters, numbers, underscore).");
      return;
    }

    setLoading(true);
    setError("");

    if (mode === "create") {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        handle: normalized,
        display_name: displayName.trim() || normalized,
        is_published: true,
        theme: { accent },
      });

      if (insertError) {
        setError(
          insertError.message.includes("unique")
            ? "That handle is taken."
            : insertError.message
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          theme: { accent },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/dashboard?settings=saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="handle">Handle</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-muted-foreground">deckk.me/</span>
          {mode === "edit" ? (
            <p
              id="handle"
              className="flex h-11 min-w-0 flex-1 items-center rounded-[0.625rem] border border-line bg-paper-sunken/50 px-4 text-base text-ink"
            >
              {initialHandle}
            </p>
          ) : (
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourname"
              required
            />
          )}
        </div>
        {mode === "create" && normalized && valid && (
          <p className="text-sm text-brand-accent-strong">deckk.me/{normalized}</p>
        )}
        {mode === "edit" && (
          <p className="text-sm text-muted-foreground">Your handle can&apos;t be changed.</p>
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

      <Button
        type="submit"
        disabled={loading || !valid || unchanged}
        className="w-full"
      >
        {loading
          ? mode === "create"
            ? "Creating…"
            : "Saving…"
          : mode === "create"
            ? "deckk"
            : "Save"}
      </Button>
    </form>
  );
}
