import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getDeckByHandle, getLiveCardsForDeck } from "@/lib/deck-query";
import { PublicDeckApp } from "@/components/deck/public-deck-app";
import type { PublicTab } from "@/types/cards";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string; preview?: string; embed?: string }>;
}

const TABS: PublicTab[] = ["home", "events", "shop", "adult", "listen", "writing"];

function normalizeTab(value: string | undefined): PublicTab {
  if (value && (TABS as string[]).includes(value)) return value as PublicTab;
  return "home";
}

export default async function PublicDeckPage({ params, searchParams }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = rawHandle.replace(/^@/, "").toLowerCase();
  const { tab: tabParam, preview, embed: embedParam } = await searchParams;
  const tab = normalizeTab(tabParam);
  const previewMode = preview === "1" || preview === "true";
  const embed = embedParam === "1" || embedParam === "true";

  const admin = createAdminClient();

  const { data: redirectRow } = await admin
    .from("deck_handle_redirects")
    .select("deck_id")
    .eq("old_handle", handle)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (redirectRow) {
    const { data: target } = await admin
      .from("decks")
      .select("handle")
      .eq("id", redirectRow.deck_id)
      .single();
    if (target) redirect(`/${target.handle}`);
  }

  const deck = await getDeckByHandle(admin, handle);
  if (!deck || !deck.is_published) notFound();

  const cards = await getLiveCardsForDeck(admin, deck.id);

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  const isOwner = Boolean(user && user.id === deck.user_id);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "deckkme.vercel.app";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${proto}://${host}/${deck.handle}`;

  return (
    <PublicDeckApp
      deck={deck}
      cards={cards}
      tab={tab}
      isOwner={isOwner}
      previewMode={previewMode && isOwner}
      shareUrl={shareUrl}
      embed={embed}
    />
  );
}
