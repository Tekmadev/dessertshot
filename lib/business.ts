/**
 * Single source of truth for business identity, contact, and location.
 * Update values here — every page, footer, metadata block, and CTA reads from this.
 */
export const BUSINESS = {
  name: "Dessert Shot",
  tagline: "Layered cups, made by hand in Hamilton.",
  description:
    "Hand layered dessert cups baked in Hamilton, Ontario. Real fruit, real cream, ridiculous detail. Order packages of 6, 12, or 24 across the GTA.",
  shortDescription: "Hand layered dessert cups baked in Hamilton, Ontario.",

  domain: "dessertshot.ca",
  url: "https://dessertshot.ca",

  email: "farhanaakter2612@gmail.com",

  instagram: {
    handle: "@dessertshot.ca",
    username: "dessertshot.ca",
    url: "https://instagram.com/dessertshot.ca",
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
    notice: "48 hours minimum notice.",
  },

  seoKeywords: [
    "dessert cups Hamilton",
    "dessert cups GTA",
    "dessert shot",
    "layered dessert cups",
    "Kinder Bueno dessert",
    "Ferrero dessert",
    "Dubai chocolate dessert",
    "Biscoff dessert cups",
    "mango cheesecake cup",
    "custom dessert orders Hamilton",
    "Toronto dessert delivery",
    "wedding dessert cups",
  ],
} as const;

export const mailtoLink = `mailto:${BUSINESS.email}`;
