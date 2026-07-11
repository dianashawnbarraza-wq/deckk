import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDeckByUserId } from "@/lib/deck-query";

const createSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck) return NextResponse.json({ deck: null });
  return NextResponse.json({ deck });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getDeckByUserId(supabase, user.id);
  if (existing) {
    return NextResponse.json({ deck: existing });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { handle, displayName, bio } = parsed.data;
  const { data: deck, error } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      handle: handle.toLowerCase(),
      display_name: displayName,
      bio: bio ?? "",
      is_published: true,
    })
    .select("id, handle, display_name, bio, avatar_url, theme, timezone, is_published")
    .single();

  if (error) {
    const msg = error.message.includes("unique")
      ? "That handle is taken — try another."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ deck });
}

const patchSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;
  if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: deck, error } = await supabase
    .from("decks")
    .update(updates)
    .eq("user_id", user.id)
    .select("id, handle, display_name, bio, avatar_url, theme, timezone, is_published")
    .single();

  if (error || !deck) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ deck });
}
