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

const STORAGE_KEY = "deckk-theme";

type ThemeContextValue = {
  dark: boolean;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function usePhoneTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("usePhoneTheme must be used inside PhoneShell");
  }
  return ctx;
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { dark, toggleTheme } = usePhoneTheme();
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
      {dark ? <Sun className="size-4" strokeWidth={2} /> : <Moon className="size-4" fill="currentColor" />}
    </button>
  );
}

interface PhoneShellProps {
  children: ReactNode;
  className?: string;
}

export function PhoneShell({ children, className }: PhoneShellProps) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark") setDark(true);
      else if (stored === "light") setDark(false);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

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
          "flex min-h-dvh items-center justify-center bg-backdrop p-3.5 transition-colors duration-500 sm:p-5",
          dark && "dark",
          className
        )}
      >
        <div className="relative h-[868px] w-full max-w-phone max-h-[calc(100dvh-30px)] overflow-hidden rounded-[46px] border border-phone-brd bg-page text-foreground shadow-[0_50px_90px_-40px_var(--deck-shadow),0_10px_30px_-20px_var(--deck-shadow)] transition-colors duration-500">
          <div
            className="pointer-events-none absolute -left-10 -top-[60px] h-[260px] w-[260px] rounded-full opacity-50 blur-[30px]"
            style={{
              background: "radial-gradient(circle, var(--accent), transparent 70%)",
              animation: "deckk-float 14s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute -right-[70px] top-[220px] h-[240px] w-[240px] rounded-full opacity-40 blur-[34px]"
            style={{
              background: "radial-gradient(circle, #6a4c86, transparent 70%)",
              animation: "deckk-float 18s ease-in-out infinite reverse",
            }}
          />
          <div
            className="pointer-events-none absolute -left-[50px] bottom-10 h-[230px] w-[230px] rounded-full opacity-35 blur-[34px]"
            style={{
              background: "radial-gradient(circle, var(--accent-2), transparent 70%)",
              animation: "deckk-float 16s ease-in-out infinite",
            }}
          />
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
