import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { devAuthEmail, devAuthEnabled, devAuthHandle } from "@/lib/dev-auth";

export async function GET(request: NextRequest) {
  if (!devAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(
      new URL("/login?error=Missing+Supabase+configuration", request.url)
    );
  }

  const email = devAuthEmail();
  const admin = createAdminClient();

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(listError.message)}`, request.url)
    );
  }

  let user = listed.users.find((u) => u.email === email);
  if (!user) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(createError?.message ?? "Could not create demo user")}`,
          request.url
        )
      );
    }
    user = created.user;
  }

  const targetHandle = devAuthHandle();

  const { data: deck } = await admin
    .from("decks")
    .select("id, handle, is_published")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!deck) {
    const { error: deckError } = await admin.from("decks").insert({
      user_id: user.id,
      handle: targetHandle,
      display_name: "Shawn",
      bio: "Welcome to my deck — events, shop, and links all in one place.",
      is_published: true,
    });
    if (deckError) {
      const fallbackHandle = `${targetHandle}-${user.id.slice(0, 8)}`;
      const { error: retryError } = await admin.from("decks").insert({
        user_id: user.id,
        handle: fallbackHandle,
        display_name: "Shawn",
        bio: "Welcome to my deck — events, shop, and links all in one place.",
        is_published: true,
      });
      if (retryError) {
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(retryError.message)}`,
            request.url
          )
        );
      }
    }
  } else {
    if (deck.handle !== targetHandle) {
      const { data: conflict } = await admin
        .from("decks")
        .select("id")
        .eq("handle", targetHandle)
        .neq("id", deck.id)
        .maybeSingle();

      if (!conflict) {
        await admin.from("deck_handle_redirects").upsert(
          {
            old_handle: deck.handle,
            deck_id: deck.id,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { onConflict: "old_handle" }
        );
        await admin
          .from("decks")
          .update({ handle: targetHandle, display_name: "Shawn" })
          .eq("id", deck.id);
      }
    }

    if (!deck.is_published) {
      await admin.from("decks").update({ is_published: true }).eq("id", deck.id);
    }
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback?next=/auth/continue`,
    },
  });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(linkError?.message ?? "Could not start demo session")}`,
        request.url
      )
    );
  }

  const response = NextResponse.redirect(new URL("/auth/continue", request.url));
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (verifyError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(verifyError.message)}`, request.url)
    );
  }

  return response;
}
