import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}
