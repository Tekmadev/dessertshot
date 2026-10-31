/**
 * Deep links into the order form (brief §7.8): flavour, package and event
 * pages link to /order?pack=48&size=5oz&flavour=dubai,biscoff&event=wedding
 * and the form opens with those choices made. Anything unknown in the URL is
 * ignored rather than trusted.
 *
 * On the same page (the Packages section above the form) there is no
 * navigation, so `requestOrderPrefill` hands the choices to the form directly.
 */
import { EVENT_VALUES, getEventBySlug } from "./events";
import { comesInSize, getFlavorById, getFlavorBySlug, type Flavor } from "./flavors";
import type { OrderItem } from "./order-schema";
import { MIN_CUPS_PER_FLAVOR, maxFlavorsForPack, type CupSize, type PackQty } from "./pricing";

export type OrderPrefill = {
  pack?: PackQty;
  size?: CupSize;
  /** Flavour registry ids, in the order given. */
  flavours?: string[];
  /** An `orders.event_type` value. */
  event?: string;
};

const PACKS: Record<string, PackQty> = { "24": 24, "48": 48, "96": 96 };
const SIZES: Record<string, CupSize> = { "2oz": "2oz", "5oz": "5oz" };

export function parseOrderPrefill(search: string | URLSearchParams): OrderPrefill {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const prefill: OrderPrefill = {};

  const pack = PACKS[params.get("pack") ?? ""];
  if (pack) prefill.pack = pack;

  const size = SIZES[params.get("size") ?? ""];
  if (size) prefill.size = size;

  const flavours = (params.get("flavour") ?? params.get("flavor") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .map((s) => (getFlavorById(s) ?? getFlavorBySlug(s))?.id)
    .filter((id): id is string => Boolean(id));
  if (flavours.length > 0) prefill.flavours = [...new Set(flavours)];

  // Accept the stored value ("wedding") or the page slug ("weddings").
  const event = (params.get("event") ?? "").trim().toLowerCase();
  const eventValue = EVENT_VALUES.includes(event) ? event : getEventBySlug(event)?.value;
  if (eventValue) prefill.event = eventValue;

  return prefill;
}

export function hasPrefill(prefill: OrderPrefill): boolean {
  return Object.keys(prefill).length > 0;
}

/**
 * The starting box for preselected flavours: the minimum of each, as many as
 * the pack allows. The customer then tops up to the pack size.
 */
export function prefilledItems(flavourIds: readonly string[], pack: PackQty, size: CupSize): OrderItem[] {
  return flavourIds
    .map((id) => getFlavorById(id))
    .filter((f): f is Flavor => f !== undefined && comesInSize(f, size))
    .slice(0, maxFlavorsForPack(pack))
    .map((f) => ({ id: f.id, name: f.name, tier: f.tier, count: MIN_CUPS_PER_FLAVOR }));
}

/** The box without flavours that don't come in this size (Tiramisu at 2 oz). */
export function itemsForSize(items: readonly OrderItem[], size: CupSize): OrderItem[] {
  return items.filter((i) => {
    const f = getFlavorById(i.id);
    return !f || comesInSize(f, size);
  });
}

/**
 * A box trimmed to fit a (smaller) pack: flavours keep their order, counts
 * shrink in steps of the minimum, and flavours that no longer fit drop off.
 */
export function fitItemsToPack(items: readonly OrderItem[], pack: PackQty): OrderItem[] {
  const out: OrderItem[] = [];
  let room = pack;
  for (const item of items) {
    if (out.length >= maxFlavorsForPack(pack)) break;
    const count = Math.min(item.count, Math.floor(room / MIN_CUPS_PER_FLAVOR) * MIN_CUPS_PER_FLAVOR);
    if (count < MIN_CUPS_PER_FLAVOR) break;
    out.push({ ...item, count });
    room -= count;
  }
  return out;
}

/** "/order?pack=48&size=5oz&flavour=dubai,biscoff&event=wedding" */
export function orderHref(prefill: OrderPrefill): string {
  const params = new URLSearchParams();
  if (prefill.pack) params.set("pack", String(prefill.pack));
  if (prefill.size) params.set("size", prefill.size);
  if (prefill.flavours?.length) params.set("flavour", prefill.flavours.join(","));
  if (prefill.event) params.set("event", prefill.event);
  const query = params.toString().replace(/%2C/g, ",");
  return query ? `/order?${query}` : "/order";
}

export const ORDER_PREFILL_EVENT = "dessertshot:order-prefill";

/** Same-page prefill, e.g. a pack card above the form. */
export function requestOrderPrefill(prefill: OrderPrefill): void {
  window.dispatchEvent(new CustomEvent<OrderPrefill>(ORDER_PREFILL_EVENT, { detail: prefill }));
}
