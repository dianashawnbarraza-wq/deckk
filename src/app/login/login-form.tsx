"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function getSupabaseClient() {
  try {
    return createClient();
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Could not connect to auth.");
  }
}

type Mode = "password" | "magic";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/auth/continue";
  const urlError = searchParams.get("error");
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(urlError ?? "");

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("invalid") || msg.includes("credentials")) {
          setError("Email or password doesn’t match. Try again, or use a magic link.");
        } else if (msg.includes("email not confirmed")) {
          setError("Confirm your email first — we sent a link when you signed up.");
        } else if (msg.includes("rate limit")) {
          setError("Too many attempts. Wait a minute and try again.");
        } else {
          setError(authError.message);
        }
        return;
      }
      router.replace(next.startsWith("/") ? next : "/auth/continue");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });
      if (otpError) {
        const message = otpError.message.toLowerCase();
        if (message.includes("signups not allowed") || message.includes("user not found")) {
          setError("No account with that email yet. Get started to create one.");
        } else if (message.includes("rate limit")) {
          setError(
            "Too many sign-in emails sent recently. Wait about an hour, or try password sign-in."
          );
        } else {
          setError(otpError.message);
        }
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Google sign-in could not start. Is Google enabled in Supabase?");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent a magic link. Tap it to sign in — check spam if nothing shows up in a few minutes."
      />
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to Studio with your password or a magic link.">
      <Button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="mb-4 w-full"
        disabled={googleLoading || loading}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>
      <div className="relative my-5 text-center text-sm text-muted-foreground">or</div>

      <div className="mb-5 flex rounded-full border border-deck-card-brd bg-deck-card p-1">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError("");
          }}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition",
            mode === "password" ? "bg-primary text-white" : "text-muted-foreground"
          )}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic");
            setError("");
          }}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition",
            mode === "magic" ? "bg-primary text-white" : "text-muted-foreground"
          )}
        >
          Magic link
        </button>
      </div>

      <form
        onSubmit={(e) => void (mode === "password" ? signInWithPassword(e) : signInWithMagicLink(e))}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {mode === "password" && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || googleLoading}>
          {loading
            ? mode === "password"
              ? "Signing in…"
              : "Sending…"
            : mode === "password"
              ? "Sign in"
              : "Email me a magic link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/get-started"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Get started
        </Link>
      </p>
    </AuthShell>
  );
}
