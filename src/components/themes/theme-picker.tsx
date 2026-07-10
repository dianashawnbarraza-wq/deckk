"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ACCENT_PRESETS, accentStyle, type AccentPreset } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemePicker({
  initialAccent,
  handle,
}: {
  initialAccent: AccentPreset;
  handle: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialAccent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: { accent: selected } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save theme");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground">
        Pick an accent for deckk.me/{handle}. Changes apply to your public deck instantly.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((key) => {
          const preset = ACCENT_PRESETS[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={cn(
                "rounded-[1rem] border p-4 text-left transition-[transform,box-shadow,border-color]",
                isSelected
                  ? "border-brand-accent shadow-[0_0_0_1px_var(--brand-accent)]"
                  : "border-line hover:-translate-y-0.5"
              )}
              style={accentStyle(key)}
            >
              <div
                className="mb-3 h-10 rounded-full"
                style={{ background: preset.accent }}
              />
              <p className="font-medium text-ink">{preset.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{preset.accent}</p>
            </button>
          );
        })}
      </div>

      <Button type="button" onClick={save} disabled={saving || selected === initialAccent}>
        {saving ? "Saving…" : "Apply theme"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
