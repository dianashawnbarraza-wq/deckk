"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";

function getSupabaseClient() {
  try {
    return createClient();
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Could not connect to auth.");
  }
}

export default function GetStartedForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (password.length < 8) {
      setError("Password needs at least 8 characters.");
      setLoading(false);
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/continue")}`,
        },
      });
      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          setError("That email already has an account. Sign in instead — or use a magic link.");
        } else if (msg.includes("password")) {
          setError(signUpError.message);
        } else if (msg.includes("rate limit")) {
          setError("Too many attempts. Wait a minute and try again.");
        } else {
          setError(signUpError.message);
        }
        return;
      }
      // Supabase returns a user with empty identities when email is taken + confirmations on
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setError("That email already has an account. Sign in instead — or use a magic link.");
        return;
      }
      if (data.session) {
        router.replace("/auth/continue");
        router.refresh();
        return;
      }
      setNeedsConfirm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/continue")}`,
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

  if (needsConfirm) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="Confirm your address to finish signing up — then you’ll claim your handle and land in Studio."
      >
        <p className="text-sm text-muted-foreground">
          Sent to <span className="font-medium text-ink">{email.trim()}</span>. Check spam if it
          takes a minute.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Get started"
      subtitle="Create your Deckk. Email and password now — magic link anytime you come back."
    >
      <Button
        type="button"
        onClick={() => void signUpWithGoogle()}
        className="mb-4 w-full"
        disabled={googleLoading || loading}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>
      <div className="relative my-5 text-center text-sm text-muted-foreground">or</div>
      <form onSubmit={(e) => void signUp(e)} className="space-y-5">
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || googleLoading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a Deckk?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
