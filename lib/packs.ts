/**
 * The three packs (brief §2.2, §2.3). Rule-based perks are built from the
 * pricing rules, so "Mix up to N flavours" can never disagree with what the
 * order form and the API enforce.
 */
import { MIN_CUPS_PER_FLAVOR, maxFlavorsForPack, type CupSize, type PackQty } from "./pricing";

export const CUP_SIZES = [
  { value: "2oz", label: "Mini Shots", sub: "2 oz · tasting size" },
  { value: "5oz", label: "Dessert Cups", sub: "5 oz · full serving" },
] as const satisfies readonly { value: CupSize; label: string; sub: string }[];

/** "Dessert Cups (5 oz)" */
export function cupSizeLabel(size: CupSize): string {
  const s = CUP_SIZES.find((c) => c.value === size)!;
  return `${s.label} (${size.replace("oz", " oz")})`;
}

export const PACK_SIZES = [24, 48, 96] as const satisfies readonly PackQty[];
export const MIN_ORDER_CUPS = Math.min(...PACK_SIZES);

export type Pack = {
  size: PackQty;
  label: string;
  description: string;
  perks: readonly string[];
  featured: boolean;
};

const mixUpTo = (size: PackQty) => `Mix up to ${maxFlavorsForPack(size)} flavours`;
const minPerFlavour = `Minimum ${MIN_CUPS_PER_FLAVOR} cups per flavour`;

export const PACKAGES: readonly Pack[] = [
  {
    size: 24,
    label: "The 24",
    description: "Weekend gatherings, small parties, office treats.",
    // No flavour labels on the cups for now (owner, 2026-10-30).
    perks: [mixUpTo(24), minPerFlavour, "Pickup in Hamilton"],
    featured: false,
  },
  {
    size: 48,
    label: "The 48",
    description: "The most popular size. Built for bigger tables.",
    // No "free flavour recommendation": the owner doesn't offer one (2026-10-30).
    perks: [mixUpTo(48), minPerFlavour, "Pickup in Hamilton", "Priority preparation"],
    featured: true,
  },
  {
    size: 96,
    label: "The 96",
    description: "Weddings, baby showers, corporate events.",
    // The presentation tray is an extra-cost option (owner, 2026-10-30).
    perks: [mixUpTo(96), "Custom label option", "Event day pickup", "Presentation tray (extra cost)", "7 days' notice"],
    featured: false,
  },
];

// Cups come in boxes of 24 with no lids, so a 96 is four boxes (owner, 2026-10-30).
export const PACK_RULES_LINE = `Minimum order ${MIN_ORDER_CUPS} cups · ${minPerFlavour} · Mix Classic and Premium in the same pack · Packed in boxes of 24`;
