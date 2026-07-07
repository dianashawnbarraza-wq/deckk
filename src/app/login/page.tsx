import { Suspense } from "react";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-sm px-4 py-16">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
