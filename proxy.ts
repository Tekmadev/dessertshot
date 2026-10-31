import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session for guarded routes
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /account and /admin routes
  if (!user) {
    const url = request.nextUrl.clone();
    if (url.pathname.startsWith("/account")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith("/admin")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// Only the guarded areas. Running on every request meant a Supabase auth
// round-trip before every page view, slowing TTFB/LCP site-wide, for routes
// that don't exist yet.
export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
