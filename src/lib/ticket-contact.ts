const TICKET_CONTACT_PREFIX = "ticket_contact:";

export function ticketContactFromTags(tags: unknown): string | null {
  if (!Array.isArray(tags)) return null;
  for (const tag of tags) {
    if (typeof tag !== "string" || !tag.startsWith(TICKET_CONTACT_PREFIX)) {
      continue;
    }
    const email = tag.slice(TICKET_CONTACT_PREFIX.length).trim().toLowerCase();
    if (email && email.includes("@")) return email;
  }
  return null;
}

export function withTicketContactTag(
  tags: string[],
  email: string | null | undefined
): string[] {
  const next = tags.filter((t) => !t.startsWith(TICKET_CONTACT_PREFIX));
  const cleaned = email?.trim().toLowerCase() ?? "";
  if (cleaned && cleaned.includes("@")) {
    next.push(`${TICKET_CONTACT_PREFIX}${cleaned}`);
  }
  return next;
}

export function isValidTicketContactEmail(value: string): boolean {
  const email = value.trim();
  if (!email || email.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
