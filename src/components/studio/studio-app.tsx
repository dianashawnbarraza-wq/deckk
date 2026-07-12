"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, Plus, Send, Trash2, X } from "lucide-react";
import type { Card, CardType, Deck } from "@/types/cards";
import type { ExtractResult } from "@/lib/ai/extract-types";
import { fileToDownscaledBlob } from "@/lib/ai/image-prep";
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

const LOW_CONFIDENCE = 0.7;

type Draft = {
  type: ExtractResult["type"] | "link";
  title: string;
  description: string;
  dateStart: string | null;
  dateEnd: string | null;
  locationName: string | null;
  locationAddress: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  price: number | null;
  tags: string[];
  confidence: ExtractResult["confidence"];
  mediaUrl: string | null;
  source: "manual" | "extracted";
  label: string;
};

function inferCardType(text: string): Draft["type"] {
  const t = text.toLowerCase();
  if (/(event|workshop|class|reading|rsvp|pm|am|ticket)/.test(t)) return "event";
  if (/(shop|buy|mug|tote|item|\$\d)/.test(t)) return "item";
  return "link";
}

function kindLabel(type: CardType | Draft["type"]) {
  if (type === "event") return "Event";
  if (type === "item") return "Shop";
  if (type === "announcement") return "News";
  if (type === "collection") return "Group";
  return "Link";
}

function Field({
  label,
  value,
  onChange,
  low,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  low?: boolean;
  multiline?: boolean;
}) {
  const cls = cn(
    "w-full rounded-lg border bg-page px-2.5 py-2 text-[13px] text-foreground outline-none",
    low ? "border-[#d4a017] bg-[#fff8e7]" : "border-deck-card-brd"
  );
  return (
    <label className="block">
      <span
        className={cn(
          "mb-1 block text-[9px] font-bold tracking-[0.14em] uppercase",
          low ? "text-[#b8894a]" : "text-faint"
        )}
      >
        {label}
        {low ? " · check" : ""}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

export function StudioApp({ deck }: { deck: Deck }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [composer, setComposer] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [attachment, setAttachment] = useState<{
    file: Blob;
    name: string;
    previewUrl: string;
    mime: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    };
  }, [attachment]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1900);
  }

  function clearAttachment() {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  }

  async function onPickImage(file: File | null) {
    if (!file) return;
    try {
      const { blob, mime, previewUrl } = await fileToDownscaledBlob(file);
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      setAttachment({ file: blob, name: file.name || "flyer.jpg", previewUrl, mime });
      setDraft(null);
      await runPhotoExtract(blob, mime, composer.trim());
    } catch {
      showToast("Could not read that image");
    }
  }

  async function runPhotoExtract(blob: Blob, mime: string, prompt: string) {
    setExtracting(true);
    setDraft(null);
    try {
      const form = new FormData();
      form.append("file", blob, "flyer.jpg");
      form.append("prompt", prompt);
      form.append("timezone", deck.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Extraction failed");
        return;
      }

      const extraction = data.extraction as ExtractResult;
      let mediaUrl: string | null = null;
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", new File([blob], "flyer.jpg", { type: mime }));
        const uploadRes = await fetch("/api/uploads", { method: "POST", body: uploadForm });
        if (uploadRes.ok) {
          const uploaded = await uploadRes.json();
          mediaUrl = uploaded.url ?? null;
        }
      } catch {
        // Extraction still works without stored media
      }

      setDraft({
        type: extraction.type,
        title: extraction.title,
        description: extraction.description ?? "",
        dateStart: extraction.date_start ?? null,
        dateEnd: extraction.date_end ?? null,
        locationName: extraction.location_name ?? null,
        locationAddress: extraction.location_address ?? null,
        ctaLabel: extraction.cta_label ?? null,
        ctaUrl: extraction.cta_url ?? null,
        price: extraction.price ?? null,
        tags: extraction.tags ?? [],
        confidence: extraction.confidence ?? {},
        mediaUrl,
        source: "extracted",
        label: data.meta?.usedAi ? "from your photo ✦ AI" : "from your photo",
      });
      setComposer("");
    } catch {
      showToast("Extraction failed — try again");
    } finally {
      setExtracting(false);
    }
  }

  async function runTextExtract() {
    const text = composer.trim();
    if (!text && !attachment) return;
    if (attachment) {
      await runPhotoExtract(attachment.file, attachment.mime, text);
      return;
    }
    setExtracting(true);
    setDraft(null);
    const type = inferCardType(text);
    const priceMatch = text.match(/\$\s?(\d+(?:\.\d+)?)/);
    setTimeout(() => {
      setDraft({
        type,
        title: text.split(/[,.\n]/)[0].trim().slice(0, 60) || "New card",
        description: text,
        dateStart: null,
        dateEnd: null,
        locationName: null,
        locationAddress: null,
        ctaLabel: type === "event" ? "RSVP" : type === "item" ? "Shop" : "Open",
        ctaUrl: null,
        price: priceMatch ? Number(priceMatch[1]) : null,
        tags: [],
        confidence: {},
        mediaUrl: null,
        source: "manual",
        label: "from your text",
      });
      setExtracting(false);
      setComposer("");
    }, 450);
  }

  async function publishDraft() {
    if (!draft) return;
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: draft.type,
        title: draft.title,
        description: draft.description || undefined,
        media: draft.mediaUrl ? [{ url: draft.mediaUrl }] : undefined,
        dateStart: draft.dateStart,
        dateEnd: draft.dateEnd,
        locationName: draft.locationName,
        locationAddress: draft.locationAddress,
        ctaLabel: draft.ctaLabel,
        ctaUrl: draft.ctaUrl,
        price: draft.price,
        tags: draft.tags,
        source: draft.source,
        extractionConfidence: draft.source === "extracted" ? draft.confidence : null,
      }),
    });
    if (res.ok) {
      setDraft(null);
      clearAttachment();
      setComposer("");
      await loadCards();
      showToast("Added to your page ✦");
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Could not publish");
    }
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
  const conf = draft?.confidence ?? {};

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
              Turn your flyers, images, ideas into beautiful event pages, shop
              listings, and a home for everything you share.
            </p>

            <div className="mt-4 rounded-[16px] border-[1.5px] border-foreground bg-glass-strong px-1.5 py-1.5 shadow-lg backdrop-blur-xl">
              {attachment && (
                <div className="mb-1.5 flex items-center gap-2 rounded-[11px] bg-deck-card px-2.5 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.previewUrl}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearAttachment}
                    className="text-dim"
                    aria-label="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex size-8 items-center justify-center rounded-[10px] border border-deck-card-brd bg-deck-card text-foreground"
                    aria-label="Add photo"
                    aria-expanded={menuOpen}
                  >
                    <Plus className={cn("size-4 transition-transform", menuOpen && "rotate-45")} />
                  </button>
                  {menuOpen && (
                    <div className="absolute bottom-full left-0 z-20 mb-2 w-48 overflow-hidden rounded-xl border border-deck-card-brd bg-glass-strong py-1 shadow-lg backdrop-blur-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          cameraInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-foreground transition hover:bg-deck-card"
                      >
                        <Camera className="size-4 shrink-0 text-dim" />
                        Take a photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          uploadInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-foreground transition hover:bg-deck-card"
                      >
                        <ImageIcon className="size-4 shrink-0 text-dim" />
                        Upload an image
                      </button>
                    </div>
                  )}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      void onPickImage(f);
                    }}
                  />
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      void onPickImage(f);
                    }}
                  />
                </div>
                <div className="relative flex min-h-8 min-w-0 flex-1 items-center">
                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void runTextExtract();
                      }
                    }}
                    rows={1}
                    className="max-h-20 w-full resize-none border-0 bg-transparent py-1.5 text-sm leading-5 text-foreground outline-none"
                  />
                  {!composer && !attachment && (
                    <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 truncate text-sm leading-5 text-faint">
                      &ldquo;{HINTS[hintIndex]}&rdquo;
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void runTextExtract()}
                  disabled={extracting || (!composer.trim() && !attachment)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-center text-[10px] text-faint">
              Snap a flyer or describe it — Deckk builds the card. You always review before publish.
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

            {draft && !extracting && (
              <div className="deckk-pop mt-3.5 rounded-[18px] border-[1.5px] border-primary bg-deck-card p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground">
                    ✦ DECKK READ THIS
                  </span>
                  <span className="text-[11px] text-dim">{draft.label}</span>
                </div>
                {draft.mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.mediaUrl}
                    alt=""
                    className="mb-3 h-28 w-full rounded-xl object-cover"
                  />
                )}
                <div className="space-y-2.5">
                  <Field
                    label="Title"
                    value={draft.title}
                    onChange={(title) => setDraft({ ...draft, title })}
                    low={
                      draft.source === "extracted" &&
                      conf.title != null &&
                      conf.title < LOW_CONFIDENCE
                    }
                  />
                  <Field
                    label="Description"
                    value={draft.description}
                    onChange={(description) => setDraft({ ...draft, description })}
                    multiline
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      label="Type"
                      value={draft.type}
                      onChange={(type) =>
                        setDraft({
                          ...draft,
                          type: (["event", "item", "announcement", "link"].includes(type)
                            ? type
                            : draft.type) as Draft["type"],
                        })
                      }
                      low={
                        draft.source === "extracted" &&
                        conf.type != null &&
                        conf.type < LOW_CONFIDENCE
                      }
                    />
                    <Field
                      label="Price"
                      value={draft.price != null ? String(draft.price) : ""}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          price: v.trim() === "" ? null : Number(v.replace(/[^0-9.]/g, "")) || null,
                        })
                      }
                      low={
                        draft.source === "extracted" &&
                        conf.price != null &&
                        conf.price < LOW_CONFIDENCE
                      }
                    />
                    <Field
                      label="When"
                      value={draft.dateStart ?? ""}
                      onChange={(dateStart) =>
                        setDraft({ ...draft, dateStart: dateStart.trim() || null })
                      }
                      low={
                        draft.source === "extracted" &&
                        conf.date_start != null &&
                        conf.date_start < LOW_CONFIDENCE
                      }
                    />
                    <Field
                      label="Where"
                      value={draft.locationName ?? ""}
                      onChange={(locationName) => setDraft({ ...draft, locationName })}
                      low={
                        draft.source === "extracted" &&
                        conf.location_name != null &&
                        conf.location_name < LOW_CONFIDENCE
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void publishDraft()}
                    className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground"
                  >
                    ＋ Add to page
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      clearAttachment();
                    }}
                    className="rounded-xl border border-deck-card-brd px-4 py-3 text-[13px] font-semibold text-foreground"
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
                    <div className="truncate text-[13px] font-semibold text-foreground">{card.title}</div>
                    <div className="truncate text-[11px] text-dim">
                      {card.source === "extracted" ? "extracted · " : ""}
                      {card.status}
                    </div>
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
                  No cards yet — snap a flyer or describe your first post.
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
