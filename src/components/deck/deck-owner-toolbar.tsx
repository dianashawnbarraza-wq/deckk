"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckOwnerToolbarProps {
  shareUrl: string;
  title?: string;
}

export function DeckOwnerToolbar({ shareUrl, title }: DeckOwnerToolbarProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    setCopied(false);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          url: shareUrl,
          title: title ?? "My deck",
        });
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your deck link:", shareUrl);
    }
  }

  return (
    <div className="-mx-5 mb-8 flex items-center justify-between gap-3 border-b border-line px-5 pb-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={share}
        className={cn(copied && "border-ink text-ink")}
        aria-label={copied ? "Link copied" : "Share deck link"}
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="size-4" />
            Share
          </>
        )}
      </Button>
    </div>
  );
}
