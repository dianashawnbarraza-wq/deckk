"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DiscoverSearch({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/discover?q=${encodeURIComponent(q)}` : "/discover");
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="discover-search" className="sr-only">
          Search creators
        </Label>
        <Input
          id="discover-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, handle, or bio…"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
