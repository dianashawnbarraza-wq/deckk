"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyToastProvider } from "@/components/shell/deck-copy-toast";
import {
  deckAppearance,
  nextAppearance,
  type Appearance,
} from "@/lib/appearance";

export { deckAppearance, type Appearance };

const STORAGE_KEY = "deckk-theme";

type ThemeContextValue = {
  appearance: Appearance;
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

function ThemeGlyph({ appearance }: { appearance: Appearance }) {
  if (appearance === "dark") return <Sun className="size-4" strokeWidth={2} />;
  if (appearance === "lilac") return <Sparkles className="size-4" strokeWidth={2} />;
  return <Moon className="size-4" fill="currentColor" />;
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { appearance, toggleTheme } = usePhoneTheme();
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

interface PhoneShellProps {
  children: ReactNode;
  className?: string;
  /** Fill the viewport — used for landing gallery iframes. */
  embed?: boolean;
  /**
   * `phone` — device chrome (Studio preview / narrow phones).
   * `responsive` — full-page public layout on desktop, phone chrome on small screens.
   */
  layout?: "phone" | "responsive";
  /**
   * Creator-chosen appearance for the public deck / Studio preview.
   * When set (without visitor persistence), visitors cannot override it.
   */
  appearance?: Appearance;
  /** Studio: persist appearance when the creator toggles. */
  onAppearanceChange?: (next: Appearance) => void;
}

function parseStoredAppearance(raw: string | null): Appearance | null {
  if (raw === "dark" || raw === "light" || raw === "lilac") return raw;
  return null;
}

export function PhoneShell({
  children,
  className,
  embed = false,
  layout = "phone",
  appearance: appearanceProp,
  onAppearanceChange,
}: PhoneShellProps) {
  const controlled = appearanceProp !== undefined;
  const [localAppearance, setLocalAppearance] = useState<Appearance>("dark");
  const [ready, setReady] = useState(false);
  const cosmicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlled) {
      setReady(true);
      return;
    }
    try {
      const stored = parseStoredAppearance(localStorage.getItem(STORAGE_KEY));
      if (stored) setLocalAppearance(stored);
      else {
        setLocalAppearance("dark");
        localStorage.setItem(STORAGE_KEY, "dark");
      }
    } catch {
      setLocalAppearance("dark");
    }
    setReady(true);
  }, [controlled]);

  useEffect(() => {
    if (layout !== "responsive") return;

    let frame = 0;
    function syncCosmic(scrollTop: number, maxScroll: number) {
      const el = cosmicRef.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, scrollTop / Math.max(1, maxScroll)));
      el.style.setProperty("--deck-scroll", String(p));
      el.style.setProperty("--deck-scroll-y", `${scrollTop}px`);
    }

    function onWindowScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        syncCosmic(window.scrollY, max);
      });
    }

    function onDeckScroll(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = target.scrollHeight - target.clientHeight;
        syncCosmic(target.scrollTop, max);
      });
    }

    onWindowScroll();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    const deck = document.querySelector("[data-deck-scroll]");
    deck?.addEventListener("scroll", onDeckScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onWindowScroll);
      deck?.removeEventListener("scroll", onDeckScroll);
    };
  }, [layout]);

  const appearance = controlled ? appearanceProp! : localAppearance;
  const dark = appearance === "dark";

  const toggleTheme = useCallback(() => {
    const next = nextAppearance(appearance);
    if (onAppearanceChange) {
      onAppearanceChange(next);
      return;
    }
    if (controlled) return;
    setLocalAppearance(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, [appearance, controlled, onAppearanceChange]);

  if (embed) {
    const embedAppearance = controlled ? appearanceProp! : "dark";
    const embedDark = embedAppearance === "dark";
    return (
      <ThemeContext.Provider
        value={{ appearance: embedAppearance, dark: embedDark, toggleTheme, ready: true }}
      >
        <div
          data-theme={embedAppearance}
          className={cn(
            "relative h-full min-h-0 w-full overflow-hidden bg-page text-foreground",
            // Full-viewport embeds (e.g. /handle?embed=1) still fill the screen.
            !className && "h-dvh",
            embedDark && "dark",
            className
          )}
        >
          {embedDark && <div className="deckk-purple-glow" aria-hidden />}
          <div className="relative z-[1] h-full">
            <CopyToastProvider>{children}</CopyToastProvider>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ appearance, dark, toggleTheme, ready }}>
      <div
        data-theme={appearance}
        className={cn(
          "flex min-h-dvh justify-center overflow-x-hidden transition-colors duration-500",
          layout === "responsive"
            ? "items-stretch bg-page p-0"
            : "items-center bg-backdrop p-3.5 sm:p-5",
          dark && "dark",
          className
        )}
      >
        <div
          data-phone-frame={layout === "phone" ? "" : undefined}
          className={cn(
            "relative w-full overflow-x-hidden bg-page text-foreground transition-colors duration-500",
            layout === "responsive"
              ? "min-h-dvh w-full max-w-none border-0 shadow-none overflow-y-visible"
              : "h-[868px] max-h-[calc(100dvh-30px)] max-w-phone overflow-hidden rounded-[36px] border border-phone-brd shadow-[0_50px_90px_-40px_var(--deck-shadow),0_10px_30px_-20px_var(--deck-shadow)]"
          )}
        >
          {dark && <div className="deckk-purple-glow" aria-hidden />}
          {layout === "responsive" || appearance === "lilac" ? (
            <div
              ref={cosmicRef}
              className={cn(
                "deckk-cosmic pointer-events-none absolute inset-0 z-0 overflow-hidden",
                appearance === "lilac" && "deckk-lilac-grain"
              )}
              aria-hidden
            >
              <div className="deckk-cosmic-nebula deckk-cosmic-nebula-a" />
              <div className="deckk-cosmic-nebula deckk-cosmic-nebula-b" />
              <div className="deckk-cosmic-nebula deckk-cosmic-nebula-c" />
              <div className="deckk-cosmic-stars" />
            </div>
          ) : null}
          <div className="relative z-[1] h-full">
            <CopyToastProvider>{children}</CopyToastProvider>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
