"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Home, ShoppingBag, Sparkles } from "lucide-react";

export type ShellTab = "home" | "events" | "shop" | "studio";

interface BottomNavProps {
  active: ShellTab;
  basePath: string;
  showStudio?: boolean;
}

const tabs: { id: ShellTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "studio", label: "Studio", icon: Sparkles },
];

export function BottomNav({ active, basePath, showStudio = false }: BottomNavProps) {
  const visible = showStudio ? tabs : tabs.filter((t) => t.id !== "studio");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-deck-card-brd bg-deck-nav px-2 py-1.5 shadow-lg backdrop-blur-3xl backdrop-saturate-180">
        {visible.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const href = id === "studio" ? "/studio" : `${basePath}?tab=${id}`;
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full border-none px-3 py-2.5 text-sm transition-colors",
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
