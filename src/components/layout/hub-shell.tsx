import { cn } from "@/lib/utils";
import { accentStyle, type AccentPreset } from "@/lib/theme";

export function HubShell({
  children,
  accent = "poppy",
  className,
}: {
  children: React.ReactNode;
  accent?: AccentPreset;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-screen bg-paper text-ink", className)}
      style={accentStyle(accent)}
    >
      <div className="mx-auto w-full max-w-hub px-5 py-10 sm:px-6">{children}</div>
    </div>
  );
}
