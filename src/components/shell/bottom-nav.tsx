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
    renderIcon: (active) => <Home className="size-5" strokeWidth={active ? 2.2 : 2} />,
  },
  {
    id: "events",
    label: "Events",
    show: (c) => c.hasEvents,
    renderIcon: (active) => <Calendar className="size-5" strokeWidth={active ? 2.2 : 2} />,
  },
  {
    id: "shop",
    label: "Shop",
    show: (c) => c.hasShop,
    renderIcon: (active) => <ShoppingBag className="size-5" strokeWidth={active ? 2.2 : 2} />,
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
    renderIcon: (active) => <Music2 className="size-5" strokeWidth={active ? 2.2 : 2} />,
  },
  {
    id: "writing",
    label: "Writing",
    show: (c) => c.hasWriting,
    renderIcon: (active) => <PenLine className="size-5" strokeWidth={active ? 2.2 : 2} />,
  },
];

export function BottomNav({ active, capabilities, onSelect }: BottomNavProps) {
  const visible = tabs.filter((t) => t.show(capabilities));

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <nav className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-deck-card-brd bg-deck-nav px-1.5 py-1.5 shadow-lg backdrop-blur-3xl backdrop-saturate-180">
        {visible.map(({ id, label, renderIcon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border-none px-2.5 py-2.5 text-sm transition-all duration-300 ease-out",
                isActive
                  ? "bg-primary text-white"
                  : "bg-transparent text-dim hover:text-foreground"
              )}
            >
              {renderIcon(isActive)}
              <span
                className={cn(
                  "overflow-hidden font-semibold whitespace-nowrap transition-all duration-300 ease-out",
                  isActive ? "max-w-20 opacity-100" : "max-w-0 opacity-0"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
