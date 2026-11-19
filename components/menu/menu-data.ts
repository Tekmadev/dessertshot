/**
 * Pure helpers shared by the homepage lineup, /menu and /menu/[slug]. Client
 * safe: no drafts or server-only imports here (the FAQ picker lives in
 * flavor-faqs.ts so the draft JSON stays out of the client bundle).
 * lib/menu-data.test.ts covers every function.
 */
import { FLAVORS, comesInSize, type Flavor, type FlavorCategory } from "@/lib/flavors";
import { orderHref } from "@/lib/order-prefill";
import { CUP_SIZES, PACK_SIZES } from "@/lib/packs";
import { MENU_PRICES, perCupPrice, type CupSize, type PackQty } from "@/lib/pricing";

export type LineupFilter = "All" | FlavorCategory;

/** "All" plus each category in the order the registry first uses it. */
export const LINEUP_FILTERS: readonly LineupFilter[] = [
  "All",
  ...FLAVORS.map((f) => f.category).filter((c, i, all) => all.indexOf(c) === i),
];

/**
 * "Premium" means the Premium tier, as on every card's badge and in the FAQ's
 * list of five, not just the one flavour whose category is "Premium" (Dubai).
 */
export function filterFlavors(filter: LineupFilter, flavors: readonly Flavor[] = FLAVORS): Flavor[] {
  if (filter === "All") return [...flavors];
  if (filter === "Premium") return flavors.filter((f) => f.tier === "premium");
  return flavors.filter((f) => f.category === filter);
}

/** The one size a flavour comes in, or undefined when it comes in both. */
export function onlySize(f: Pick<Flavor, "sizes">): CupSize | undefined {
  return f.sizes?.length === 1 ? f.sizes[0] : undefined;
}

/**
 * "Add to my box": /order with this flavour preselected. A single-size flavour
 * (Tiramisu, Dessert Cups only) also carries its size so the form opens on it.
 */
export function addToBoxHref(f: Pick<Flavor, "id" | "sizes">, pack?: PackQty): string {
  return orderHref({ pack, size: onlySize(f), flavours: [f.id] });
}

export function tierLabel(f: Pick<Flavor, "tier">): "Classic" | "Premium" {
  return f.tier === "premium" ? "Premium" : "Classic";
}

/** "Fruit · Classic"; just "Premium" when the category and tier say the same thing (Dubai). */
export function categoryAndTier(f: Pick<Flavor, "category" | "tier">): string {
  const tier = tierLabel(f);
  return f.category === tier ? tier : `${f.category} · ${tier}`;
}

export type PriceCell = { pack: PackQty; packPrice: number; perCup: number };
export type SizePrices = { size: CupSize; label: string; sub: string; cells: PriceCell[] };

/** Pack and per-cup prices for each size the flavour comes in, at its tier. */
export function flavorPrices(f: Pick<Flavor, "tier" | "sizes">): SizePrices[] {
  return CUP_SIZES.filter((s) => comesInSize(f, s.value)).map((s) => ({
    size: s.value,
    label: s.label,
    sub: s.sub,
    cells: PACK_SIZES.map((pack) => ({
      pack,
      packPrice: MENU_PRICES[s.value][f.tier][pack],
      perCup: perCupPrice(s.value, f.tier, pack),
    })),
  }));
}

/** "$45" for whole dollars, "$1.88" otherwise. */
export function formatDollars(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** "01" */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The flavour's accent mixed into the page cream: a tint dark enough to read
 * as the flavour, light enough that ink text keeps AA contrast on it.
 */
export function accentTint(accent: string, percent: number, base = "var(--color-cream)"): string {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  return `color-mix(in srgb, ${accent} ${p}%, ${base})`;
}

/**
 * Accent strength for each band of the cross-section diagram, bottom layer
 * first: strongest at the base, lightest on top. Decorative only.
 */
export function layerStrengths(count: number, bottom = 72, top = 18): number[] {
  if (count <= 0) return [];
  if (count === 1) return [Math.round((bottom + top) / 2)];
  return Array.from({ length: count }, (_, i) => Math.round(bottom - ((bottom - top) * i) / (count - 1)));
}

/** Every other flavour, in menu order. */
export function otherFlavors(f: Pick<Flavor, "id">, flavors: readonly Flavor[] = FLAVORS): Flavor[] {
  return flavors.filter((x) => x.id !== f.id);
}
