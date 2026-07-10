import Image from "next/image";
import { cn } from "@/lib/utils";

interface DeckHeroHeaderProps {
  displayName: string;
  handle: string;
  bio?: string | null;
  avatarUrl?: string | null;
  headerUrl?: string | null;
  compact?: boolean;
  className?: string;
}

export function DeckHeroHeader({
  displayName,
  handle,
  bio,
  avatarUrl,
  headerUrl,
  compact = false,
  className,
}: DeckHeroHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden",
        compact
          ? "aspect-[16/11] rounded-[0.75rem]"
          : "-mx-5 mb-10 aspect-[4/3] min-h-[280px] rounded-none sm:aspect-[21/9] sm:min-h-[320px]",
        className
      )}
    >
      {headerUrl ? (
        <Image
          src={headerUrl}
          alt=""
          fill
          className="object-cover grayscale contrast-[1.12] brightness-[0.78]"
          unoptimized
          priority={!compact}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0c0b0a]" aria-hidden />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/88" />
      <div className="deck-hero-noise absolute inset-0" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white/[0.14] to-transparent mix-blend-screen opacity-50"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex h-full flex-col items-center justify-center text-center",
          compact ? "px-3 py-4" : "px-6 py-10"
        )}
      >
        {avatarUrl ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/25",
              compact ? "mb-2 size-10" : "mb-5 size-20"
            )}
          >
            <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div
            className={cn(
              "shrink-0 rounded-full bg-white/10 ring-2 ring-white/20",
              compact ? "mb-2 size-10" : "mb-5 size-20"
            )}
            aria-hidden
          />
        )}

        <div
          className={cn(
            "deck-ripple-name relative inline-block font-display leading-[0.95] tracking-tight text-white",
            compact ? "text-xl" : "text-[2.75rem] sm:text-[3.5rem]"
          )}
        >
          <span className="deck-ripple-name__echo" aria-hidden>
            {displayName}
          </span>
          <span className="deck-ripple-name__echo deck-ripple-name__echo--delay" aria-hidden>
            {displayName}
          </span>
          <h1 className="deck-ripple-name__text relative z-[2]">{displayName}</h1>
        </div>

        {bio && (
          <p
            className={cn(
              "mx-auto max-w-sm leading-relaxed text-white/30",
              compact ? "mt-1.5 line-clamp-2 text-[8px]" : "mt-4 text-sm sm:text-base"
            )}
          >
            {bio}
          </p>
        )}

        {!compact && (
          <p className="mt-3 text-xs font-medium tracking-wide text-white/20">
            deckk.me/{handle}
          </p>
        )}
      </div>
    </header>
  );
}
