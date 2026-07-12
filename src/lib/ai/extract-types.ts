import { z } from "zod";

export const extractConfidenceSchema = z.object({
  title: z.number().min(0).max(1).optional(),
  date_start: z.number().min(0).max(1).optional(),
  location_name: z.number().min(0).max(1).optional(),
  price: z.number().min(0).max(1).optional(),
  type: z.number().min(0).max(1).optional(),
});

export const extractResultSchema = z.object({
  type: z.enum(["event", "item", "announcement"]),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  date_start: z.string().nullable().optional(),
  date_end: z.string().nullable().optional(),
  location_name: z.string().nullable().optional(),
  location_address: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  tags: z.array(z.string()).max(5).default([]),
  confidence: extractConfidenceSchema.default({}),
});

export type ExtractResult = z.infer<typeof extractResultSchema>;

export const EXTRACTION_SYSTEM_PROMPT = `You extract structured data from flyers, posters, and product photos for a
link in bio tool. Respond with ONLY a JSON object, no markdown fences, no
preamble, matching this schema:

{
  "type": "event" | "item" | "announcement",
  "title": string,
  "description": string,
  "date_start": string | null,
  "date_end": string | null,
  "location_name": string | null,
  "location_address": string | null,
  "cta_label": string | null,
  "cta_url": string | null,
  "price": number | null,
  "tags": string[],
  "confidence": {
    "title": number, "date_start": number, "location_name": number,
    "price": number, "type": number
  }
}

Rules:
- description: 1 to 2 sentences, plain and warm.
- date_start / date_end: ISO 8601 with timezone if determinable; else null.
- If the year is missing, assume the next occurrence of that date from today (${new Date().toISOString().slice(0, 10)}).
- Never invent a URL. If none is printed, cta_url is null.
- If the image is a product photo with no text, type is "item"; write a
  neutral title from what you see and set title confidence at or below 0.5.
- If handwriting or partial text makes a field a guess, lower its confidence.
- tags: max 5, lowercase.
- Multi-event flyers: extract the soonest event; note "N more dates detected" in description if relevant.
- Non-English flyers: extract in the source language; do not translate.
- Blurry images: return low confidence rather than refusing.`;

export function parseExtractJson(raw: string): ExtractResult | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = extractResultSchema.safeParse(JSON.parse(match[0]));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function blankExtractFallback(title = "New card"): ExtractResult {
  return {
    type: "announcement",
    title,
    description: "",
    date_start: null,
    date_end: null,
    location_name: null,
    location_address: null,
    cta_label: null,
    cta_url: null,
    price: null,
    tags: [],
    confidence: { title: 0.3, type: 0.3 },
  };
}
