import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  calcMixTotal,
  perCupPrice,
  maxFlavorsForPack,
  MIN_CUPS_PER_FLAVOR,
  type CupSize,
  type Tier,
  type PackQty,
} from "@/lib/copy";

type IncomingItem = { name: string; tier: Tier; count: number };

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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setAll: () => {},
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[orders] POST received", {
      hasName: Boolean(body?.name),
      hasEmail: Boolean(body?.email),
      cupSize: body?.cupSize,
      packQty: body?.packQty,
      itemCount: Array.isArray(body?.items) ? body.items.length : 0,
    });
    const supabase = await getSupabase();

    const { name, email, phone, cupSize, packQty, items, date, notes, urgency } = body;
    const isRush = urgency === "urgent";

    // Validate the configuration server-side; never trust the client's price.
    const validCupSizes = ["2oz", "5oz"] as const;
    const validTiers = ["classic", "premium"] as const;
    const validQtys = [24, 48, 96] as const;

    const cupSizeValid = validCupSizes.includes(cupSize);
    const qtyNum = parseInt(packQty, 10);
    const qtyValid = (validQtys as readonly number[]).includes(qtyNum);

    if (!cupSizeValid || !qtyValid) {
      return NextResponse.json(
        { error: "Invalid order configuration", cupSize, packQty },
        { status: 400 }
      );
    }

    // ── Validate the flavour mix ──
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Select at least one flavour" },
        { status: 400 }
      );
    }

    const cleanItems: IncomingItem[] = items.map((i: IncomingItem) => ({
      name: String(i?.name ?? ""),
      tier: i?.tier,
      count: Number(i?.count),
    }));

    const itemsValid = cleanItems.every(
      (i) =>
        i.name.length > 0 &&
        (validTiers as readonly string[]).includes(i.tier) &&
        Number.isInteger(i.count) &&
        i.count >= MIN_CUPS_PER_FLAVOR &&
        i.count % MIN_CUPS_PER_FLAVOR === 0
    );
    const totalCups = cleanItems.reduce((sum, i) => sum + i.count, 0);
    const withinFlavorLimit = cleanItems.length <= maxFlavorsForPack(qtyNum as PackQty);

    if (!itemsValid || totalCups !== qtyNum || !withinFlavorLimit) {
      return NextResponse.json(
        {
          error: "Invalid flavour mix",
          detail: `Cups must total ${qtyNum} in multiples of ${MIN_CUPS_PER_FLAVOR}, with at most ${maxFlavorsForPack(
            qtyNum as PackQty
          )} flavours.`,
          totalCups,
        },
        { status: 400 }
      );
    }

    // Smart per-cup pricing across the mix, computed from the authoritative table.
    const totalPrice = calcMixTotal(
      cupSize as CupSize,
      qtyNum as PackQty,
      cleanItems.map((i) => ({ tier: i.tier, count: i.count }))
    );

    // Derive the order tier: classic / premium when uniform, otherwise mixed.
    const hasClassic = cleanItems.some((i) => i.tier === "classic");
    const hasPremium = cleanItems.some((i) => i.tier === "premium");
    const tier = hasClassic && hasPremium ? "mixed" : hasPremium ? "premium" : "classic";

    const flavorNotes = cleanItems.map((i) => `${i.name} ×${i.count}`).join(", ");

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone ?? null,
        package_size: qtyNum,
        cup_size: cupSize,
        tier,
        is_rush: isRush,
        flavor_notes: flavorNotes,
        desired_date: date,
        additional_notes: notes ?? null,
        status: "pending",
        fulfillment_method: "pickup",
        total_price: totalPrice,
      })
      .select()
      .single();

    if (error) {
      console.error("[orders] Supabase insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        {
          error: "Failed to create order",
          supabase: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          },
        },
        { status: 500 }
      );
    }

    console.log("[orders] Inserted order id:", data?.id);

    // Persist the flavour breakdown as order line items — best-effort, must not
    // block order success (the breakdown also lives in orders.flavor_notes).
    const { error: itemsError } = await supabase.from("order_items").insert(
      cleanItems.map((i) => ({
        order_id: data.id,
        product_id: null,
        flavor_name: i.name,
        quantity: i.count,
        price_per_cup: Math.round(perCupPrice(cupSize as CupSize, i.tier, qtyNum as PackQty) * 100) / 100,
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
          pack_qty: qtyNum,
          tier,
          is_rush: isRush,
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
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
