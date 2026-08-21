import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { TICKET_PLATFORM_FEE_CENTS } from "@/lib/platform-fee";
import { ticketCheckinUrl } from "@/lib/tickets";
import { CommunityBadge } from "@/components/deck/community-badge";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { PublicThemeShell } from "@/components/layout/public-theme-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type TicketRow = {
  ticket_code: string;
  qr_url: string | null;
};

export default async function TicketConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id: cardId } = await params;
  const { session_id: sessionId } = await searchParams;
  const supabase = createAdminClient();

  const { data: card } = await supabase
    .from("cards")
    .select("id, title, ticket_price_cents, media")
    .eq("id", cardId)
    .maybeSingle();

  const browseEventsHref = "/events";

  let quantity = 1;
  let unitCents = card?.ticket_price_cents ?? 0;
  let totalCents = unitCents + TICKET_PLATFORM_FEE_CENTS;
  let email: string | null = null;
  let tickets: TicketRow[] = [];

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      const line = session.line_items?.data?.[0];
      quantity = line?.quantity ?? 1;
      unitCents = line?.price?.unit_amount ?? unitCents;
      totalCents =
        session.amount_total ?? unitCents * quantity + TICKET_PLATFORM_FEE_CENTS;
      email = session.customer_details?.email ?? null;

      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();

      if (order?.id) {
        const { data: rows } = await supabase
          .from("tickets")
          .select("ticket_code, qr_url")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true });
        tickets = (rows as TicketRow[] | null) ?? [];
      }
    } catch {
      // show static confirmation
    }
  }

  const ticketSubtotal = unitCents * quantity;
  const fee = TICKET_PLATFORM_FEE_CENTS;

  return (
    <PublicThemeShell initialAppearance="dark">
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-lg px-5 py-10 lg:max-w-xl">
        <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
          Confirmed
        </p>
        <h1 className="mt-2 font-display text-[34px] leading-tight">
          You&apos;re in
        </h1>
        <p className="mt-2 text-[14px] text-dim">
          {card?.title
            ? `Your ${card.title} ticket is confirmed.`
            : "Your ticket is confirmed."}
          {email
            ? ` A copy with QR codes is on its way to ${email}.`
            : " Check your email for your QR code."}
        </p>

        {tickets.length > 0 ? (
          <div className="mt-6 space-y-4">
            <p className="text-[13px] font-semibold text-foreground">
              Show at the door
            </p>
            {tickets.map((t, i) => (
              <div
                key={t.ticket_code}
                className="rounded-[14px] border border-deck-card-brd bg-deck-card p-4 text-center backdrop-blur-xl"
              >
                <p className="text-[12px] font-bold tracking-[0.12em] text-faint uppercase">
                  Ticket {i + 1}
                </p>
                {t.qr_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.qr_url}
                    alt={`QR for ticket ${t.ticket_code}`}
                    className="mx-auto mt-3 size-48 rounded-lg bg-white p-2"
                    width={192}
                    height={192}
                  />
                ) : null}
                <p className="mt-3 font-mono text-[15px] tracking-[0.2em] text-foreground">
                  {t.ticket_code}
                </p>
                <Link
                  href={ticketCheckinUrl(t.ticket_code)}
                  className="mt-2 inline-block text-[12px] font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Open ticket screen
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-[14px] border border-deck-card-brd bg-deck-card/60 px-4 py-3 text-[13px] leading-relaxed text-dim">
            Your QR ticket is emailed from Deckk (not Stripe). If it hasn&apos;t
            arrived yet, refresh this page in a moment — or check spam.
          </p>
        )}

        <div className="mt-6 rounded-[14px] border border-deck-card-brd bg-deck-card p-4 backdrop-blur-xl">
          <dl className="space-y-2 text-[14px]">
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Ticket</dt>
              <dd className="font-semibold">
                {formatUsd(unitCents)} × {quantity}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Subtotal</dt>
              <dd>{formatUsd(ticketSubtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-dim">Processing fee</dt>
              <dd>{formatUsd(fee)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-deck-card-brd pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatUsd(totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] leading-relaxed text-dim">
            A flat processing fee is added per order so totals stay clear. Stripe
            card fees come out of the host payout and aren&apos;t shown as a
            separate line for buyers.
          </p>
        </div>

        <Link
          href={browseEventsHref}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
        >
          Browse events
        </Link>

        <div className="mt-10">
          <CommunityBadge />
        </div>
      </main>
    </PublicThemeShell>
  );
}
