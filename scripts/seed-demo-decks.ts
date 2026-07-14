/**
 * Seed Gen Z demo Decks for the landing gallery.
 * Run: npx tsx scripts/seed-demo-decks.ts
 *
 * Handles:
 *   /softkrush   — Soft Krush (musician)
 *   /kilnkid     — Kiln Kid (ceramics)
 *   /batchhouse  — Batch House (coffee)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      if (!process.env[key]) {
        process.env[key] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // ignore
  }
}

loadEnv();

type SeedCard = {
  type: "event" | "item" | "link";
  title: string;
  description: string;
  date_start: string | null;
  date_end: string | null;
  location_name: string | null;
  location_address: string | null;
  cta_label: string | null;
  cta_url: string | null;
  price: number | null;
  pinned: boolean;
  featured?: boolean;
  position: number;
  tags: string[];
  media?: { url: string }[];
};

type DemoDeck = {
  email: string;
  handle: string;
  display_name: string;
  bio: string;
  pronouns: string;
  location: string;
  avatar_url: string;
  cards: SeedCard[];
};

const demos: DemoDeck[] = [
  {
    email: "demo+softkrush@deckk.me",
    handle: "softkrush",
    display_name: "Soft Krush",
    bio: "hyperpop + heartbreak. new EP out friday. find me in the crowd, not the comments.",
    pronouns: "they/she",
    location: "Brooklyn",
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
    cards: [
      {
        type: "event",
        title: "SOFT KRUSH: basement set",
        description: "unannounced until 8 — bring a charger and a friend who gets it.",
        date_start: "2026-07-25T21:00:00-04:00",
        date_end: "2026-07-26T01:00:00-04:00",
        location_name: "TV Eye",
        location_address: "50-14 Metropolitan Ave, Ridgewood, NY",
        cta_label: "RSVP",
        cta_url: "https://example.com/softkrush-tveye",
        price: 18,
        pinned: true,
        position: 0,
        tags: ["show", "live"],
        media: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&q=80" }],
      },
      {
        type: "event",
        title: "listening party · EP soft launch",
        description: "first listens + vinyl raffle. RSVP required.",
        date_start: "2026-08-01T19:00:00-04:00",
        date_end: "2026-08-01T22:00:00-04:00",
        location_name: "Public Records",
        location_address: "233 Butler St, Brooklyn, NY",
        cta_label: "RSVP",
        cta_url: "https://example.com/softkrush-listening",
        price: null,
        pinned: false,
        position: 1,
        tags: ["ep", "party"],
        media: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&q=80" }],
      },
      {
        type: "item",
        title: "GHOST TOUR TEE",
        description: "washed black · limited drop · ships this week.",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/softkrush-tee",
        price: 42,
        pinned: false,
        featured: true,
        position: 2,
        tags: ["merch", "featured"],
        media: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&q=80" }],
      },
      {
        type: "item",
        title: "EP cassette (preorder)",
        description: "hand-numbered · 100 only.",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/softkrush-cassette",
        price: 18,
        pinned: false,
        featured: true,
        position: 3,
        tags: ["merch", "featured"],
        media: [{ url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=640&q=80" }],
      },
      {
        type: "link",
        title: "Tip jar",
        description: "keep the lights on ♡",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Tip",
        cta_url: "https://venmo.com/u/softkrush",
        price: null,
        pinned: false,
        position: 4,
        tags: ["support", "tip"],
      },
      {
        type: "link",
        title: "Instagram",
        description: "@softkrush",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/softkrush",
        price: null,
        pinned: false,
        position: 5,
        tags: ["social"],
      },
      {
        type: "link",
        title: "TikTok",
        description: "@softkrush",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://www.tiktok.com/@softkrush",
        price: null,
        pinned: false,
        position: 6,
        tags: ["social"],
      },
    ],
  },
  {
    email: "demo+kilnkid@deckk.me",
    handle: "kilnkid",
    display_name: "Kiln Kid",
    bio: "mud, glaze, and main-character mugs. handmade in LA — pickup at open studio nights.",
    pronouns: "she/they",
    location: "Los Angeles",
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",
    cards: [
      {
        type: "event",
        title: "Open Studio · mug night",
        description: "sip, shop seconds, watch the kiln cool. free entry.",
        date_start: "2026-07-19T17:00:00-07:00",
        date_end: "2026-07-19T20:00:00-07:00",
        location_name: "Kiln Kid Studio",
        location_address: "1824 E 7th St, Los Angeles, CA",
        cta_label: "RSVP",
        cta_url: "https://example.com/kilnkid-openstudio",
        price: null,
        pinned: true,
        position: 0,
        tags: ["studio", "free"],
        media: [{ url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=640&q=80" }],
      },
      {
        type: "event",
        title: "Wheel throwing 101",
        description: "2-hour beginner class · clay + firing included.",
        date_start: "2026-07-26T11:00:00-07:00",
        date_end: "2026-07-26T13:00:00-07:00",
        location_name: "Kiln Kid Studio",
        location_address: "1824 E 7th St, Los Angeles, CA",
        cta_label: "Tickets",
        cta_url: "https://example.com/kilnkid-wheel",
        price: 85,
        pinned: false,
        position: 1,
        tags: ["class", "workshop"],
        media: [{ url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=640&q=80" }],
      },
      {
        type: "item",
        title: "Speckled latte mug",
        description: "dishwasher safe · one-of-one glaze.",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/kilnkid-mug",
        price: 48,
        pinned: false,
        featured: true,
        position: 2,
        tags: ["shop", "featured"],
        media: [{ url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=640&q=80" }],
      },
      {
        type: "item",
        title: "Wavy catch-all dish",
        description: "for keys, rings, chaos.",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Shop",
        cta_url: "https://example.com/kilnkid-dish",
        price: 36,
        pinned: false,
        featured: true,
        position: 3,
        tags: ["shop", "featured"],
        media: [{ url: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=640&q=80" }],
      },
      {
        type: "link",
        title: "Instagram",
        description: "@kilnkid",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/kilnkid",
        price: null,
        pinned: false,
        position: 4,
        tags: ["social"],
      },
      {
        type: "link",
        title: "Facebook",
        description: "Kiln Kid Studio",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://facebook.com/kilnkid",
        price: null,
        pinned: false,
        position: 5,
        tags: ["social"],
      },
      {
        type: "link",
        title: "TikTok",
        description: "@kilnkid",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://www.tiktok.com/@kilnkid",
        price: null,
        pinned: false,
        position: 6,
        tags: ["social"],
      },
    ],
  },
  {
    email: "demo+batchhouse@deckk.me",
    handle: "batchhouse",
    display_name: "Batch House",
    bio: "neighborhood coffee · weird hours · louder mornings. come for the oat, stay for the calendar.",
    pronouns: "they/them",
    location: "Portland",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
    cards: [
      {
        type: "event",
        title: "Dawn pour · weekly cupping",
        description: "try three new lots before the rush. free.",
        date_start: "2026-07-16T07:30:00-07:00",
        date_end: "2026-07-16T08:30:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "Details",
        cta_url: "https://example.com/batch-cupping",
        price: null,
        pinned: false,
        position: 0,
        tags: ["cupping", "weekly"],
      },
      {
        type: "event",
        title: "Latte art throwdown",
        description: "sign up at the bar · winner gets a month of free drip.",
        date_start: "2026-07-18T18:00:00-07:00",
        date_end: "2026-07-18T21:00:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "RSVP",
        cta_url: "https://example.com/batch-throwdown",
        price: null,
        pinned: true,
        position: 1,
        tags: ["competition", "baristas"],
        media: [{ url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=80" }],
      },
      {
        type: "event",
        title: "Open mic · poets + producers",
        description: "5 min slots · put your name in the milk jug.",
        date_start: "2026-07-20T19:00:00-07:00",
        date_end: "2026-07-20T22:00:00-07:00",
        location_name: "Batch House patio",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "Details",
        cta_url: "https://example.com/batch-openmic",
        price: null,
        pinned: false,
        position: 2,
        tags: ["open-mic", "community"],
      },
      {
        type: "event",
        title: "Saturday market takeover",
        description: "pastries from Lil Oven + vinyl from Night Shift.",
        date_start: "2026-07-25T09:00:00-07:00",
        date_end: "2026-07-25T14:00:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "Details",
        cta_url: "https://example.com/batch-market",
        price: null,
        pinned: false,
        position: 3,
        tags: ["market"],
        media: [{ url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&q=80" }],
      },
      {
        type: "event",
        title: "Film night · short docs",
        description: "projector out back · bring a hoodie.",
        date_start: "2026-07-28T20:00:00-07:00",
        date_end: "2026-07-28T22:30:00-07:00",
        location_name: "Batch House yard",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "RSVP",
        cta_url: "https://example.com/batch-film",
        price: 5,
        pinned: false,
        position: 4,
        tags: ["film"],
      },
      {
        type: "event",
        title: "Roaster collab · Midcity",
        description: "guest espresso line + sticker drop.",
        date_start: "2026-08-02T08:00:00-07:00",
        date_end: "2026-08-02T16:00:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "Details",
        cta_url: "https://example.com/batch-collab",
        price: null,
        pinned: false,
        position: 5,
        tags: ["collab"],
      },
      {
        type: "event",
        title: "Kids craft + cold brew",
        description: "parents get coffee · kids get chaos trays.",
        date_start: "2026-08-08T10:00:00-07:00",
        date_end: "2026-08-08T12:00:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "RSVP",
        cta_url: "https://example.com/batch-kids",
        price: null,
        pinned: false,
        position: 6,
        tags: ["family"],
      },
      {
        type: "event",
        title: "DJ brunch · soft house",
        description: "no cover before noon · pastries hit different.",
        date_start: "2026-08-09T10:00:00-07:00",
        date_end: "2026-08-09T14:00:00-07:00",
        location_name: "Batch House",
        location_address: "1122 SE Division St, Portland, OR",
        cta_label: "Details",
        cta_url: "https://example.com/batch-brunch",
        price: null,
        pinned: false,
        position: 7,
        tags: ["dj", "brunch"],
        media: [{ url: "https://images.unsplash.com/photo-1442512595331-e89e7384260c?w=640&q=80" }],
      },
      {
        type: "link",
        title: "Instagram",
        description: "@batchhousepdx",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://instagram.com/batchhousepdx",
        price: null,
        pinned: false,
        position: 8,
        tags: ["social"],
      },
      {
        type: "link",
        title: "TikTok",
        description: "@batchhouse",
        date_start: null,
        date_end: null,
        location_name: null,
        location_address: null,
        cta_label: "Follow",
        cta_url: "https://www.tiktok.com/@batchhouse",
        price: null,
        pinned: false,
        position: 9,
        tags: ["social"],
      },
    ],
  },
];

async function ensureUser(admin: ReturnType<typeof createClient>, email: string) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  let user = listed.data.users.find((u) => u.email === email);
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error(`Could not create ${email}`);
    }
    user = created.data.user;
    console.log(`Created auth user ${email}`);
  } else {
    console.log(`Using existing auth user ${email}`);
  }
  return user;
}

async function seedOne(
  admin: ReturnType<typeof createClient>,
  demo: DemoDeck
) {
  const user = await ensureUser(admin, demo.email);

  const deckPayload = {
    handle: demo.handle,
    display_name: demo.display_name,
    bio: demo.bio,
    avatar_url: demo.avatar_url,
    is_published: true,
    timezone: "America/Los_Angeles",
    theme: {
      accent: "grape",
      pronouns: demo.pronouns,
      location: demo.location,
    },
  };

  const existing = await admin
    .from("decks")
    .select("id, handle")
    .eq("handle", demo.handle)
    .maybeSingle();
  if (existing.error) throw existing.error;

  let deckId = existing.data?.id as string | undefined;
  if (!deckId) {
    const byUser = await admin
      .from("decks")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (byUser.data) {
      const upd = await admin
        .from("decks")
        .update(deckPayload)
        .eq("id", byUser.data.id)
        .select("id")
        .single();
      if (upd.error) throw upd.error;
      deckId = upd.data.id;
    } else {
      const ins = await admin
        .from("decks")
        .insert({ user_id: user.id, ...deckPayload })
        .select("id")
        .single();
      if (ins.error) throw ins.error;
      deckId = ins.data.id;
    }
  } else {
    const upd = await admin.from("decks").update(deckPayload).eq("id", deckId);
    if (upd.error) throw upd.error;
  }

  const del = await admin.from("cards").delete().eq("deck_id", deckId);
  if (del.error) throw del.error;

  const rows = demo.cards.map((c) => ({
    deck_id: deckId,
    type: c.type,
    title: c.title,
    description: c.description,
    media: c.media ?? [],
    date_start: c.date_start,
    date_end: c.date_end,
    location_name: c.location_name,
    location_address: c.location_address,
    cta_label: c.cta_label,
    cta_url: c.cta_url,
    price: c.price,
    currency: "usd",
    tags: c.tags,
    pinned: c.pinned,
    featured: c.featured ?? false,
    status: "live",
    position: c.position,
    source: "manual",
  }));

  let inserted = await admin.from("cards").insert(rows).select("id");
  if (inserted.error && /featured/i.test(inserted.error.message)) {
    const withoutFeatured = rows.map(({ featured: _f, ...rest }) => rest);
    inserted = await admin.from("cards").insert(withoutFeatured).select("id");
  }
  if (inserted.error) throw inserted.error;

  console.log(`✓ /${demo.handle} — ${inserted.data?.length ?? 0} cards`);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const demo of demos) {
    await seedOne(admin, demo);
  }

  console.log("\nOpen:");
  for (const d of demos) {
    console.log(`  https://deckkme.vercel.app/${d.handle}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
