"use client";

import Link from "next/link";
import { Palette } from "lucide-react";
import { ShareDeckButton } from "@/components/deck/share-deck-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderActionsProps {
  shareUrl: string;
  displayName: string;
}

export function DashboardHeaderActions({
  shareUrl,
  displayName,
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ShareDeckButton shareUrl={shareUrl} title={displayName} />
      <Link
        href="/dashboard/themes"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Palette className="size-4" />
        Explore themes
      </Link>
    </div>
  );
}
