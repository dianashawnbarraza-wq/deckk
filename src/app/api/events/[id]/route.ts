import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  timezone: z.string().min(1).optional(),
  isAllDay: z.boolean().optional(),
  location: z.string().max(200).nullable().optional(),
  isOnline: z.boolean().optional(),
  url: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  communityOptIn: z.boolean().optional(),
  city: z.string().max(100).nullable().optional(),
  isCanceled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function validateHttpsUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("URL must use https");
  }
  return url;
}

async function getOwnedEvent(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data: event } = await supabase
    .from("events")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!event) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, handle")
    .eq("id", event.profile_id)
    .single();

  if (!profile || profile.user_id !== userId) return null;
  return { event, profile };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await getOwnedEvent(supabase, id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.startsAt !== undefined) updates.starts_at = input.startsAt;
  if (input.endsAt !== undefined) updates.ends_at = input.endsAt;
  if (input.timezone !== undefined) updates.timezone = input.timezone;
  if (input.isAllDay !== undefined) updates.is_all_day = input.isAllDay;
  if (input.location !== undefined) updates.location = input.location;
  if (input.isOnline !== undefined) updates.is_online = input.isOnline;
  if (input.communityOptIn !== undefined) {
    updates.community_opt_in = input.communityOptIn;
  }
  if (input.city !== undefined) updates.city = input.city;
  if (input.isCanceled !== undefined) updates.is_canceled = input.isCanceled;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  try {
    if (input.url !== undefined) updates.url = validateHttpsUrl(input.url);
    if (input.coverUrl !== undefined) {
      updates.cover_url = validateHttpsUrl(input.coverUrl);
    }
  } catch {
    return NextResponse.json({ error: "URL must use https" }, { status: 400 });
  }

  const { data: event, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/@${owned.profile.handle}`);
  revalidatePath("/calendar");
  return NextResponse.json({ event });
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await getOwnedEvent(supabase, id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/@${owned.profile.handle}`);
  revalidatePath("/calendar");
  return NextResponse.json({ ok: true });
}
