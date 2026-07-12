import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDeckByUserId } from "@/lib/deck-query";
import { StudioApp } from "@/components/studio/studio-app";

export default async function StudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/studio");

  const deck = await getDeckByUserId(supabase, user.id);
  if (!deck) redirect("/signup");

  return <StudioApp deck={deck} />;
}
