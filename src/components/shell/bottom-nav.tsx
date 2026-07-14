"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Home,
  Music2,
  PenLine,
  ShoppingBag,
  ShieldAlert,
} from "lucide-react";
import type { PublicTab } from "@/types/cards";
import type { NavCapability } from "@/lib/card-taxonomy";

export type ShellTab = PublicTab;

interface BottomNavProps {
  active: ShellTab;
  basePath: string;
  capabilities: NavCapability;
}

type TabDef = {
  id: ShellTab;
  label: string;
  icon: typeof Home;
  show: (c: NavCapability) => boolean;
};

const tabs: TabDef[] = [
  { id: "home", label: "Home", icon: Home, show: () => true },
  { id: "events", label: "Events", icon: Calendar, show: (c) => c.hasEvents },
  { id: "shop", label: "Shop", icon: ShoppingBag, show: (c) => c.hasShop },
  { id: "adult", label: "18+", icon: ShieldAlert, show: (c) => c.hasAdult },
  { id: "listen", label: "Listen", icon: Music2, show: (c) => c.hasListen },
  { id: "writing", label: "Writing", icon: PenLine, show: (c) => c.hasWriting },
];

export function BottomNav({ active, basePath, capabilities }: BottomNavProps) {
  const visible = tabs.filter((t) => t.show(capabilities));

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <nav className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-deck-card-brd bg-deck-nav px-1.5 py-1.5 shadow-lg backdrop-blur-3xl backdrop-saturate-180">
        {visible.map(({ id, label, icon: Icon }) => {
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
              <Icon className="size-5" strokeWidth={isActive ? 2.2 : 2} />
              {isActive && <span className="font-semibold">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
