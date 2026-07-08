/** Public deck URL path. Avoid `/@handle` — Next.js treats `@` segments as parallel routes. */
export function publicDeckPath(
  handle: string,
  query?: Record<string, string | undefined>
): string {
  const slug = handle.replace(/^@/, "").toLowerCase();
  const base = `/${slug}`;
  if (!query) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
