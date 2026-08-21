/** Handles whose live events appear on the public Events directory / home. */
export const FEATURED_EVENT_HANDLES = [
  "kyleholiday",
  "chainsoflove",
  "snakeandmoon",
] as const;

export type FeaturedEventHandle = (typeof FEATURED_EVENT_HANDLES)[number];

export function isFeaturedEventHost(
  handle: string | null | undefined
): boolean {
  if (!handle) return false;
  return (FEATURED_EVENT_HANDLES as readonly string[]).includes(
    handle.toLowerCase()
  );
}
