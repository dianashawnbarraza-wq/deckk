import Link from "next/link";
import { cn } from "@/lib/utils";

export function JoinBetaButton({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <Link
      href="/join"
      className={cn(
        "landing-cta inline-flex items-center justify-center rounded-[var(--landing-radius-pill)] bg-[var(--landing-black)] font-semibold text-[var(--landing-white)]",
        size === "lg"
          ? "h-12 px-7 text-[15px]"
          : "h-11 px-6 text-[14px]",
        className
      )}
    >
      Join the beta
    </Link>
  );
}
