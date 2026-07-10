import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/profile/avatar";
import { publicDeckPath } from "@/lib/paths";
import { partitionEvents } from "@/lib/events";
import { accentStyle, resolveAccentPreset } from "@/lib/theme";
import type { Block, Event, PaymentLink, Product, Profile } from "@/types/database";
import { cn } from "@/lib/utils";

type PreviewItem =
  | { kind: "link"; title: string }
  | { kind: "product"; title: string; priceCents: number }
  | { kind: "event"; title: string }
  | { kind: "support"; title: string };

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function buildPreviewItems(
  blocks: Block[],
  products: Product[],
  paymentLinks: PaymentLink[],
  events: Event[]
): PreviewItem[] {
  const { upcoming } = partitionEvents(events);
  const items: PreviewItem[] = [];

  for (const block of blocks.filter((b) => b.category !== "social").slice(0, 2)) {
    items.push({ kind: "link", title: block.title });
  }
  for (const product of products.slice(0, 2)) {
    items.push({ kind: "product", title: product.title, priceCents: product.price_cents });
  }
  for (const event of upcoming.slice(0, 2)) {
    items.push({ kind: "event", title: event.title });
  }
  for (const link of paymentLinks.slice(0, 1)) {
    items.push({ kind: "support", title: link.title });
  }
  for (const block of blocks.filter((b) => b.category === "social").slice(0, 1)) {
    items.push({ kind: "link", title: block.title });
  }

  return items.slice(0, 5);
}

function PreviewRow({ item }: { item: PreviewItem }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[0.625rem] border border-line bg-paper px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm leading-tight text-ink">{item.title}</p>
        {item.kind === "product" && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{formatUsd(item.priceCents)}</p>
        )}
        {item.kind === "event" && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">Event</p>
        )}
        {item.kind === "support" && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">Support</p>
        )}
      </div>
      <ArrowUpRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />
    </div>
  );
}

interface DeckMiniPreviewProps {
  profile: Pick<
    Profile,
    "handle" | "display_name" | "bio" | "avatar_url" | "theme" | "is_published"
  >;
  blocks: Block[];
  products: Product[];
  paymentLinks: PaymentLink[];
  events: Event[];
  className?: string;
}

export function DeckMiniPreview({
  profile,
  blocks,
  products,
  paymentLinks,
  events,
  className,
}: DeckMiniPreviewProps) {
  const accent = resolveAccentPreset(profile.theme);
  const href = publicDeckPath(profile.handle);
  const items = buildPreviewItems(blocks, products, paymentLinks, events);
  const hasShop = products.length > 0;
  const hasEvents = events.length > 0;
  const hasSupport = paymentLinks.length > 0;
  const hasSocial = blocks.some((b) => b.category === "social");

  return (
    <Link
      href={href}
      className={cn(
        "group mx-auto block max-w-[240px] overflow-hidden rounded-[1.25rem] border border-line bg-paper shadow-[0_1px_0_rgba(25,21,18,0.04)] ring-1 ring-line transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[9/19] overflow-hidden bg-paper">
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-[400px] -translate-x-1/2 origin-top scale-[0.56]"
          style={accentStyle(accent)}
        >
          <div className="px-5 pb-6 pt-5 text-center">
            <div className="mb-3 flex justify-center">
              <Avatar src={profile.avatar_url} size="lg" className="size-14" />
            </div>
            <h2 className="font-display text-[1.65rem] leading-[1.02] tracking-tight text-ink">
              {profile.display_name}
            </h2>
            <p className="mt-1 text-xs font-medium text-brand-accent-strong">
              deckk.me/{profile.handle}
            </p>
            {profile.bio ? (
              <p className="mx-auto mt-2 line-clamp-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            ) : (
              <p className="mx-auto mt-2 text-xs text-muted-foreground/70">Add a bio in your profile</p>
            )}
          </div>

          <div className="mb-3 flex gap-1.5 overflow-hidden px-5 pb-1">
            <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-paper">
              All
            </span>
            {hasShop && (
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Shop
              </span>
            )}
            {hasEvents && (
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Events
              </span>
            )}
            {hasSupport && (
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Support
              </span>
            )}
            {hasSocial && (
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Social
              </span>
            )}
          </div>

          <div className="space-y-2 px-5">
            {items.length > 0 ? (
              items.map((item, index) => <PreviewRow key={`${item.kind}-${index}`} item={item} />)
            ) : (
              <>
                <div className="rounded-[0.625rem] border border-dashed border-line bg-paper-sunken/50 px-3 py-3">
                  <p className="text-center text-[10px] text-muted-foreground">
                    Your links and shop items show up here
                  </p>
                </div>
                <div className="rounded-[0.625rem] border border-line bg-paper-sunken/40 px-3 py-2.5" />
                <div className="rounded-[0.625rem] border border-line bg-paper-sunken/40 px-3 py-2.5" />
              </>
            )}
          </div>

          <div className="mt-5 border-t border-line px-5 pt-4 text-center">
            <p className="text-[9px] text-muted-foreground">made on deckk</p>
          </div>
        </div>

        {!profile.is_published && (
          <span className="absolute right-3 top-3 rounded-full bg-paper/95 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-line backdrop-blur-sm">
            Draft
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <div className="min-w-0 text-left">
          <p className="text-sm font-medium text-ink">View full deck</p>
          <p className="truncate text-xs text-muted-foreground">deckk.me/{profile.handle}</p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
