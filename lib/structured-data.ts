/**
 * JSON-LD for search engines (brief §8.4), built only from the fact sources:
 * lib/business.ts, lib/flavors.ts, lib/packs.ts, lib/pricing.ts and the
 * reviewed drafts. Nothing here may say what the pages don't: no reviews or
 * ratings, no opening hours, no street address (a service-area business:
 * city-level address and the delivery cities as areaServed).
 *
 * Every page carries the site graph (WebSite + the business, from the root
 * layout); pages add their own nodes, which point back to the business by @id.
 * The `schema-dts` types check every property against schema.org.
 */
import type {
  Bakery,
  BreadcrumbList,
  City,
  FAQPage,
  ItemAvailability,
  Menu,
  MenuItem,
  Offer,
  Product,
  Thing,
  WebSite,
} from "schema-dts";
import { BUSINESS, CONTACT_PHONE, SERVICE_AREA } from "./business";
import { PAGE_DRAFTS } from "./drafts";
import { getEventBySlug } from "./events";
import { FLAVORS, comesInSize, type Flavor } from "./flavors";
import { plainText, SITE_TOKENS, usesDietaryClaim, type Tokens } from "./markdown";
import { productPhoto } from "./media";
import { CUP_SIZES, PACK_SIZES, cupSizeLabel } from "./packs";
import { MENU_PRICES, type CupSize, type PackQty, type Tier } from "./pricing";
import { DEFAULT_OG_IMAGE } from "./seo";

const BASE = BUSINESS.url;
export const WEBSITE_ID = `${BASE}/#website`;
export const BUSINESS_ID = `${BASE}/#business`;
const CURRENCY = "CAD";
const MADE_TO_ORDER: ItemAvailability = "https://schema.org/MadeToOrder";

/** Absolute URL on the production host. The home URL has no trailing slash, as Next renders its canonical. */
export function absoluteUrl(path: string): string {
  return path === "/" ? BASE : `${BASE}${path}`;
}

export type JsonLdGraph = { "@context": "https://schema.org"; "@graph": Thing[] };

export function graph(...nodes: Thing[]): JsonLdGraph {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Safe inside <script>: no "</script>" or HTML can break out. */
export function serializeJsonLd(data: JsonLdGraph): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

// ---------------------------------------------------------------------------
// The site graph: WebSite and the business
// ---------------------------------------------------------------------------

/** "(438) 700-3223" → "+1-438-700-3223". */
function internationalPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return `+1-${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Every pack price, lowest and highest (CAD). */
export function priceBounds(): { low: number; high: number } {
  const all = CUP_SIZES.flatMap((s) =>
    (["classic", "premium"] as const).flatMap((t) => PACK_SIZES.map((p): number => MENU_PRICES[s.value][t][p]))
  );
  return { low: Math.min(...all), high: Math.max(...all) };
}

function servedCity(name: string): City {
  return {
    "@type": "City",
    name,
    containedInPlace: { "@type": "State", name: BUSINESS.location.province, containedInPlace: { "@type": "Country", name: "Canada" } },
  };
}

/**
 * Google reads the site name from WebSite (the brand in full, the short form
 * as an alternate). Must be on the homepage; it's on every page.
 */
export function websiteNode(): WebSite {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: BUSINESS.name,
    alternateName: [BUSINESS.shortName, BUSINESS.domain],
    inLanguage: "en-CA",
    publisher: { "@id": BUSINESS_ID },
  };
}

/**
 * The business: a Bakery (a FoodEstablishment, so also an Organization and a
 * LocalBusiness) serving an area. City-level address only; pickup details are
 * shared after an order is confirmed.
 */
export function businessNode(): Bakery {
  const { low, high } = priceBounds();
  const phone = CONTACT_PHONE ? internationalPhone(CONTACT_PHONE) : undefined;
  return {
    "@type": "Bakery",
    "@id": BUSINESS_ID,
    name: BUSINESS.name,
    alternateName: BUSINESS.shortName,
    url: absoluteUrl("/"),
    description: BUSINESS.description,
    slogan: BUSINESS.tagline,
    foundingDate: String(BUSINESS.founded),
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: "482", height: "874" },
    image: [absoluteUrl(DEFAULT_OG_IMAGE.url), absoluteUrl(productPhoto(FLAVORS.find((f) => f.isHero) ?? FLAVORS[0]).src)],
    email: BUSINESS.email,
    ...(phone ? { telephone: phone } : {}),
    sameAs: [BUSINESS.instagram.url, BUSINESS.facebook.url],
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.location.city,
      addressRegion: BUSINESS.location.provinceShort,
      addressCountry: "CA",
    },
    areaServed: SERVICE_AREA.deliveryCities.map(servedCity),
    priceRange: `$${low}–$${high}`,
    currenciesAccepted: CURRENCY,
    servesCuisine: "Desserts",
    // Google's LocalBusiness docs read `menu`; schema.org's newer name is hasMenu.
    menu: absoluteUrl("/menu"),
    hasMenu: absoluteUrl("/menu"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: BUSINESS.email,
      ...(phone ? { telephone: phone } : {}),
    },
  };
}

export function siteGraph(): JsonLdGraph {
  return graph(websiteNode(), businessNode());
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

export type Crumb = { name: string; path: string };

/** Section names for breadcrumbs (short, as the navigation and footer say them). */
const SECTION_NAMES: Record<string, string> = {
  "/menu": "Menu",
  "/packages": "Packages",
  "/events": "Events",
  "/faq": "FAQ",
  "/order": "Order",
  "/dessert-cups-hamilton": "Pickup in Hamilton",
  "/dessert-cups-gta": "Delivery across the GTA",
  "/open-a-shop": "Help us open our first shop",
};

/** Home → section → page, for a published path. */
export function crumbsFor(path: string): Crumb[] {
  const home: Crumb = { name: "Home", path: "/" };
  if (path === "/") return [home];
  const [section, child] = path.split("/").filter(Boolean);
  const sectionPath = `/${section}`;
  const crumbs: Crumb[] = [home, { name: SECTION_NAMES[sectionPath] ?? section, path: sectionPath }];
  if (child) {
    const name =
      section === "menu"
        ? FLAVORS.find((f) => f.slug === child)?.name
        : section === "events"
          ? getEventBySlug(child)?.label
          : undefined;
    if (!name) throw new Error(`No breadcrumb name for ${path}`);
    crumbs.push({ name, path });
  }
  return crumbs;
}

export function breadcrumbNode(crumbs: Crumb[]): BreadcrumbList {
  const path = crumbs[crumbs.length - 1].path;
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export type FaqEntry = { q: string; a: string };

/**
 * The questions a page shows, as they read on it: an entry built on the
 * dietary claim goes when the claim is off (same rule as DraftPage). Use it
 * only where the questions are the page's own (not the reused /faq picks on
 * the homepage and flavour pages).
 */
export function faqNode(path: string, faqs: readonly FaqEntry[], tokens: Tokens = SITE_TOKENS): FAQPage | null {
  const shown = faqs
    .filter((f) => !usesDietaryClaim(f.a) || tokens.dietaryClaim)
    .map((f) => ({ q: f.q, a: plainText(f.a, tokens) }))
    .filter((f): f is { q: string; a: string } => Boolean(f.a));
  if (!shown.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: shown.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// ---------------------------------------------------------------------------
// Products and offers
// ---------------------------------------------------------------------------

const tierName = (t: Tier) => (t === "premium" ? "Premium" : "Classic");

/** One full pack of a flavour at its tier's price: "Mango Dream Mini Shots (2 oz), pack of 24". */
function packOffer(f: Flavor, size: CupSize, pack: PackQty, availability?: ItemAvailability): Offer {
  return {
    "@type": "Offer",
    name: `${f.name} ${cupSizeLabel(size)}, pack of ${pack}`,
    price: MENU_PRICES[size][f.tier][pack].toFixed(2),
    priceCurrency: CURRENCY,
    ...(availability ? { availability } : {}),
    url: absoluteUrl(`/menu/${f.slug}`),
    seller: { "@id": BUSINESS_ID },
  };
}

/** Every pack of a flavour, in each size it comes in (made to order). */
export function flavorOffers(f: Flavor): Offer[] {
  return CUP_SIZES.filter((s) => comesInSize(f, s.value)).flatMap((s) =>
    PACK_SIZES.map((pack) => packOffer(f, s.value, pack, MADE_TO_ORDER))
  );
}

/** The pack a flavour starts at: its smallest pack, in the first size it comes in. */
export function entryOffer(f: Flavor): Offer {
  const size = CUP_SIZES.find((s) => comesInSize(f, s.value))!.value;
  return packOffer(f, size, PACK_SIZES[0]);
}

/**
 * The flavour as Google's product snippet reads it: one Offer, named for the
 * pack it prices. Not an AggregateOffer (Google keeps that for several
 * sellers, not one seller's pack sizes), not a ProductGroup (variants need
 * URLs of their own), and no availability (Google's list has no "made to
 * order"). Every pack is on the page and in the /menu Menu.
 */
export function flavorProductNode(f: Flavor): Product {
  const url = absoluteUrl(`/menu/${f.slug}`);
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${f.name} dessert cups`,
    description: f.description,
    image: absoluteUrl(productPhoto(f).src),
    url,
    category: `Dessert cups (${tierName(f.tier)})`,
    brand: { "@type": "Brand", name: BUSINESS.name },
    offers: entryOffer(f),
  };
}

/** /menu: the menu, by tier, each item linking to its flavour page with every pack it comes in. */
export function menuNode(flavors: readonly Flavor[] = FLAVORS): Menu {
  const item = (f: Flavor): MenuItem => ({
    "@type": "MenuItem",
    name: f.name,
    description: f.description,
    url: absoluteUrl(`/menu/${f.slug}`),
    image: absoluteUrl(productPhoto(f).src),
    offers: flavorOffers(f),
  });
  return {
    "@type": "Menu",
    "@id": `${absoluteUrl("/menu")}#menu`,
    name: `${BUSINESS.name} menu`,
    url: absoluteUrl("/menu"),
    inLanguage: "en-CA",
    hasMenuSection: (["classic", "premium"] as const).map((tier) => ({
      "@type": "MenuSection",
      name: `${tierName(tier)} flavours`,
      hasMenuItem: flavors.filter((f) => f.tier === tier).map(item),
    })),
  };
}

// ---------------------------------------------------------------------------
// Per page
// ---------------------------------------------------------------------------

/**
 * A page's own nodes (the site graph comes from the root layout): breadcrumbs
 * on every inner page, plus the FAQ on draft pages (their questions are their
 * own), the menu on /menu and the product on each flavour page. /packages
 * lists packs, and Google wants product markup on product pages, not lists.
 * Null for the homepage.
 */
export function pageGraph(path: string, tokens: Tokens = SITE_TOKENS): JsonLdGraph | null {
  if (path === "/") return null;
  const nodes: Thing[] = [breadcrumbNode(crumbsFor(path))];
  const draft = PAGE_DRAFTS.find((d) => d.path === path);
  const faq = draft ? faqNode(path, draft.faqs, tokens) : null;
  if (faq) nodes.push(faq);
  if (path === "/menu") nodes.push(menuNode());
  const flavor = FLAVORS.find((f) => path === `/menu/${f.slug}`);
  if (flavor) nodes.push(flavorProductNode(flavor));
  return graph(...nodes);
}
