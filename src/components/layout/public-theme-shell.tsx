"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  nextAppearance,
  type Appearance,
} from "@/lib/appearance";

const STORAGE_KEY = "deckk-theme";

type ThemeContextValue = {
  appearance: Appearance;
  dark: boolean;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function usePublicTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("usePublicTheme must be used inside PublicThemeShell");
  }
  return ctx;
}

function ThemeGlyph({ appearance }: { appearance: Appearance }) {
  if (appearance === "dark") return <Sun className="size-4" strokeWidth={2} />;
  if (appearance === "lilac") return <Sparkles className="size-4" strokeWidth={2} />;
  return <Moon className="size-4" fill="currentColor" />;
}

export function PublicThemeToggle({ className }: { className?: string }) {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  const { appearance, toggleTheme } = ctx;
  const label =
    appearance === "dark"
      ? "Switch to light mode"
      : appearance === "light"
        ? "Switch to lilac mode"
        : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground backdrop-blur-md transition-colors",
        className
      )}
    >
      <ThemeGlyph appearance={appearance} />
    </button>
  );
}

/**
 * Theme shell for public event pages (matches PhoneShell tokens).
 * Defaults to dark; respects localStorage and optional host deck appearance.
 */
export function PublicThemeShell({
  children,
  initialAppearance = "dark",
  className,
}: {
  children: ReactNode;
  initialAppearance?: Appearance;
  className?: string;
}) {
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light" || stored === "lilac") {
        setAppearance(stored);
      } else {
        setAppearance(initialAppearance);
        localStorage.setItem(STORAGE_KEY, initialAppearance);
      }
    } catch {
      setAppearance(initialAppearance);
    }
    setReady(true);
  }, [initialAppearance]);

  const toggleTheme = useCallback(() => {
    setAppearance((prev) => {
      const next = nextAppearance(prev);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const dark = appearance === "dark";

  return (
    <ThemeContext.Provider value={{ appearance, dark, toggleTheme, ready }}>
      <div
        data-theme={appearance}
        className={cn(
          "relative min-h-dvh overflow-x-hidden bg-page text-foreground transition-colors duration-500",
          dark && "dark",
          className
        )}
      >
        {dark && <div className="deckk-purple-glow" aria-hidden />}
        {appearance === "lilac" ? (
          <div
            className="deckk-cosmic deckk-lilac-grain pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            <div className="deckk-cosmic-nebula deckk-cosmic-nebula-a" />
            <div className="deckk-cosmic-nebula deckk-cosmic-nebula-b" />
            <div className="deckk-cosmic-nebula deckk-cosmic-nebula-c" />
            <div className="deckk-cosmic-stars" />
          </div>
        ) : null}
        <div className="relative z-[1]">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
