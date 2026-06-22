import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MENU_PRICES } from "@/lib/copy";

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
      tier: body?.tier,
    });
    const supabase = await getSupabase();

    const { name, email, phone, cupSize, packQty, tier, flavors, date, notes, urgency } = body;
    const isRush = urgency === "urgent";

    // Validate and calculate price server-side from the authoritative MENU_PRICES table
    const validCupSizes = ["2oz", "5oz"] as const;
    const validTiers = ["classic", "premium"] as const;
    const validQtys = [24, 48, 96] as const;

    const cupSizeValid = validCupSizes.includes(cupSize);
    const tierValid = validTiers.includes(tier);
    const qtyNum = parseInt(packQty, 10);
    const qtyValid = (validQtys as readonly number[]).includes(qtyNum);

    if (!cupSizeValid || !tierValid || !qtyValid) {
      return NextResponse.json(
        { error: "Invalid order configuration", cupSize, tier, packQty },
        { status: 400 }
      );
    }

    const totalPrice =
      MENU_PRICES[cupSize as "2oz" | "5oz"][tier as "classic" | "premium"][
        qtyNum as 24 | 48 | 96
      ];

    const flavorNotes = Array.isArray(flavors) ? flavors.join(", ") : String(flavors ?? "");

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
