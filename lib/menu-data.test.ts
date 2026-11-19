import { describe, expect, it } from "vitest";
import {
  LINEUP_FILTERS,
  accentTint,
  addToBoxHref,
  categoryAndTier,
  filterFlavors,
  flavorPrices,
  formatDollars,
  layerStrengths,
  onlySize,
  otherFlavors,
  pad2,
  tierLabel,
} from "@/components/menu/menu-data";
import { FLAVOR_FAQ_TOPICS, flavorFaqs } from "@/components/menu/flavor-faqs";
import { FLAVORS, getFlavorById } from "./flavors";
import { getDraft } from "./drafts";
import { parseOrderPrefill } from "./order-prefill";
import { MENU_PRICES } from "./pricing";

const tiramisu = getFlavorById("tiramisu")!;
const mango = getFlavorById("mango")!;
const dubai = getFlavorById("dubai")!;

describe("lineup filters", () => {
  it("offers All plus the registry's categories, in the brief's order", () => {
    expect(LINEUP_FILTERS).toEqual(["All", "Fruit", "Chocolate", "Caramel", "Premium"]);
  });

  it("shows every flavour under All, in menu order", () => {
    expect(filterFlavors("All").map((f) => f.id)).toEqual(FLAVORS.map((f) => f.id));
  });

  it("filters by category, and every chip has at least one flavour", () => {
    for (const filter of LINEUP_FILTERS.slice(1).filter((c) => c !== "Premium")) {
      const shown = filterFlavors(filter);
      expect(shown.length, filter).toBeGreaterThan(0);
      for (const f of shown) expect(f.category).toBe(filter);
    }
    expect(filterFlavors("Fruit").map((f) => f.id)).toEqual(["mango", "strawberry", "blueberry"]);
  });

  it("shows the whole Premium tier under Premium, matching the cards' badges", () => {
    const premium = FLAVORS.filter((f) => f.tier === "premium").map((f) => f.id);
    expect(filterFlavors("Premium").map((f) => f.id)).toEqual(premium);
    expect(premium.length).toBe(5);
  });

  it("files every flavour under at least one chip besides All", () => {
    const all = new Set(LINEUP_FILTERS.slice(1).flatMap((c) => filterFlavors(c).map((f) => f.id)));
    expect([...all].sort()).toEqual(FLAVORS.map((f) => f.id).sort());
  });
});

describe("Add to my box links", () => {
  it("carries Tiramisu's only size, 5 oz, so the form opens on Dessert Cups", () => {
    expect(onlySize(tiramisu)).toBe("5oz");
    expect(addToBoxHref(tiramisu)).toBe("/order?size=5oz&flavour=tiramisu");
  });

  it("carries just the flavour for flavours that come in both sizes", () => {
    for (const f of FLAVORS.filter((x) => x.id !== "tiramisu")) {
      expect(onlySize(f), f.id).toBeUndefined();
      expect(addToBoxHref(f)).toBe(`/order?flavour=${f.id}`);
    }
  });

  it("adds a pack when asked", () => {
    expect(addToBoxHref(mango, 48)).toBe("/order?pack=48&flavour=mango");
    expect(addToBoxHref(tiramisu, 96)).toBe("/order?pack=96&size=5oz&flavour=tiramisu");
  });

  it("round-trips through the order form's own parser", () => {
    for (const f of FLAVORS) {
      const prefill = parseOrderPrefill(addToBoxHref(f).split("?")[1]);
      expect(prefill.flavours).toEqual([f.id]);
      expect(prefill.size).toBe(onlySize(f));
    }
  });
});

describe("flavour prices", () => {
  it("lists both sizes for most flavours, at the flavour's tier", () => {
    const rows = flavorPrices(mango);
    expect(rows.map((r) => r.size)).toEqual(["2oz", "5oz"]);
    for (const r of rows) {
      expect(r.cells.map((c) => c.pack)).toEqual([24, 48, 96]);
      for (const c of r.cells) {
        expect(c.packPrice).toBe(MENU_PRICES[r.size].classic[c.pack]);
        expect(c.perCup).toBeCloseTo(c.packPrice / c.pack, 10);
      }
    }
  });

  it("lists only Dessert Cups for Tiramisu, at Premium prices", () => {
    const rows = flavorPrices(tiramisu);
    expect(rows.map((r) => r.size)).toEqual(["5oz"]);
    expect(rows[0].label).toBe("Dessert Cups");
    expect(rows[0].cells.map((c) => c.packPrice)).toEqual([129, 259, 499]);
  });

  it("uses Premium prices for Premium flavours", () => {
    expect(flavorPrices(dubai)[0].cells[0].packPrice).toBe(MENU_PRICES["2oz"].premium[24]);
  });
});

describe("formatting", () => {
  it("prints whole dollars bare and cents to two places", () => {
    expect(formatDollars(45)).toBe("$45");
    expect(formatDollars(1.875)).toBe("$1.88");
    expect(formatDollars(259 / 48)).toBe("$5.40");
    expect(formatDollars(1.75)).toBe("$1.75");
  });

  it("pads indexes and names tiers", () => {
    expect(pad2(1)).toBe("01");
    expect(pad2(12)).toBe("12");
    expect(tierLabel(mango)).toBe("Classic");
    expect(tierLabel(dubai)).toBe("Premium");
  });

  it("says the category and tier once each, and once when they match", () => {
    expect(categoryAndTier(mango)).toBe("Fruit · Classic");
    expect(categoryAndTier(tiramisu)).toBe("Chocolate · Premium");
    expect(categoryAndTier(dubai)).toBe("Premium");
  });
});

describe("accent tints", () => {
  it("mixes the accent into the page cream, clamped to 0–100%", () => {
    expect(accentTint("var(--color-mango)", 10)).toBe("color-mix(in srgb, var(--color-mango) 10%, var(--color-cream))");
    expect(accentTint("#000", 140, "#fff")).toBe("color-mix(in srgb, #000 100%, #fff)");
    expect(accentTint("#000", -5)).toContain(" 0%,");
  });

  it("shades the cross-section from a strong base to a light top", () => {
    const s = layerStrengths(6);
    expect(s).toHaveLength(6);
    expect(s[0]).toBe(72);
    expect(s[5]).toBe(18);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeLessThan(s[i - 1]);
    expect(layerStrengths(1)).toEqual([45]);
    expect(layerStrengths(0)).toEqual([]);
  });

  it("has a band for every layer of every flavour", () => {
    for (const f of FLAVORS) expect(layerStrengths(f.layers.length)).toHaveLength(f.layers.length);
  });
});

describe("other flavours", () => {
  it("lists every flavour but this one, in menu order", () => {
    const others = otherFlavors(dubai);
    expect(others).toHaveLength(FLAVORS.length - 1);
    expect(others.map((f) => f.id)).not.toContain("dubai");
    expect(others.map((f) => f.id)).toEqual(FLAVORS.filter((f) => f.id !== "dubai").map((f) => f.id));
  });
});

describe("flavour page FAQs", () => {
  it("picks the allergen, storage and flavours-per-pack answers from the FAQ draft", () => {
    const faqs = flavorFaqs();
    expect(faqs).toHaveLength(FLAVOR_FAQ_TOPICS.length);
    expect(faqs[0].q).toMatch(/nuts/i);
    expect(faqs[1].q).toMatch(/dairy/i);
    expect(faqs[2].q).toMatch(/fridge/i);
    expect(faqs[3].q).toMatch(/how many flavours/i);
    const draft = getDraft("faq")!;
    for (const f of faqs) expect(draft.faqs).toContainEqual(f);
  });

  it("drops an answer that needs the dietary claim when the claim is off", () => {
    const draft = {
      faqs: [
        { q: "Which flavours contain nuts?", a: "Three. {{dietaryClaim}}" },
        { q: "Do all your dessert cups contain dairy?", a: "Yes." },
      ],
    };
    const off = { contactEmail: "x@example.com", mailto: "mailto:x@example.com", dietaryClaim: null };
    expect(flavorFaqs(draft, off).map((f) => f.a)).toEqual(["Yes."]);
  });

  it("returns nothing without a draft, and skips topics the draft lacks", () => {
    expect(flavorFaqs(null)).toEqual([]);
    expect(flavorFaqs({ faqs: [{ q: "Do the cups need to stay in the fridge?", a: "Yes." }] })).toHaveLength(1);
  });
});
