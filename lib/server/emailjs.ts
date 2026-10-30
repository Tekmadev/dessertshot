import "server-only";
import { businessEmailParams, customerEmailParams } from "@/lib/order-email";
import type { OrderSummary } from "@/lib/order-summary";

/**
 * Order emails through the EmailJS REST API, sent from the server so they go
 * out only for orders that passed validation (previously the browser sent the
 * owner's notification itself, whatever the server said).
 *
 * Needs, in the EmailJS dashboard: Account > Security > "Allow EmailJS API for
 * non-browser applications", and the private-key option with
 * EMAILJS_PRIVATE_KEY set (never NEXT_PUBLIC_). Setup: docs/order-setup.md.
 */
const ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

// EmailJS accepts one request per second, so this request's emails go out in
// turn, and a retry waits a little longer in case another order's email took
// the slot.
const MIN_GAP_MS = 1100;
const RETRY_GAP_MS = 1500;
const TIMEOUT_MS = 6000;

export type EmailConfig = {
  serviceId: string;
  publicKey: string;
  privateKey: string | null;
  businessTemplateId: string;
  customerTemplateId: string | null;
};

/** Null when the owner's notification can't be sent (nothing configured). */
export function emailConfig(env: Record<string, string | undefined> = process.env): EmailConfig | null {
  // The NEXT_PUBLIC_ names are what the site used when it sent from the
  // browser; they still work here so the existing Vercel settings carry over.
  const serviceId = env.EMAILJS_SERVICE_ID || env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const publicKey = env.EMAILJS_PUBLIC_KEY || env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const businessTemplateId = env.EMAILJS_TEMPLATE_ID || env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  if (!serviceId || !publicKey || !businessTemplateId) return null;
  return {
    serviceId,
    publicKey,
    businessTemplateId,
    privateKey: env.EMAILJS_PRIVATE_KEY || null,
    customerTemplateId: env.EMAILJS_CUSTOMER_TEMPLATE_ID || null,
  };
}

type SendResult = { ok: boolean; retryable: boolean };

type Deps = {
  fetchImpl?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
  now?: () => number;
};

/**
 * One request's order emails. Always send the owner's first; send the
 * customer's only once the order has reached the owner (saved or emailed).
 */
export function createOrderMailer(config: EmailConfig | null = emailConfig(), deps: Deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const wait = deps.wait ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const now = deps.now ?? Date.now;
  let lastRequestAt: number | null = null;

  async function send(templateId: string, params: Record<string, string>, label: string, gap: number): Promise<SendResult> {
    if (lastRequestAt !== null) {
      const remaining = gap - (now() - lastRequestAt);
      if (remaining > 0) await wait(remaining);
    }
    lastRequestAt = now();
    try {
      const res = await fetchImpl(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: config!.serviceId,
          template_id: templateId,
          user_id: config!.publicKey,
          ...(config!.privateKey ? { accessToken: config!.privateKey } : {}),
          template_params: params,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return { ok: true, retryable: false };
      // Error bodies are short messages (text or JSON); they never echo the key.
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      console.error(`[orders] EmailJS ${label} email failed`, { status: res.status, detail });
      // 429 and 5xx can pass; 4xx means configuration, which a retry won't fix.
      return { ok: false, retryable: res.status === 429 || res.status >= 500 };
    } catch (err) {
      console.error(`[orders] EmailJS ${label} email error`, { error: String(err) });
      return { ok: false, retryable: true };
    }
  }

  return {
    /** The owner's notification, with one retry. */
    async business(summary: OrderSummary): Promise<boolean> {
      if (!config) {
        console.error("[orders] EmailJS is not configured; no order emails sent");
        return false;
      }
      if (!config.privateKey) console.warn("[orders] EMAILJS_PRIVATE_KEY is not set");
      const params = businessEmailParams(summary);
      const first = await send(config.businessTemplateId, params, "business", MIN_GAP_MS);
      if (first.ok || !first.retryable) return first.ok;
      return (await send(config.businessTemplateId, params, "business (retry)", RETRY_GAP_MS)).ok;
    },

    /** The customer's auto-reply (no retry: the thanks page covers a miss). */
    async customer(summary: OrderSummary): Promise<boolean> {
      if (!config) return false;
      if (!config.customerTemplateId) {
        console.warn("[orders] EMAILJS_CUSTOMER_TEMPLATE_ID is not set; no auto-reply sent");
        return false;
      }
      return (await send(config.customerTemplateId, customerEmailParams(summary), "customer", MIN_GAP_MS)).ok;
    },
  };
}
