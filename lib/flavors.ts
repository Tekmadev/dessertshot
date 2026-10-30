/**
 * The eight flavours — written from the owner's real recipes (brief §2.1).
 * This registry drives the menu, flavour pages, order form, structured data
 * and alt text. `lib/flavors.test.ts` guards it against drift.
 *
 * Brand names (Kinder, Ferrero, Biscoff) appear as plain-text flavour names
 * only — never logos, wrappers or packaging (brief §2.4).
 */
import type { AllergenId } from "./claims";
import type { Tier } from "./pricing";

export type FlavorCategory = "Fruit" | "Chocolate" | "Caramel" | "Premium";

export type Flavor = {
  /**
   * Stable id used by the order form, the order schema and deep links (and by
   * order_items.flavor_id once migration 004 runs). Never rename.
   */
  id: string;
  /** URL segment for /menu/[flavour]. */
  slug: string;
  name: string;
  tier: Tier;
  /** Filter chip on the lineup (All / Fruit / Chocolate / Caramel / Premium). */
  category: FlavorCategory;
  tagline: string;
  description: string;
  /** Layers bottom → top, exactly as the owner builds them. Empty = not yet confirmed. */
  layers: readonly string[];
  /** What the finished cup looks like — art direction and alt text. */
  visualSignature: string;
  /** CSS colour for this flavour's accent. */
  accent: string;
  allergens: readonly AllergenId[];
  /** The hero cup (most dramatic cross-section). */
  isHero?: boolean;
  /** Facts still waiting on the owner (brief §10). */
  needsOwnerReview?: boolean;
  reviewNotes?: string;
};

export const FLAVORS: readonly Flavor[] = [
  {
    id: "mango",
    slug: "mango-dream",
    name: "Mango Dream",
    tier: "classic",
    category: "Fruit",
    tagline: "Tropical and bright.",
    description:
      "A graham crumb base, a mango-tinted cream cheese layer and a saffron-orange mango layer, finished with a soft dollop of cream.",
    layers: ["Graham crumb", "Mango-tinted cream cheese", "Mango layer", "Cream dollop"],
    visualSignature: "Saffron-orange mango layer over pale yellow cream, topped with a cream dollop.",
    accent: "var(--color-mango)",
    allergens: ["dairy"],
  },
  {
    id: "strawberry",
    slug: "strawberry-fields",
    name: "Strawberry Fields",
    tier: "classic",
    category: "Fruit",
    tagline: "Summer in a cup.",
    description:
      "A graham crumb base, a blush-pink strawberry cream and a glossy strawberry compote, topped with cream rosettes and strawberry.",
    layers: [
      "Graham crumb",
      "Pink strawberry cream",
      "Glossy strawberry compote",
      "Cream rosettes and strawberry",
    ],
    visualSignature: "Glossy red compote over blush-pink cream, with cream rosettes on top.",
    accent: "var(--color-strawberry)",
    allergens: ["dairy"],
  },
  {
    id: "blueberry",
    slug: "blueberry-haze",
    name: "Blueberry Haze",
    tier: "classic",
    category: "Fruit",
    tagline: "Deep and lush.",
    description:
      "A graham crumb base, a lilac blueberry cream and a deep blueberry compote, finished with fresh blueberries.",
    layers: ["Graham crumb", "Lilac blueberry cream", "Deep blueberry compote", "Fresh blueberries"],
    visualSignature: "Near-black violet compote over lilac cream, topped with fresh blueberries.",
    accent: "var(--color-blueberry)",
    allergens: ["dairy"],
  },
  {
    id: "kinder",
    slug: "kinder-bueno",
    name: "Kinder Bueno",
    tier: "premium",
    category: "Chocolate",
    tagline: "Milk chocolate, silk and crunch.",
    description:
      "A graham crumb base, cream cheese mixed with Kinder chocolate and a glossy Kinder-chocolate ganache, topped with a Kinder Bueno bite and a dusting of crumb.",
    layers: [
      "Graham crumb",
      "Cream cheese with Kinder chocolate",
      "Kinder-chocolate ganache",
      "Kinder Bueno bite and crumb dust",
    ],
    visualSignature: "Milk-chocolate cream under glossy ganache, with a striped chocolate bite on top.",
    accent: "var(--color-kinder)",
    allergens: ["dairy", "tree-nuts"],
  },
  {
    id: "ferrero",
    slug: "ferrero-royale",
    name: "Ferrero Royale",
    tier: "premium",
    category: "Chocolate",
    tagline: "Dark, glossy, hazelnut.",
    description:
      "A graham crumb base, a chocolate-hazelnut cream and a dark ganache, crowned with a Ferrero-style hazelnut ball and crushed hazelnut.",
    layers: [
      "Graham crumb",
      "Chocolate-hazelnut cream",
      "Dark ganache",
      "Ferrero-style hazelnut ball and crushed hazelnut",
    ],
    visualSignature: "Dark glossy ganache crowned with a crunchy hazelnut sphere.",
    accent: "var(--color-ferrero)",
    allergens: ["dairy", "tree-nuts"],
  },
  {
    id: "biscoff",
    slug: "biscoff-bliss",
    name: "Biscoff Bliss",
    tier: "premium",
    category: "Caramel",
    tagline: "Caramel and spice.",
    description:
      "A Biscoff crumb base, Biscoff cream and a melted Biscoff layer, finished with a Biscoff cookie standing upright in a scatter of crumb.",
    layers: ["Biscoff crumb", "Biscoff cream", "Melted Biscoff layer", "Biscoff cookie and crumb"],
    visualSignature: "Caramel-tan cream under an amber top, with a cookie standing upright.",
    accent: "var(--color-biscoff)",
    allergens: ["dairy"],
  },
  {
    id: "dubai",
    slug: "dubai-chocolate",
    name: "Dubai Chocolate",
    tier: "premium",
    category: "Premium",
    tagline: "Pistachio, kunafa and dark chocolate.",
    description:
      "A graham crumb base, pistachio cream, a layer of golden kunafa, more pistachio cream and a dark ganache, finished with a pistachio-paste swirl and crushed pistachio. Some are topped with rose petals.",
    layers: [
      "Graham crumb",
      "Pistachio cream",
      "Kunafa layer",
      "Pistachio cream",
      "Dark ganache",
      "Pistachio-paste swirl and crushed pistachio",
    ],
    visualSignature:
      "Pale green cream with golden kunafa strands mid-cup, dark ganache and a green marbled swirl on top.",
    accent: "var(--color-dubai)",
    allergens: ["dairy", "tree-nuts"],
    isHero: true,
  },
  {
    id: "tiramisu",
    slug: "tiramisu",
    name: "Tiramisu",
    // Tier defaults to Classic until the owner confirms (brief §2.1, §10.1).
    tier: "classic",
    category: "Chocolate",
    tagline: "Cocoa-dusted.",
    description: "A cocoa-dusted tiramisu cup.",
    // Layers deliberately left empty — the brief forbids inventing them.
    layers: [],
    visualSignature: "Matte cocoa-dusted top.",
    accent: "var(--color-tiramisu)",
    allergens: ["dairy"],
    needsOwnerReview: true,
    reviewNotes:
      "Tier and price (defaulted to Classic), layers, filter category (defaulted to Chocolate), and whether it comes as both Mini Shots and Dessert Cups are unconfirmed (brief §10.1). The only photo shows it in a square mini cup (photo D) — use that for art direction, but don't claim the cup shape until sizes are confirmed.",
  },
];

export const CLASSIC_FLAVORS = FLAVORS.filter((f) => f.tier === "classic");
export const PREMIUM_FLAVORS = FLAVORS.filter((f) => f.tier === "premium");

export const HERO_FLAVOR = FLAVORS.find((f) => f.isHero) ?? FLAVORS[0];

export function getFlavorById(id: string): Flavor | undefined {
  return FLAVORS.find((f) => f.id === id);
}

export function getFlavorBySlug(slug: string): Flavor | undefined {
  return FLAVORS.find((f) => f.slug === slug);
}

/** Names of flavours that contain tree nuts, in menu order. */
export function treeNutFlavorNames(): string[] {
  return FLAVORS.filter((f) => f.allergens.includes("tree-nuts")).map((f) => f.name);
}
