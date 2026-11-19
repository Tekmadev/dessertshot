import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/structured-data";

/**
 * Production: crawl everything public; keep crawlers out of the API and the
 * signed-in areas. /order/thanks stays crawlable so its noindex is seen.
 * Vercel previews (VERCEL_ENV=preview) shut crawlers out entirely.
 */
export default function robots(): MetadataRoute.Robots {
  const preview = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";
  if (preview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/admin"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
