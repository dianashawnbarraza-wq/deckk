"use client";

import { ShareDeckSheet } from "@/components/deck/share-deck-sheet";
import { cn } from "@/lib/utils";

interface ShareDeckButtonProps {
  shareUrl: string;
  title?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ShareDeckButton({
  shareUrl,
  title,
  variant = "outline",
}: ShareDeckButtonProps) {
  return (
    <ShareDeckSheet
      shareUrl={shareUrl}
      title={title ?? "My deck"}
      trigger="icon"
      className={cn(variant === "ghost" && "border-transparent bg-transparent")}
    />
  );
}
