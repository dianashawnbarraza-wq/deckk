import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";

const schema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

function validateHttpsUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return null;
  return url;
}

export async function PATCH(request: Request) {
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
  let safeAvatar: string | null | undefined = undefined;
  if (input.avatarUrl !== undefined) {
    try {
      safeAvatar = validateHttpsUrl(input.avatarUrl);
      if (input.avatarUrl && !safeAvatar) {
        return NextResponse.json({ error: "Avatar URL must use https" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 });
    }
  }

  const updates: Record<string, string | null> = {};
  if (input.displayName !== undefined) updates.display_name = input.displayName;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (safeAvatar !== undefined) updates.avatar_url = safeAvatar;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("id, handle, display_name, bio, avatar_url")
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  revalidatePath(publicDeckPath(profile.handle));
  revalidatePath("/discover");
  return NextResponse.json({ profile });
}
