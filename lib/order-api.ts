/**
 * What POST /api/orders answers, shared by the route and the form, and how the
 * form hands the confirmed order to /order/thanks (sessionStorage: it is the
 * customer's own data in their own tab, never put in a URL).
 */
import type { OrderSummary } from "./order-summary";

export type OrderApiSuccess = {
  ok: true;
  reference: string;
  summary: OrderSummary;
  /** False when the customer's auto-reply could not be sent. */
  confirmationEmailSent: boolean;
};

export type OrderApiFailure = {
  ok: false;
  error: "invalid" | "rate-limited" | "forbidden" | "server";
  /** Field-level problems for "invalid", keyed by form field path. */
  issues?: { path: string; message: string }[];
};

export type OrderApiResponse = OrderApiSuccess | OrderApiFailure;

export const LAST_ORDER_STORAGE_KEY = "dessertshot:last-order";

/**
 * What the thanks page keeps: the summary minus what it never shows (phone,
 * notes, full name), with a timestamp so a stale entry is ignored.
 */
export type StoredOrder = Pick<OrderApiSuccess, "summary" | "confirmationEmailSent"> & { savedAt: number };

export const STORED_ORDER_MAX_AGE_MS = 60 * 60 * 1000;

export function toStoredOrder(res: OrderApiSuccess, savedAt: number): StoredOrder {
  return {
    summary: { ...res.summary, name: firstName(res.summary.name), phone: null, notes: null },
    confirmationEmailSent: res.confirmationEmailSent,
    savedAt,
  };
}

/** "Mary-Jane O'Brien" → "Mary-Jane" (at most 30 characters). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0].slice(0, 30);
}
