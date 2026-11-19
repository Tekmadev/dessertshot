import { describe, expect, it } from "vitest";
import {
  MENU_PRICES,
  MIN_CUPS_PER_FLAVOR,
  calcMixTotal,
  maxFlavorsForPack,
  perCupPrice,
  type CupSize,
  type PackQty,
  type Tier,
} from "./pricing";

// The price table from the brief (§2.2), copied as literals on purpose: if
// MENU_PRICES ever drifts from what the owner charges, this test fails.
const BRIEF_TABLE: Record<CupSize, Record<Tier, Record<PackQty, number>>> = {
  "2oz": {
    classic: { 24: 45, 48: 88, 96: 168 },
    premium: { 24: 58, 48: 115, 96: 215 },
  },
  "5oz": {
    classic: { 24: 99, 48: 199, 96: 379 },
    premium: { 24: 129, 48: 259, 96: 499 },
  },
};

const SIZES: CupSize[] = ["2oz", "5oz"];
const TIERS: Tier[] = ["classic", "premium"];
const QTYS: PackQty[] = [24, 48, 96];
const CELLS = SIZES.flatMap((size) =>
  TIERS.flatMap((tier) => QTYS.map((qty) => ({ size, tier, qty, price: BRIEF_TABLE[size][tier][qty] })))
);

describe("price table (brief §2.2)", () => {
  it("covers all 12 cells", () => {
    expect(CELLS).toHaveLength(12);
  });

  it.each(CELLS)("$size $tier ×$qty is $$price", ({ size, tier, qty, price }) => {
    expect(MENU_PRICES[size][tier][qty]).toBe(price);
  });

  it.each(CELLS)("a full single-tier $size $tier ×$qty box totals exactly $$price", ({ size, tier, qty, price }) => {
    expect(calcMixTotal(size, qty, [{ tier, count: qty }])).toBe(price);
  });

  it("has no extra sizes, tiers or pack quantities", () => {
    expect(Object.keys(MENU_PRICES).sort()).toEqual(["2oz", "5oz"]);
    for (const size of SIZES) {
      expect(Object.keys(MENU_PRICES[size]).sort()).toEqual(["classic", "premium"]);
      for (const tier of TIERS) {
        expect(Object.keys(MENU_PRICES[size][tier]).map(Number).sort((a, b) => a - b)).toEqual([24, 48, 96]);
      }
    }
  });
});

describe("per-cup rates", () => {
  it("shows the 24-pack Dessert Cup rates the brief quotes ($4.13 / $5.38)", () => {
    expect(perCupPrice("5oz", "classic", 24).toFixed(2)).toBe("4.13");
    expect(perCupPrice("5oz", "premium", 24).toFixed(2)).toBe("5.38");
  });

  it("is lowest at 96 for every size and tier", () => {
    for (const size of SIZES)
      for (const tier of TIERS) {
        expect(perCupPrice(size, tier, 96)).toBeLessThan(perCupPrice(size, tier, 24));
        expect(perCupPrice(size, tier, 96)).toBeLessThan(perCupPrice(size, tier, 48));
      }
  });

  // Recorded, not endorsed: prices are preserved exactly as instructed, but at
  // 5 oz the 48-pack costs slightly more per cup than the 24-pack. Copy must
  // therefore never claim "the bigger the pack, the better the value".
  it("documents that at 5 oz the 48-pack per-cup rate is above the 24-pack", () => {
    expect(perCupPrice("5oz", "classic", 48)).toBeGreaterThan(perCupPrice("5oz", "classic", 24));
    expect(perCupPrice("5oz", "premium", 48)).toBeGreaterThan(perCupPrice("5oz", "premium", 24));
  });
});

describe("mixed Classic + Premium boxes (rounded to the nearest dollar)", () => {
  const cases: { size: CupSize; qty: PackQty; classic: number; premium: number; total: number }[] = [
    { size: "5oz", qty: 24, classic: 12, premium: 12, total: 114 },
    { size: "5oz", qty: 24, classic: 18, premium: 6, total: 107 }, // 106.5 rounds up
    { size: "2oz", qty: 48, classic: 24, premium: 24, total: 102 }, // 101.5 rounds up
    { size: "2oz", qty: 24, classic: 6, premium: 18, total: 55 },
    { size: "5oz", qty: 48, classic: 30, premium: 18, total: 222 },
    { size: "5oz", qty: 96, classic: 48, premium: 48, total: 439 },
    { size: "5oz", qty: 96, classic: 90, premium: 6, total: 387 },
    { size: "2oz", qty: 96, classic: 6, premium: 90, total: 212 },
  ];

  it.each(cases)("$size ×$qty: $classic classic + $premium premium = $$total", ({ size, qty, classic, premium, total }) => {
    const items = [
      { tier: "classic" as const, count: classic },
      { tier: "premium" as const, count: premium },
    ];
    expect(calcMixTotal(size, qty, items)).toBe(total);
  });

  it("does not depend on item order", () => {
    const a = calcMixTotal("5oz", 48, [
      { tier: "classic", count: 30 },
      { tier: "premium", count: 18 },
    ]);
    const b = calcMixTotal("5oz", 48, [
      { tier: "premium", count: 18 },
      { tier: "classic", count: 30 },
    ]);
    expect(a).toBe(b);
  });

  it("always lands between the all-Classic and all-Premium prices", () => {
    for (const size of SIZES)
      for (const qty of QTYS)
        for (let premium = 0; premium <= qty; premium += MIN_CUPS_PER_FLAVOR) {
          const total = calcMixTotal(size, qty, [
            { tier: "classic", count: qty - premium },
            { tier: "premium", count: premium },
          ]);
          expect(total).toBeGreaterThanOrEqual(MENU_PRICES[size].classic[qty]);
          expect(total).toBeLessThanOrEqual(MENU_PRICES[size].premium[qty]);
        }
  });
});

describe("mix-and-match rules (brief §2.3)", () => {
  it("requires at least 6 cups per flavour", () => {
    expect(MIN_CUPS_PER_FLAVOR).toBe(6);
  });

  it.each([
    [24, 4],
    [48, 8],
    [96, 16],
  ] as const)("a %i pack holds at most %i flavours", (qty, max) => {
    expect(maxFlavorsForPack(qty)).toBe(max);
  });
});
