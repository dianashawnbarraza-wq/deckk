import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";
import type { AccentPreset } from "@/lib/theme";

const accentSchema = z.enum(["poppy", "lime", "cobalt", "grape", "ink"]);

const schema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  headerUrl: z.string().url().nullable().optional(),
  theme: z.object({ accent: accentSchema }).optional(),
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

  let safeHeader: string | null | undefined = undefined;
  if (input.headerUrl !== undefined) {
    try {
      safeHeader = validateHttpsUrl(input.headerUrl);
      if (input.headerUrl && !safeHeader) {
        return NextResponse.json({ error: "Header URL must use https" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid header URL" }, { status: 400 });
    }
  }

  const updates: Record<string, string | null | { accent: AccentPreset }> = {};
  if (input.displayName !== undefined) updates.display_name = input.displayName;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (safeAvatar !== undefined) updates.avatar_url = safeAvatar;
  if (safeHeader !== undefined) updates.header_url = safeHeader;
  if (input.theme !== undefined) updates.theme = input.theme;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("id, handle, display_name, bio, avatar_url, header_url")
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  revalidatePath(publicDeckPath(profile.handle));
  revalidatePath("/discover");
  revalidatePath("/dashboard");
  return NextResponse.json({ profile });
}
