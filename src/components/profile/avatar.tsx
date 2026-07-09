import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt = "",
  size = "lg",
  className,
}: {
  src?: string | null;
  alt?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass = {
    md: "size-16",
    lg: "size-24",
    xl: "size-32",
  }[size];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-[1rem] object-cover ring-1 ring-line",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "rounded-[1rem] bg-paper-sunken ring-1 ring-line",
        sizeClass,
        className
      )}
    />
  );
}
