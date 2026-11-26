/**
 * Deckk brand voice (marketing)
 *
 * Closer to Square: clear, confident, practical. Short sentences. Say what
 * the product does and why it matters. No slang, no swagger, no em dashes.
 *
 * Do: explain the workflow, name concrete outcomes (events with dates, a
 * shop, one bio link), keep the tone professional and human.
 *
 * Don't: fintech slang, empty taglines, em dashes, "you know how…" padding.
 */
export const DECKK_VOICE = {
  tone: "clear, confident, practical",
  person: "you / we",
  pace: "short sentences, then detail",
  mustAnswer: ["what is it", "how does it work", "why should I care"],
  avoid: ["—", "get in", "come through", "that's the move", "you know how"],
} as const;
