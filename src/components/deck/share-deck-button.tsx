"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareDeckButtonProps {
  shareUrl: string;
  title?: string;
  size?: "default" | "sm";
  variant?: "default" | "outline" | "ghost";
}

export function ShareDeckButton({
  shareUrl,
  title,
  size = "sm",
  variant = "outline",
}: ShareDeckButtonProps) {
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
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={share}
      className={cn(copied && "border-ink text-ink")}
      aria-label={copied ? "Link copied" : "Share deck"}
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
  );
}
