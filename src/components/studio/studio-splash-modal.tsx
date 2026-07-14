"use client";

import { useEffect, useId, useState } from "react";
import { Camera, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "deckk-studio-splash-v1";

export function StudioSplashModal({
  onAddPhoto,
}: {
  onAddPhoto: () => void;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function startWithPhoto() {
    dismiss();
    onAddPhoto();
  }

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-28 pt-10 backdrop-blur-[2px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-[22px] border border-deck-card-brd bg-glass-strong p-5 shadow-xl backdrop-blur-xl deckk-pop"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles className="size-5" strokeWidth={2.2} />
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 id={titleId} className="font-display text-[26px] leading-tight text-foreground">
          Easy to get started
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-dim">
          Add a photo of a flyer, product, or poster. Deckk.me extracts the details so you can
          publish an event, shop item, or link in seconds.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={startWithPhoto}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
          >
            <Camera className="size-4" />
            Add a photo
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl border border-deck-card-brd bg-deck-card py-3 text-[13px] font-semibold text-foreground transition-transform active:scale-[0.98]"
          >
            I&apos;ll explore first
          </button>
        </div>
      </div>
    </div>
  );
}
