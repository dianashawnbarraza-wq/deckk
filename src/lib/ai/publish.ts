import { allDayDateToUtc, localDateTimeToUtc } from "@/lib/event-datetime";
import type { ComposeResult } from "@/lib/ai/types";

export function localDraftToUtcIso(
  value: string | undefined,
  timezone: string,
  isAllDay: boolean
): string | null {
  if (!value) return null;
  try {
    if (isAllDay && value.length === 10) {
      return allDayDateToUtc(value, timezone);
    }
    if (value.includes("T")) {
      return localDateTimeToUtc(value, timezone);
    }
    return allDayDateToUtc(value, timezone);
  } catch {
    return null;
  }
}

export function mergeImageDescription(
  description: string | undefined,
  imageDescription: string | undefined
): string {
  const parts = [description?.trim(), imageDescription?.trim()].filter(Boolean);
  return parts.join("\n\n");
}

export function draftFromCompose(
  result: ComposeResult,
  imageUrl: string | null
): ComposeResult {
  if (result.intent === "event" && result.event) {
    return {
      ...result,
      event: {
        ...result.event,
        description: mergeImageDescription(
          result.event.description,
          result.imageDescription
        ),
      },
    };
  }
  if (result.intent === "product" && result.product) {
    return {
      ...result,
      product: {
        ...result.product,
        description: mergeImageDescription(
          result.product.description,
          result.imageDescription
        ),
      },
    };
  }
  return result;
}
