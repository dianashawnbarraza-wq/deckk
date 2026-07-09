"use client";

import { ACCENT_PRESETS, type AccentPreset } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeSwatch({
  value,
  onChange,
}: {
  value: AccentPreset;
  onChange: (preset: AccentPreset) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((preset) => {
        const { label, accent } = ACCENT_PRESETS[preset];
        const selected = value === preset;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            aria-label={`${label} theme`}
            aria-pressed={selected}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96]",
              selected
                ? "border-ink bg-paper-sunken text-ink ring-2 ring-ink ring-offset-2 ring-offset-paper"
                : "border-line bg-paper text-muted-foreground hover:border-ink/30"
            )}
          >
            <span
              className="size-4 shrink-0 rounded-full ring-1 ring-line"
              style={{ backgroundColor: accent }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
