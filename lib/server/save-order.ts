import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderSummary } from "@/lib/order-summary";

/**
 * Writes an order request to Supabase. The id is known before the write (the
 * form's request id, else one made on the server), so nothing needs reading
 * back (a read-back is what made anonymous inserts fail under row level
 * security) and the emails can quote the same reference even if the database
 * is down. A retry of a request that was already saved hits the primary key
 * and comes back as "duplicate", so it isn't saved or emailed twice.
 *
 * Until migration 004 runs, its columns don't exist and PostgREST answers
 * PGRST204; the order is then saved in the old shape, with the delivery
 * address folded into the notes as before.
 */
const MISSING_COLUMN = "PGRST204";
const UNIQUE_VIOLATION = "23505";

export type SaveResult = "saved" | "duplicate" | "failed";

function orderRow(id: string, s: OrderSummary, userId: string | null) {
  return {
    id,
    user_id: userId,
    customer_name: s.name,
    customer_email: s.email,
    customer_phone: s.phone,
    package_size: s.packQty,
    cup_size: s.cupSize,
    tier: s.tier,
    is_rush: s.urgent,
    flavor_notes: s.items.map((i) => `${i.name} ×${i.count}`).join(", "),
    desired_date: s.date,
    additional_notes: s.notes,
    status: "pending",
    fulfillment_method: s.fulfillment,
    total_price: s.estimatedTotal,
    event_type: s.eventType,
    delivery_address: s.deliveryAddress,
    delivery_postal_code: s.deliveryPostalCode,
    source: null as string | null,
  };
}

// Columns added by migration 004.
const NEW_ORDER_COLUMNS = ["event_type", "delivery_address", "delivery_postal_code", "source"];
const NEW_ITEM_COLUMNS = ["flavor_id"];

function omit<T extends object>(obj: T, keys: readonly string[]): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k))) as Partial<T>;
}

function legacyOrderRow(row: ReturnType<typeof orderRow>) {
  const where = [row.delivery_address, row.delivery_postal_code].filter(Boolean).join(", ");
  return {
    ...omit(row, NEW_ORDER_COLUMNS),
    additional_notes: where
      ? `Delivery address: ${where}${row.additional_notes ? `\n\n${row.additional_notes}` : ""}`
      : row.additional_notes,
  };
}

function itemRows(orderId: string, s: OrderSummary) {
  return s.items.map((i) => ({
    order_id: orderId,
    product_id: null,
    flavor_id: i.id,
    flavor_name: i.name,
    quantity: i.count,
    price_per_cup: i.pricePerCup,
  }));
}

export async function saveOrder(
  db: SupabaseClient,
  id: string,
  summary: OrderSummary,
  opts: { userId: string | null; source: string | null }
): Promise<SaveResult> {
  const row = { ...orderRow(id, summary, opts.userId), source: opts.source };

  let legacy = false;
  let { error } = await db.from("orders").insert(row);
  if (error?.code === MISSING_COLUMN) {
    console.warn("[orders] migration 004 columns missing (or schema cache stale); saving in the old shape");
    legacy = true;
    ({ error } = await db.from("orders").insert(legacyOrderRow(row)));
  }
  if (error?.code === UNIQUE_VIOLATION) {
    console.warn("[orders] order already saved (retried request)");
    return "duplicate";
  }
  if (error) {
    // Details stay in the server log; the customer never sees them.
    console.error("[orders] order insert failed", { code: error.code, message: error.message });
    return "failed";
  }

  // The breakdown is also in orders.flavor_notes, so a failure here is logged, not fatal.
  const items = itemRows(id, summary);
  const { error: itemsError } = await db
    .from("order_items")
    .insert(legacy ? items.map((i) => omit(i, NEW_ITEM_COLUMNS)) : items);
  if (itemsError) {
    console.error("[orders] order_items insert failed (non-fatal)", { code: itemsError.code, message: itemsError.message });
  }
  return "saved";
}
