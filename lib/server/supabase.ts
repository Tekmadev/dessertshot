import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients for the order API. Never imported by the browser.
 *
 * `serviceClient()` uses SUPABASE_SECRET_KEY, which bypasses row level
 * security. Once migration 004 runs it is the only key that can write orders.
 * It is a plain supabase-js client on purpose: the cookie-based @supabase/ssr
 * client would swap a signed-in visitor's session in for the key and bring
 * RLS back.
 *
 * `publicClient()` is the publishable key with no session. It is only a
 * stopgap until the secret key is set: it can insert (never read back) while
 * the public insert policy from 001 still exists.
 */
const NO_SESSION = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  // A slow database must not use up the request before the emails go out:
  // every query and insert gives up after this long (fails like any error).
  db: { timeout: 4000 },
};

export function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? createClient(url, key, NO_SESSION) : null;
}

export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key, NO_SESSION) : null;
}
