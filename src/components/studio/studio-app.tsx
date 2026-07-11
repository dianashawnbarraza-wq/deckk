"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, ImageIcon, Send, Trash2 } from "lucide-react";
import type { Card, Deck } from "@/types/cards";
import { PhoneShell } from "@/components/shell/phone-shell";
import { DeckIdentityHeader } from "@/components/shell/deck-identity-header";
import { BottomNav } from "@/components/shell/bottom-nav";
import { cn } from "@/lib/utils";
import Link from "next/link";

const HINTS = [
  "Sell this bag of coffee for $29",
  "Upload a flyer to scan and add to your events",
  "Add a tip jar link",
];

function inferCardType(text: string): Card["type"] {
  const t = text.toLowerCase();
  if (/(event|workshop|class|reading|rsvp|pm|am|ticket)/.test(t)) return "event";
  if (/(shop|buy|mug|tote|item|\$\d)/.test(t)) return "item";
  return "link";
}

function kindLabel(type: Card["type"]) {
  if (type === "event") return "Event";
  if (type === "item") return "Shop";
  if (type === "announcement") return "News";
  if (type === "collection") return "Group";
  return "Link";
}

export function StudioApp({ deck }: { deck: Deck }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [composer, setComposer] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [draft, setDraft] = useState<{ title: string; type: Card["type"]; meta: string } | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    const res = await fetch("/api/cards");
    if (res.ok) {
      const data = await res.json();
      setCards(data.cards ?? []);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    const id = setInterval(() => setHintIndex((i) => (i + 1) % HINTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1900);
  }

  async function publishDraft() {
    if (!draft) return;
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: draft.type,
        title: draft.title,
        description: draft.meta || undefined,
      }),
    });
    if (res.ok) {
      setDraft(null);
      setComposer("");
      await loadCards();
      showToast("Added to your page ✦");
    }
  }

  function runExtract() {
    const text = composer.trim();
    if (!text) return;
    setExtracting(true);
    setDraft(null);
    setTimeout(() => {
      const type = inferCardType(text);
      const priceMatch = text.match(/\$\s?\d+/);
      setDraft({
        type,
        title: text.split(/[,.\n]/)[0].trim().slice(0, 60) || "New card",
        meta: priceMatch ? priceMatch[0] : type === "event" ? "From your description" : "",
      });
      setExtracting(false);
      setComposer("");
    }, 600);
  }

  async function toggleStatus(card: Card) {
    const next = card.status === "live" ? "archived" : "live";
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await loadCards();
  }

  async function deleteCard(id: string) {
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    await loadCards();
    showToast("Deleted");
  }

  const basePath = `/${deck.handle}`;

  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col">
        <div className="deckk-scroll-hide absolute inset-0 overflow-y-auto pb-36">
          <DeckIdentityHeader
            deck={deck}
            condensed
            actions={
              <Link
                href={basePath}
                className="rounded-full border border-deck-card-brd bg-deck-card px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md"
              >
                View live
              </Link>
            }
          />

          <div className="deckk-fade-up px-4 pb-4 pt-2">
            <p className="mb-1 text-[9px] font-bold tracking-[0.18em] text-primary uppercase">
              ✦ Studio
            </p>
            <h2 className="font-display text-[28px] leading-tight text-foreground">
              Everything in one place.
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dim">
              Snap a flyer or describe it. Deckk builds the card for you.
            </p>

            <div className="mt-4 rounded-[18px] border-[1.5px] border-foreground bg-glass-strong p-2 shadow-lg backdrop-blur-xl">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-deck-card-brd bg-deck-card text-foreground"
                  aria-label="Camera"
                >
                  <Camera className="size-4" />
                </button>
                <button
                  type="button"
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-deck-card-brd bg-deck-card text-foreground"
                  aria-label="Upload"
                >
                  <ImageIcon className="size-4" />
                </button>
                <div className="relative min-w-0 flex-1">
                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        runExtract();
                      }
                    }}
                    rows={1}
                    className="max-h-24 min-h-10 w-full resize-none border-0 bg-transparent py-2 text-sm text-foreground outline-none"
                  />
                  {!composer && (
                    <span className="pointer-events-none absolute left-0 top-2 text-sm text-faint transition-opacity duration-500">
                      &ldquo;{HINTS[hintIndex]}&rdquo;
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={runExtract}
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-primary text-primary-foreground"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-center text-[10px] text-faint">
              Photo extraction ships next — text works today.
            </p>

            {extracting && (
              <div className="mt-3.5 rounded-2xl border border-deck-card-brd bg-deck-card p-4 backdrop-blur-xl deckk-fade-up">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary">
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  DECKK IS READING…
                </div>
                <div className="space-y-2">
                  {[70, 90, 50].map((w) => (
                    <div
                      key={w}
                      className="h-2.5 rounded-md opacity-50"
                      style={{
                        width: `${w}%`,
                        background:
                          "linear-gradient(90deg, var(--deck-card-brd) 25%, var(--faint) 37%, var(--deck-card-brd) 63%)",
                        backgroundSize: "400px 100%",
                        animation: "deckk-shimmer 1.2s infinite linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {draft && (
              <div className="deckk-pop mt-3.5 rounded-[18px] border-[1.5px] border-primary bg-deck-card p-4 backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground">
                    ✦ DECKK READ THIS
                  </span>
                  <span className="text-[11px] text-dim">from your text</span>
                </div>
                <div className="font-display text-[22px] leading-tight text-foreground">
                  {draft.title}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={publishDraft}
                    className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground"
                  >
                    ＋ Add to page
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="rounded-xl border border-deck-card-brd px-4 py-3 text-[13px] font-semibold"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 mb-2 flex items-center justify-between px-0.5">
              <span className="text-[9px] font-semibold tracking-[0.14em] text-dim uppercase">
                Your cards · {cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "flex items-center gap-2 rounded-[13px] border border-deck-card-brd bg-deck-card px-3 py-2.5 backdrop-blur-xl",
                    card.status !== "live" && "opacity-50"
                  )}
                >
                  <span className="text-[9px] font-bold tracking-wide text-primary uppercase">
                    {kindLabel(card.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{card.title}</div>
                    <div className="truncate text-[11px] text-dim">{card.status}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStatus(card)}
                    className="text-[11px] font-semibold text-primary"
                  >
                    {card.status === "live" ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCard(card.id)}
                    className="text-primary"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              {cards.length === 0 && (
                <p className="rounded-2xl border border-dashed border-deck-card-brd py-8 text-center text-sm text-dim">
                  No cards yet — describe your first event or link above.
                </p>
              )}
            </div>
          </div>
        </div>

        <BottomNav active="studio" basePath={basePath} showStudio />

        {toast && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1b1813] px-5 py-3 text-[13px] font-medium text-[#f3ecdf] shadow-xl deckk-fade-up">
            {toast}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
