/**
 * Route map: every published route and its search metadata, in one place.
 * Pages build their metadata from here via `pageMetadata()`, the tests check
 * titles and descriptions stay unique, and the sitemap (Step 5) will read it.
 * New pages are added here when they are built.
 */
import { dietaryClaim } from "./claims";
import { PAGE_DRAFTS, getDraft } from "./drafts";
import { FLAVORS, sizeNote, type Flavor } from "./flavors";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  /** Use the title as-is, without the brand template (homepage). */
  absoluteTitle?: boolean;
  /** Keep out of search results and the sitemap. */
  noindex?: boolean;
};

const dietary = dietaryClaim();

export const ROUTES = {
  home: {
    path: "/",
    absoluteTitle: true,
    title: "Dessert Cups in Hamilton & the GTA · Dessert Shot by Farhana",
    description: `${dietary ? `${dietary} dessert cups` : "Hand-layered dessert cups"} and dessert shots for weddings, showers and parties. Made fresh in Hamilton, delivered Saturdays across the GTA.`,
  },
  menu: {
    path: "/menu",
    title: "Dessert Cup Menu: Eight Layered Flavours",
    description:
      "Dubai Chocolate, Kinder Bueno, Biscoff, Ferrero, Tiramisu and fruit dessert cups. Every layer listed bottom to top, with allergen notes.",
  },
  order: {
    path: "/order",
    title: "Order Dessert Cups for Pickup or Delivery",
    description:
      "Request a pack of 24, 48 or 96 dessert cups or mini dessert shots. Free pickup in Hamilton, Saturday delivery across the GTA. We confirm within the day.",
  },
  orderThanks: {
    path: "/order/thanks",
    noindex: true,
    title: "Order Request Received",
    description:
      "Your Dessert Shot order request has arrived. Here is your summary and what happens next: we confirm within the day, by email, text or Instagram.",
  },
} as const satisfies Record<string, RouteMeta>;

/** A page built from a reviewed draft (content/drafts): its own title and description. */
export function draftRoute(slug: string): RouteMeta {
  const d = getDraft(slug);
  if (!d) throw new Error(`No page draft "${slug}"`);
  return { path: d.path, title: d.metaTitle, description: d.metaDescription };
}

/** /menu/[flavour]: one page per flavour (brief §6). */
export function flavorRoute(f: Flavor): RouteMeta {
  const sizes = sizeNote(f) ? "Dessert Cups" : "Dessert Cups & Mini Shots";
  return { path: `/menu/${f.slug}`, title: `${f.name} ${sizes}`, description: f.seoDescription };
}

/** Every route with metadata: the fixed pages, the draft pages and the flavour pages. */
export function allRoutes(): RouteMeta[] {
  return [...Object.values(ROUTES), ...PAGE_DRAFTS.map((d) => draftRoute(d.slug)), ...FLAVORS.map(flavorRoute)];
}
