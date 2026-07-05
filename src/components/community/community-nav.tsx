import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommunityNavProps {
  active: "calendar" | "discover";
}

export function CommunityNav({ active }: CommunityNavProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          deckk.me
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
