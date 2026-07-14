"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Home, Music2, PenLine, ShoppingBag } from "lucide-react";
import type { PublicTab } from "@/types/cards";
import type { NavCapability } from "@/lib/card-taxonomy";
import { EighteenPlusIcon } from "@/components/icons/social-icons";

export type ShellTab = PublicTab;

interface BottomNavProps {
  active: ShellTab;
  basePath: string;
  capabilities: NavCapability;
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

export function BottomNav({ active, basePath, capabilities }: BottomNavProps) {
  const visible = tabs.filter((t) => t.show(capabilities));

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <nav className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-deck-card-brd bg-deck-nav px-1.5 py-1.5 shadow-lg backdrop-blur-3xl backdrop-saturate-180">
        {visible.map(({ id, label, renderIcon }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              href={`${basePath}?tab=${id}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border-none px-2.5 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-dim hover:text-foreground"
              )}
            >
              {renderIcon(isActive)}
              {isActive && <span className="font-semibold">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
