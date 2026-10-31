/**
 * "How many cups?": the planning helper in the Packages section.
 *
 * A suggestion, not a rule. The ratios are the ones the page drafts give
 * (content/drafts/bridal-showers.json, corporate.json): about one Dessert Cup
 * per guest when the cups are the dessert, about two Mini Shots per guest
 * alongside a cake or other sweets. The packs are then the fewest cups that
 * cover that, in the fewest packs. Several packs are fine (owner, 2026-10-30).
 */
import { PACKAGES, PACK_SIZES } from "./packs";
import { MENU_PRICES, type CupSize, type PackQty, type Tier } from "./pricing";

export type ServingStyle = "dessert" | "alongside";

export const SERVING_RATIOS = {
  dessert: { size: "5oz", cupsPerGuest: 1 },
  alongside: { size: "2oz", cupsPerGuest: 2 },
} as const satisfies Record<ServingStyle, { size: CupSize; cupsPerGuest: number }>;

export type PackCount = { pack: PackQty; count: number };

export type CupsSuggestion = {
  guests: number;
  size: CupSize;
  /** Guests × the serving ratio. */
  cupsNeeded: number;
  /** Largest pack first. */
  packs: PackCount[];
  totalCups: number;
  /** The largest pack: the one "Order this" opens the form with. */
  lead: PackQty;
  /** Everything after the lead pack, for the order notes. Empty for one pack. */
  rest: PackCount[];
  /** Whole order before delivery, all Classic and all Premium; a mix lands in between. */
  estimate: Record<Tier, number>;
};

/** Typed guests as a whole number: blank, NaN, zero and negatives are none; part-guests round up. */
export function wholeGuests(guests: number): number {
  return Number.isFinite(guests) && guests > 0 ? Math.ceil(guests) : 0;
}

export function cupsNeeded(guests: number, style: ServingStyle): number {
  return wholeGuests(guests) * SERVING_RATIOS[style].cupsPerGuest;
}

// Every pack is a whole number of boxes of 24, and the sizes double (1, 2, 4
// boxes), so taking the largest pack that fits, again and again, gives the
// fewest packs for the fewest boxes.
const BOX = Math.min(...PACK_SIZES);
const LARGEST_FIRST = [...PACK_SIZES].sort((a, b) => b - a);

/**
 * The smallest combination of packs that holds `cups`: the fewest cups first
 * (`cups` rounded up to the next 24, never under one pack), then the fewest
 * packs. Largest pack first; empty when there's nothing to hold.
 */
export function packsFor(cups: number): PackCount[] {
  if (!Number.isFinite(cups) || cups <= 0) return [];
  let boxes = Math.ceil(cups / BOX);
  const out: PackCount[] = [];
  for (const pack of LARGEST_FIRST) {
    const perPack = pack / BOX;
    const count = Math.floor(boxes / perPack);
    if (count > 0) {
      out.push({ pack, count });
      boxes -= count * perPack;
    }
  }
  return out;
}

export function totalCups(packs: readonly PackCount[]): number {
  return packs.reduce((sum, p) => sum + p.pack * p.count, 0);
}

/** The packs left once one of the first (largest) is taken out. */
export function restAfterLead(packs: readonly PackCount[]): PackCount[] {
  return packs
    .map((p, i) => (i === 0 ? { ...p, count: p.count - 1 } : p))
    .filter((p) => p.count > 0);
}

/** The listed pack prices added up, per tier. */
export function packsEstimate(size: CupSize, packs: readonly PackCount[]): Record<Tier, number> {
  const sum = (tier: Tier) => packs.reduce((total, p) => total + MENU_PRICES[size][tier][p.pack] * p.count, 0);
  return { classic: sum("classic"), premium: sum("premium") };
}

export function suggestCups(guests: number, style: ServingStyle): CupsSuggestion | null {
  const cups = cupsNeeded(guests, style);
  const packs = packsFor(cups);
  if (packs.length === 0) return null;
  const { size } = SERVING_RATIOS[style];
  return {
    guests: wholeGuests(guests),
    size,
    cupsNeeded: cups,
    packs,
    totalCups: totalCups(packs),
    lead: packs[0].pack,
    rest: restAfterLead(packs),
    estimate: packsEstimate(size, packs),
  };
}

/** "The 96", from the pack registry. */
export function packName(pack: PackQty): string {
  return PACKAGES.find((p) => p.size === pack)?.label ?? `${pack} cups`;
}

/** "2 × The 96 + The 24" */
export function packsLabel(packs: readonly PackCount[]): string {
  return packs.map((p) => (p.count > 1 ? `${p.count} × ${packName(p.pack)}` : packName(p.pack))).join(" + ");
}

/**
 * "$199", "$4.13", "$1,127": the same output as formatCad in
 * lib/order-summary (a test pins that), without pulling the order schema and
 * zod into pages that have no order form.
 */
export function formatPrice(amount: number): string {
  const cents = Math.round(amount * 100);
  const [dollars, part] = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2).split(".");
  return `$${dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${part ? `.${part}` : ""}`;
}
