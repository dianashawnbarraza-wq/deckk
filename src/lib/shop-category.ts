/** Custom + inferred shop categories for filtering. */

export type ShopCategoryId = string;

export type ShopCategoryDef = {
  id: ShopCategoryId;
  label: string;
};

const CAT_TAG_PREFIX = "shop_cat:";

/** Built-in fallbacks when a deck has no custom categories yet. */
export const DEFAULT_SHOP_CATEGORIES: ShopCategoryDef[] = [
  { id: "tees", label: "Tees" },
  { id: "tags", label: "Tags" },
  { id: "stickers", label: "Stickers" },
  { id: "apparel", label: "Apparel" },
  { id: "accessories", label: "Accessories" },
  { id: "music", label: "Music" },
  { id: "food", label: "Food & drink" },
  { id: "prints", label: "Prints" },
  { id: "other", label: "Other" },
];

const DEFAULT_LABELS = Object.fromEntries(
  DEFAULT_SHOP_CATEGORIES.map((c) => [c.id, c.label])
) as Record<string, string>;

/** @deprecated use ShopCategoryId — kept for call-site compatibility */
export type ShopCategory = ShopCategoryId;

export const SHOP_CATEGORY_LABELS: Record<string, string> = { ...DEFAULT_LABELS };

export function shopCatTag(id: string): string {
  return `${CAT_TAG_PREFIX}${slugifyCategory(id)}`;
}

export function parseShopCatTag(
  tags: string[] | null | undefined
): string | null {
  if (!Array.isArray(tags)) return null;
  const hit = tags.find((t) => t.startsWith(CAT_TAG_PREFIX));
  if (!hit) return null;
  const id = hit.slice(CAT_TAG_PREFIX.length).trim().toLowerCase();
  return id || null;
}

export function slugifyCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function labelForCategoryId(
  id: string,
  custom?: ShopCategoryDef[] | null
): string {
  const fromCustom = custom?.find((c) => c.id === id)?.label;
  if (fromCustom) return fromCustom;
  if (DEFAULT_LABELS[id]) return DEFAULT_LABELS[id];
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Read ordered custom categories from deck theme JSON. */
export function shopCategoriesFromTheme(
  theme: Record<string, unknown> | null | undefined
): ShopCategoryDef[] {
  if (!theme || typeof theme !== "object") return [];
  const raw = theme.shopCategories;
  if (!Array.isArray(raw)) return [];
  const out: ShopCategoryDef[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id =
      typeof r.id === "string"
        ? slugifyCategory(r.id)
        : typeof r.slug === "string"
          ? slugifyCategory(r.slug)
          : "";
    const label =
      typeof r.label === "string" && r.label.trim()
        ? r.label.trim()
        : labelForCategoryId(id);
    if (!id) continue;
    if (out.some((c) => c.id === id)) continue;
    out.push({ id, label });
  }
  return out;
}

export function withShopCategoriesInTheme(
  theme: Record<string, unknown> | null | undefined,
  categories: ShopCategoryDef[]
): Record<string, unknown> {
  const base = theme && typeof theme === "object" ? { ...theme } : {};
  base.shopCategories = categories.map((c) => ({
    id: c.id,
    label: c.label,
  }));
  return base;
}

export function setCardShopCategory(
  tags: string[] | null | undefined,
  categoryId: string | null
): string[] {
  const kept = (Array.isArray(tags) ? tags : []).filter(
    (t) => !t.startsWith(CAT_TAG_PREFIX)
  );
  if (!categoryId) return kept;
  return [...kept, shopCatTag(categoryId)];
}

const RULES: { category: string; patterns: RegExp[] }[] = [
  {
    category: "tees",
    patterns: [
      /\b(tee|t-?shirt|shirt|hoodie|sweatshirt|crewneck|tank|jersey)\b/i,
    ],
  },
  {
    category: "tags",
    patterns: [/\b(pet[\s-]?tag|dog[\s-]?tag|bone[\s-]?tag|name[\s-]?tag|\btags?\b)\b/i],
  },
  {
    category: "stickers",
    patterns: [/\b(sticker|stickers|decal|decals|vinyl sticker)\b/i],
  },
  {
    category: "apparel",
    patterns: [
      /\b(jacket|pants|shorts|hat|cap|beanie|socks|apparel|clothing|wear)\b/i,
    ],
  },
  {
    category: "accessories",
    patterns: [
      /\b(tote|bag|pin|pins|keychain|keychains|bracelet|necklace|ring|earring|patch|patches|bandana|scarf|wallet|accessory|accessories)\b/i,
    ],
  },
  {
    category: "music",
    patterns: [
      /\b(vinyl|record|cassette|cd|album|ep\b|lp\b|single|music|song|bandcamp)\b/i,
    ],
  },
  {
    category: "food",
    patterns: [
      /\b(coffee|bean|beans|tea|chocolate|cookie|cookies|snack|snacks|food|drink|beverage)\b/i,
    ],
  },
  {
    category: "prints",
    patterns: [
      /\b(print|prints|poster|posters|zine|zines|book|books|art print|photo print)\b/i,
    ],
  },
];

/** Resolve category for a shop item — prefers explicit `shop_cat:` tag. */
export function inferShopCategory(input: {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
}): ShopCategoryId {
  const tagged = parseShopCatTag(input.tags);
  if (tagged) return tagged;

  // Plain tag match for known Kyle-style labels
  const tagSet = new Set(
    (input.tags ?? []).map((t) => t.trim().toLowerCase())
  );
  if (tagSet.has("tees") || tagSet.has("tee") || tagSet.has("apparel")) {
    return tagSet.has("tees") || tagSet.has("tee") ? "tees" : "apparel";
  }
  if (tagSet.has("tags") || tagSet.has("tag")) return "tags";
  if (tagSet.has("stickers") || tagSet.has("sticker")) return "stickers";

  const blob = [
    input.title ?? "",
    input.description ?? "",
    ...(input.tags ?? []),
  ]
    .join(" ")
    .trim();
  if (!blob) return "other";
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(blob))) return rule.category;
  }
  return "other";
}

/** Categories to show as chips: deck custom list first, then any present on items. */
export function resolveShopFilterCategories(opts: {
  theme?: Record<string, unknown> | null;
  presentIds: Iterable<string>;
}): ShopCategoryDef[] {
  const custom = shopCategoriesFromTheme(opts.theme);
  const present = new Set(opts.presentIds);
  if (custom.length > 0) {
    const ordered = custom.filter((c) => present.has(c.id));
    // Include orphan categories that appear on items but aren't in theme yet
    for (const id of present) {
      if (!ordered.some((c) => c.id === id) && id !== "other") {
        ordered.push({ id, label: labelForCategoryId(id, custom) });
      }
    }
    if (present.has("other") && !ordered.some((c) => c.id === "other")) {
      ordered.push({ id: "other", label: "Other" });
    }
    return ordered;
  }
  // No custom list — show defaults that are present, in default order
  return DEFAULT_SHOP_CATEGORIES.filter((c) => present.has(c.id));
}
