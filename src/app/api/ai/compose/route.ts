import { NextResponse } from "next/server";
import { z } from "zod";
import { composeWithAi } from "@/lib/ai/compose";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  prompt: z.string().max(2000).default(""),
  timezone: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
  imageBase64: z.string().max(8_000_000).nullable().optional(),
  imageMime: z.string().nullable().optional(),
});

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

  const { prompt, timezone, imageUrl, imageBase64, imageMime } = parsed.data;

  if (!prompt.trim() && !imageUrl && !imageBase64) {
    return NextResponse.json(
      { error: "Add a photo or describe what you want to post." },
      { status: 400 }
    );
  }

  const result = await composeWithAi({
    prompt: prompt.trim(),
    timezone,
    imageUrl: imageUrl ?? null,
    imageBase64: imageBase64 ?? null,
    imageMime: imageMime ?? null,
  });

  const usingAi = Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json({
    ...result,
    meta: {
      usedAi: usingAi,
      imageUrl: imageUrl ?? null,
    },
  });
}
