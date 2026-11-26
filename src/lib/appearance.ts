import type { DeckTheme } from "@/types/cards";

export type Appearance = "dark" | "light" | "lilac";

export const APPEARANCES: Appearance[] = ["light", "lilac", "dark"];

export function deckAppearance(theme: DeckTheme | null | undefined): Appearance {
  const stored = theme?.appearance;
  if (stored === "lilac" || stored === "light" || stored === "dark") return stored;
  return theme?.dark === false ? "light" : "dark";
}

export function nextAppearance(current: Appearance): Appearance {
  if (current === "dark") return "light";
  if (current === "light") return "lilac";
  return "dark";
}

export function appearanceThemePatch(next: Appearance): Pick<DeckTheme, "appearance" | "dark"> {
  return {
    appearance: next,
    dark: next === "dark",
  };
}

export function appearanceLabel(a: Appearance): string {
  if (a === "lilac") return "Lilac";
  if (a === "light") return "Light";
  return "Dark";
}
