import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">deckk.me</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Your whole deck, dealt in one link.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage one link, promote everything, get paid — 0% platform fees.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/login" className={buttonVariants()}>
          Get started
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Sign in
        </Link>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/calendar" className="text-muted-foreground underline-offset-4 hover:underline">
          Community calendar
        </Link>
        <Link href="/discover" className="text-muted-foreground underline-offset-4 hover:underline">
          Discover creators
        </Link>
      </div>
    </main>
  );
}
