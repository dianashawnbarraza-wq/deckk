import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deckExistsForUser } from "@/lib/deck-query";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const hasDeck = await deckExistsForUser(supabase, user.id);
  const dest = hasDeck ? "/studio" : "/signup";
  return NextResponse.redirect(new URL(dest, request.url));
}
