/**
 * Seed thekyleholiday deck from kyleholiday.com content + flyer assets.
 * Run: npx tsx scripts/seed-kyle-holiday.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
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

const ASSET_ROOT = resolve(
  process.env.HOME || "",
  ".cursor/projects/Users-shawn-deckkme/assets"
);

const AVATAR_PATH = resolve(
  ASSET_ROOT,
  "Kyle_holiday-6a338062-ef79-4d0e-92db-5bdd139ebc73.png"
);
const KINKTERIA_PATH = resolve(
  ASSET_ROOT,
  "Kinkteria_Cruise_LA_July_2026-a16cf429-fa5e-42f9-94ec-bc8761798496.png"
);
const RIVET_PATH = resolve(
  ASSET_ROOT,
  "RIVET_Collars_and_Mosh_July_2026-1816ec0c-0587-464e-b87b-33bf77846e43.png"
);
const TEE_PATH = resolve(
  ASSET_ROOT,
  "Title_Tee_Trans_Leather_Babes_Kyle_Holiday-170df201-9b2f-4404-b48b-5db1312dcc97.png"
);
const BONES_PATH = resolve(
  ASSET_ROOT,
  "Bones-f0a13262-201b-441e-b4c4-58a46bcfd8d1.png"
);
const BARBED_PATH = resolve(
  ASSET_ROOT,
  "Kyle_Holiday_Custom_Barbed_Wire_Tag-399a8492-8378-423e-aa9d-cfe2bfb135c0.png"
);
const HEART_PATH = resolve(
  ASSET_ROOT,
  "Heart_Kyle_Holiday_Thumb-5f70d5b9-4c42-49d2-a3ea-524032b0a1fb.png"
);

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
  mediaKey?: "kinkteria" | "rivet" | "tee" | "bones" | "barbed" | "heart";
};

const cards: SeedCard[] = [
  {
    type: "event",
    title: "KINKTERIA",
    description:
      "Mx. Cruise LA Leather 2026 x Machete present KINKTERIA — lotería-style play for prizes on the patio. @kinkteria",
    date_start: "2026-07-18T16:00:00-07:00",
    date_end: "2026-07-18T17:30:00-07:00",
    location_name: "Cruise LA",
    location_address: "4219 Santa Monica Blvd, Los Angeles, CA 90029",
    cta_label: "Details",
    cta_url: "https://www.instagram.com/kinkteria",
    price: null,
    pinned: false,
    position: 0,
    tags: ["cruise-la", "loteria", "machete"],
    mediaKey: "kinkteria",
  },
  {
    type: "event",
    title: "RIVET: Collars + Mosh Party",
    description:
      "Co-host with Shayn (International Trainer 2026) — make a collar, supplies and snacks provided, mosh starts at 8 PM. Hosted by Shayn & Kyle (Mr. Cruise LA Leather 2024).",
    date_start: "2026-07-22T18:00:00-07:00",
    date_end: "2026-07-22T22:00:00-07:00",
    location_name: "Devil Mask Studio",
    location_address: "313 W 118th Street",
    cta_label: "RSVP",
    cta_url: "https://kyleholiday.com/",
    price: null,
    pinned: true,
    position: 1,
    tags: ["party", "workshop", "mosh", "craft"],
    mediaKey: "rivet",
  },
  {
    type: "event",
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
    position: 2,
    tags: ["leather", "social"],
  },
  {
    type: "event",
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
    position: 3,
    tags: ["cruise-la"],
  },
  {
    type: "item",
    title: "Trans Leather Babes Tee",
    description:
      "Title t-shirt celebrating trans joy in leather — four-color screenprint by Kyle on a super soft tee.",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop on Etsy",
    cta_url:
      "https://www.etsy.com/listing/4490224009/trans-leather-babes-screen-printed-t",
    price: null,
    pinned: false,
    featured: true,
    position: 10,
    tags: ["apparel", "new", "featured"],
    mediaKey: "tee",
  },
  {
    type: "item",
    title: "Bone-Shaped Custom Tag",
    description:
      "Custom engraved acrylic bone tags — pick your color, name, and style. Hang from a collar with the metal jump ring.",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop on Etsy",
    cta_url:
      "https://www.etsy.com/listing/1784936319/personalized-puppy-play-collar-tag",
    price: 12,
    pinned: false,
    featured: true,
    position: 11,
    tags: ["pet-play", "tags", "featured"],
    mediaKey: "bones",
  },
  {
    type: "item",
    title: "Barbed Wire Bone Tag",
    description:
      "Personalized puppy play collar tag with a barbed-wire edge — custom engraved acrylic.",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop on Etsy",
    cta_url:
      "https://www.etsy.com/listing/1836159961/personalized-puppy-play-collar-tag",
    price: 12,
    pinned: false,
    featured: true,
    position: 12,
    tags: ["pet-play", "tags", "featured"],
    mediaKey: "barbed",
  },
  {
    type: "item",
    title: "Heart-Shaped Custom Tag",
    description:
      "Custom heart pet play tag — engraved acrylic, made to order. 2 font styles, 3 sizes, 17 colors (incl glow + pastels).",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Shop on Etsy",
    cta_url:
      "https://www.etsy.com/listing/1840728495/custom-heart-pet-play-tag-engraved",
    price: 12,
    pinned: false,
    featured: true,
    position: 13,
    tags: ["pet-play", "tags", "featured", "heart"],
    mediaKey: "heart",
  },
  {
    type: "link",
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
    type: "link",
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
    type: "link",
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
    type: "link",
    title: "Fansly",
    description: "18+ content",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: "Enter",
    cta_url: "https://fansly.com/",
    price: null,
    pinned: false,
    position: 24,
    tags: ["adult", "18+"],
  },
  {
    type: "link",
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

async function uploadPublic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  localPath: string,
  filename: string
): Promise<string | null> {
  if (!existsSync(localPath)) {
    console.warn(`Missing asset: ${localPath}`);
    return null;
  }
  const buffer = readFileSync(localPath);
  const path = `${userId}/seed-${filename}`;
  const contentType = filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png";
  const { error } = await admin.storage.from("deckk-uploads").upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.warn(`Upload failed for ${filename}: ${error.message}`);
    return null;
  }
  const { data } = admin.storage.from("deckk-uploads").getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Featured column applied via migration SQL when available; tags also mark featured.

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

  const avatarUrl = await uploadPublic(admin, user.id, AVATAR_PATH, "kyle-avatar.png");
  const kinkteriaUrl = await uploadPublic(admin, user.id, KINKTERIA_PATH, "kinkteria.png");
  const rivetUrl = await uploadPublic(admin, user.id, RIVET_PATH, `rivet-flyer-${Date.now()}.png`);
  const teeUrl = await uploadPublic(admin, user.id, TEE_PATH, `tee-${Date.now()}.png`);
  const bonesUrl = await uploadPublic(admin, user.id, BONES_PATH, `bones-${Date.now()}.png`);
  const barbedUrl = await uploadPublic(admin, user.id, BARBED_PATH, `barbed-${Date.now()}.jpg`);
  const heartUrl = await uploadPublic(admin, user.id, HEART_PATH, `heart-${Date.now()}.jpg`);

  const mediaMap = {
    kinkteria: kinkteriaUrl,
    rivet: rivetUrl,
    tee: teeUrl,
    bones: bonesUrl,
    barbed: barbedUrl,
    heart: heartUrl,
  };

  const existing = await admin
    .from("decks")
    .select("id, handle")
    .eq("handle", HANDLE)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const deckPayload = {
    handle: HANDLE,
    display_name: "Kyle Holiday",
    bio: "Mx. Cruise LA Leather 2026. I'm a Latine artist making leather gear, pet play tags, and custom framed art. Find me at Cruise LA every 3rd Saturday.",
    avatar_url: avatarUrl,
    is_published: true,
    timezone: "America/Los_Angeles",
    theme: { accent: "grape", pronouns: "they/he", location: "Los Angeles" },
  };

  let deckId = existing.data?.id as string | undefined;
  if (!deckId) {
    const byUser = await admin
      .from("decks")
      .select("id, handle")
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
      console.log(`Updated existing deck ${byUser.data.handle} → ${HANDLE}`);
    } else {
      const ins = await admin
        .from("decks")
        .insert({ user_id: user.id, ...deckPayload })
        .select("id")
        .single();
      if (ins.error) throw ins.error;
      deckId = ins.data.id;
      console.log(`Created deck /${HANDLE}`);
    }
  } else {
    const upd = await admin.from("decks").update(deckPayload).eq("id", deckId);
    if (upd.error) throw upd.error;
    console.log(`Deck /${HANDLE} refreshed (avatar: ${avatarUrl ? "yes" : "no"})`);
  }

  const del = await admin.from("cards").delete().eq("deck_id", deckId);
  if (del.error) throw del.error;

  const rows = cards.map((c) => {
    const mediaUrl = c.mediaKey ? mediaMap[c.mediaKey] : null;
    return {
      deck_id: deckId,
      type: c.type,
      title: c.title,
      description: c.description,
      media: mediaUrl ? [{ url: mediaUrl }] : [],
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
      source: c.mediaKey ? "extracted" : "manual",
    };
  });

  let inserted = await admin.from("cards").insert(rows).select("id, type, title");
  if (inserted.error && /featured/i.test(inserted.error.message)) {
    const withoutFeatured = rows.map(({ featured: _f, ...rest }) => rest);
    inserted = await admin.from("cards").insert(withoutFeatured).select("id, type, title");
  }
  if (inserted.error) throw inserted.error;

  console.log(`Imported ${inserted.data?.length ?? 0} cards`);
  console.log(`Public deck: https://deckkme.vercel.app/${HANDLE}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
