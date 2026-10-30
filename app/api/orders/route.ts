import { randomUUID } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { orderSchema } from "@/lib/order-schema";
import { buildOrderSummary } from "@/lib/order-summary";
import type { OrderApiFailure, OrderApiSuccess } from "@/lib/order-api";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createOrderMailer } from "@/lib/server/emailjs";
import { clientIp, hashKey, inboxKey, rateLimitSecret, takeRateLimit } from "@/lib/server/rate-limit";
import { saveOrder } from "@/lib/server/save-order";
import { publicClient, serviceClient } from "@/lib/server/supabase";

// Spam checks, a database write (4 s timeouts) and up to three emails a
// second or more apart, each with a 6 s timeout. Well inside Hobby's limit.
export const maxDuration = 60;

/**
 * `next dev` shares the live database and inbox (there is only one), so local
 * test orders are validated and summarised but never saved or emailed unless
 * ORDER_LIVE=1. ORDER_DRY_RUN=1 does the same on any deployment.
 */
function isDryRun(): boolean {
  if (process.env.ORDER_DRY_RUN === "1") return true;
  return process.env.NODE_ENV === "development" && process.env.ORDER_LIVE !== "1";
}

function fail(error: OrderApiFailure["error"], status: number, issues?: OrderApiFailure["issues"]) {
  return NextResponse.json<OrderApiFailure>({ ok: false, error, ...(issues ? { issues } : {}) }, { status });
}

/**
 * Only the site's own form may post here. A JSON content type means another
 * site's page would need a CORS preflight, which this route never grants; the
 * Origin and Sec-Fetch-Site checks catch the rest.
 */
function crossSiteRejection(request: NextRequest): NextResponse | null {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return fail("forbidden", 415);

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return fail("forbidden", 403);

  const origin = request.headers.get("origin");
  if (origin) {
    let host: string | null = null;
    try {
      host = new URL(origin).host;
    } catch {
      // A malformed Origin is treated as foreign.
    }
    // The Host header is the address the browser used (the domain on Vercel;
    // localhost, 127.0.0.1 or a LAN address when testing locally).
    const self = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
    if (host !== self) return fail("forbidden", 403);
  }
  return null;
}

/** The signed-in customer, if any, so the order shows in their account. */
async function signedInUserId(): Promise<string | null> {
  try {
    const supabase = await createSessionClient();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const lookup = supabase.auth.getUser().then(({ data }) => data.user?.id ?? null);
    return await Promise.race([lookup, timeout]);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rejected = crossSiteRejection(request);
    if (rejected) return rejected;

    const body: unknown = await request.json().catch(() => null);

    // Validate with the same schema as the form; never trust the client.
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "invalid",
        400,
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      );
    }
    const order = parsed.data;
    // The form's request id survives retries, so a retried order keeps its id.
    const id = order.requestId ?? randomUUID();
    const summary = buildOrderSummary(order, id, new Date());

    // Honeypot: people never see the "website" field; bots fill it in. Answer
    // exactly as if it worked, and do nothing.
    const website = (body as { website?: unknown }).website;
    if (typeof website === "string" && website.trim() !== "") {
      console.warn("[orders] honeypot filled; request dropped");
      return NextResponse.json<OrderApiSuccess>(
        { ok: true, reference: summary.reference, summary, confirmationEmailSent: true },
        { status: 201 }
      );
    }

    if (isDryRun()) {
      console.log("[orders] dry run: not saved, not emailed", { reference: summary.reference });
      return NextResponse.json<OrderApiSuccess>(
        { ok: true, reference: summary.reference, summary, confirmationEmailSent: false },
        { status: 201 }
      );
    }

    const db = serviceClient();
    const secret = rateLimitSecret();
    const ip = clientIp(request.headers);
    if (ip) {
      const allowed = await Promise.all([
        takeRateLimit(db, "ip", hashKey(ip, secret)),
        takeRateLimit(db, "ip_day", hashKey(ip, secret)),
      ]);
      if (allowed.includes(false)) {
        console.warn("[orders] rate limited (ip)");
        return fail("rate-limited", 429);
      }
    }

    const writer = db ?? publicClient();
    if (!db) console.warn("[orders] SUPABASE_SECRET_KEY is not set; writing with the publishable key");
    const saved = writer
      ? await saveOrder(writer, id, summary, {
          userId: await signedInUserId(),
          source: order.source ?? null,
        })
      : "failed";

    // Already saved by an earlier attempt of this same request: its emails
    // went out then (or the owner has the row), so don't send them twice.
    if (saved === "duplicate") {
      return NextResponse.json<OrderApiSuccess>(
        { ok: true, reference: summary.reference, summary, confirmationEmailSent: false },
        { status: 201 }
      );
    }

    const mailer = createOrderMailer();
    const ownerEmailed = await mailer.business(summary);

    // The order reached the owner if it was saved or she was emailed. If
    // neither, say so, and don't send the customer a confirmation.
    if (saved !== "saved" && !ownerEmailed) {
      console.error("[orders] order lost: not saved and owner not emailed", { reference: summary.reference });
      return fail("server", 500);
    }
    if (!ownerEmailed) {
      console.error("[orders] saved but the owner was not emailed; check the orders table", {
        reference: summary.reference,
      });
    }

    // The auto-reply has its own limits (per inbox, and in total per month).
    // Hitting them only skips the auto-reply, never the order.
    let confirmationEmailSent = false;
    const inboxAllowed = await takeRateLimit(db, "email", hashKey(inboxKey(order.email), secret));
    if (inboxAllowed && (await takeRateLimit(db, "autoreply", "all"))) {
      confirmationEmailSent = await mailer.customer(summary);
    } else {
      console.warn("[orders] auto-reply limit reached; auto-reply skipped", {
        reference: summary.reference,
        limit: inboxAllowed ? "monthly" : "inbox",
      });
    }

    console.log("[orders] request", {
      reference: summary.reference,
      saved,
      ownerEmailed,
      confirmationEmailSent,
    });

    if (writer) {
      after(async () => {
        const { error } = await writer.from("analytics_events").insert({
          session_id: "anonymous",
          event_type: "order_submitted",
          page_path: order.source?.split("?")[0] ?? "/order",
          element_id: "order-form",
          metadata: {
            order_id: id,
            cup_size: summary.cupSize,
            pack_qty: summary.packQty,
            tier: summary.tier,
            is_rush: summary.urgent,
            fulfillment: summary.fulfillment,
            event_type: summary.eventType,
            total_price: summary.estimatedTotal,
          },
          user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
        });
        if (error) console.error("[orders] analytics insert failed (non-fatal)", { code: error.code });
      });
    }

    return NextResponse.json<OrderApiSuccess>(
      { ok: true, reference: summary.reference, summary, confirmationEmailSent },
      { status: 201 }
    );
  } catch (err) {
    console.error("[orders] unhandled error", { error: String(err) });
    return fail("server", 500);
  }
}

// A signed-in customer's own orders. Explicit columns: owner-only fields
// such as admin_notes never leave the server.
const CUSTOMER_ORDER_COLUMNS =
  "id, created_at, status, package_size, cup_size, tier, is_rush, flavor_notes, desired_date, fulfillment_method, total_price, order_items(flavor_name, quantity, price_per_cup)";

export async function GET() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(CUSTOMER_ORDER_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
