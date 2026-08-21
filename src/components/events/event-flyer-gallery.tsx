"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

function FlyerViewerOverlay({
  images,
  title,
  index,
  onClose,
  onIndexChange,
}: {
  images: string[];
  title: string;
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = images.length;
  const safeIndex = ((index % count) + count) % count;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange(safeIndex - 1);
      if (e.key === "ArrowRight") onIndexChange(safeIndex + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onIndexChange, safeIndex]);

  function go(delta: number) {
    onIndexChange(safeIndex + delta);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
    setDragX(0);
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const x = e.touches[0]?.clientX ?? touchStartX.current;
    const delta = x - touchStartX.current;
    touchDeltaX.current = delta;
    setDragX(delta);
  }

  function onTouchEnd() {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setDragX(0);
    setDragging(false);
    if (Math.abs(delta) < 56) return;
    if (delta < 0) go(1);
    else go(-1);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex h-dvh max-h-dvh w-screen flex-col bg-black/75 backdrop-blur-md deckk-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} flyer gallery`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="pl-1 text-[13px] font-semibold text-white/85 tabular-nums">
          {safeIndex + 1} / {count}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full border border-white/35 bg-black/55 text-white backdrop-blur-md"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="relative z-10 flex min-h-0 flex-1 touch-pan-y items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/55 text-white backdrop-blur-md sm:flex"
            aria-label="Previous flyer"
          >
            <ChevronLeft className="size-6" strokeWidth={2.25} />
          </button>
        ) : null}

        <div className="relative z-10 h-full min-h-0 w-full overflow-hidden px-3 sm:px-14">
          <div
            className={cn(
              "flex h-full",
              !dragging && "transition-transform duration-200 ease-out"
            )}
            style={{
              transform: `translateX(calc(${-safeIndex * 100}% + ${dragX}px))`,
            }}
          >
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="flex h-full w-full min-w-full shrink-0 items-center justify-center p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${title} flyer ${i + 1}`}
                  className="h-auto max-h-full w-auto max-w-full object-contain select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/55 text-white backdrop-blur-md sm:flex"
            aria-label="Next flyer"
          >
            <ChevronRight className="size-6" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="relative z-20 flex shrink-0 justify-center gap-1.5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Flyer ${i + 1}`}
              onClick={() => onIndexChange(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === safeIndex
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/35 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="pb-[max(1rem,env(safe-area-inset-bottom))]" />
      )}
    </div>,
    document.body
  );
}

/** Mobile: horizontal scroll. Desktop: large flyer + thumbnail row (first selected). */
export function EventFlyerGallery({
  images,
  title,
  footer,
  side,
}: {
  images: string[];
  title: string;
  /** Shown under thumbs on desktop / under mobile scroll (e.g. countdown). */
  footer?: React.ReactNode;
  /** Desktop-only panel beside the lockup (title, hosts, etc.). */
  side?: React.ReactNode;
}) {
  const urls = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  const safeActive = Math.min(active, urls.length - 1);
  const mainUrl = urls[safeActive] ?? urls[0];

  return (
    <div className="relative w-full overflow-hidden border-b border-deck-card-brd">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mainUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50 saturate-125"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[color-mix(in_srgb,var(--deck-page)_90%,transparent)]" />

      {/* Mobile: simply scrollable flyers */}
      <div className="relative lg:hidden">
        <div
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} flyers`}
        >
          {urls.map((url, i) => (
            <button
              key={`${url}-m-${i}`}
              type="button"
              onClick={() => {
                setActive(i);
                setViewerIndex(i);
              }}
              className="relative w-[78vw] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-lg shadow-[0_12px_32px_-14px_rgba(0,0,0,0.65)]"
              aria-label={`View flyer ${i + 1} fullscreen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={i === 0 ? title : `${title} flyer ${i + 1}`}
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
        {footer ? (
          <div className="flex justify-center px-4 pb-4">{footer}</div>
        ) : null}
      </div>

      {/* Desktop: lockup + optional side copy */}
      <div
        className={cn(
          "relative mx-auto hidden max-w-6xl px-4 py-5 lg:grid lg:px-8 lg:py-6",
          side
            ? "lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-end lg:gap-10"
            : "lg:flex lg:flex-col lg:items-center"
        )}
      >
        <div className="flex w-full max-w-[380px] flex-col items-stretch gap-3">
          <div className="relative w-full overflow-hidden rounded-lg shadow-[0_16px_40px_-18px_rgba(0,0,0,0.7)]">
            <button
              type="button"
              onClick={() => setViewerIndex(safeActive)}
              className="block w-full text-left"
              aria-label={`View flyer ${safeActive + 1} fullscreen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainUrl}
                alt={
                  safeActive === 0 ? title : `${title} flyer ${safeActive + 1}`
                }
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            </button>
            <button
              type="button"
              onClick={() => setViewerIndex(safeActive)}
              className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-md backdrop-blur-md transition-opacity hover:bg-black/60"
              aria-label={`Expand flyer ${safeActive + 1}`}
            >
              <Expand className="size-4" strokeWidth={2.25} />
            </button>
          </div>

          {urls.length > 1 ? (
            <div
              className="flex w-full gap-2"
              role="tablist"
              aria-label={`${title} flyer thumbnails`}
            >
              {urls.map((url, i) => {
                const selected = i === safeActive;
                return (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={`Show flyer ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative shrink-0 overflow-hidden rounded-md transition-[box-shadow,opacity]",
                      urls.length === 2
                        ? "w-[calc((100%-0.5rem)/2)]"
                        : "w-[calc((100%-1rem)/3)]",
                      selected
                        ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-black/40"
                        : "opacity-70 hover:opacity-95"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="aspect-[4/5] w-full object-cover"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          ) : null}

          {!side && footer ? (
            <div className="flex justify-center pt-1">{footer}</div>
          ) : null}
        </div>

        {side ? (
          <div className="min-w-0 pb-1">
            {side}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        ) : null}
      </div>

      {viewerIndex != null ? (
        <FlyerViewerOverlay
          images={urls}
          title={title}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={(i) => {
            const next = ((i % urls.length) + urls.length) % urls.length;
            setViewerIndex(next);
            setActive(next);
          }}
        />
      ) : null}
    </div>
  );
}
