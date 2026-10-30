/**
 * Route map: every published route and its search metadata, in one place.
 * Pages build their metadata from here via `pageMetadata()`, the tests check
 * titles and descriptions stay unique, and the sitemap (Step 5) will read it.
 * New pages are added here when they are built.
 */
import { dietaryClaim } from "./claims";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  /** Use the title as-is, without the brand template (homepage). */
  absoluteTitle?: boolean;
};

const dietary = dietaryClaim();

export const ROUTES = {
  home: {
    path: "/",
    absoluteTitle: true,
    title: "Dessert Shot · Hand-Layered Dessert Cups, Hamilton & GTA",
    description: `${dietary ? `${dietary} dessert cups` : "Hand-layered dessert cups"} and dessert shots for weddings, showers and parties. Made fresh in Hamilton, delivered Saturdays across the GTA.`,
  },
  menu: {
    path: "/menu",
    title: "Menu: Layered Dessert Cup Flavours",
    description:
      "Dubai Chocolate, Kinder Bueno, Biscoff, Ferrero, Tiramisu and fruit dessert cups. Every layer listed bottom to top, with allergen notes.",
  },
  order: {
    path: "/order",
    title: "Order Dessert Cups for Pickup or Delivery",
    description:
      "Request a pack of 24, 48 or 96 dessert cups or mini dessert shots. Free pickup in Hamilton, Saturday delivery across the GTA. We confirm within the day.",
  },
} as const satisfies Record<string, RouteMeta>;
