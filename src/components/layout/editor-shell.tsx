import Link from "next/link";
import { DeckLogo } from "@/components/brand/deck-logo";
import { cn } from "@/lib/utils";

export function EditorShell({
  children,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  hideTitle = false,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  hideTitle?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-paper", className)}>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-editor items-center justify-between gap-4 px-5 py-4">
          <Link href="/dashboard" className="inline-flex items-center" aria-label="deckk home">
            <DeckLogo size={34} />
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
            >
              {backLabel}
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-editor px-5 py-8">
        {!hideTitle && title && (
          <>
            <h1 className="font-display text-[2rem] leading-[1.05] tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
          </>
        )}
        {hideTitle && children}
      </main>
    </div>
  );
}
