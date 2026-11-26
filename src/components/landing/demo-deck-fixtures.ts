import type { Card, Deck } from "@/types/cards";

export type DemoDeckFixture = {
  id: string;
  caption: string;
  href: string;
  deck: Deck;
  cards: Card[];
};

function daysFromNow(days: number, hour = 17) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function card(
  partial: Omit<Card, "created_at" | "updated_at" | "currency" | "collection_id" | "extraction_confidence" | "source" | "status"> &
    Partial<Pick<Card, "currency" | "status" | "source">>
): Card {
  const now = new Date().toISOString();
  return {
    currency: "USD",
    status: "live",
    source: "manual",
    collection_id: null,
    extraction_confidence: null,
    created_at: now,
    updated_at: now,
    ...partial,
  };
}

const NOW = "2020-01-01T00:00:00.000Z";

function deckBase(
  partial: Pick<Deck, "id" | "handle" | "display_name" | "bio" | "avatar_url" | "theme">
): Deck {
  return {
    user_id: "demo",
    timezone: "America/Los_Angeles",
    is_published: true,
    created_at: NOW,
    updated_at: NOW,
    ...partial,
  };
}

export const DEMO_DECK_FIXTURES: DemoDeckFixture[] = [
  {
    id: "kilncity",
    caption: "Clay nights, mugs, and studio drops in LA.",
    href: "/kilncity",
    deck: deckBase({
      id: "demo-kilncity",
      handle: "kilncity",
      display_name: "Kiln City",
      bio: "mud, glaze, and main-character mugs. handmade in LA.",
      avatar_url: "/demo/kilncity-avatar.png",
      theme: {
        appearance: "lilac",
        dark: false,
        accent: "grape",
        location: "Los Angeles",
      },
    }),
    cards: [
      card({
        id: "kc-event-1",
        deck_id: "demo-kilncity",
        type: "event",
        title: "Open Studio · mug night",
        description: "sip, shop seconds, watch the kiln cool.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=640&q=80",
          },
        ],
        date_start: daysFromNow(5, 17),
        date_end: daysFromNow(5, 20),
        location_name: "Kiln City Studio",
        location_address: "1824 E 7th St, Los Angeles, CA",
        cta_label: "RSVP",
        cta_url: "https://example.com/kiln-open",
        price: 0,
        tags: ["studio", "free"],
        pinned: true,
        position: 0,
      }),
      card({
        id: "kc-event-2",
        deck_id: "demo-kilncity",
        type: "event",
        title: "Wheel throwing 101",
        description: "2-hour beginner class · clay + firing included.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=640&q=80",
          },
        ],
        date_start: daysFromNow(9, 11),
        date_end: daysFromNow(9, 13),
        location_name: "Kiln City Studio",
        location_address: "1824 E 7th St, Los Angeles, CA",
        cta_label: "Tickets",
        cta_url: "https://example.com/kiln-wheel",
        price: 85,
        tags: ["class", "workshop"],
        pinned: false,
        position: 1,
      }),
      card({
        id: "kc-mug",
        deck_id: "demo-kilncity",
        type: "item",
        title: "Speckled latte mug",
        description: "dishwasher safe · one-of-one glaze.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=640&q=80",
          },
        ],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/kiln-mug",
        price: 48,
        tags: ["shop", "featured"],
        pinned: false,
        featured: true,
        position: 2,
      }),
      card({
        id: "kc-dish",
        deck_id: "demo-kilncity",
        type: "item",
        title: "Wavy catch-all dish",
        description: "for keys, rings, chaos.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=640&q=80",
          },
        ],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/kiln-dish",
        price: 36,
        tags: ["shop", "featured"],
        pinned: false,
        featured: true,
        position: 3,
      }),
      card({
        id: "kc-news",
        deck_id: "demo-kilncity",
        type: "announcement",
        title: "Mud, glaze, and main-character mugs",
        description: "Studio notes from the week.",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Read",
        cta_url: "https://example.com/kiln-notes",
        price: null,
        tags: ["news"],
        pinned: false,
        position: 4,
      }),
      card({
        id: "kc-ig",
        deck_id: "demo-kilncity",
        type: "link",
        title: "Instagram",
        description: "@kilncity",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/kilncity",
        price: null,
        tags: ["social"],
        pinned: false,
        position: 5,
      }),
      card({
        id: "kc-tt",
        deck_id: "demo-kilncity",
        type: "link",
        title: "TikTok",
        description: "@kilncity",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://www.tiktok.com/@kilncity",
        price: null,
        tags: ["social"],
        pinned: false,
        position: 6,
      }),
    ],
  },
  {
    id: "softkrush",
    caption: "Shows, merch, and the new EP.",
    href: "/softkrush",
    deck: deckBase({
      id: "demo-softkrush",
      handle: "softkrush",
      display_name: "Soft Krush",
      bio: "hyperpop + heartbreak. new EP out friday.",
      avatar_url: "/demo/softkrush-avatar.png",
      theme: {
        appearance: "lilac",
        dark: false,
        accent: "grape",
        location: "Brooklyn",
        pronouns: "they/she",
      },
    }),
    cards: [
      card({
        id: "sk-event-1",
        deck_id: "demo-softkrush",
        type: "event",
        title: "SOFT KRUSH: basement set",
        description: "unannounced until 8.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&q=80",
          },
        ],
        date_start: daysFromNow(7, 21),
        date_end: daysFromNow(8, 1),
        location_name: "TV Eye",
        location_address: "Ridgewood, NY",
        cta_label: "RSVP",
        cta_url: "https://example.com/sk-show",
        price: 18,
        tags: ["show"],
        pinned: true,
        position: 0,
      }),
      card({
        id: "sk-tee",
        deck_id: "demo-softkrush",
        type: "item",
        title: "Soft Krush tee",
        description: "limited run.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&q=80",
          },
        ],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/sk-tee",
        price: 36,
        tags: ["shop", "featured"],
        pinned: false,
        featured: true,
        position: 1,
      }),
      card({
        id: "sk-ig",
        deck_id: "demo-softkrush",
        type: "link",
        title: "Instagram",
        description: "@softkrush",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/softkrush",
        price: null,
        tags: ["social"],
        pinned: false,
        position: 2,
      }),
    ],
  },
  {
    id: "goodbatch",
    caption: "Beans, cuppings, open mics.",
    href: "/goodbatch",
    deck: deckBase({
      id: "demo-goodbatch",
      handle: "goodbatch",
      display_name: "Good Batch",
      bio: "oat milk + open mics. roast fresh.",
      avatar_url: "/demo/goodbatch-avatar.png",
      theme: {
        appearance: "lilac",
        dark: false,
        accent: "grape",
        location: "Los Angeles",
      },
    }),
    cards: [
      card({
        id: "gb-event-1",
        deck_id: "demo-goodbatch",
        type: "event",
        title: "Cupping this Saturday",
        description: "taste the weekly feature.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=80",
          },
        ],
        date_start: daysFromNow(3, 10),
        date_end: daysFromNow(3, 12),
        location_name: "Roastery bar",
        location_address: "Los Angeles, CA",
        cta_label: "RSVP",
        cta_url: "https://example.com/gb-cupping",
        price: 0,
        tags: ["free"],
        pinned: true,
        position: 0,
      }),
      card({
        id: "gb-beans",
        deck_id: "demo-goodbatch",
        type: "item",
        title: "Ethiopia natural",
        description: "12oz bag.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=640&q=80",
          },
        ],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/gb-beans",
        price: 22,
        tags: ["shop", "featured"],
        pinned: false,
        featured: true,
        position: 1,
      }),
      card({
        id: "gb-ig",
        deck_id: "demo-goodbatch",
        type: "link",
        title: "Instagram",
        description: "@goodbatch",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/goodbatch",
        price: null,
        tags: ["social"],
        pinned: false,
        position: 2,
      }),
    ],
  },
  {
    id: "publicmatters",
    caption: "Programs, books, community nights.",
    href: "/publicmatters",
    deck: deckBase({
      id: "demo-publicmatters",
      handle: "publicmatters",
      display_name: "Public Matters",
      bio: "stories for the block. books for the table.",
      avatar_url: "/demo/publicmatters-avatar.png",
      theme: {
        appearance: "lilac",
        dark: false,
        accent: "grape",
        location: "Los Angeles",
      },
    }),
    cards: [
      card({
        id: "pm-event-1",
        deck_id: "demo-publicmatters",
        type: "event",
        title: "Neighborhood reading night",
        description: "bring a friend and a book.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=640&q=80",
          },
        ],
        date_start: daysFromNow(6, 19),
        date_end: daysFromNow(6, 21),
        location_name: "Community room",
        location_address: "Los Angeles, CA",
        cta_label: "RSVP",
        cta_url: "https://example.com/pm-reading",
        price: 0,
        tags: ["free"],
        pinned: true,
        position: 0,
      }),
      card({
        id: "pm-zine",
        deck_id: "demo-publicmatters",
        type: "item",
        title: "Field notes zine",
        description: "issue 04.",
        media: [
          {
            url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=640&q=80",
          },
        ],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/pm-zine",
        price: 12,
        tags: ["shop", "featured"],
        pinned: false,
        featured: true,
        position: 1,
      }),
      card({
        id: "pm-ig",
        deck_id: "demo-publicmatters",
        type: "link",
        title: "Instagram",
        description: "@publicmatters",
        media: [],
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/publicmatters",
        price: null,
        tags: ["social"],
        pinned: false,
        position: 2,
      }),
    ],
  },
];

export function getDemoFixture(id: string) {
  return DEMO_DECK_FIXTURES.find((d) => d.id === id) ?? DEMO_DECK_FIXTURES[0];
}
