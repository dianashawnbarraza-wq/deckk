import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDeckByUserId } from "@/lib/deck-query";

const cardType = z.enum(["event", "item", "announcement", "link", "collection"]);

const createSchema = z.object({
  type: cardType,
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  media: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).optional(),
  dateStart: z.string().nullable().optional(),
  dateEnd: z.string().nullable().optional(),
  locationName: z.string().max(200).nullable().optional(),
  locationAddress: z.string().max(300).nullable().optional(),
  ctaLabel: z.string().max(80).nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  source: z.enum(["manual", "extracted"]).optional(),
  extractionConfidence: z.record(z.string(), z.number()).nullable().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck) return NextResponse.json({ cards: [] });

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .eq("deck_id", deck.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cards: cards ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck) return NextResponse.json({ error: "Create your deck first" }, { status: 400 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;

  if (input.pinned) {
    await supabase.from("cards").update({ pinned: false }).eq("deck_id", deck.id);
  }

  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      deck_id: deck.id,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      media: input.media ?? [],
      date_start: input.dateStart ?? null,
      date_end: input.dateEnd ?? null,
      location_name: input.locationName ?? null,
      location_address: input.locationAddress ?? null,
      cta_label: input.ctaLabel ?? null,
      cta_url: input.ctaUrl || null,
      price: input.price ?? null,
      tags: input.tags ?? [],
      pinned: input.pinned ?? false,
      status: input.status ?? "live",
      source: input.source ?? "manual",
      extraction_confidence: input.extractionConfidence ?? null,
    })
    .select("*")
    .single();

  if (error || !card) {
    return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ card });
}
