import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";

const schema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  category: z
    .enum(["shop", "social", "listen", "read", "book", "community", "contact", "custom"])
    .default("custom"),
});

function validateHttpsUrl(url: string): string | null {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return null;
  return url;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const safeUrl = validateHttpsUrl(input.url);
  if (!safeUrl) {
    return NextResponse.json({ error: "URL must use https" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", input.profileId)
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: last } = await supabase
    .from("blocks")
    .select("position")
    .eq("profile_id", profile.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      profile_id: profile.id,
      title: input.title,
      url: safeUrl,
      category: input.category,
      position,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(publicDeckPath(profile.handle));
  return NextResponse.json({ block });
}
