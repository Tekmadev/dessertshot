import type { MetadataRoute } from "next";
import { pagePhotos } from "@/lib/page-photos";
import { allRoutes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/structured-data";

/**
 * Every indexable route (lib/routes.ts) on the production host, with the
 * photos each page shows (lib/page-photos.ts: an image sitemap). No lastmod:
 * an honest date per page isn't tracked, and Google ignores lastmod it can't
 * trust; no priority or changefreq: Google ignores both.
 */
const imagesFor = (path: string) => pagePhotos(path).map((p) => absoluteUrl(p.src));

export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes()
    .filter((r) => !r.noindex)
    .map((r) => {
      const images = imagesFor(r.path);
      return { url: absoluteUrl(r.path), ...(images.length ? { images } : {}) };
    });
}
