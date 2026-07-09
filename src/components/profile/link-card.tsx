import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LinkCardProps = {
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string | null;
  eyebrow?: string;
  variant?: "row" | "featured" | "tile";
  external?: boolean;
  className?: string;
};

export function LinkCard({
  title,
  subtitle,
  href,
  imageUrl,
  eyebrow,
  variant = "row",
  external = true,
  className,
}: LinkCardProps) {
  const inner = (
    <>
      {variant === "featured" && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.625rem] bg-paper-sunken">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      )}
      {variant === "tile" && (
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-[0.625rem] bg-paper-sunken">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      )}
      <div className={cn("flex items-start justify-between gap-3", variant !== "row" && "pt-3")}>
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-accent-strong">
              {eyebrow}
            </p>
          )}
          <p className="font-display text-xl leading-[1.1] text-ink">{title}</p>
          {subtitle && (
            <p className="mt-1 text-base leading-snug text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {variant === "row" && (
          <ArrowUpRight
            className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        )}
      </div>
    </>
  );

  const baseClass = cn(
    "group block rounded-[1rem] border border-line bg-paper transition-[transform,box-shadow] duration-200 ease-out",
    variant === "row" && "px-5 py-4 hover:-translate-y-0.5 active:scale-[0.99]",
    variant === "featured" && "p-3 hover:-translate-y-0.5",
    variant === "tile" && "p-3 hover:scale-[1.02] active:scale-[0.98]",
    className
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      {inner}
    </Link>
  );
}
