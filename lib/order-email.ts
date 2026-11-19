/**
 * The variables the two EmailJS templates receive: the owner's order
 * notification and the customer's auto-reply (brief §7.6). Built from the
 * server's OrderSummary only. Template setup is in docs/order-setup.md.
 *
 * The business template keeps the variable names the live template already
 * uses (from_name, cup_size, flavors, …), so it keeps working unchanged;
 * the new ones are additions.
 *
 * EmailJS escapes {{var}} but collapses its line breaks, so the full summary
 * is also sent pre-escaped with <br> for {{{order_summary_html}}}.
 *
 * The auto-reply goes to an address nobody has verified, so it carries only
 * what the server worked out, plus a first name when it looks like one: no
 * notes, phone, street address or anything link-shaped the sender typed (see
 * orderSummaryText).
 */
import { BUSINESS } from "./business";
import { allergenNoticeText } from "./claims";
import { copy } from "./copy";
import { treeNutFlavorNames } from "./flavors";
import { firstName } from "./order-api";
import {
  formatCad,
  fulfillmentLine,
  itemLine,
  orderSummaryText,
  timingLine,
  type OrderSummary,
} from "./order-summary";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asHtml(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, "<br>");
}

const TIER_LABEL = { classic: "Classic", premium: "Premium", mixed: "Mixed" } as const;

/** "Ana" for "Ana Smith"; "there" for anything that isn't plainly a name (links, digits, symbols). */
export function greetingName(name: string): string {
  const first = firstName(name);
  return /^[\p{L}\p{M}'’-]{1,20}$/u.test(first) ? first : "there";
}

function shared(s: OrderSummary, forCustomer: boolean) {
  const summary = orderSummaryText(s, forCustomer);
  return {
    order_ref: s.reference,
    cup_size: s.cupSizeLabel,
    tier: TIER_LABEL[s.tier],
    package_size: `${s.packQty} cups · ${formatCad(s.estimatedTotal)}`,
    flavors: s.items.map(itemLine).join(", "),
    estimated_total: formatCad(s.estimatedTotal),
    total_label: copy.order.totalLabel,
    desired_date: s.dateLabel,
    urgency: timingLine(s),
    fulfillment: fulfillmentLine(s, forCustomer),
    event_type: s.eventLabel ?? "—",
    order_summary: summary,
    order_summary_html: asHtml(summary),
  };
}

/** The owner's notification. Replying goes straight to the customer. */
export function businessEmailParams(s: OrderSummary): Record<string, string> {
  return {
    ...shared(s, false),
    to_email: BUSINESS.email,
    from_name: s.name,
    from_email: s.email,
    reply_to: s.email,
    phone: s.phone ?? "—",
    notes: s.notes ?? "—",
    delivery_address: s.deliveryAddress ?? "—",
    postal_code: s.deliveryPostalCode ?? "—",
    subject: `Order request ${s.reference}: ${s.packQty} ${s.cupSizeLabel}, ${s.dateLabel}${s.urgent ? " (URGENT)" : ""}`,
  };
}

/** The customer's auto-reply. Replying goes to the business inbox. */
export function customerEmailParams(s: OrderSummary): Record<string, string> {
  const nextSteps = [
    "This is a request: your order is booked once we confirm it.",
    copy.order.confirmation,
    copy.order.deposit,
    s.fulfillment === "pickup" ? copy.order.pickup : copy.order.deliveryFee,
  ].join(" ");
  const allergens = allergenNoticeText(treeNutFlavorNames());
  return {
    ...shared(s, true),
    to_email: s.email,
    to_name: greetingName(s.name),
    from_name: BUSINESS.name,
    reply_to: BUSINESS.email,
    business_email: BUSINESS.email,
    next_steps: nextSteps,
    allergen_notice: allergens,
    subject: `We've got your order request (${s.reference})`,
  };
}
