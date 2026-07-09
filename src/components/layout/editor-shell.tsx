import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

export function EditorShell({
  children,
  title,
  backHref,
  backLabel = "Back",
  className,
}: {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-paper", className)}>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-editor items-center justify-between gap-4 px-5 py-4">
          <Link href="/dashboard">
            <Wordmark className="text-xl" />
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
        <h1 className="font-display text-[2rem] leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
