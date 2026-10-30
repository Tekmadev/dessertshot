import "server-only";
import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Spam throttle for the order API (brief §7.7), alongside the honeypot.
 *
 *   ip         5 requests an hour from one connection     } refuse the request
 *   ip_day     10 a day from one connection               }
 *   email      5 auto-replies a day to one inbox (plus-tags and Gmail dots
 *              count as one), so the form can't flood someone with them
 *   autoreply  auto-replies in total over 30 days (default 80, of the free
 *              plan's 200 EmailJS requests a month), so auto-replies can't
 *              use up the quota the owner's notifications need
 *
 * The last two only skip the auto-reply: the order is still saved and the
 * owner still emailed, so typing someone's address can't block their order.
 * Only salted hashes are stored, never raw IPs or emails, and rows older than
 * a day are deleted. The count-and-record happens in one database call
 * (take_order_rate_limit, migration 004). Until that migration runs, or if the
 * database is unreachable, a per-instance memory limiter stands in: weaker,
 * but it never blocks a real order because of our own outage.
 */
export type RateLimitBucket = "ip" | "ip_day" | "email" | "autoreply";

const DAY = 24 * 60;

/** Auto-replies allowed per 30 days; raise it with EMAILJS_AUTOREPLY_MONTHLY_LIMIT on a paid plan. */
function autoreplyMonthlyLimit(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.EMAILJS_AUTOREPLY_MONTHLY_LIMIT);
  return Number.isInteger(n) && n >= 0 ? n : 80;
}

export const RATE_LIMITS: Record<RateLimitBucket, { max: number; windowMinutes: number }> = {
  ip: { max: 5, windowMinutes: 60 },
  ip_day: { max: 10, windowMinutes: DAY },
  email: { max: 5, windowMinutes: DAY },
  autoreply: { max: autoreplyMonthlyLimit(), windowMinutes: 30 * DAY },
};

/** The visitor's IP as Vercel reports it (it overwrites client-sent values). */
export function clientIp(headers: Headers): string | null {
  const raw =
    headers.get("x-vercel-forwarded-for") ?? headers.get("x-real-ip") ?? headers.get("x-forwarded-for");
  const ip = raw?.split(",")[0]?.trim();
  return ip ? ip : null;
}

/**
 * The inbox an address reaches, for counting only (mail still goes to the
 * address as typed): "Jo.Doe+party@googlemail.com" → "jodoe@gmail.com".
 */
export function inboxKey(email: string): string {
  const [local = "", domain = ""] = email.trim().toLowerCase().split("@");
  const base = local.split("+")[0];
  const gmail = domain === "gmail.com" || domain === "googlemail.com";
  return gmail ? `${base.replace(/\./g, "")}@gmail.com` : `${base}@${domain}`;
}

export function hashKey(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}

export function rateLimitSecret(env: Record<string, string | undefined> = process.env): string {
  return env.RATE_LIMIT_SECRET || env.SUPABASE_SECRET_KEY || "dessertshot-local-dev";
}

// ── Fallback: in-memory, per server instance ──
const memory = new Map<string, number[]>();

export function takeMemoryRateLimit(bucket: RateLimitBucket, keyHash: string, now = Date.now()): boolean {
  const { max, windowMinutes } = RATE_LIMITS[bucket];
  const key = `${bucket}:${keyHash}`;
  const recent = (memory.get(key) ?? []).filter((t) => now - t < windowMinutes * 60_000);
  if (recent.length >= max) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);
  if (memory.size > 5000) memory.clear(); // never grow without bound
  return true;
}

/** True if the request may go ahead; records it either way it's allowed. */
export async function takeRateLimit(
  db: SupabaseClient | null,
  bucket: RateLimitBucket,
  keyHash: string
): Promise<boolean> {
  if (db) {
    const { max, windowMinutes } = RATE_LIMITS[bucket];
    const { data, error } = await db.rpc("take_order_rate_limit", {
      p_bucket: bucket,
      p_key_hash: keyHash,
      p_window_minutes: windowMinutes,
      p_max: max,
    });
    if (!error && typeof data === "boolean") return data;
    console.warn("[orders] rate limit check fell back to memory", { code: error?.code });
  }
  return takeMemoryRateLimit(bucket, keyHash);
}
