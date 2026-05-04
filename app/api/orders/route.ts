import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Creates an untyped Supabase client for the API route.
// After running `supabase gen types typescript`, replace with the typed createClient from @/lib/supabase/server.
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setAll: () => {},
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // Determine price from package size
    const prices: Record<string, number> = {
      "1": 7.50,
      "6": 42.00,
      "12": 78.00,
      "24": 144.00,
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
      console.error("Order insert error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Track analytics event
    await supabase.from("analytics_events").insert({
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

    return NextResponse.json({ success: true, orderId: data.id }, { status: 201 });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
