import { describe, expect, it } from "vitest";
import { fitItemsToPack, hasPrefill, itemsForSize, orderHref, parseOrderPrefill, prefilledItems } from "./order-prefill";

describe("parseOrderPrefill", () => {
  it("reads every supported choice from a deep link", () => {
    expect(parseOrderPrefill("?pack=48&size=5oz&flavour=dubai,biscoff&event=wedding")).toEqual({
      pack: 48,
      size: "5oz",
      flavours: ["dubai", "biscoff"],
      event: "wedding",
    });
  });

  it("accepts flavour slugs, event page slugs and the US spelling", () => {
    expect(parseOrderPrefill("flavor=dubai-chocolate&event=celebrations")).toEqual({
      flavours: ["dubai"],
      event: "cultural",
    });
  });

  it("ignores anything it doesn't recognise", () => {
    expect(parseOrderPrefill("pack=12&size=8oz&flavour=lemon,,dubai,dubai&event=rave&utm_source=ig")).toEqual({
      flavours: ["dubai"],
    });
    expect(hasPrefill(parseOrderPrefill(""))).toBe(false);
  });
});

describe("prefilledItems", () => {
  it("starts each preselected flavour at the minimum, named and tiered from the registry", () => {
    expect(prefilledItems(["mango", "dubai"], 24, "5oz")).toEqual([
      { id: "mango", name: "Mango Dream", tier: "classic", count: 6 },
      { id: "dubai", name: "Dubai Chocolate", tier: "premium", count: 6 },
    ]);
  });

  it("never preselects more flavours than the pack holds", () => {
    const ids = ["mango", "strawberry", "blueberry", "tiramisu", "dubai"];
    expect(prefilledItems(ids, 24, "5oz")).toHaveLength(4);
    expect(prefilledItems(ids, 48, "5oz")).toHaveLength(5);
  });
});

describe("Tiramisu comes in Dessert Cups only", () => {
  it("is left out of a Mini Shots deep link and dropped when the size changes to Mini Shots", () => {
    expect(prefilledItems(["tiramisu", "mango"], 24, "2oz").map((i) => i.id)).toEqual(["mango"]);
    expect(prefilledItems(["tiramisu", "mango"], 24, "5oz").map((i) => i.id)).toEqual(["tiramisu", "mango"]);
    const box = prefilledItems(["tiramisu", "mango"], 24, "5oz");
    expect(itemsForSize(box, "2oz").map((i) => i.id)).toEqual(["mango"]);
    expect(itemsForSize(box, "5oz")).toEqual(box);
  });
});

describe("orderHref", () => {
  it("builds links that parse back to the same choices", () => {
    const prefill = { pack: 96 as const, size: "2oz" as const, flavours: ["kinder", "ferrero"], event: "corporate" };
    const href = orderHref(prefill);
    expect(href).toBe("/order?pack=96&size=2oz&flavour=kinder,ferrero&event=corporate");
    expect(parseOrderPrefill(href.split("?")[1])).toEqual(prefill);
    expect(orderHref({})).toBe("/order");
  });
});

describe("fitItemsToPack", () => {
  const box = [
    { id: "mango", name: "Mango Dream", tier: "classic" as const, count: 30 },
    { id: "dubai", name: "Dubai Chocolate", tier: "premium" as const, count: 12 },
    { id: "kinder", name: "Kinder Bueno", tier: "premium" as const, count: 6 },
  ];

  it("keeps a box that already fits", () => {
    expect(fitItemsToPack(box, 48)).toEqual(box);
  });

  it("shrinks counts in steps of 6 and drops flavours that no longer fit", () => {
    expect(fitItemsToPack(box, 24)).toEqual([{ ...box[0], count: 24 }]);
    expect(fitItemsToPack([{ ...box[0], count: 12 }, box[1], box[2]], 24)).toEqual([{ ...box[0], count: 12 }, box[1]]);
  });

  it("never keeps more flavours than the pack holds", () => {
    const six = ["mango", "strawberry", "blueberry", "tiramisu", "dubai", "kinder"].map((id) => ({ id, name: id, tier: "classic" as const, count: 6 }));
    expect(fitItemsToPack(six, 24)).toHaveLength(4);
  });
});
