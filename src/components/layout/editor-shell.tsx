import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeckLogo } from "@/components/brand/deck-logo";
import { cn } from "@/lib/utils";

export function EditorShell({
  children,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  contentBackHref,
  contentBackLabel = "Back",
  hideTitle = false,
  wide = false,
  headerActions,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  contentBackHref?: string;
  contentBackLabel?: string;
  hideTitle?: boolean;
  wide?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-paper", className)}>
      <header className="border-b border-line">
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-4 px-5 py-4",
            wide ? "max-w-6xl" : "max-w-editor"
          )}
        >
          <Link href="/dashboard" className="inline-flex items-center" aria-label="deckk home">
            <DeckLogo size={34} />
          </Link>
          <div className="flex items-center gap-3">
            {headerActions}
            {backHref && (
              <Link
                href={backHref}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
              >
                {backLabel}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto px-5 py-8",
          wide ? "max-w-6xl" : "max-w-editor"
        )}
      >
        {!hideTitle && title && (
          <>
            {contentBackHref && (
              <Link
                href={contentBackHref}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
              >
                <ArrowLeft className="size-4" />
                {contentBackLabel}
              </Link>
            )}
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
