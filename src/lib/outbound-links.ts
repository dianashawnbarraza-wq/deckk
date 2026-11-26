/**
 * Normalize outbound CTAs so payment / social apps open natively when installed.
 */

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Extract a Venmo username from common URL / handle shapes. */
export function extractVenmoUsername(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Bare handle: @mxholiday or mxholiday
  if (/^@?[A-Za-z0-9_-]+$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed.replace(/^@/, "");
  }

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.includes("venmo")) return null;

    // https://venmo.com/u/{user}
    // https://account.venmo.com/u/{user}
    // https://venmo.com/{user}
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "u" && parts[1]) return parts[1];
    if (parts[0] === "code") {
      // QR / code links — leave as-is (handled by caller)
      return null;
    }
    if (parts[0] && !["pay", "account", "signup", "login"].includes(parts[0].toLowerCase())) {
      return parts[0];
    }
  } catch {
    // ignore
  }

  const m = trimmed.match(/venmo\.com\/(?:u\/)?([A-Za-z0-9_-]+)/i);
  return m?.[1] ?? null;
}

/**
 * Venmo HTTPS profile URLs that participate in Universal Links / App Links.
 * Prefer these over account.venmo.com so installed apps open.
 */
export function venmoProfileWebUrl(username: string): string {
  return `https://venmo.com/u/${encodeURIComponent(username)}`;
}

/** Native Venmo scheme — opens the app when present. */
export function venmoNativeUrl(
  username: string,
  options?: { preferPay?: boolean; note?: string; amount?: number }
): string {
  const preferPay = options?.preferPay ?? false;
  if (preferPay) {
    const params = new URLSearchParams({
      txn: "pay",
      recipients: username,
    });
    if (options?.note?.trim()) params.set("note", options.note.trim());
    if (
      options?.amount != null &&
      Number.isFinite(options.amount) &&
      options.amount > 0
    ) {
      params.set("amount", String(options.amount));
    }
    return `venmo://paycharge?${params.toString()}`;
  }
  return `venmo://users/${encodeURIComponent(username)}`;
}

/**
 * HTTPS pay intent — used as fallback when the app doesn't open.
 * Prefills recipient + note when possible.
 */
export function venmoPayWebUrl(
  username: string,
  options?: { note?: string; amount?: number }
): string {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "private",
    recipients: username,
  });
  if (options?.note?.trim()) params.set("note", options.note.trim());
  if (
    options?.amount != null &&
    Number.isFinite(options.amount) &&
    options.amount > 0
  ) {
    params.set("amount", String(options.amount));
  }
  return `https://venmo.com/?${params.toString()}`;
}

/**
 * Rewrite known URLs to the form most likely to open a native app.
 * Safe to use as an <a href>.
 */
export function outboundHref(url: string | null | undefined): string {
  if (!url) return "#";
  const host = hostOf(url);
  if (host.includes("venmo")) {
    const username = extractVenmoUsername(url);
    if (username) return venmoProfileWebUrl(username);
  }
  return url;
}

/**
 * Open Venmo via native scheme when possible, with HTTPS fallback.
 * Call from click handlers on Venmo support / tip links.
 */
export function openVenmo(
  urlOrUsername: string,
  options?: { preferPay?: boolean; note?: string; amount?: number }
) {
  const username =
    extractVenmoUsername(urlOrUsername) ?? urlOrUsername.replace(/^@/, "");
  if (!username) {
    window.open(urlOrUsername, "_blank", "noopener,noreferrer");
    return;
  }

  const preferPay = options?.preferPay ?? true;
  const web = preferPay
    ? venmoPayWebUrl(username, { note: options?.note, amount: options?.amount })
    : venmoProfileWebUrl(username);
  const native = venmoNativeUrl(username, {
    preferPay,
    note: options?.note,
    amount: options?.amount,
  });

  const started = Date.now();
  const fallback = window.setTimeout(() => {
    // If the page is still visible, the app likely didn't open.
    if (!document.hidden && Date.now() - started < 1800) {
      window.location.href = web;
    }
  }, 650);

  const onHide = () => {
    window.clearTimeout(fallback);
    document.removeEventListener("visibilitychange", onHide);
  };
  document.addEventListener("visibilitychange", onHide);

  window.location.href = native;
}

export function isVenmoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return hostOf(url).includes("venmo") || /venmo/i.test(url);
}
