import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Service-role client — webhook route ONLY writer of orders. */
export function createAdminClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
