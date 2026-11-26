"use client";

import { notFound } from "next/navigation";
import { PublicDeckApp } from "@/components/deck/public-deck-app";
import {
  DEMO_DECK_FIXTURES,
  getDemoFixture,
} from "@/components/landing/demo-deck-fixtures";
import { use } from "react";

const VALID = new Set(DEMO_DECK_FIXTURES.map((d) => d.id));

export default function DemoDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!VALID.has(id)) notFound();

  const fixture = getDemoFixture(id);

  return (
    <PublicDeckApp
      deck={fixture.deck}
      cards={fixture.cards}
      tab="home"
      isOwner={false}
      previewMode
      shareUrl={`https://deckk.me/${fixture.deck.handle}`}
      syncUrl={false}
    />
  );
}
