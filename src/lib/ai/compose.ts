import { composeResultSchema, type ComposeResult } from "@/lib/ai/types";
import { heuristicCompose } from "@/lib/ai/heuristics";

const SYSTEM_PROMPT = `You help creators add content to deckk.me, a link-in-bio hub.
Given an optional image and a short natural-language request, return JSON only.

Schema:
{
  "intent": "event" | "product" | "link" | "payment_link",
  "summary": "one line for the creator",
  "imageDescription": "describe the image — used as draft copy they can edit",
  "event": { "title", "description", "startsAtLocal", "endsAtLocal", "timezone", "isAllDay", "location", "isOnline", "url", "city", "communityOptIn" },
  "product": { "title", "description", "priceCents", "inventoryQty" },
  "link": { "title", "url", "category" },
  "paymentLink": { "kind": "tip"|"fixed", "title", "amountCents" }
}

Rules:
- Flyer images → intent event; extract dates, times, venue, title from the visual.
- startsAtLocal / endsAtLocal: YYYY-MM-DDTHH:mm in the user's timezone, or YYYY-MM-DD if isAllDay.
- Selling with a price → product; priceCents is integer USD cents.
- Paste a URL (TikTok, Instagram, etc.) → link with a friendly title and category social/listen/read/custom.
- Tip jar / support → payment_link kind tip.
- Fixed dollar support → payment_link kind fixed with amountCents.
- Tone: casual, friend-to-friend. Sentence case.
- If unsure, pick the best intent and leave optional fields null.`;

export async function composeWithAi(params: {
  prompt: string;
  timezone: string;
  imageBase64?: string | null;
  imageMime?: string | null;
  imageUrl?: string | null;
}): Promise<ComposeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return heuristicCompose(params.prompt, params.timezone, params.imageUrl);
  }

  const userText = [
    `User timezone: ${params.timezone}`,
    `Request: ${params.prompt || "Figure out what to create from the image."}`,
    params.imageUrl ? `Uploaded image URL: ${params.imageUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: userText }];

  if (params.imageBase64 && params.imageMime) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${params.imageMime};base64,${params.imageBase64}`,
      },
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI compose failed", await res.text());
      return heuristicCompose(params.prompt, params.timezone, params.imageUrl);
    }

    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) {
      return heuristicCompose(params.prompt, params.timezone, params.imageUrl);
    }

    const parsed = composeResultSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return heuristicCompose(params.prompt, params.timezone, params.imageUrl);
    }

    return parsed.data;
  } catch (e) {
    console.error("OpenAI compose error", e);
    return heuristicCompose(params.prompt, params.timezone, params.imageUrl);
  }
}
