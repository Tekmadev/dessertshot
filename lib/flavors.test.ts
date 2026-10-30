import { describe, expect, it } from "vitest";
import {
  CLASSIC_FLAVORS,
  FLAVORS,
  HERO_FLAVOR,
  PREMIUM_FLAVORS,
  getFlavorById,
  getFlavorBySlug,
  treeNutFlavorNames,
} from "./flavors";
import { ALLERGEN_NOTICE, DIETARY_CLAIM, allergenNoticeText } from "./claims";

describe("flavour registry (brief §2.1)", () => {
  it("has the eight flavours, in menu order", () => {
    expect(FLAVORS.map((f) => f.name)).toEqual([
      "Mango Dream",
      "Strawberry Fields",
      "Blueberry Haze",
      "Kinder Bueno",
      "Ferrero Royale",
      "Biscoff Bliss",
      "Dubai Chocolate",
      "Tiramisu",
    ]);
  });

  it("uses unique ids and slugs", () => {
    expect(new Set(FLAVORS.map((f) => f.id)).size).toBe(FLAVORS.length);
    expect(new Set(FLAVORS.map((f) => f.slug)).size).toBe(FLAVORS.length);
    for (const f of FLAVORS) expect(f.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("assigns the brief's tiers (Tiramisu defaults to Classic)", () => {
    expect(CLASSIC_FLAVORS.map((f) => f.id)).toEqual(["mango", "strawberry", "blueberry", "tiramisu"]);
    expect(PREMIUM_FLAVORS.map((f) => f.id)).toEqual(["kinder", "ferrero", "biscoff", "dubai"]);
  });

  it("builds every confirmed cup on graham crumb, except Biscoff on Biscoff crumb", () => {
    for (const f of FLAVORS.filter((x) => x.layers.length > 0)) {
      expect(f.layers[0]).toBe(f.id === "biscoff" ? "Biscoff crumb" : "Graham crumb");
    }
  });

  it("gives Dubai Chocolate its kunafa layer between two pistachio creams", () => {
    const dubai = getFlavorById("dubai")!;
    expect(dubai.layers).toEqual([
      "Graham crumb",
      "Pistachio cream",
      "Kunafa layer",
      "Pistachio cream",
      "Dark ganache",
      "Pistachio-paste swirl and crushed pistachio",
    ]);
  });

  it("makes Dubai Chocolate the hero cup", () => {
    expect(HERO_FLAVOR.id).toBe("dubai");
    expect(FLAVORS.filter((f) => f.isHero)).toHaveLength(1);
  });

  it("does not claim fresh mango cubes (the photos show a cream dollop)", () => {
    const mango = getFlavorById("mango")!;
    const text = [mango.description, mango.tagline, ...mango.layers].join(" ").toLowerCase();
    expect(text).not.toMatch(/cube/);
    expect(mango.layers.at(-1)).toBe("Cream dollop");
  });

  it("leaves Tiramisu's layers empty and flags it for the owner", () => {
    const tiramisu = getFlavorBySlug("tiramisu")!;
    expect(tiramisu.layers).toEqual([]);
    expect(tiramisu.needsOwnerReview).toBe(true);
    expect(tiramisu.description.toLowerCase()).toContain("cocoa-dusted tiramisu cup");
  });

  // Registry only; lib/copy.test.ts scans the copy and every component.
  it("removes the old, wrong biscuit copy from the registry", () => {
    const banned = [/brown butter/i, /vanilla biscuit/i, /hazelnut biscuit/i, /hazelnut crunch/i, /mascarpone/i, /nutella/i, /kataifi/i, /gold dust/i, /\bgold\b/i];
    for (const f of FLAVORS) {
      const text = [f.name, f.tagline, f.description, f.visualSignature, ...f.layers].join(" ");
      for (const pattern of banned) expect(text, `${f.name} matches ${pattern}`).not.toMatch(pattern);
    }
  });

  it("makes no medical claims or unverifiable superlatives", () => {
    const banned = [/certified/i, /celiac/i, /coeliac/i, /allergy[- ]safe/i, /\bbest\b/i, /#1/, /number one/i];
    for (const f of FLAVORS) {
      const text = [f.tagline, f.description, f.visualSignature].join(" ");
      for (const pattern of banned) expect(text, `${f.name} matches ${pattern}`).not.toMatch(pattern);
    }
  });
});

describe("allergens and claims (brief §2.4)", () => {
  it("flags dairy on every flavour", () => {
    for (const f of FLAVORS) expect(f.allergens, f.name).toContain("dairy");
  });

  it("flags tree nuts on exactly Kinder, Ferrero and Dubai", () => {
    expect(FLAVORS.filter((f) => f.allergens.includes("tree-nuts")).map((f) => f.id).sort()).toEqual([
      "dubai",
      "ferrero",
      "kinder",
    ]);
    expect(treeNutFlavorNames()).toEqual(["Kinder Bueno", "Ferrero Royale", "Dubai Chocolate"]);
  });

  it("keeps the dietary claim owner-worded and free of medical language", () => {
    expect(DIETARY_CLAIM.text).toBe("Gluten-free and eggless");
    expect(DIETARY_CLAIM.needsOwnerReview).toBe(true);
    expect(DIETARY_CLAIM.text).not.toMatch(/certified|celiac|coeliac|safe/i);
  });

  it("builds the notice from the registry's tree-nut list", () => {
    const text = allergenNoticeText(treeNutFlavorNames());
    expect(text).toContain("Every cup contains dairy.");
    expect(text).toContain("Kinder Bueno, Ferrero Royale and Dubai Chocolate contain tree nuts");
    expect(text).not.toMatch(/certified|celiac|guarantee/i);
    expect(ALLERGEN_NOTICE.needsOwnerReview).toBe(true);
  });
});
