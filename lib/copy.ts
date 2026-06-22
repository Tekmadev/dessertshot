export const copy = {
  hero: {
    eyebrow: "Hand layered in Hamilton, Ontario",
    line1: "Cups so good",
    line2Pre: "people stop ",
    line2Italic: "talking",
    line2Post: " when",
    line3: "they hit the spoon.",
    subhead:
      "Real fruit, real cream, biscuit pressed by hand. We layer each cup the morning of pickup so the texture lands the way it should.",
    primaryCta: { label: "Browse Packages", href: "#packages" },
    secondaryCta: { label: "See the Flavours", href: "#flavors" },
    note: "Pickup in Hamilton or delivery across the GTA. Just give us 48 hours notice.",
  },

  feature: {
    kicker: "What lives in a cup",
    heading: "Four layers, no shortcuts.",
    body: "Every cup is built the same morning it leaves us. Biscuit is pressed, not poured. Cream is whipped to soft peaks, not piped from a tub. The flavour layer is concentrated to the point where it almost becomes paste. Then the topping that gives it its name.",
  },

  builder: {
    sectionLabel: "How a cup is built",
    phases: [
      {
        kicker: "01 . Base",
        title: "A biscuit pressed by hand.",
        body: "Crushed cookie folded with brown butter and sea salt. Pressed into the bottom of the cup so the spoon meets resistance, not powder.",
      },
      {
        kicker: "02 . Cream",
        title: "Cream cheese, whipped soft.",
        body: "Slow whipped with mascarpone until it lifts. We taste every batch before it hits a cup. Sweet, but never cloying.",
      },
      {
        kicker: "03 . Flavour",
        title: "The layer that gives it a name.",
        body: "Fresh mango reduced for forty minutes. Or Biscoff melted with single cream. Or pistachio paste folded with kunafa. This is the layer you remember.",
      },
      {
        kicker: "04 . Finish",
        title: "Topped the morning of pickup.",
        body: "Real fruit, real chocolate, real crunch. Plated like it matters because it does. Then a lid, a label, and into the cooler.",
      },
    ],
  },

  numbers: {
    intro:
      "The math we run before we ever bake a tray. Every number on this page comes from real orders, real customers, real GTA addresses.",
    stats: [
      {
        value: 7,
        format: "plus" as const,
        label:
          "Signature flavours on the menu, plus seasonal drops the moment fruit hits its peak.",
      },
      {
        value: 1200,
        format: "plus" as const,
        label:
          "Cups served to weddings, baby showers, corporate boxes, and people who just had a long week.",
      },
      {
        value: 24,
        format: "hours" as const,
        label:
          "From last cream layer to the spoon. We bake in the morning so the textures arrive the way we built them.",
      },
    ],
  },

  flavors: {
    kicker: "The lineup",
    heading: "Seven flavours.",
    headingItalic: "All of them serious.",
    body: "Pick one, build a mixed box, or let us recommend a mix for your 24, 48, or 96 pack. Every flavour layers the same way: biscuit, cream, concentrate, finish.",
  },

  packages: {
    kicker: "Choose your box",
    heading: "Boxes priced",
    headingItalic: "for sharing.",
    body: "The bigger the pack, the better the value. Mix Classic and Premium flavours freely. We label each cup so the gluten free pistachio does not end up next to the strawberry compote.",
  },

  testimonials: {
    kicker: "From the inbox",
    heading: "What people say after the first spoon.",
  },

  cta: {
    kicker: "Ready to order",
    heading: "Tell us the date.",
    headingItalic: "We do the rest.",
    body: "Drop your details, your flavour preferences, and the date you need them by. We confirm within the day, every day.",
    primary: { label: "Place an Order", href: "/order" },
    secondary: { label: "Browse the Menu", href: "/menu" },
  },
} as const;

export const FLAVORS = [
  {
    id: "mango",
    name: "Mango Dream",
    tagline: "Tropical and bright.",
    accent: "var(--color-mango)",
    description:
      "Fresh mango reduced low and slow, layered over a velvety mango cream cheese. Topped with fresh cubes the morning of pickup.",
    layers: ["Brown butter biscuit", "Mango cream", "Mango concentrate", "Fresh mango"],
    pricePerCup: 6.5,
    category: "Fruit",
    tier: "classic" as const,
  },
  {
    id: "strawberry",
    name: "Strawberry Fields",
    tagline: "Summer in a cup.",
    accent: "var(--color-strawberry)",
    description:
      "Fresh strawberry compote that holds its shape on a spoon, over a rose tinted cream. Vanilla biscuit base.",
    layers: ["Vanilla biscuit", "Rose cream", "Strawberry compote", "Halved strawberries"],
    pricePerCup: 6.5,
    category: "Fruit",
    tier: "classic" as const,
  },
  {
    id: "blueberry",
    name: "Blueberry Haze",
    tagline: "Deep and lush.",
    accent: "var(--color-blueberry)",
    description:
      "Wild blueberry reduced with a touch of lemon, over a blueberry tinted cream. Comes out almost violet.",
    layers: ["Vanilla biscuit", "Blueberry cream", "Wild blueberry", "Fresh berries"],
    pricePerCup: 6.5,
    category: "Fruit",
    tier: "classic" as const,
  },
  {
    id: "kinder",
    name: "Kinder Bueno",
    tagline: "Hazelnut, silk, crunch.",
    accent: "var(--color-kinder)",
    description:
      "Kinder cream cheese folded with hazelnut paste, glossed with dark ganache. A whole Kinder Bueno on top.",
    layers: ["Hazelnut biscuit", "Kinder cream", "Dark ganache", "Kinder Bueno"],
    pricePerCup: 7.5,
    category: "Chocolate",
    tier: "premium" as const,
  },
  {
    id: "ferrero",
    name: "Ferrero Royale",
    tagline: "Rich, royal, restrained.",
    accent: "var(--color-ferrero)",
    description:
      "A whole Ferrero suspended in chocolate cream, over hazelnut crunch. The cup people text us about.",
    layers: ["Hazelnut crunch", "Chocolate cream", "Hazelnut praline", "Whole Ferrero"],
    pricePerCup: 7.5,
    category: "Chocolate",
    tier: "premium" as const,
  },
  {
    id: "biscoff",
    name: "Biscoff Bliss",
    tagline: "Caramel and spice.",
    accent: "var(--color-biscoff)",
    description:
      "Lotus Biscoff melted into single cream, layered over Biscoff cream cheese. Crushed Biscoff lid.",
    layers: ["Biscoff base", "Biscoff cream", "Melted Biscoff", "Biscoff crumb"],
    pricePerCup: 7.0,
    category: "Caramel",
    tier: "premium" as const,
  },
  {
    id: "dubai",
    name: "Dubai Chocolate",
    tagline: "Pistachio, kunafa, gold.",
    accent: "var(--color-dubai)",
    description:
      "Roasted pistachio paste folded with toasted kunafa, sealed under dark chocolate. The cup that started a trend.",
    layers: ["Dark chocolate shell", "Pistachio kunafa", "Pistachio cream", "Crushed pistachio"],
    pricePerCup: 8.5,
    category: "Premium",
    tier: "premium" as const,
  },
] as const;

// Pricing structure: cup size → tier → pack quantity → price (CAD)
// Website prices are slightly above Facebook Marketplace to reflect the full-service experience.
export const MENU_PRICES = {
  "2oz": {
    classic: { 24: 45, 48: 88, 96: 168 },
    premium: { 24: 58, 48: 115, 96: 215 },
  },
  "5oz": {
    classic: { 24: 99, 48: 199, 96: 379 },
    premium: { 24: 129, 48: 259, 96: 499 },
  },
} as const;

export type CupSize = keyof typeof MENU_PRICES;
export type Tier = "classic" | "premium";
export type PackQty = 24 | 48 | 96;

export const CLASSIC_FLAVORS = FLAVORS.filter((f) => f.tier === "classic");
export const PREMIUM_FLAVORS = FLAVORS.filter((f) => f.tier === "premium");

export const PACKAGES = [
  {
    size: 24,
    label: "The 24",
    description: "Weekend gatherings, small parties, office treats.",
    perks: [
      "Mix up to 4 flavours",
      "Packed in sets of 5",
      "Pickup in Hamilton",
      "Labelled by flavour",
    ],
    featured: false,
  },
  {
    size: 48,
    label: "The 48",
    description: "The most popular size. Built for bigger tables.",
    perks: [
      "Mix up to 6 flavours",
      "Packed in sets of 5",
      "Pickup in Hamilton",
      "Priority preparation",
      "Free flavour recommendation",
    ],
    featured: true,
  },
  {
    size: 96,
    label: "The 96",
    description: "Weddings, baby showers, corporate events.",
    perks: [
      "Full flavour mix",
      "Custom label option",
      "Event day pickup",
      "Presentation tray included",
    ],
    featured: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Aisha",
    location: "Mississauga",
    rating: 5,
    text: "Ordered a box of 24 for my sister's bridal shower. Three different aunts asked for the link before the box was empty.",
    flavor: "Dubai Chocolate",
  },
  {
    name: "Marcus",
    location: "Toronto",
    rating: 5,
    text: "Picked these up Saturday morning, ate one in the car. Forgot to bring the rest to the dinner. No regrets.",
    flavor: "Ferrero Royale",
  },
  {
    name: "Priya",
    location: "Burlington",
    rating: 5,
    text: "The mango cup tastes like the mangoes my grandmother used to bring. Real fruit, not flavouring. Worth every dollar.",
    flavor: "Mango Dream",
  },
  {
    name: "Jordan",
    location: "Hamilton",
    rating: 5,
    text: "Got a box of 24 for an office launch. Ten people, way more than enough, one fight over the last Biscoff.",
    flavor: "Biscoff Bliss",
  },
];

export const HOW_STEPS = [
  {
    kicker: "01",
    title: "You tell us when.",
    body: "Pick a date, a package size, and the flavours you want. We confirm within the same day so you know it is locked.",
  },
  {
    kicker: "02",
    title: "We bake the morning of.",
    body: "Biscuit pressed, cream whipped, fruit reduced, all the morning of pickup. Nothing sits overnight, nothing is poured from a tub.",
  },
  {
    kicker: "03",
    title: "Pickup or delivery.",
    body: "Pickup is free in Hamilton. Delivery runs Saturdays across the GTA. Boxes arrive cold, sealed, labelled by flavour.",
  },
];
