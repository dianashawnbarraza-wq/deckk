"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, X } from "lucide-react";
import {
  googleCalendarUrl,
  outlookCalendarUrl,
  type CalendarEventInput,
} from "@/lib/calendar-links";
import { cn } from "@/lib/utils";

export function AddToCalendarSheet({
  event,
  icsHref,
  className,
  label = "Add to calendar",
}: {
  event: CalendarEventInput;
  /** Optional .ics fallback for Apple Calendar / other apps. */
  icsHref?: string | null;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<Element | null>(null);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setFrame(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const googleHref = googleCalendarUrl(event);
  const outlookHref = outlookCalendarUrl(event);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-deck-card-brd bg-page px-4 text-[14px] font-semibold text-foreground transition-opacity hover:opacity-90",
          className
        )}
      >
        <CalendarPlus className="size-4 text-primary" strokeWidth={2.2} />
        {label}
      </button>

      {open && frame
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
              <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-[1] w-full max-w-md rounded-t-[22px] border border-deck-card-brd bg-deck-card p-5 shadow-2xl sm:rounded-[22px] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      id={titleId}
                      className="font-display text-[24px] leading-tight text-foreground"
                    >
                      Add to calendar
                    </p>
                    <p className="mt-1 text-[13px] text-dim">
                      Pick your calendar app
                    </p>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-deck-card-brd text-foreground"
                    aria-label="Close"
                  >
                    <X className="size-4" strokeWidth={2.2} />
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <a
                    href={googleHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground"
                  >
                    Google Calendar
                  </a>
                  <a
                    href={outlookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-deck-card-brd bg-page px-5 text-[15px] font-semibold text-foreground"
                  >
                    Outlook
                  </a>
                  {icsHref ? (
                    <a
                      href={icsHref}
                      onClick={() => setOpen(false)}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-[13px] font-medium text-dim underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Apple Calendar / other (.ics)
                    </a>
                  ) : null}
                </div>
              </div>
            </div>,
            frame
          )
        : null}
    </>
  );
}
