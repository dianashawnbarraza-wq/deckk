export async function redirectToStripeIfNeeded(returnTo: string): Promise<void> {
  const res = await fetch("/api/stripe/connect/status");
  if (!res.ok) return;

  const { charges_enabled } = await res.json();
  if (charges_enabled) return;

  const connectRes = await fetch("/api/stripe/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnTo }),
  });
  const data = await connectRes.json();
  if (data.url) {
    window.location.href = data.url;
  }
}
