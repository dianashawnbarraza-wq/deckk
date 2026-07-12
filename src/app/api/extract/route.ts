import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractCardFromImage } from "@/lib/ai/extract";
import { getDeckByUserId } from "@/lib/deck-query";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck) {
    return NextResponse.json({ error: "Create your deck first" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const prompt = String(form.get("prompt") ?? "");
  const timezone =
    String(form.get("timezone") ?? "") || deck.timezone || "America/Los_Angeles";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { result, provider } = await extractCardFromImage({
    buffer,
    mime: file.type,
    prompt,
    timezone,
  });

  return NextResponse.json({
    extraction: result,
    meta: {
      provider,
      usedAi: provider !== "fallback",
      timezone,
    },
  });
}
