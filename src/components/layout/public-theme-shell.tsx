"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appearance } from "@/lib/appearance";

const STORAGE_KEY = "deckk-theme";

type ThemeContextValue = {
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

export function PublicThemeToggle({ className }: { className?: string }) {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  const { dark, toggleTheme } = ctx;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-deck-card-brd bg-deck-card text-foreground backdrop-blur-md transition-colors",
        className
      )}
    >
      {dark ? (
        <Sun className="size-4" strokeWidth={2} />
      ) : (
        <Moon className="size-4" fill="currentColor" />
      )}
    </button>
  );
}

/**
 * Dark-capable shell for public event pages (matches PhoneShell tokens).
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
  const [dark, setDark] = useState(initialAppearance === "dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark") setDark(true);
      else if (stored === "light") setDark(false);
      else {
        setDark(initialAppearance === "dark");
        localStorage.setItem(STORAGE_KEY, initialAppearance);
      }
    } catch {
      setDark(initialAppearance === "dark");
    }
    setReady(true);
  }, [initialAppearance]);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, ready }}>
      <div
        data-theme={dark ? "dark" : "light"}
        className={cn(
          "min-h-dvh bg-page text-foreground transition-colors duration-500",
          dark && "dark",
          className
        )}
      >
        {dark && <div className="deckk-purple-glow" aria-hidden />}
        <div className="relative z-[1]">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
