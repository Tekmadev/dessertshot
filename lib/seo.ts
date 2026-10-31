/**
 * Per-page metadata. Next.js merges metadata shallowly, so a page that omits
 * `alternates` or `openGraph` silently inherits the parent's — which is how
 * /menu and /order ended up declaring the homepage as canonical. Every page
 * builds its metadata here instead, with a self-referencing canonical.
 */
import type { Metadata } from "next";
import { BUSINESS } from "./business";

export type OgImage = { url: string; width: number; height: number; alt: string };

// Shared fallback until per-page OG images land in Step 2. A crop of the
// owner's real Mango photo (photo J), re-encoded with all EXIF/GPS removed.
export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/og/default.jpg",
  width: 1200,
  height: 630,
  alt: "Five Mango Dream dessert cups topped with cream, on a wooden board with pistachios and rose petals",
};

export const TITLE_SEPARATOR = " · ";

type PageMetadataInput = {
  /** Page title. The root layout's template appends the brand unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Route path, e.g. "/menu". Resolved against `metadataBase` for canonical and og:url. */
  path: string;
  /** Use the title as-is, without the brand template (homepage). */
  absoluteTitle?: boolean;
  /** Keep the page out of search results (e.g. /order/thanks). */
  noindex?: boolean;
  image?: OgImage;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  image = DEFAULT_OG_IMAGE,
}: PageMetadataInput): Metadata {
  // Matches the layout's title template: the short name keeps titles within search-result length.
  const fullTitle = absoluteTitle ? title : `${title}${TITLE_SEPARATOR}${BUSINESS.shortName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    // A whole new object, never a spread of the layout's: metadata merges
    // shallowly, and a leftover googleBot "index" would contradict this.
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: BUSINESS.name,
      locale: BUSINESS.location.locale,
      url: path,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
