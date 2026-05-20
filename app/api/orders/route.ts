import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
      packageSize: body?.packageSize,
    });
    const supabase = await getSupabase();

    const {
      name,
      email,
      phone,
      packageSize,
      flavors,
      date,
      notes,
    } = body;

    // Determine price from package size — keep in sync with lib/copy.ts PACKAGES
    const prices: Record<string, number> = {
      "1": 7.5,
      "6": 39.0,
      "12": 72.0,
      "24": 132.0,
    };
    const totalPrice = prices[packageSize] ?? 0;

    // Get current user (optional, works for anonymous too)
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone ?? null,
        package_size: parseInt(packageSize),
        flavor_notes: flavors,
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

    // Track analytics event — best-effort, must not block order success
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        session_id: request.headers.get("x-session-id") ?? "anonymous",
        event_type: "order_submitted",
        page_path: "/",
        element_id: "order-form",
        metadata: {
          package_size: packageSize,
          order_id: data.id,
        },
        user_agent: request.headers.get("user-agent") ?? undefined,
      });
    if (analyticsError) {
      console.error("Analytics insert error (non-fatal):", analyticsError);
    }

    return NextResponse.json(
      { success: true, orderId: data.id },
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
