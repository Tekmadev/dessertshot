/**
 * Pricing — the single authoritative source for every price on the site.
 *
 * The table below is copied verbatim from the live site (brief §2.2) and must
 * not drift. `lib/pricing.test.ts` pins every cell. The order API recomputes
 * the total with these same functions server-side, so a tampered client total
 * is never trusted.
 */

// Pricing structure: cup size → tier → pack quantity → price (CAD).
// 2oz = Mini Shots (tasting size), 5oz = Dessert Cups (full serving).
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

// ── Mix-and-match rules ──
// Flavours are produced in batches, so every flavour in a pack must be ordered
// in multiples of this minimum. A 24 pack therefore holds at most 4 flavours,
// a 48 holds 8, a 96 holds 16. Want more flavours? Order another pack.
export const MIN_CUPS_PER_FLAVOR = 6;

// Largest number of distinct flavours a pack can hold (pack size ÷ minimum).
export function maxFlavorsForPack(packQty: PackQty): number {
  return packQty / MIN_CUPS_PER_FLAVOR;
}

// Per-cup price for a tier at a given cup size and pack quantity. Derived from
// the pack price so the volume discount tracks the pack size and a single-tier
// pack always totals exactly its listed price.
export function perCupPrice(cupSize: CupSize, tier: Tier, packQty: PackQty): number {
  return MENU_PRICES[cupSize][tier][packQty] / packQty;
}

export type MixItem = { tier: Tier; count: number };

// Smart mixed-pack total: each cup is priced by its own tier at the pack's
// volume rate, summed across the mix, then rounded to the nearest dollar.
export function calcMixTotal(
  cupSize: CupSize,
  packQty: PackQty,
  items: MixItem[]
): number {
  const total = items.reduce(
    (sum, item) => sum + item.count * perCupPrice(cupSize, item.tier, packQty),
    0
  );
  return Math.round(total);
}
