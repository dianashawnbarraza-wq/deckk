export function CommunityBadge({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "rounded-[12px] border border-deck-card-brd/80 bg-deck-card/60 px-3.5 py-3 text-[12px] leading-snug text-dim backdrop-blur-md"
      }
    >
      <p className="font-medium text-foreground/90">
        Deckk is LGBTQ+ owned and proudly rooted in the Los Angeles community.
      </p>
      <p className="mt-1">Built on empathy, not big tech.</p>
    </div>
  );
}
