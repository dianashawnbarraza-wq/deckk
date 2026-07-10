"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Calendar,
  Camera,
  DollarSign,
  Heart,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComposeResult } from "@/lib/ai/types";
import { draftFromCompose, localDraftToUtcIso } from "@/lib/ai/publish";
import { redirectToStripeIfNeeded } from "@/lib/stripe-onboarding-client";
import { AnimatedPlaceholder, QUICK_PROMPTS } from "@/components/compose/animated-placeholder";
import { ComposeDraftPanel } from "@/components/compose/compose-draft-panel";
import { cn } from "@/lib/utils";

interface SmartComposerProps {
  profileId: string;
  variant?: "chat" | "card";
  hint?: string;
  showHint?: boolean;
  onPublished?: () => void;
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

const ADD_MENU = [
  { id: "upload", label: "Upload photo", icon: ImagePlus },
  { id: "camera", label: "Take photo", icon: Camera },
  { id: "link", label: "Add a link", icon: Link2 },
  { id: "sell", label: "Sell something", icon: ShoppingBag },
  { id: "event", label: "Post an event", icon: Calendar },
  { id: "tip", label: "Tip jar", icon: Heart },
  { id: "fixed", label: "Fixed price link", icon: DollarSign },
] as const;

export function SmartComposer({
  profileId,
  variant = "chat",
  hint,
  showHint = true,
  onPublished,
}: SmartComposerProps) {
  const router = useRouter();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Los_Angeles";

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<ComposeResult | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const onPickFile = useCallback(
    (picked: File | null) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(picked);
      setUploadedUrl(null);
      setDraft(null);
      if (picked) {
        setPreviewUrl(URL.createObjectURL(picked));
      } else {
        setPreviewUrl(null);
      }
    },
    [previewUrl]
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  async function uploadImage(): Promise<string | null> {
    if (!file) return null;
    if (uploadedUrl) return uploadedUrl;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    setUploadedUrl(data.url);
    return data.url as string;
  }

  async function fillOut() {
    setError("");
    setLoading(true);
    try {
      const imageUrl = file ? await uploadImage() : null;
      const imageBase64 = file ? await fileToBase64(file) : null;
      const res = await fetch("/api/ai/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          timezone,
          imageUrl,
          imageBase64,
          imageMime: file?.type ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not parse that");
        return;
      }
      const merged = draftFromCompose(data as ComposeResult, imageUrl);
      if (merged.intent === "event" && merged.event && !merged.event.timezone) {
        merged.event.timezone = timezone;
      }
      setDraft(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!draft) return;
    setPublishing(true);
    setError("");
    try {
      if (draft.intent === "event" && draft.event) {
        const e = draft.event;
        const startsAt = localDraftToUtcIso(
          e.startsAtLocal,
          e.timezone ?? timezone,
          e.isAllDay ?? false
        );
        if (!startsAt) {
          setError("Add a start date and time for your event.");
          return;
        }
        const endsAt = e.endsAtLocal
          ? localDraftToUtcIso(e.endsAtLocal, e.timezone ?? timezone, e.isAllDay ?? false)
          : null;
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            title: e.title,
            description: e.description ?? "",
            startsAt,
            endsAt,
            timezone: e.timezone ?? timezone,
            isAllDay: e.isAllDay ?? false,
            location: e.isOnline ? null : e.location ?? null,
            isOnline: e.isOnline ?? false,
            url: e.url ?? null,
            coverUrl: uploadedUrl,
            city: e.city ?? null,
            communityOptIn: e.communityOptIn ?? false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create event");
      } else if (draft.intent === "product" && draft.product) {
        const p = draft.product;
        if (!p.priceCents || p.priceCents <= 0) {
          setError("Add a price for your listing.");
          return;
        }
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            title: p.title,
            description: p.description ?? "",
            priceCents: p.priceCents,
            inventoryQty: p.inventoryQty ?? null,
            images: uploadedUrl ? [uploadedUrl] : [],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create product");
        await redirectToStripeIfNeeded("/dashboard/payments");
      } else if (draft.intent === "link" && draft.link) {
        const res = await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            title: draft.link.title,
            url: draft.link.url,
            category: draft.link.category ?? "custom",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to add link");
      } else if (draft.intent === "payment_link" && draft.paymentLink) {
        const pl = draft.paymentLink;
        const res = await fetch("/api/payment-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            kind: pl.kind,
            title: pl.title,
            amountCents: pl.kind === "fixed" ? pl.amountCents : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create payment link");
        await redirectToStripeIfNeeded("/dashboard/payments");
      }
      setDraft(null);
      setPrompt("");
      onPickFile(null);
      router.refresh();
      onPublished?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  function handleMenuAction(id: (typeof ADD_MENU)[number]["id"]) {
    setMenuOpen(false);
    switch (id) {
      case "upload":
        galleryRef.current?.click();
        break;
      case "camera":
        cameraRef.current?.click();
        break;
      case "link":
        setPrompt(QUICK_PROMPTS.link);
        textareaRef.current?.focus();
        break;
      case "sell":
        setPrompt(QUICK_PROMPTS.product);
        galleryRef.current?.click();
        break;
      case "event":
        setPrompt(QUICK_PROMPTS.event);
        galleryRef.current?.click();
        break;
      case "tip":
        setPrompt(QUICK_PROMPTS.tip);
        textareaRef.current?.focus();
        break;
      case "fixed":
        setPrompt(QUICK_PROMPTS.fixed);
        textareaRef.current?.focus();
        break;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && (prompt.trim() || file)) fillOut();
    }
  }

  const showPlaceholder = !prompt && !focused;

  if (variant === "card") {
    return null;
  }

  return (
    <section className="w-full">
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />

      <div className="rounded-[1.25rem] border border-line bg-paper shadow-[0_1px_0_rgba(25,21,18,0.04)]">
        {previewUrl && (
          <div className="relative overflow-hidden border-b border-line bg-paper-sunken/30 p-3">
            <div className="relative mx-auto aspect-[16/9] max-h-48 w-full max-w-md overflow-hidden rounded-[0.75rem] ring-1 ring-line">
              <Image src={previewUrl} alt="Attached" fill className="object-cover" unoptimized />
            </div>
            <button
              type="button"
              onClick={() => onPickFile(null)}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-paper text-ink ring-1 ring-line transition hover:bg-paper-sunken"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 p-4">
          <div className="relative shrink-0" ref={menuRef}>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Add attachment or quick action"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="size-11"
            >
              <Plus className={cn("size-5 transition", menuOpen && "rotate-45")} />
            </Button>
            {menuOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-[1rem] border border-line bg-paper py-1 shadow-lg">
                {ADD_MENU.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleMenuAction(id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-base text-ink transition hover:bg-paper-sunken"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex min-h-[52px] min-w-0 flex-1 items-center">
            <AnimatedPlaceholder active={showPlaceholder} />
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={onKeyDown}
              rows={1}
              className={cn(
                "block w-full resize-none border-0 bg-transparent px-1 py-2 text-base leading-relaxed text-ink outline-none",
                showPlaceholder && "text-transparent caret-ink"
              )}
              style={{ minHeight: "44px", maxHeight: "160px" }}
              aria-label="Describe what you want to add"
            />
          </div>

          <Button
            type="button"
            size="icon"
            onClick={fillOut}
            disabled={loading || (!prompt.trim() && !file)}
            aria-label="Create draft"
            className="size-11 shrink-0"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {showHint && hint && (
        <p className="mt-3 text-center text-sm text-muted-foreground">{hint}</p>
      )}

      {draft && (
        <ComposeDraftPanel
          draft={draft}
          timezone={timezone}
          publishing={publishing}
          onUpdate={(fn) => setDraft((d) => (d ? fn(d) : d))}
          onPublish={publish}
        />
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
