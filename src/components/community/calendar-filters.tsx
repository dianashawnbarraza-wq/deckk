"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalendarFiltersProps {
  cities: string[];
  initial: {
    city?: string;
    online?: string;
    from?: string;
    to?: string;
  };
}

export function CalendarFilters({ cities, initial }: CalendarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(initial.city ?? "");
  const [online, setOnline] = useState(initial.online ?? "");
  const [from, setFrom] = useState(initial.from ?? "");
  const [to, setTo] = useState(initial.to ?? "");

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city);
    else params.delete("city");
    if (online) params.set("online", online);
    else params.delete("online");
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    const q = params.toString();
    router.push(q ? `/calendar?${q}` : "/calendar");
  }

  function clear() {
    setCity("");
    setOnline("");
    setFrom("");
    setTo("");
    router.push("/calendar");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="filter-city">City</Label>
        <Input
          id="filter-city"
          list="city-options"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Any city"
        />
        <datalist id="city-options">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div>
        <Label htmlFor="filter-online">Type</Label>
        <select
          id="filter-online"
          value={online}
          onChange={(e) => setOnline(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">All events</option>
          <option value="false">In person</option>
          <option value="true">Online</option>
        </select>
      </div>
      <div>
        <Label htmlFor="filter-from">From</Label>
        <Input
          id="filter-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="filter-to">To</Label>
        <Input
          id="filter-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="outline" onClick={clear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
