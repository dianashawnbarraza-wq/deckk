import {
  blankExtractFallback,
  EXTRACTION_SYSTEM_PROMPT,
  parseExtractJson,
  type ExtractResult,
} from "@/lib/ai/extract-types";

const MAX_EDGE = 1568;

export async function downscaleImageBuffer(
  buffer: Buffer,
  mime: string
): Promise<{ base64: string; mime: string }> {
  // Server-side canvas isn't available; pass through. Client downscales before upload.
  return { base64: buffer.toString("base64"), mime };
}

async function extractWithAnthropic(params: {
  apiKey: string;
  base64: string;
  mime: string;
  prompt?: string;
  timezone: string;
}): Promise<ExtractResult | null> {
  const userText = [
    `Creator timezone: ${params.timezone}`,
    params.prompt?.trim()
      ? `Creator note: ${params.prompt.trim()}`
      : "Extract the card from this image.",
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: params.mime,
                data: params.base64,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Anthropic extract failed", await res.text());
    return null;
  }

  const json = await res.json();
  const text = (json.content as Array<{ type: string; text?: string }> | undefined)
    ?.filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");
  if (!text) return null;
  return parseExtractJson(text);
}

async function extractWithOpenAI(params: {
  apiKey: string;
  base64: string;
  mime: string;
  prompt?: string;
  timezone: string;
}): Promise<ExtractResult | null> {
  const userText = [
    `Creator timezone: ${params.timezone}`,
    params.prompt?.trim()
      ? `Creator note: ${params.prompt.trim()}`
      : "Extract the card from this image.",
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            {
              type: "image_url",
              image_url: { url: `data:${params.mime};base64,${params.base64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI extract failed", await res.text());
    return null;
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) return null;
  return parseExtractJson(raw);
}

export async function extractCardFromImage(params: {
  buffer: Buffer;
  mime: string;
  prompt?: string;
  timezone: string;
}): Promise<{ result: ExtractResult; provider: "anthropic" | "openai" | "fallback" }> {
  const { base64, mime } = await downscaleImageBuffer(params.buffer, params.mime);
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    const result = await extractWithAnthropic({
      apiKey: anthropicKey,
      base64,
      mime,
      prompt: params.prompt,
      timezone: params.timezone,
    });
    if (result) return { result, provider: "anthropic" };
  }

  if (openaiKey) {
    const result = await extractWithOpenAI({
      apiKey: openaiKey,
      base64,
      mime,
      prompt: params.prompt,
      timezone: params.timezone,
    });
    if (result) return { result, provider: "openai" };
  }

  return {
    result: blankExtractFallback(params.prompt?.trim().slice(0, 60) || "New card"),
    provider: "fallback",
  };
}

export { MAX_EDGE };
