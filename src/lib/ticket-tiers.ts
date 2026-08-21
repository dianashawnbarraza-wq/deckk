/** Optional one-off test / promo tier via card tag: `test_ticket:50` (cents). */

export function parseTestTicketCents(tags: string[] | null | undefined): number | null {
  if (!Array.isArray(tags)) return null;
  const hit = tags.find((t) => t.startsWith("test_ticket:"));
  if (!hit) return null;
  const n = Number.parseInt(hit.slice("test_ticket:".length), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export type TicketTierId = "ga" | "test";
