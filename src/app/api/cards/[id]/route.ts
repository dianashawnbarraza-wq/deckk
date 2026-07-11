import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDeckByUserId } from "@/lib/deck-query";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  pinned: z.boolean().optional(),
  ctaUrl: z.string().url().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
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

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.pinned !== undefined) updates.pinned = parsed.data.pinned;
  if (parsed.data.ctaUrl !== undefined) updates.cta_url = parsed.data.ctaUrl;
  if (parsed.data.price !== undefined) updates.price = parsed.data.price;

  const { data: updated, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

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
