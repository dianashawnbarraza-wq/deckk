import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { devAuthEnabled } from "@/lib/dev-auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const skipLogin = devAuthEnabled();

  return (
    <main className="mx-auto flex min-h-screen max-w-hub flex-col justify-center px-5 py-16">
      <Wordmark className="text-[3.5rem] sm:text-[4.5rem]" />
      <h1 className="mt-6 font-display text-[2.5rem] leading-[1.02] tracking-tight text-ink sm:text-[3rem]">
        your whole deck, dealt in one link
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        A living micro site for makers — events, shop, and links with hierarchy that helps visitors find what matters now.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        {skipLogin ? (
          <Link href="/dev/enter" className={buttonVariants({ size: "lg" })}>
            Enter app
          </Link>
        ) : (
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        )}
        {!skipLogin && (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign in
          </Link>
        )}
      </div>
      <div className="mt-14 flex flex-wrap gap-6 text-base">
        <Link
          href="/calendar"
          className="text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
        >
          Community calendar
        </Link>
        <Link
          href="/discover"
          className="text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
        >
          Discover creators
        </Link>
      </div>
    </main>
  );
}
