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

  const { data: profile } = await admin
    .from("profiles")
    .select("id, handle, is_published")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const baseHandle = devAuthHandle();
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: user.id,
      handle: baseHandle,
      display_name: "Demo",
      is_published: true,
    });
    if (profileError) {
      const fallbackHandle = `${baseHandle}-${user.id.slice(0, 8)}`;
      const { error: retryError } = await admin.from("profiles").insert({
        user_id: user.id,
        handle: fallbackHandle,
        display_name: "Demo",
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
  } else if (!profile.is_published) {
    await admin
      .from("profiles")
      .update({ is_published: true })
      .eq("id", profile.id);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback?next=/dashboard`,
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

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
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
