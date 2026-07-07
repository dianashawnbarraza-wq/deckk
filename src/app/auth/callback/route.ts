import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(
      new URL("/login?error=Server+auth+configuration+error", request.url)
    );
  }

  if (authError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(authError)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing+auth+code", request.url)
    );
  }

  const redirectUrl = new URL(safeNext, request.url);
  const response = NextResponse.redirect(redirectUrl);

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return response;
}
