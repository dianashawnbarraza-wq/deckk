import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";

const createSchema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  timezone: z.string().min(1),
  isAllDay: z.boolean().optional(),
  location: z.string().max(200).nullable().optional(),
  isOnline: z.boolean().optional(),
  url: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  communityOptIn: z.boolean().optional(),
  city: z.string().max(100).nullable().optional(),
});

function validateHttpsUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("URL must use https");
  }
  return url;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("profile_id", profile.id)
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", input.profileId)
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let safeUrl: string | null = null;
  let safeCoverUrl: string | null = null;
  try {
    safeUrl = validateHttpsUrl(input.url);
    safeCoverUrl = validateHttpsUrl(input.coverUrl);
  } catch {
    return NextResponse.json({ error: "URL must use https" }, { status: 400 });
  }

  if (input.endsAt && new Date(input.endsAt) < new Date(input.startsAt)) {
    return NextResponse.json(
      { error: "End must be after start" },
      { status: 400 }
    );
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      profile_id: profile.id,
      title: input.title,
      description: input.description ?? "",
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      timezone: input.timezone,
      is_all_day: input.isAllDay ?? false,
      location: input.location ?? null,
      is_online: input.isOnline ?? false,
      url: safeUrl,
      cover_url: safeCoverUrl,
      community_opt_in: input.communityOptIn ?? false,
      city: input.city ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(publicDeckPath(profile.handle));
  revalidatePath("/calendar");
  return NextResponse.json({ event });
}
