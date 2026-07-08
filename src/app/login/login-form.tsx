"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            "Too many sign-in emails sent recently. Supabase limits built-in email to about 2 per hour — wait an hour, or set up custom SMTP in Supabase (Resend) for higher limits."
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

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Sign in to deckk.me</h1>
      {sent ? (
        <p className="text-muted-foreground">
          Check your email for a magic link. If nothing arrives in a few minutes,
          check spam or confirm Supabase email settings.
        </p>
      ) : (
        <>
          <Button
            onClick={signInWithGoogle}
            className="mb-4 w-full"
            disabled={googleLoading || loading}
          >
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>
          <div className="relative my-4 text-center text-sm text-muted-foreground">
            or
          </div>
          <form onSubmit={signInWithMagicLink} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        </>
      )}
    </main>
  );
}
