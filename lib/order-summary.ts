/**
 * One summary of an order request, built on the server from the validated
 * order and the registries, and used three ways: the business email, the
 * customer's auto-reply and the /order/thanks page (brief §7.6). Names,
 * prices, timing and labels are recomputed from config, never copied from
 * what the browser sent, so all three always show the server's total.
 *
 * Shaped so a payment step (Stripe) can be added later: the items, unit
 * prices and total are already itemised and server-computed.
 */
import { ALLERGENS } from "./claims";
import { copy } from "./copy";
import { OTHER_EVENT_VALUE, getEventByValue } from "./events";
import { getFlavorById } from "./flavors";
import { normalizePostalCode, type OrderFormValues } from "./order-schema";
import { formatOrderDate, isSaturday, orderTiming } from "./order-timing";
import { cupSizeLabel } from "./packs";
import { calcMixTotal, perCupPrice, type CupSize, type PackQty, type Tier } from "./pricing";

export type OrderSummaryItem = {
  id: string;
  name: string;
  tier: Tier;
  count: number;
  /** CAD, to the cent. */
  pricePerCup: number;
  /** Allergen labels, e.g. ["Dairy", "Tree nuts"]. */
  allergens: string[];
};

export type OrderSummary = {
  /** Short code shown to the customer and in both emails, e.g. "DS-1A2B3C4D". */
  reference: string;
  cupSize: CupSize;
  cupSizeLabel: string;
  packQty: PackQty;
  tier: "classic" | "premium" | "mixed";
  items: OrderSummaryItem[];
  /** CAD, before delivery and any rush fee. */
  estimatedTotal: number;
  date: string;
  dateLabel: string;
  urgent: boolean;
  fulfillment: "pickup" | "delivery";
  deliveryAddress: string | null;
  deliveryPostalCode: string | null;
  /** Delivery runs on Saturdays; any other day gets a friendly note, never a block. */
  deliveryNotSaturday: boolean;
  eventType: string | null;
  eventLabel: string | null;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
};

export function orderReference(orderId: string): string {
  return `DS-${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function eventLabel(value: string | undefined): string | null {
  if (!value) return null;
  if (value === OTHER_EVENT_VALUE) return "Something else";
  return getEventByValue(value)?.label ?? null;
}

function clean(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/** Expects an order that already passed `orderSchema`. */
export function buildOrderSummary(order: OrderFormValues, orderId: string, now: Date): OrderSummary {
  const cupSize = order.cupSize as CupSize;
  const packQty = Number(order.packQty) as PackQty;

  const items: OrderSummaryItem[] = order.items.map((i) => {
    const flavor = getFlavorById(i.id)!;
    return {
      id: flavor.id,
      name: flavor.name,
      tier: flavor.tier,
      count: i.count,
      pricePerCup: Math.round(perCupPrice(cupSize, flavor.tier, packQty) * 100) / 100,
      allergens: flavor.allergens.map((a) => ALLERGENS[a].short),
    };
  });

  const hasClassic = items.some((i) => i.tier === "classic");
  const hasPremium = items.some((i) => i.tier === "premium");
  const delivery = order.fulfillment === "delivery";

  return {
    reference: orderReference(orderId),
    cupSize,
    cupSizeLabel: cupSizeLabel(cupSize),
    packQty,
    tier: hasClassic && hasPremium ? "mixed" : hasPremium ? "premium" : "classic",
    items,
    estimatedTotal: calcMixTotal(cupSize, packQty, items),
    date: order.date,
    dateLabel: formatOrderDate(order.date),
    urgent: orderTiming(order.date, now) === "urgent",
    fulfillment: order.fulfillment,
    deliveryAddress: delivery ? clean(order.deliveryAddress) : null,
    deliveryPostalCode: delivery ? normalizePostalCode(order.deliveryPostalCode ?? "") : null,
    deliveryNotSaturday: delivery && !isSaturday(order.date),
    eventType: clean(order.eventType),
    eventLabel: eventLabel(clean(order.eventType) ?? undefined),
    name: order.name.trim(),
    email: order.email,
    phone: clean(order.phone),
    notes: clean(order.notes),
  };
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString("en-CA", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "Mango Dream ×12 (Dairy)" */
export function itemLine(item: OrderSummaryItem): string {
  return `${item.name} ×${item.count} (${item.allergens.join(", ")})`;
}

/** `forCustomer` leaves out the street address (only the postal code). */
export function fulfillmentLine(s: OrderSummary, forCustomer = false): string {
  if (s.fulfillment === "pickup") return "Pickup in Hamilton (free)";
  const where = forCustomer
    ? `postal code ${s.deliveryPostalCode}`
    : [s.deliveryAddress, s.deliveryPostalCode].filter(Boolean).join(", ");
  return `Delivery to ${where}. ${copy.order.deliveryFee}`;
}

export function timingLine(s: OrderSummary): string {
  return s.urgent ? copy.order.urgent : copy.order.standard;
}

/**
 * The order as plain text, one fact per line, for both emails. The owner's
 * copy has everything. The customer's copy repeats only what the server
 * worked out (no name, phone, street address or notes), so the auto-reply
 * can't be used to send someone else text of the sender's choosing.
 */
export function orderSummaryText(s: OrderSummary, forCustomer = false): string {
  const lines = [
    `Order request ${s.reference}`,
    "",
    `${s.packQty} × ${s.cupSizeLabel}`,
    ...s.items.map((i) => `  • ${itemLine(i)}`),
    `${copy.order.totalLabel}: ${formatCad(s.estimatedTotal)}`,
    "",
    `Date needed: ${s.dateLabel}`,
    timingLine(s),
    fulfillmentLine(s, forCustomer),
    ...(s.deliveryNotSaturday ? [copy.order.notSaturday] : []),
    ...(s.eventLabel ? [`Event: ${s.eventLabel}`] : []),
    "",
    ...(forCustomer
      ? s.notes
        ? ["Your notes: received."]
        : []
      : [
          `Name: ${s.name}`,
          `Email: ${s.email}`,
          ...(s.phone ? [`Phone: ${s.phone}`] : []),
          ...(s.notes ? ["", "Notes:", s.notes] : []),
        ]),
  ];
  return lines.join("\n");
}
