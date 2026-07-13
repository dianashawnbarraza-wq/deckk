/**
 * Seed thekyleholiday deck from kyleholiday.com content.
 * Run: npx tsx scripts/seed-kyle-holiday.ts
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

const EMAIL = "kyle@deckk.me";
const HANDLE = "thekyleholiday";

const cards = [
  {
    type: "event" as const,
    title: "RIVET: Collars + Mosh Party",
    description:
      "Co-host with Shayn (International Trainer 2026) at Devil Mask Studio — make a collar (supplies & snacks provided); mosh starts at 8 PM.",
    date_start: "2026-07-22T18:00:00-07:00",
    date_end: "2026-07-22T22:00:00-07:00",
    location_name: "Devil Mask Studio",
    location_address: null,
    cta_label: "RSVP",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: true,
    position: 0,
    tags: ["leather", "craft", "mosh"],
  },
  {
    type: "event" as const,
    title: "Strap Social",
    description:
      "Host with Patricia Nyx (Chains of Love) — for leather queers, freaks, pups & pets.",
    date_start: "2026-06-24T19:00:00-07:00",
    date_end: "2026-06-24T23:00:00-07:00",
    location_name: "Eagle LA",
    location_address: "4219 Santa Monica Blvd",
    cta_label: "Details",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: false,
    position: 1,
    tags: ["leather", "social"],
  },
  {
    type: "event" as const,
    title: "Cruise LA at the Eagle",
    description: "Every 3rd Saturday community night at Eagle LA.",
    date_start: "2026-06-20T19:00:00-07:00",
    date_end: "2026-06-20T23:00:00-07:00",
    location_name: "Eagle LA",
    location_address: "4219 Santa Monica Blvd",
    cta_label: "Details",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: false,
    position: 2,
    tags: ["cruise-la"],
  },
  {
    type: "event" as const,
    title: "Leather Beast",
    description: "Vending at Bullet Bar.",
    date_start: "2026-06-18T18:00:00-07:00",
    date_end: "2026-06-18T23:00:00-07:00",
    location_name: "Bullet Bar",
    location_address: null,
    cta_label: "Details",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: false,
    position: 3,
    tags: ["vending"],
  },
  {
    type: "item" as const,
    title: "Trans Leather Babes Tee",
    description:
      "Title t-shirt celebrating trans joy in leather — four-color screenprint by Kyle on a super soft tee.",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop on Etsy",
    cta_url: "https://www.etsy.com/shop/KyleHoliday",
    price: null,
    pinned: false,
    position: 10,
    tags: ["apparel", "new"],
  },
  {
    type: "item" as const,
    title: "Pet Play Tags & Leather",
    description:
      "Custom engraved acrylic bone tags, collars, and handmade leather — new pet play tag styles live on Etsy.",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop Etsy",
    cta_url: "https://www.etsy.com/shop/KyleHoliday",
    price: 12,
    pinned: false,
    position: 11,
    tags: ["pet-play", "tags"],
  },
  {
    type: "link" as const,
    title: "Instagram",
    description: "@thekyleholiday",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Follow",
    cta_url: "https://instagram.com/thekyleholiday",
    price: null,
    pinned: false,
    position: 20,
    tags: ["social"],
  },
  {
    type: "link" as const,
    title: "TikTok",
    description: "@thekyleholiday",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Follow",
    cta_url: "https://www.tiktok.com/@thekyleholiday",
    price: null,
    pinned: false,
    position: 21,
    tags: ["social"],
  },
  {
    type: "link" as const,
    title: "Tip jar · Venmo",
    description: "Support via Venmo @mxholiday",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Tip Kyle",
    cta_url: "https://account.venmo.com/u/mxholiday",
    price: null,
    pinned: false,
    position: 22,
    tags: ["support"],
  },
  {
    type: "link" as const,
    title: "kyleholiday.com",
    description: "Full site — art, events, and shop",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Visit",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: false,
    position: 23,
    tags: ["home"],
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find or create auth user
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  let user = listed.data.users.find((u) => u.email === EMAIL);
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email: EMAIL,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error("Could not create Kyle user");
    }
    user = created.data.user;
    console.log("Created auth user for Kyle");
  } else {
    console.log("Using existing Kyle auth user");
  }

  // Upsert deck by handle
  const existing = await admin
    .from("decks")
    .select("id, handle")
    .eq("handle", HANDLE)
    .maybeSingle();
  if (existing.error) throw existing.error;

  let deckId = existing.data?.id as string | undefined;
  if (!deckId) {
    // Also check if this user already has a different deck (unique user_id)
    const byUser = await admin
      .from("decks")
      .select("id, handle")
      .eq("user_id", user.id)
      .maybeSingle();
    if (byUser.data) {
      const upd = await admin
        .from("decks")
        .update({
          handle: HANDLE,
          display_name: "Kyle Holiday",
          bio: "Mx. Cruise LA Leather 2026 (they/he). Latine artist, leatherworker, pet play accessory maker & kinkster. Find me every 3rd Saturday at Cruise LA (Eagle LA).",
          is_published: true,
          timezone: "America/Los_Angeles",
          theme: { accent: "grape" },
        })
        .eq("id", byUser.data.id)
        .select("id")
        .single();
      if (upd.error) throw upd.error;
      deckId = upd.data.id;
      console.log(`Updated existing deck ${byUser.data.handle} → ${HANDLE}`);
    } else {
      const ins = await admin
        .from("decks")
        .insert({
          user_id: user.id,
          handle: HANDLE,
          display_name: "Kyle Holiday",
          bio: "Mx. Cruise LA Leather 2026 (they/he). Latine artist, leatherworker, pet play accessory maker & kinkster. Find me every 3rd Saturday at Cruise LA (Eagle LA).",
          is_published: true,
          timezone: "America/Los_Angeles",
          theme: { accent: "grape" },
        })
        .select("id")
        .single();
      if (ins.error) throw ins.error;
      deckId = ins.data.id;
      console.log(`Created deck /${HANDLE}`);
    }
  } else {
    const upd = await admin
      .from("decks")
      .update({
        display_name: "Kyle Holiday",
        bio: "Mx. Cruise LA Leather 2026 (they/he). Latine artist, leatherworker, pet play accessory maker & kinkster. Find me every 3rd Saturday at Cruise LA (Eagle LA).",
        is_published: true,
        timezone: "America/Los_Angeles",
      })
      .eq("id", deckId);
    if (upd.error) throw upd.error;
    console.log(`Deck /${HANDLE} already exists — refreshing profile`);
  }

  // Replace cards for a clean import
  const del = await admin.from("cards").delete().eq("deck_id", deckId);
  if (del.error) throw del.error;

  const rows = cards.map((c) => ({
    deck_id: deckId,
    type: c.type,
    title: c.title,
    description: c.description,
    media: [],
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
    status: "live",
    position: c.position,
    source: "manual",
  }));

  const inserted = await admin.from("cards").insert(rows).select("id, type, title");
  if (inserted.error) throw inserted.error;

  console.log(`Imported ${inserted.data?.length ?? 0} cards`);
  console.log(`Public deck: https://deckkme.vercel.app/${HANDLE}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
