"use client";

import { cn } from "@/lib/utils";
import { Calendar, Home, Music2, PenLine, ShoppingBag } from "lucide-react";
import type { PublicTab } from "@/types/cards";
import type { NavCapability } from "@/lib/card-taxonomy";
import { EighteenPlusIcon } from "@/components/icons/social-icons";

export type ShellTab = PublicTab;

interface BottomNavProps {
  active: ShellTab;
  capabilities: NavCapability;
  onSelect: (tab: ShellTab) => void;
}

type TabDef = {
  id: ShellTab;
  label: string;
  show: (c: NavCapability) => boolean;
  renderIcon: (active: boolean) => React.ReactNode;
};

const tabs: TabDef[] = [
  {
    id: "home",
    label: "Home",
    show: () => true,
    renderIcon: (active) => (
      <Home className="size-5" strokeWidth={active ? 2.35 : 2} />
    ),
  },
  {
    id: "events",
    label: "Events",
    show: (c) => c.hasEvents,
    renderIcon: (active) => (
      <Calendar className="size-5" strokeWidth={active ? 2.35 : 2} />
    ),
  },
  {
    id: "shop",
    label: "Shop",
    show: (c) => c.hasShop,
    renderIcon: (active) => (
      <ShoppingBag className="size-5" strokeWidth={active ? 2.35 : 2} />
    ),
  },
  {
    id: "adult",
    label: "18+",
    show: (c) => c.hasAdult,
    renderIcon: () => <EighteenPlusIcon className="size-5" />,
  },
  {
    id: "listen",
    label: "Listen",
    show: (c) => c.hasListen,
    renderIcon: (active) => (
      <Music2 className="size-5" strokeWidth={active ? 2.35 : 2} />
    ),
  },
  {
    id: "writing",
    label: "Writing",
    show: (c) => c.hasWriting,
    renderIcon: (active) => (
      <PenLine className="size-5" strokeWidth={active ? 2.35 : 2} />
    ),
  },
];

export function BottomNav({
  active,
  capabilities,
  onSelect,
  className,
  variant = "floating",
}: BottomNavProps & {
  className?: string;
  /** `floating` = mobile dock; `bar` = desktop top tabs under the header */
  variant?: "floating" | "bar";
}) {
  const visible = tabs.filter((t) => t.show(capabilities));

  if (variant === "bar") {
    return (
      <nav
        className={cn(
          "hidden border-b border-deck-card-brd bg-page/80 backdrop-blur-md lg:block",
          className
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 lg:px-8">
          {visible.map(({ id, label, renderIcon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300",
                  isActive
                    ? "text-primary-foreground"
                    : "text-dim hover:text-foreground"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive
                      ? "scale-100 opacity-100"
                      : "scale-90 opacity-0"
                  )}
                />
                <span className="relative z-[1] flex items-center gap-2">
                  {renderIcon(isActive)}
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3 lg:hidden",
        className
      )}
    >
      <nav
        aria-label="Deck sections"
        className="deckk-dock pointer-events-auto flex max-w-full items-end justify-center gap-0.5 overflow-x-auto rounded-full border border-white/45 bg-white/55 px-1.5 py-1.5 shadow-[0_18px_50px_-18px_rgba(26,26,26,0.45),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-white/[0.08] dark:shadow-[0_18px_50px_-16px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]"
      >
        {visible.map(({ id, label, renderIcon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-w-[3.35rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border-none px-2.5 py-1.5 text-sm transition-colors duration-300 ease-out",
                isActive
                  ? "text-primary-foreground"
                  : "bg-transparent text-dim hover:text-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-full bg-primary shadow-[0_8px_20px_-10px_rgba(0,0,0,0.55)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive
                    ? "scale-100 opacity-100"
                    : "scale-[0.82] opacity-0"
                )}
              />
              <span className="relative z-[1] flex flex-col items-center gap-0.5">
                {renderIcon(isActive)}
                <span className="text-[10px] leading-none font-semibold tracking-tight">
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
