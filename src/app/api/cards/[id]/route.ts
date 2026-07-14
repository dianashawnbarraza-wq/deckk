import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDeckByUserId } from "@/lib/deck-query";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  pinned: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  ctaUrl: z.string().url().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  locationName: z.string().max(200).nullable().optional(),
  locationAddress: z.string().max(300).nullable().optional(),
  dateStart: z.string().nullable().optional(),
  dateEnd: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: cardRow } = await supabase
    .from("cards")
    .select("deck_id")
    .eq("id", id)
    .single();

  if (!cardRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck || deck.id !== cardRow.deck_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.pinned) {
    await supabase.from("cards").update({ pinned: false }).eq("deck_id", cardRow.deck_id);
  }

  if (parsed.data.featured === true) {
    const { data: existing } = await supabase
      .from("cards")
      .select("id, tags, featured")
      .eq("deck_id", cardRow.deck_id)
      .eq("type", "item");

    const featuredCount = (existing ?? []).filter((c) => {
      if (c.id === id) return false;
      if (typeof c.featured === "boolean") return c.featured;
      return Array.isArray(c.tags) && c.tags.includes("featured");
    }).length;

    if (featuredCount >= 4) {
      return NextResponse.json(
        { error: "You can star up to 4 featured shop items" },
        { status: 400 }
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.pinned !== undefined) updates.pinned = parsed.data.pinned;
  if (parsed.data.featured !== undefined) updates.featured = parsed.data.featured;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.ctaUrl !== undefined) updates.cta_url = parsed.data.ctaUrl;
  if (parsed.data.price !== undefined) updates.price = parsed.data.price;
  if (parsed.data.locationName !== undefined) updates.location_name = parsed.data.locationName;
  if (parsed.data.locationAddress !== undefined) {
    updates.location_address = parsed.data.locationAddress;
  }
  if (parsed.data.dateStart !== undefined) updates.date_start = parsed.data.dateStart;
  if (parsed.data.dateEnd !== undefined) updates.date_end = parsed.data.dateEnd;

  // Keep tags in sync when featuring without a migration-backed column yet
  if (parsed.data.featured !== undefined) {
    const { data: current } = await supabase
      .from("cards")
      .select("tags")
      .eq("id", id)
      .single();
    const tags = Array.isArray(current?.tags) ? [...(current.tags as string[])] : [];
    const has = tags.includes("featured");
    if (parsed.data.featured && !has) tags.push("featured");
    if (!parsed.data.featured && has) {
      updates.tags = tags.filter((t) => t !== "featured");
    } else if (parsed.data.featured) {
      updates.tags = tags;
    }
  }

  let { data: updated, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  // If featured column is missing, retry with tags only
  if (error && parsed.data.featured !== undefined && /featured/i.test(error.message)) {
    const { featured: _f, ...withoutFeatured } = updates;
    const retry = await supabase
      .from("cards")
      .update(withoutFeatured)
      .eq("id", id)
      .select("*")
      .single();
    updated = retry.data;
    error = retry.error;
  }

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ card: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cardRow } = await supabase
    .from("cards")
    .select("deck_id")
    .eq("id", id)
    .single();

  if (!cardRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck || deck.id !== cardRow.deck_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
