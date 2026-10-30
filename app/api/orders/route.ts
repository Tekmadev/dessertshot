import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calcMixTotal, perCupPrice, type CupSize, type PackQty } from "@/lib/pricing";
import { orderSchema } from "@/lib/order-schema";
import { getFlavorById } from "@/lib/flavors";

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env: url=${Boolean(url)}, key=${Boolean(key)}`
    );
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // Validate with the same schema as the form; never trust the client.
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid order",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const order = parsed.data;
    const cupSize = order.cupSize as CupSize;
    const packQty = Number(order.packQty) as PackQty;
    const isRush = order.urgency === "urgent";
    const isDelivery = order.fulfillment === "delivery";

    // Price and name every item from the flavour registry — the schema has
    // already confirmed each id exists at its registered tier.
    const items = order.items.map((i) => {
      const flavor = getFlavorById(i.id)!;
      return { name: flavor.name, tier: flavor.tier, count: i.count };
    });
    const totalPrice = calcMixTotal(cupSize, packQty, items);

    // Derive the order tier: classic / premium when uniform, otherwise mixed.
    const hasClassic = items.some((i) => i.tier === "classic");
    const hasPremium = items.some((i) => i.tier === "premium");
    const tier = hasClassic && hasPremium ? "mixed" : hasPremium ? "premium" : "classic";

    const flavorNotes = items.map((i) => `${i.name} ×${i.count}`).join(", ");

    // Fold the delivery address into the notes so the owner can quote the
    // delivery fee (structured columns arrive with migration 004).
    const deliveryAddress = order.deliveryAddress?.trim();
    const combinedNotes =
      isDelivery && deliveryAddress
        ? `Delivery address: ${deliveryAddress}${order.notes ? `\n\n${order.notes}` : ""}`
        : order.notes || null;

    console.log("[orders] POST valid", {
      cupSize,
      packQty,
      itemCount: items.length,
      fulfillment: order.fulfillment,
    });

    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        customer_name: order.name,
        customer_email: order.email,
        customer_phone: order.phone || null,
        package_size: packQty,
        cup_size: cupSize,
        tier,
        is_rush: isRush,
        flavor_notes: flavorNotes,
        desired_date: order.date,
        additional_notes: combinedNotes,
        status: "pending",
        fulfillment_method: isDelivery ? "delivery" : "pickup",
        total_price: totalPrice,
      })
      .select()
      .single();

    if (error) {
      // Details stay in the server log; the client gets a generic message.
      console.error("[orders] Supabase insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    console.log("[orders] Inserted order id:", data?.id);

    // Persist the flavour breakdown as order line items — best-effort, must not
    // block order success (the breakdown also lives in orders.flavor_notes).
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: data.id,
        product_id: null,
        flavor_name: i.name,
        quantity: i.count,
        price_per_cup: Math.round(perCupPrice(cupSize, i.tier, packQty) * 100) / 100,
      }))
    );
    if (itemsError) {
      console.error("[orders] order_items insert error (non-fatal):", itemsError);
    }

    // Analytics event — best-effort, must not block order success
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        session_id: request.headers.get("x-session-id") ?? "anonymous",
        event_type: "order_submitted",
        page_path: "/",
        element_id: "order-form",
        metadata: {
          cup_size: cupSize,
          pack_qty: packQty,
          tier,
          is_rush: isRush,
          fulfillment: isDelivery ? "delivery" : "pickup",
          total_price: totalPrice,
          order_id: data.id,
        },
        user_agent: request.headers.get("user-agent") ?? undefined,
      });
    if (analyticsError) {
      console.error("Analytics insert error (non-fatal):", analyticsError);
    }

    return NextResponse.json(
      { success: true, orderId: data.id, totalPrice },
      { status: 201 }
    );
  } catch (err) {
    console.error("[orders] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
