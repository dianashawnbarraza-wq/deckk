"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyToastContextValue = {
  showCopied: (message?: string) => void;
};

const CopyToastContext = createContext<CopyToastContextValue | null>(null);

export function useCopyToast() {
  const ctx = useContext(CopyToastContext);
  if (!ctx) {
    return {
      showCopied: async (message?: string) => {
        // Fallback when outside PhoneShell — still flash via alertless no-op message for callers
        void message;
      },
    };
  }
  return ctx;
}

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ok = window.prompt("Copy to clipboard", text);
      return ok != null;
    } catch {
      return false;
    }
  }
}

export function CopyToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showCopied = useCallback((msg = "Copied") => {
    setMessage(msg);
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 1800);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <CopyToastContext.Provider value={{ showCopied }}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-28 z-50 flex justify-center px-4 transition-all duration-300",
          message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        {message && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1b1813] px-4 py-2.5 text-[13px] font-semibold text-[#f3ecdf] shadow-xl">
            <Check className="size-3.5" strokeWidth={2.6} />
            {message}
          </div>
        )}
      </div>
    </CopyToastContext.Provider>
  );
}
