import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-auth flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-10 inline-flex w-fit items-center" aria-label="deckk home">
        <DeckLogo size={40} />
      </Link>
      <h1 className="font-display text-[2.5rem] leading-[1.02] tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
      {children ? <div className="mt-8">{children}</div> : null}
    </main>
  );
}
