/**
 * Marketing copy. Facts come from the owner's brief: never invent ingredients,
 * stats, reviews or process details here (brief §0.3, §2.4).
 */

import { FLAVORS } from "./flavors";

// Pricing and flavours live in their own modules; re-exported so existing
// imports from "@/lib/copy" keep working.
export * from "./pricing";
export { FLAVORS, CLASSIC_FLAVORS, PREMIUM_FLAVORS } from "./flavors";
export type { Flavor, FlavorCategory } from "./flavors";
export { PACKAGES, PACK_RULES_LINE } from "./packs";

const BRAND_WORDS = ["Biscoff", "Kinder", "Ferrero", "Dubai"];

/** "Pistachio cream" → "pistachio cream"; brand names keep their capital. */
function lowerFirst(s: string): string {
  return BRAND_WORDS.includes(s.split(" ")[0]) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

function orList(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`;
}

// Each flavour's cream layer (layer 2, bottom → top), straight from the
// registry so this sentence can never drift from the recipes.
const CREAM_LAYERS = FLAVORS.filter((f) => f.layers.length > 1).map((f) => lowerFirst(f.layers[1]));

export const copy = {
  hero: {
    eyebrow: "Hand-layered in Hamilton, Ontario",
    line1: "Cups so good",
    line2Pre: "people stop ",
    line2Italic: "talking",
    line2Post: " when",
    line3: "they hit the spoon.",
    subhead:
      "Real fruit, real cream, a crumb base pressed by hand. We layer every cup the morning of pickup so each layer lands the way it should.",
    primaryCta: { label: "Browse Packages", href: "#packages" },
    secondaryCta: { label: "See the Flavours", href: "#flavors" },
    note: "Pickup in Hamilton or Saturday delivery across the GTA. Just give us 48 hours notice.",
  },

  feature: {
    kicker: "What lives in a cup",
    heading: "Four layers, no shortcuts.",
    body: "Every cup is layered by hand the morning it leaves us: a base pressed or soaked by hand, its own cream, the layer that gives it its name, then the finish on top.",
  },

  builder: {
    sectionLabel: "How a cup is built",
    phases: [
      {
        kicker: "01 . Base",
        title: "A crumb base, pressed by hand.",
        body: "Graham crumb for most cups, Biscoff crumb for Biscoff Bliss. Pressed into the bottom so the spoon meets resistance, not powder.",
      },
      {
        kicker: "02 . Cream",
        title: "A cream for every flavour.",
        // "Whipped" is the brief's own process word (S5: pressed → whipped → layered).
        body: `Each flavour gets its own, whipped and layered straight onto the base: ${orList(CREAM_LAYERS)}.`,
      },
      {
        kicker: "03 . Flavour",
        title: "The layer that gives it a name.",
        body: "A mango layer, strawberry or blueberry compote, a glossy ganache, melted Biscoff, or golden kunafa between pistachio cream. This is the layer you remember.",
      },
      {
        kicker: "04 . Finish",
        title: "Topped the morning of pickup.",
        body: "A cream dollop, fresh blueberries, a hazelnut ball, a Biscoff cookie or a pistachio swirl. Then a lid, and it is ready for the table.",
      },
    ],
  },

  flavors: {
    kicker: "The lineup",
    heading: "Eight flavours.",
    headingItalic: "All of them serious.",
    body: "Pick one or build a mixed box. Classic and Premium flavours mix freely in the same pack.",
  },

  packages: {
    kicker: "Choose your box",
    heading: "Boxes priced",
    headingItalic: "for sharing.",
    body: "Mix Classic and Premium flavours freely in the same box. The 96 brings the lowest price per cup.",
  },

  how: {
    kicker: "The order flow",
    headingPre: "Three steps,",
    headingItalic: "no surprises.",
    body: "We confirm your order within the day, make every cup the morning of pickup or delivery, and hand it off ready for the table.",
  },

  cta: {
    kicker: "Ready to order",
    heading: "Tell us the date.",
    headingItalic: "We do the rest.",
    body: "Send your details, your flavours, and the date you need them by. We confirm within the day.",
    primary: { label: "Place an Order", href: "/order" },
    secondary: { label: "Browse the Menu", href: "/menu" },
  },

  // The order form, the order emails and /order/thanks (brief §7).
  order: {
    totalLabel: "Estimated total (before delivery)",
    deliveryFee: "Delivery fee quoted after we confirm.",
    standard: "48 hours' notice or more.",
    noticeDefault: "Standard orders need 48 hours' notice. Under 48 hours is urgent, subject to availability.",
    // Rush fee confirmed by the owner (2026-10-30); "subject to availability"
    // is the brief's.
    urgent: "Under 48 hours' notice: urgent, subject to availability. A rush fee applies; we'll confirm it when we reply.",
    notSaturday:
      "Delivery runs on Saturdays. We'll get back to you about your date when we confirm, or you can pick up in Hamilton for free.",
    pickup: "Pickup is free in Hamilton. We share the pickup spot when we confirm your order.",
    // When the thanks page doesn't know which was chosen.
    pickupOrDelivery: "Pickup is free in Hamilton; for delivery, the fee is quoted after we confirm.",
    confirmation: "We confirm every order within the day, by email.",
  },
} as const;

export const HOW_STEPS = [
  {
    kicker: "01",
    title: "You tell us when.",
    body: "Pick a date, a package size, and the flavours you want. We confirm within the day so you know it is locked.",
  },
  {
    kicker: "02",
    title: "We make it the morning of.",
    body: "Crumb pressed, cream whipped, every layer built the morning of pickup or delivery. Nothing sits overnight.",
  },
  {
    kicker: "03",
    title: "Pickup or delivery.",
    body: "Pickup is free in Hamilton. Delivery runs on Saturdays across the GTA, with the fee quoted when we confirm your order.",
  },
];
