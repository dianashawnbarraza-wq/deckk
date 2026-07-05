/** Client-safe env — must use static process.env.* access for Next.js inlining. */
function requirePublic(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local and restart npm run dev.`
    );
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: requirePublic(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ),
  supabaseAnonKey: requirePublic(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
