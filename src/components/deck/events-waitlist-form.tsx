"use client";

import { useState } from "react";

export function EventsWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(data.error ?? "Could not save your email");
        return;
      }
      setStatus("done");
      setMessage("Thanks — we'll be in touch.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-xl border border-deck-card-brd bg-page px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-primary"
        aria-label="Email"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
      >
        {status === "loading" ? "…" : "Notify me"}
      </button>
      {message ? (
        <p
          className={`text-[12px] sm:basis-full ${
            status === "error" ? "text-red-600" : "text-dim"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
