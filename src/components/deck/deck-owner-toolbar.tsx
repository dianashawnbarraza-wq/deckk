"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareDeckButton } from "@/components/deck/share-deck-button";

interface DeckOwnerToolbarProps {
  shareUrl: string;
  title?: string;
}

export function DeckOwnerToolbar({ shareUrl, title }: DeckOwnerToolbarProps) {
  return (
    <div className="-mx-5 mb-8 flex items-center justify-between gap-3 border-b border-line px-5 pb-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <ShareDeckButton shareUrl={shareUrl} title={title} />
    </div>
  );
}
