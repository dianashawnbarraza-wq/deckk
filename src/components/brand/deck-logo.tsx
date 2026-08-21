import Image from "next/image";
import { cn } from "@/lib/utils";

interface DeckLogoProps {
  className?: string;
  /** Visual height in px. Width scales from the logo’s aspect ratio. */
  size?: number;
  animate?: boolean;
  priority?: boolean;
  /** Soft lilac stack for photo headers; default is brand purple. */
  soft?: boolean;
}

/** Wide mark: stack + “deckk” wordmark (1024×357), transparent background. */
const ASPECT = 1024 / 357;

/** Official Deckk logo. */
export function DeckLogo({
  className,
  size = 28,
  animate = false,
  priority = false,
  soft = false,
}: DeckLogoProps) {
  const height = size;
  const width = Math.round(size * ASPECT);
  return (
    <Image
      src={soft ? "/deckk-logo-soft.png" : "/deckk-logo.png"}
      alt="deckk"
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "shrink-0 object-contain object-left drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]",
        animate && "deck-logo-levitate",
        className
      )}
    />
  );
}
