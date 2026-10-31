import { describe, expect, it } from "vitest";
import {
  SERVING_RATIOS,
  cupsNeeded,
  formatPrice,
  packName,
  packsEstimate,
  packsFor,
  packsLabel,
  restAfterLead,
  suggestCups,
  totalCups,
  wholeGuests,
  type PackCount,
} from "./cups-helper";
import { formatCad } from "./order-summary";
import { PACKAGES, PACK_SIZES } from "./packs";
import { MENU_PRICES, perCupPrice, type CupSize, type PackQty, type Tier } from "./pricing";

describe("serving ratios (the page drafts' suggestion)", () => {
  it("is one Dessert Cup per guest as the dessert, two Mini Shots alongside other sweets", () => {
    expect(SERVING_RATIOS.dessert).toEqual({ size: "5oz", cupsPerGuest: 1 });
    expect(SERVING_RATIOS.alongside).toEqual({ size: "2oz", cupsPerGuest: 2 });
  });
});

describe("wholeGuests / cupsNeeded", () => {
  it("treats blank, zero, negative and non-numbers as no guests", () => {
    for (const g of [0, -1, -40, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(wholeGuests(g)).toBe(0);
      expect(cupsNeeded(g, "dessert")).toBe(0);
    }
  });

  it("rounds part-guests up", () => {
    expect(wholeGuests(0.2)).toBe(1);
    expect(wholeGuests(24.5)).toBe(25);
  });

  it("applies the ratio", () => {
    expect(cupsNeeded(30, "dessert")).toBe(30);
    expect(cupsNeeded(30, "alongside")).toBe(60);
  });
});

// Fewest cups, then fewest packs, by brute force over every combination.
function bruteForce(cups: number): { total: number; packs: number } {
  let best = { total: Infinity, packs: Infinity };
  for (let a = 0; a * 96 < cups + 96; a++)
    for (let b = 0; a * 96 + b * 48 < cups + 48; b++)
      for (let c = 0; a * 96 + b * 48 + c * 24 < cups + 24; c++) {
        const total = a * 96 + b * 48 + c * 24;
        const packs = a + b + c;
        if (total < cups || packs === 0) continue;
        if (total < best.total || (total === best.total && packs < best.packs)) best = { total, packs };
      }
  return best;
}

describe("packsFor", () => {
  const counts = (cups: number) => packsFor(cups).map((p) => [p.pack, p.count]);

  it("is empty when there's nothing to hold", () => {
    expect(packsFor(0)).toEqual([]);
    expect(packsFor(-5)).toEqual([]);
    expect(packsFor(Number.NaN)).toEqual([]);
  });

  it("never goes under one pack (the minimum order)", () => {
    expect(counts(1)).toEqual([[24, 1]]);
  });

  it("fits exact packs exactly", () => {
    expect(counts(24)).toEqual([[24, 1]]);
    expect(counts(48)).toEqual([[48, 1]]);
    expect(counts(96)).toEqual([[96, 1]]);
  });

  it("rounds up to the next 24 rather than the next pack", () => {
    expect(counts(25)).toEqual([[48, 1]]);
    expect(counts(72)).toEqual([[48, 1], [24, 1]]);
    expect(counts(97)).toEqual([[96, 1], [24, 1]]);
  });

  it("uses several packs, largest first", () => {
    expect(counts(200)).toEqual([[96, 2], [24, 1]]);
    expect(counts(400)).toEqual([[96, 4], [24, 1]]);
  });

  it("matches a brute-force search for the fewest cups, then the fewest packs", () => {
    for (let cups = 1; cups <= 600; cups++) {
      const packs = packsFor(cups);
      const best = bruteForce(cups);
      expect(totalCups(packs), `${cups} cups`).toBe(best.total);
      expect(packs.reduce((n, p) => n + p.count, 0), `${cups} cups`).toBe(best.packs);
    }
  });

  it("only uses packs that exist", () => {
    for (let cups = 1; cups <= 300; cups++) {
      for (const p of packsFor(cups)) expect(PACK_SIZES).toContain(p.pack);
    }
  });
});

describe("restAfterLead", () => {
  it("takes one of the largest pack out", () => {
    expect(restAfterLead([{ pack: 96, count: 2 }, { pack: 24, count: 1 }])).toEqual([
      { pack: 96, count: 1 },
      { pack: 24, count: 1 },
    ]);
    expect(restAfterLead([{ pack: 48, count: 1 }, { pack: 24, count: 1 }])).toEqual([{ pack: 24, count: 1 }]);
    expect(restAfterLead([{ pack: 24, count: 1 }])).toEqual([]);
  });
});

describe("packsEstimate", () => {
  it("adds up the listed pack prices per tier", () => {
    const packs: PackCount[] = [{ pack: 96, count: 2 }, { pack: 24, count: 1 }];
    expect(packsEstimate("5oz", packs)).toEqual({
      classic: 2 * MENU_PRICES["5oz"].classic[96] + MENU_PRICES["5oz"].classic[24],
      premium: 2 * MENU_PRICES["5oz"].premium[96] + MENU_PRICES["5oz"].premium[24],
    });
  });
});

describe("suggestCups", () => {
  it("has no suggestion for zero or negative guests", () => {
    expect(suggestCups(0, "dessert")).toBeNull();
    expect(suggestCups(-3, "alongside")).toBeNull();
    expect(suggestCups(Number.NaN, "dessert")).toBeNull();
  });

  it("suggests one 24 for a single guest, either way", () => {
    expect(suggestCups(1, "dessert")).toMatchObject({ size: "5oz", cupsNeeded: 1, totalCups: 24, lead: 24, rest: [] });
    expect(suggestCups(1, "alongside")).toMatchObject({ size: "2oz", cupsNeeded: 2, totalCups: 24, lead: 24, rest: [] });
  });

  it("fits exactly 24 guests", () => {
    expect(suggestCups(24, "dessert")).toMatchObject({ cupsNeeded: 24, totalCups: 24, packs: [{ pack: 24, count: 1 }] });
    expect(suggestCups(24, "alongside")).toMatchObject({ cupsNeeded: 48, totalCups: 48, packs: [{ pack: 48, count: 1 }] });
  });

  it("moves 25 guests up to the 48", () => {
    expect(suggestCups(25, "dessert")).toMatchObject({ cupsNeeded: 25, totalCups: 48, lead: 48, rest: [] });
    expect(suggestCups(25, "alongside")).toMatchObject({ cupsNeeded: 50, totalCups: 72, lead: 48, rest: [{ pack: 24, count: 1 }] });
  });

  it("covers 200 guests with several packs and keeps the rest for the notes", () => {
    const dessert = suggestCups(200, "dessert")!;
    expect(dessert).toMatchObject({
      guests: 200,
      size: "5oz",
      cupsNeeded: 200,
      totalCups: 216,
      lead: 96,
      packs: [{ pack: 96, count: 2 }, { pack: 24, count: 1 }],
      rest: [{ pack: 96, count: 1 }, { pack: 24, count: 1 }],
    });
    expect(dessert.estimate).toEqual(packsEstimate("5oz", dessert.packs));

    const alongside = suggestCups(200, "alongside")!;
    expect(alongside).toMatchObject({ size: "2oz", cupsNeeded: 400, totalCups: 408, lead: 96 });
    expect(alongside.packs).toEqual([{ pack: 96, count: 4 }, { pack: 24, count: 1 }]);
  });

  it("always covers the cups needed with less than one extra box", () => {
    for (let guests = 1; guests <= 300; guests++) {
      for (const style of ["dessert", "alongside"] as const) {
        const s = suggestCups(guests, style)!;
        expect(s.totalCups).toBeGreaterThanOrEqual(s.cupsNeeded);
        expect(s.totalCups - s.cupsNeeded).toBeLessThan(24);
      }
    }
  });
});

describe("labels", () => {
  it("names packs from the registry", () => {
    for (const p of PACKAGES) expect(packName(p.size)).toBe(p.label);
  });

  it("lists packs largest first, counting repeats", () => {
    expect(packsLabel([{ pack: 48, count: 1 }])).toBe("The 48");
    expect(packsLabel([{ pack: 96, count: 2 }, { pack: 24, count: 1 }])).toBe("2 × The 96 + The 24");
  });
});

describe("formatPrice", () => {
  it("formats like formatCad", () => {
    expect(formatPrice(199)).toBe("$199");
    expect(formatPrice(4.125)).toBe("$4.13");
    expect(formatPrice(1127)).toBe("$1,127");
    expect(formatPrice(1234567)).toBe("$1,234,567");
  });

  it("matches formatCad for every per-cup price and pack total", () => {
    const sizes: CupSize[] = ["2oz", "5oz"];
    const tiers: Tier[] = ["classic", "premium"];
    const qtys: PackQty[] = [24, 48, 96];
    for (const size of sizes)
      for (const tier of tiers)
        for (const qty of qtys) {
          const each = perCupPrice(size, tier, qty);
          expect(formatPrice(each)).toBe(formatCad(each));
          expect(formatPrice(MENU_PRICES[size][tier][qty])).toBe(formatCad(MENU_PRICES[size][tier][qty]));
        }
  });
});
