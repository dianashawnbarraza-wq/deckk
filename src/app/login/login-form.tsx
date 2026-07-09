"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";

function getSupabaseClient() {
  try {
    return createClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not connect to auth.";
    throw new Error(message);
  }
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(urlError ?? "");

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (otpError) {
        const message = otpError.message.toLowerCase();
        if (message.includes("rate limit")) {
          setError(
            "Too many sign-in emails sent recently. Wait about an hour, or set up custom SMTP in Supabase for higher limits."
          );
        } else {
          setError(otpError.message);
        }
        return;
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed.");
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
    <AuthShell title="Welcome back" subtitle="Sign in to manage your deck.">
      <Button
        onClick={signInWithGoogle}
        className="mb-4 w-full"
        disabled={googleLoading || loading}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>
      <div className="relative my-6 text-center text-sm text-muted-foreground">or</div>
      <form onSubmit={signInWithMagicLink} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={loading || googleLoading}
        >
          {loading ? "Sending…" : "Send magic link"}
        </Button>
      </form>
    </AuthShell>
  );
}
