/** Temporary auth bypass for testing — never enable in real production. */
export function devAuthEnabled(): boolean {
  return process.env.BYPASS_AUTH === "true";
}

export function devAuthEmail(): string {
  return process.env.BYPASS_AUTH_EMAIL ?? "demo@deckk.me";
}

export function devAuthHandle(): string {
  return process.env.BYPASS_AUTH_HANDLE ?? "shawn";
}
