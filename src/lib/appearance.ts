import type { DeckTheme } from "@/types/cards";

export type Appearance = "dark" | "light";

export function deckAppearance(theme: DeckTheme | null | undefined): Appearance {
  return theme?.dark === false ? "light" : "dark";
}
