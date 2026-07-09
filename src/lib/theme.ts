export type AccentPreset = "poppy" | "lime" | "cobalt" | "grape" | "ink";

export const ACCENT_PRESETS: Record<
  AccentPreset,
  { label: string; accent: string; accentStrong: string }
> = {
  poppy: { label: "Poppy", accent: "#FF4433", accentStrong: "#C42E1F" },
  lime: { label: "Lime", accent: "#9AE600", accentStrong: "#4D7300" },
  cobalt: { label: "Cobalt", accent: "#2D5BFF", accentStrong: "#1A3DB8" },
  grape: { label: "Grape", accent: "#8B5CF6", accentStrong: "#6D28D9" },
  ink: { label: "Ink", accent: "#191512", accentStrong: "#191512" },
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
  };
}
