import { Suspense } from "react";
import GetStartedForm from "./get-started-form";

export const dynamic = "force-dynamic";

export default function GetStartedPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-sm px-4 py-16">Loading…</main>}>
      <GetStartedForm />
    </Suspense>
  );
}
