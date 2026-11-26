"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { secondaryButton } from "@/lib/secondary-surface";

interface ShareDeckSheetProps {
  shareUrl: string;
  title: string;
  /** Optional flyer / preview image used as share thumbnail. */
  imageUrl?: string | null;
  /** Icon-only round trigger (header) vs labeled button. */
  trigger?: "icon" | "button";
  /** Label when trigger is "button" (defaults to Share icon only if empty). */
  label?: string;
  className?: string;
}

export function ShareDeckSheet({
  shareUrl,
  title,
  imageUrl = null,
  trigger = "icon",
  label,
  className,
}: ShareDeckSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [frame, setFrame] = useState<Element | null>(null);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setQrDataUrl(null);
    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(shareUrl, {
          width: 220,
          margin: 2,
          color: { dark: "#1b1813", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    })();
    closeRef.current?.focus();
    return () => {
      cancelled = true;
    };
  }, [open, shareUrl]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your deck link:", shareUrl);
    }
  }

  async function nativeShare() {
    try {
      const data: ShareData = { url: shareUrl, title, text: title };
      if (imageUrl && typeof navigator.canShare === "function") {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const ext = blob.type.includes("png")
            ? "png"
            : blob.type.includes("webp")
              ? "webp"
              : "jpg";
          const file = new File([blob], `flyer.${ext}`, {
            type: blob.type || "image/jpeg",
          });
          const withFile: ShareData = { ...data, files: [file] };
          if (navigator.canShare(withFile)) {
            await navigator.share(withFile);
            setOpen(false);
            return;
          }
        } catch {
          // Fall through to link-only share
        }
      }
      await navigator.share(data);
      setOpen(false);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      await copyLink();
    }
  }

  const sheet =
    open && frame
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-24 pt-10 backdrop-blur-[2px] sm:items-center sm:pb-10"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="w-full max-w-sm rounded-[22px] border border-deck-card-brd bg-glass-strong p-5 shadow-xl backdrop-blur-xl deckk-pop"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3
                    id={titleId}
                    className="font-display text-[24px] leading-tight text-foreground"
                  >
                    Share
                  </h3>
                  <p className="mt-1 text-[12px] leading-snug text-dim">
                    Scan the code or copy the link to {title}.
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {imageUrl ? (
                <div className="mb-3 overflow-hidden rounded-[16px] border border-deck-card-brd">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="aspect-[4/5] max-h-44 w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="mx-auto flex size-[200px] items-center justify-center rounded-[16px] border border-deck-card-brd bg-white p-3">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${shareUrl}`}
                    className="size-full"
                  />
                ) : (
                  <span className="text-[12px] text-dim">Generating QR…</span>
                )}
              </div>

              <p className="mt-3 break-all text-center text-[11px] leading-snug text-dim">
                {shareUrl}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? "Link copied" : "Copy link"}
                </button>
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={() => void nativeShare()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-deck-card-brd bg-deck-card py-3 text-[13px] font-semibold text-foreground transition-transform active:scale-[0.98]"
                  >
                    <Share className="size-4" strokeWidth={2.25} />
                    Share via…
                  </button>
                )}
              </div>
            </div>
          </div>,
          frame
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          const root =
            triggerRef.current?.closest("[data-phone-frame]") ??
            document.querySelector("[data-phone-frame]") ??
            document.body;
          setFrame(root);
          setOpen(true);
        }}
        aria-label={label || "Share"}
        className={cn(
          trigger === "icon"
            ? cn(secondaryButton, "size-9")
            : cn(secondaryButton, "h-9 gap-2 px-3 text-[13px]"),
          className
        )}
      >
        {trigger === "button" && label ? (
          <>
            <Share className="size-4" strokeWidth={2.25} />
            {label}
          </>
        ) : (
          <Share className="size-4" strokeWidth={2.25} />
        )}
      </button>
      {sheet}
    </>
  );
}
