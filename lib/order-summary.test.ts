import { describe, expect, it } from "vitest";
import type { OrderFormValues } from "./order-schema";
import { buildOrderSummary, formatCad, orderReference, orderSummaryText } from "./order-summary";
import { calcMixTotal } from "./pricing";

const NOW = new Date("2026-10-30T12:00:00Z"); // Friday, 08:00 in Toronto
const ID = "1a2b3c4d-0000-4000-8000-000000000000";

function order(overrides: Partial<OrderFormValues> = {}): OrderFormValues {
  return {
    cupSize: "5oz",
    packQty: "24",
    items: [
      { id: "mango", name: "Mango Dream", tier: "classic", count: 12 },
      { id: "dubai", name: "Dubai Chocolate", tier: "premium", count: 12 },
    ],
    fulfillment: "pickup",
    name: "  Test Customer ",
    email: "test@example.com",
    date: "2026-12-12",
    ...overrides,
  };
}

describe("buildOrderSummary", () => {
  it("prices the box with the shared pricing function", () => {
    const s = buildOrderSummary(order(), ID, NOW);
    expect(s.estimatedTotal).toBe(calcMixTotal("5oz", 24, [{ tier: "classic", count: 12 }, { tier: "premium", count: 12 }]));
    expect(s.estimatedTotal).toBe(114);
    expect(s.tier).toBe("mixed");
    expect(s.items.map((i) => i.pricePerCup)).toEqual([4.13, 5.38]);
  });

  it("names flavours and allergens from the registry", () => {
    const s = buildOrderSummary(order(), ID, NOW);
    expect(s.items[0]).toMatchObject({ name: "Mango Dream", allergens: ["Dairy"] });
    expect(s.items[1]).toMatchObject({ name: "Dubai Chocolate", allergens: ["Dairy", "Tree nuts"] });
  });

  it("derives urgency from the date, not from anything the browser sent", () => {
    expect(buildOrderSummary(order({ date: "2026-12-12" }), ID, NOW).urgent).toBe(false);
    expect(buildOrderSummary(order({ date: "2026-10-31" }), ID, NOW).urgent).toBe(true);
  });

  it("keeps delivery details only for delivery, normalised, with the Saturday note", () => {
    const pickup = buildOrderSummary(order({ deliveryAddress: "1 Main St", deliveryPostalCode: "l8p4r5" }), ID, NOW);
    expect(pickup.deliveryAddress).toBeNull();
    expect(pickup.deliveryPostalCode).toBeNull();
    expect(pickup.deliveryNotSaturday).toBe(false);

    const friday = buildOrderSummary(
      order({ fulfillment: "delivery", date: "2026-12-11", deliveryAddress: " 1 Main St, Hamilton ", deliveryPostalCode: "l8p4r5" }),
      ID,
      NOW
    );
    expect(friday.deliveryAddress).toBe("1 Main St, Hamilton");
    expect(friday.deliveryPostalCode).toBe("L8P 4R5");
    expect(friday.deliveryNotSaturday).toBe(true);
    expect(buildOrderSummary(order({ fulfillment: "delivery", deliveryAddress: "x", deliveryPostalCode: "L8P 4R5" }), ID, NOW).deliveryNotSaturday).toBe(false);
  });

  it("labels event types, including 'other'", () => {
    expect(buildOrderSummary(order({ eventType: "cultural" }), ID, NOW).eventLabel).toBe("Cultural and religious celebrations");
    expect(buildOrderSummary(order({ eventType: "other" }), ID, NOW).eventLabel).toBe("Something else");
    expect(buildOrderSummary(order({ eventType: "" }), ID, NOW).eventLabel).toBeNull();
  });

  it("makes a short, stable reference from the order id", () => {
    expect(orderReference(ID)).toBe("DS-1A2B3C4D");
  });
});

describe("orderSummaryText", () => {
  it("lists every fact the owner needs to confirm the order", () => {
    const text = orderSummaryText(
      buildOrderSummary(
        order({ fulfillment: "delivery", deliveryAddress: "1 Main St, Hamilton", deliveryPostalCode: "L8P4R5", eventType: "wedding", notes: "Nut allergy at table 3", phone: "905-555-0100" }),
        ID,
        NOW
      )
    );
    for (const expected of [
      "Order request DS-1A2B3C4D",
      "24 × Dessert Cups (5 oz)",
      "Mango Dream ×12 (Dairy)",
      "Dubai Chocolate ×12 (Dairy, Tree nuts)",
      "Estimated total (before delivery): $114",
      "Date needed: Saturday, December 12, 2026",
      "Delivery to 1 Main St, Hamilton, L8P 4R5. Delivery fee quoted after we confirm, as part of your total.",
      "Event: Weddings",
      "Name: Test Customer",
      "Phone: 905-555-0100",
      "Nut allergy at table 3",
    ]) {
      expect(text).toContain(expected);
    }
    expect(text).not.toContain("Delivery runs on Saturdays"); // 12 Dec is a Saturday
  });
});

describe("formatCad", () => {
  it("shows whole dollars without cents and keeps cents otherwise", () => {
    expect(formatCad(114)).toBe("$114");
    expect(formatCad(4.13)).toBe("$4.13");
    expect(formatCad(1234)).toBe("$1,234");
  });
});
