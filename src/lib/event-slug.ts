/** URL-safe slug from an event title (e.g. "Butch Brunch" → "butch-brunch"). */
export function slugifyTitle(title: string, maxLen = 48): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
  return base || "event";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function looksLikeUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Prefer short slug path when available. */
export function eventPublicPath(card: {
  id: string;
  slug?: string | null;
  title?: string | null;
}): string {
  const slug =
    card.slug?.trim() ||
    (card.title ? slugifyTitle(card.title) : "") ||
    "";
  return `/events/${slug || card.id}`;
}
