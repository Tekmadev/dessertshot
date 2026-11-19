/**
 * The eight flavours — written from the owner's real recipes (brief §2.1).
 * This registry drives the menu, flavour pages, order form, structured data
 * and alt text. `lib/flavors.test.ts` guards it against drift.
 *
 * Brand names (Kinder, Ferrero, Biscoff) appear as plain-text flavour names
 * only — never logos, wrappers or packaging (brief §2.4).
 */
import type { AllergenId } from "./claims";
import type { CupSize, Tier } from "./pricing";

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
  /** Search description for /menu/[slug] (lib/routes.ts): 160 characters at most, facts from this entry only. */
  seoDescription: string;
  /** Layers bottom → top, exactly as the owner builds them. Empty = not yet confirmed. */
  layers: readonly string[];
  /** What the finished cup looks like — art direction and alt text. */
  visualSignature: string;
  /** CSS colour for this flavour's accent. */
  accent: string;
  allergens: readonly AllergenId[];
  /** Cup sizes it comes in; omitted means both. */
  sizes?: readonly CupSize[];
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
    seoDescription:
      "Mango Dream dessert cups: graham crumb, mango-tinted cream cheese and a mango layer under a cream dollop. Classic, in packs of 24, 48 or 96, made in Hamilton.",
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
    seoDescription:
      "Strawberry Fields dessert cups: graham crumb, pink strawberry cream and compote under cream rosettes. Classic, in packs of 24, 48 or 96, made in Hamilton.",
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
    seoDescription:
      "Blueberry Haze dessert cups: graham crumb, lilac blueberry cream and deep compote with fresh blueberries. Classic, in packs of 24, 48 or 96, made in Hamilton.",
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
    seoDescription:
      "Kinder Bueno dessert cups: Kinder chocolate cream cheese and ganache on graham crumb, topped with a Kinder Bueno bite. Premium, in packs of 24, 48 or 96.",
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
    seoDescription:
      "Ferrero Royale dessert cups: chocolate-hazelnut cream and dark ganache, crowned with a hazelnut ball. Premium, in packs of 24, 48 or 96, made in Hamilton.",
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
    seoDescription:
      "Biscoff dessert cups: Biscoff crumb and cream under a melted Biscoff layer, topped with a Biscoff cookie. Premium, in packs of 24, 48 or 96, made in Hamilton.",
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
    seoDescription:
      "Dubai Chocolate dessert cups: pistachio cream, golden kunafa and dark ganache with a pistachio swirl. Premium, in packs of 24, 48 or 96, made in Hamilton.",
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
    // Owner, 2026-10-30: Premium, Dessert Cups (5 oz) only, layered like a
    // typical tiramisu. Layers are named generically on purpose: a typical
    // tiramisu uses ladyfingers (wheat, egg), which the gluten-free and
    // eggless claim can't cover until the owner confirms (CONTENT-REVIEW.md).
    tier: "premium",
    category: "Chocolate",
    tagline: "Cocoa-dusted.",
    seoDescription:
      "Tiramisu dessert cups: coffee-soaked layers and tiramisu cream under a cocoa dusting. Premium, 5 oz Dessert Cups in packs of 24, 48 or 96, made in Hamilton.",
    description: "Tiramisu layered the traditional way, coffee-soaked layers between cream, finished with a cocoa dusting.",
    layers: ["Coffee-soaked layer", "Tiramisu cream", "Coffee-soaked layer", "Tiramisu cream", "Cocoa dusting"],
    visualSignature: "Square cup, matte cocoa-dusted top with a light sprinkle of sugar.",
    accent: "var(--color-tiramisu)",
    allergens: ["dairy"],
    sizes: ["5oz"],
    needsOwnerReview: true,
    reviewNotes:
      "Tier, size and layer style confirmed by the owner (2026-10-30). Still open: what the coffee-soaked layer is made of, whether the gluten-free and eggless claim holds for it, its allergens beyond dairy (q-d-other-allergens), and its filter category (defaulted to Chocolate) (CONTENT-REVIEW.md).",
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

/** Whether a flavour comes in this cup size (Tiramisu is Dessert Cups only). */
export function comesInSize(f: Pick<Flavor, "sizes">, size: CupSize): boolean {
  return !f.sizes || f.sizes.includes(size);
}

/** "Dessert Cups (5 oz) only", or null when it comes in both sizes. */
export function sizeNote(f: Pick<Flavor, "sizes">): string | null {
  if (!f.sizes || f.sizes.length !== 1) return null;
  return f.sizes[0] === "5oz" ? "Dessert Cups (5 oz) only" : "Mini Shots (2 oz) only";
}

/** Names of flavours that contain tree nuts, in menu order. */
export function treeNutFlavorNames(): string[] {
  return FLAVORS.filter((f) => f.allergens.includes("tree-nuts")).map((f) => f.name);
}
