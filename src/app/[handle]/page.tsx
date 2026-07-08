import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDeck } from "@/lib/deck";
import { partitionEvents } from "@/lib/events";
import { PublicEventCard } from "@/components/events/public-event-card";
import {
  FixedPaymentLinkCard,
  ProductPaymentCard,
  TipJarCard,
} from "@/components/deck/payment-cards";
import { publicDeckPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type Tab = "all" | "shop" | "events" | "support" | "social";

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ checkout?: string; tab?: string; archive?: string }>;
}

function normalizeTab(value: string | undefined): Tab {
  if (value === "shop" || value === "events" || value === "support" || value === "social") {
    return value;
  }
  return "all";
}

export default async function PublicDeckPage({ params, searchParams }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = rawHandle.replace(/^@/, "").toLowerCase();
  const { checkout, tab: tabParam, archive } = await searchParams;
  const tab = normalizeTab(tabParam);
  const showArchive = archive === "1";

  const supabase = createAdminClient();

  const { data: redirectRow } = await supabase
    .from("handle_redirects")
    .select("profile_id")
    .eq("old_handle", handle)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (redirectRow) {
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("id", redirectRow.profile_id)
      .single();
    if (targetProfile) redirect(publicDeckPath(targetProfile.handle));
  }

  const deck = await getPublicDeck(handle);
  if (!deck) notFound();

  const { profile, blocks, products, paymentLinks, events } = deck;
  const { upcoming, past } = partitionEvents(events);

  const tips = paymentLinks.filter((l) => l.kind === "tip");
  const fixedLinks = paymentLinks.filter((l) => l.kind === "fixed");
  const hasShop = products.length > 0;
  const hasSupport = tips.length > 0 || fixedLinks.length > 0;
  const hasEvents = upcoming.length > 0 || past.length > 0;
  const socialBlocks = blocks.filter((b) => b.category === "social");
  const hasSocial = socialBlocks.length > 0;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "all", label: "All", show: true },
    { id: "shop", label: "Shop", show: hasShop },
    { id: "events", label: "Events", show: hasEvents },
    { id: "support", label: "Support", show: hasSupport },
    { id: "social", label: "Social", show: hasSocial },
  ];

  const showShop = tab === "all" || tab === "shop";
  const showEvents = tab === "all" || tab === "events";
  const showSupport = tab === "all" || tab === "support";
  const showSocial = tab === "all" || tab === "social";
  const showLinks =
    tab === "all" &&
    blocks.filter((b) => b.category !== "social").length > 0;

  function tabHref(nextTab: Tab, nextArchive = false) {
    return publicDeckPath(profile.handle, {
      ...(nextTab !== "all" ? { tab: nextTab } : {}),
      ...(nextArchive ? { archive: "1" } : {}),
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <header className="mb-8 text-center">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="mx-auto mb-4 size-24 rounded-full object-cover"
          />
        )}
        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
        {profile.bio && (
          <p className="mt-2 text-muted-foreground">{profile.bio}</p>
        )}
      </header>

      <nav className="sticky top-0 z-10 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b bg-background px-4 pb-2">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
                tab === t.id && !showArchive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t.label}
            </Link>
          ))}
      </nav>

      {checkout === "success" && (
        <p className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received — you&apos;ll get a confirmation email shortly.
        </p>
      )}
      {checkout === "cancelled" && (
        <p className="mb-6 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Checkout was cancelled.
        </p>
      )}

      {showShop && hasShop && (
        <section className="mb-8 space-y-4">
          {tab === "all" && (
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Shop
            </h2>
          )}
          <div className="space-y-4">
            {products.map((product) => (
              <ProductPaymentCard
                key={product.id}
                product={product}
                handle={profile.handle}
                chargesEnabled={profile.charges_enabled}
              />
            ))}
          </div>
        </section>
      )}

      {showEvents && hasEvents && (
        <section className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-2">
            {tab === "all" && (
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Events
              </h2>
            )}
            {past.length > 0 && (
              <Link
                href={tabHref("events", !showArchive)}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {showArchive ? "Upcoming events" : "Past events"}
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {(showArchive ? past : upcoming).map((event) => (
              <PublicEventCard
                key={event.id}
                event={event}
                variant={showArchive ? "archive" : "upcoming"}
              />
            ))}
            {!showArchive && upcoming.length === 0 && past.length > 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming events.{" "}
                <Link
                  href={tabHref("events", true)}
                  className="underline-offset-4 hover:underline"
                >
                  View past events
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      {showSupport && hasSupport && (
        <section className="mb-8 space-y-4">
          {tab === "all" && (
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Support
            </h2>
          )}
          <div className="space-y-4">
            {tips.map((link) => (
              <TipJarCard
                key={link.id}
                link={link}
                handle={profile.handle}
                chargesEnabled={profile.charges_enabled}
              />
            ))}
            {fixedLinks.map((link) => (
              <FixedPaymentLinkCard
                key={link.id}
                link={link}
                handle={profile.handle}
                chargesEnabled={profile.charges_enabled}
              />
            ))}
          </div>
        </section>
      )}

      {showSocial && hasSocial && (
        <section className="mb-8 space-y-2">
          {tab === "all" && (
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Social
            </h2>
          )}
          {socialBlocks.map((block) => (
            <a
              key={block.id}
              href={block.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border bg-card px-4 py-3 shadow-sm transition hover:bg-muted/50"
            >
              {block.title}
            </a>
          ))}
        </section>
      )}

      {showLinks && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Links
          </h2>
          {blocks
            .filter((b) => b.category !== "social")
            .map((block) => (
              <a
                key={block.id}
                href={block.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border bg-card px-4 py-3 shadow-sm transition hover:bg-muted/50"
              >
                {block.title}
              </a>
            ))}
        </section>
      )}

      <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Make your own deck →
        </Link>
      </footer>
    </main>
  );
}
