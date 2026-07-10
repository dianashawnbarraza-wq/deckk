import { z } from "zod";

export const composeIntentSchema = z.enum([
  "event",
  "product",
  "link",
  "payment_link",
]);

export type ComposeIntent = z.infer<typeof composeIntentSchema>;

export const composeResultSchema = z.object({
  intent: composeIntentSchema,
  summary: z.string().optional(),
  imageDescription: z.string().optional(),
  event: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      startsAtLocal: z.string().optional(),
      endsAtLocal: z.string().nullable().optional(),
      timezone: z.string().optional(),
      isAllDay: z.boolean().optional(),
      location: z.string().nullable().optional(),
      isOnline: z.boolean().optional(),
      url: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      communityOptIn: z.boolean().optional(),
    })
    .optional(),
  product: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      priceCents: z.number().int().positive().optional(),
      inventoryQty: z.number().int().nonnegative().nullable().optional(),
    })
    .optional(),
  link: z
    .object({
      title: z.string(),
      url: z.string(),
      category: z
        .enum(["social", "shop", "listen", "read", "book", "community", "contact", "custom"])
        .optional(),
    })
    .optional(),
  paymentLink: z
    .object({
      kind: z.enum(["tip", "fixed"]),
      title: z.string(),
      amountCents: z.number().int().positive().nullable().optional(),
    })
    .optional(),
});

export type ComposeResult = z.infer<typeof composeResultSchema>;

export type EventDraft = NonNullable<ComposeResult["event"]> & {
  coverUrl?: string | null;
};

export type ProductDraft = NonNullable<ComposeResult["product"]> & {
  imageUrl?: string | null;
};
