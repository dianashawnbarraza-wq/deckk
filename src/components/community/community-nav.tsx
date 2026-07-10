import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommunityNavProps {
  active: "calendar" | "discover";
}

export function CommunityNav({ active }: CommunityNavProps) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-editor items-center justify-between px-5 py-4">
        <Link href="/" className="inline-flex items-center" aria-label="deckk home">
          <DeckLogo size={34} />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/calendar"
            className={cn(
              buttonVariants({
                variant: active === "calendar" ? "default" : "ghost",
                size: "sm",
              })
            )}
          >
            Calendar
          </Link>
          <Link
            href="/discover"
            className={cn(
              buttonVariants({
                variant: active === "discover" ? "default" : "ghost",
                size: "sm",
              })
            )}
          >
            Discover
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
