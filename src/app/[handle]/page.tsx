import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDeck } from "@/lib/deck";
import { partitionEvents } from "@/lib/events";
import { publicDeckPath } from "@/lib/paths";
import { resolveAccentPreset } from "@/lib/theme";
import { Wordmark } from "@/components/brand/wordmark";
import { HubShell } from "@/components/layout/hub-shell";
import { Avatar } from "@/components/profile/avatar";
import { Eyebrow } from "@/components/profile/eyebrow";
import { LinkCard } from "@/components/profile/link-card";
import { PublicEventCard } from "@/components/events/public-event-card";
import {
  FixedPaymentLinkCard,
  ProductPaymentCard,
  TipJarCard,
} from "@/components/deck/payment-cards";
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
  const accent = resolveAccentPreset(profile.theme);
  const { upcoming, past } = partitionEvents(events);

  const tips = paymentLinks.filter((l) => l.kind === "tip");
  const fixedLinks = paymentLinks.filter((l) => l.kind === "fixed");
  const hasShop = products.length > 0;
  const hasSupport = tips.length > 0 || fixedLinks.length > 0;
  const hasEvents = upcoming.length > 0 || past.length > 0;
  const socialBlocks = blocks.filter((b) => b.category === "social");
  const hasSocial = socialBlocks.length > 0;
  const otherBlocks = blocks.filter((b) => b.category !== "social");

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
  const showLinks = tab === "all" && otherBlocks.length > 0;

  function tabHref(nextTab: Tab, nextArchive = false) {
    return publicDeckPath(profile.handle, {
      ...(nextTab !== "all" ? { tab: nextTab } : {}),
      ...(nextArchive ? { archive: "1" } : {}),
    });
  }

  return (
    <HubShell accent={accent}>
      <header className="mb-10">
        <Avatar src={profile.avatar_url} size="xl" className="mb-6" />
        <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-tight text-ink">
          {profile.display_name}
        </h1>
        <p className="mt-2 text-base font-medium text-brand-accent-strong">
          deckk.me/{profile.handle}
        </p>
        {profile.bio && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{profile.bio}</p>
        )}
      </header>

      <nav className="sticky top-0 z-10 -mx-5 mb-8 flex gap-2 overflow-x-auto border-b border-line bg-paper px-5 pb-3 pt-1">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                tab === t.id && !showArchive
                  ? "bg-ink text-paper"
                  : "text-muted-foreground hover:bg-paper-sunken hover:text-ink"
              )}
            >
              {t.label}
            </Link>
          ))}
      </nav>

      {checkout === "success" && (
        <p className="mb-6 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-base text-ink">
          Payment received — you&apos;ll get a confirmation email shortly.
        </p>
      )}
      {checkout === "cancelled" && (
        <p className="mb-6 rounded-[1rem] border border-line px-4 py-3 text-base text-muted-foreground">
          Checkout was cancelled.
        </p>
      )}

      {showLinks && (
        <section className="mb-10 space-y-3">
          {otherBlocks.map((block) => (
            <LinkCard
              key={block.id}
              title={block.title}
              href={block.url ?? "#"}
              variant="row"
            />
          ))}
        </section>
      )}

      {showShop && hasShop && (
        <section className="mb-10 space-y-4">
          {tab === "all" && <Eyebrow>Shop</Eyebrow>}
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
        <section className="mb-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            {tab === "all" && <Eyebrow>Events</Eyebrow>}
            {past.length > 0 && (
              <Link
                href={tabHref("events", !showArchive)}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
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
              <p className="text-base text-muted-foreground">
                No upcoming events.{" "}
                <Link
                  href={tabHref("events", true)}
                  className="text-brand-accent-strong underline-offset-4 hover:underline"
                >
                  View past events
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      {showSupport && hasSupport && (
        <section className="mb-10 space-y-4">
          {tab === "all" && <Eyebrow>Support</Eyebrow>}
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
        <section className="mb-10 space-y-3">
          {tab === "all" && <Eyebrow className="mb-1">Social</Eyebrow>}
          {socialBlocks.map((block) => (
            <LinkCard
              key={block.id}
              title={block.title}
              href={block.url ?? "#"}
              variant="row"
            />
          ))}
        </section>
      )}

      <footer className="mt-16 border-t border-line pt-8 text-center">
        <p className="text-sm text-muted-foreground">made on</p>
        <Link href="/" className="mt-1 inline-block">
          <Wordmark className="text-2xl" />
        </Link>
      </footer>
    </HubShell>
  );
}
