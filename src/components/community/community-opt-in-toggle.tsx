"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CommunityOptInToggle({
  initialOptIn,
}: {
  initialOptIn: boolean;
}) {
  const router = useRouter();
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !optIn;
    setLoading(true);
    try {
      const res = await fetch("/api/profile/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityOptIn: next }),
      });
      if (res.ok) {
        setOptIn(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-medium">Community directory</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        When enabled, your published deck appears in the public creator directory
        at /discover.
      </p>
      <Button
        variant={optIn ? "outline" : "default"}
        size="sm"
        className="mt-3"
        onClick={toggle}
        disabled={loading}
      >
        {loading
          ? "Saving…"
          : optIn
            ? "Remove from directory"
            : "Join directory"}
      </Button>
    </div>
  );
}
