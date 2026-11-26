export type AccentPreset = "poppy" | "lime" | "cobalt" | "grape" | "ink";

export const ACCENT_PRESETS: Record<
  AccentPreset,
  { label: string; accent: string; accentStrong: string }
> = {
  poppy: { label: "Poppy", accent: "#FF4433", accentStrong: "#C42E1F" },
  lime: { label: "Lime", accent: "#9AE600", accentStrong: "#4D7300" },
  cobalt: { label: "Cobalt", accent: "#2D5BFF", accentStrong: "#1A3DB8" },
  grape: { label: "Grape", accent: "#332D3B", accentStrong: "#1F1A24" },
  ink: { label: "Ink", accent: "#1A1A1A", accentStrong: "#1A1A1A" },
};

export function resolveAccentPreset(theme: unknown): AccentPreset {
  if (
    theme &&
    typeof theme === "object" &&
    "accent" in theme &&
    typeof (theme as { accent: unknown }).accent === "string"
  ) {
    const key = (theme as { accent: string }).accent as AccentPreset;
    if (key in ACCENT_PRESETS) return key;
  }
  return "poppy";
}

export function accentStyle(preset: AccentPreset): Record<string, string> {
  const { accent, accentStrong } = ACCENT_PRESETS[preset];
  return {
    ["--brand-accent" as string]: accent,
    ["--brand-accent-strong" as string]: accentStrong,
    // Keep deck chrome in sync when a creator picks an accent swatch
    ["--accent" as string]: accent,
    ["--primary" as string]: accent,
    ["--ring" as string]: accent,
  };
}
