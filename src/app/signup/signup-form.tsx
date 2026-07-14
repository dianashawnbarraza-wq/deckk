"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneShell, ThemeToggleButton } from "@/components/shell/phone-shell";

export default function SignupForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, ""),
          displayName: displayName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create deck");
        return;
      }
      router.replace("/studio");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhoneShell>
      <div className="deckk-scroll-hide absolute inset-0 overflow-y-auto p-6 deckk-fade-up">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggleButton />
        </div>
        <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center py-10">
          <p className="mb-2 text-[9px] font-bold tracking-[0.18em] text-primary uppercase">
            ✦ Welcome
          </p>
          <h1 className="mb-2 font-display text-4xl leading-tight text-foreground">
            Claim your deck
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-dim">
            Pick your public link — then Studio opens so you can snap a flyer and
            publish your first card.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <div className="flex items-center gap-1 rounded-xl border border-deck-card-brd bg-glass-strong px-3 backdrop-blur-xl">
                <span className="text-sm text-dim">deckk.me/</span>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  placeholder="shawn"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  pattern="[a-z0-9_]{3,30}"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Shawn"
                className="rounded-xl border-deck-card-brd bg-glass-strong backdrop-blur-xl"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-[15px] text-sm font-semibold" disabled={loading}>
              {loading ? "Creating…" : "deckk"}
            </Button>
          </form>
        </div>
      </div>
    </PhoneShell>
  );
}
