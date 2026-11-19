/**
 * Single source of truth for business identity, contact, and location.
 * Update values here — every page, footer, metadata block, and CTA reads from this.
 */

// Public business contact (brief §2.5). The owner's personal address must never
// appear in the UI or the client bundle.
export const CONTACT_EMAIL = "dessertshot.ca@gmail.com";
// Business phone, supplied by the owner (2026-10-30).
export const CONTACT_PHONE: string | null = "(438) 700-3223";

export const BUSINESS = {
  // The brand is always "Dessert Shot by Farhana" (owner, 2026-10-30): the
  // wordmark, home title, share cards, emails, footer and each page's first
  // mention. "Dessert Shot" is the accepted short form: title suffixes and
  // later mentions in running copy.
  name: "Dessert Shot by Farhana",
  shortName: "Dessert Shot",
  founded: 2024,
  tagline: "Layered cups, made by hand in Hamilton.",
  description:
    "Hand-layered dessert cups and mini dessert shots, made fresh the morning of pickup in Hamilton, Ontario. Packs of 24, 48 or 96 for events and parties, with Saturday delivery across the GTA.",
  shortDescription: "Hand-layered dessert cups, made fresh in Hamilton, Ontario.",

  // Display name of the domain.
  domain: "dessertshot.ca",
  // Primary host: production serves www and Vercel redirects the apex to it.
  // metadataBase, every canonical and og:url resolve against this.
  url: "https://www.dessertshot.ca",

  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,

  instagram: {
    handle: "@dessertshot.ca",
    username: "dessertshot.ca",
    url: "https://instagram.com/dessertshot.ca",
  },

  facebook: {
    handle: "Dessert Shot",
    url: "https://www.facebook.com/profile.php?id=61561377497519",
  },

  location: {
    city: "Hamilton",
    province: "Ontario",
    provinceShort: "ON",
    cityFull: "Hamilton, Ontario",
    region: "Greater Toronto Area",
    regionShort: "GTA",
    locale: "en_CA",
  },

  fulfillment: {
    pickup: "Pickup free in Hamilton.",
    delivery: "Delivery Saturdays across the GTA.",
    notice: "48 hours minimum notice (7 days for a 96).",
    confirmation: "We confirm within the day.",
  },

  // Planning list for copy and titles (brief §8). Not rendered: Google ignores
  // meta keywords, and the tag would publish the plan.
  seoKeywords: [
    "dessert cups Hamilton",
    "dessert shots GTA",
    "party dessert cups",
    "wedding dessert cups",
    "baby shower dessert cups",
    "corporate dessert boxes",
    "mini dessert shooters",
    "dessert table Hamilton",
    "Dubai chocolate dessert cup",
    "Kinder Bueno dessert cup",
    "Biscoff dessert cups",
    "tiramisu cups",
    "dessert cups Toronto delivery",
  ],
} as const;

/**
 * Service area for a service-area business — no street address is ever
 * published (brief §1, §8.5). Only places consistent with the Saturday
 * delivery policy; the owner confirms the final list (brief §10.4).
 */
export const SERVICE_AREA = {
  pickupCity: "Hamilton",
  deliveryCities: ["Hamilton", "Burlington", "Oakville", "Mississauga", "Toronto"],
  // Confirmed by the owner (2026-10-30).
  needsOwnerReview: false,
} as const;

export const mailtoLink = `mailto:${CONTACT_EMAIL}`;

/** "tel:+14387003223", or null without a phone. */
export const telLink = CONTACT_PHONE ? `tel:+1${CONTACT_PHONE.replace(/\D/g, "")}` : null;
