export type EventHost = {
  name: string;
  /** Deckk handle without @ — links to /{handle} */
  handle?: string | null;
  /** Extra label, e.g. "Akbar" */
  note?: string | null;
  /** Outbound Instagram profile URL */
  instagram?: string | null;
  /** Outbound Facebook page/profile URL */
  facebook?: string | null;
};

const HOST_TAG_PREFIX = "host:";

function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

export function normalizeHosts(raw: unknown): EventHost[] {
  if (!Array.isArray(raw)) return [];
  const out: EventHost[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name) continue;
    const handle =
      typeof row.handle === "string" && row.handle.trim()
        ? row.handle.replace(/^@/, "").trim().toLowerCase()
        : null;
    const note =
      typeof row.note === "string" && row.note.trim()
        ? row.note.trim()
        : null;
    out.push({
      name,
      handle,
      note,
      instagram: cleanUrl(row.instagram),
      facebook: cleanUrl(row.facebook),
    });
  }
  return out;
}

/** Encode hosts into card tags for environments without a hosts column. */
export function hostsToTags(hosts: EventHost[], existingTags: string[]): string[] {
  const kept = existingTags.filter((t) => !t.startsWith(HOST_TAG_PREFIX));
  const encoded = hosts.map((h) => {
    const handle = h.handle?.replace(/^@/, "").trim().toLowerCase() ?? "";
    const note = h.note?.trim() ?? "";
    // Keep social URLs out of tags (pipes break encoding); persist via hosts column.
    return `${HOST_TAG_PREFIX}${h.name.trim()}|${handle}|${note}`;
  });
  return [...kept, ...encoded];
}

export function hostsFromTags(tags: string[]): EventHost[] {
  const hosts: EventHost[] = [];
  for (const tag of tags) {
    if (!tag.startsWith(HOST_TAG_PREFIX)) continue;
    const body = tag.slice(HOST_TAG_PREFIX.length);
    const [name = "", handle = "", note = ""] = body.split("|");
    const trimmed = name.trim();
    if (!trimmed) continue;
    hosts.push({
      name: trimmed,
      handle: handle.trim() ? handle.trim().toLowerCase() : null,
      note: note.trim() || null,
      instagram: null,
      facebook: null,
    });
  }
  return hosts;
}

export function resolveHosts(row: {
  hosts?: unknown;
  tags?: unknown;
}): EventHost[] {
  const fromCol = normalizeHosts(row.hosts);
  if (fromCol.length > 0) return fromCol;
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  return hostsFromTags(tags);
}

/** Page-level host enrichments for known co-hosts. */
export function enrichEventHosts(hosts: EventHost[]): EventHost[] {
  return hosts.map((host) => {
    if (/butch\s*monthly/i.test(host.name)) {
      return {
        ...host,
        name: "Butch Monthly LA",
        instagram:
          host.instagram ?? "https://www.instagram.com/butchmonthlyla/",
      };
    }
    if (/kyle\s*holiday/i.test(host.name)) {
      return {
        ...host,
        handle: null,
        instagram:
          host.instagram ?? "https://www.instagram.com/thekyleholiday/",
      };
    }
    if (/^jp$/i.test(host.name.trim()) || /^jp\b/i.test(host.name.trim())) {
      return {
        ...host,
        instagram: host.instagram ?? "https://www.instagram.com/jparr/",
      };
    }
    return host;
  });
}
