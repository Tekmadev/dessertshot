import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizePostalCode, orderSchema, type OrderFormValues } from "./order-schema";

const mango = { id: "mango", name: "Mango Dream", tier: "classic" as const };
const dubai = { id: "dubai", name: "Dubai Chocolate", tier: "premium" as const };
const kinder = { id: "kinder", name: "Kinder Bueno", tier: "premium" as const };

function order(overrides: Partial<OrderFormValues> = {}): OrderFormValues {
  return {
    cupSize: "5oz",
    packQty: "24",
    items: [
      { ...mango, count: 12 },
      { ...dubai, count: 12 },
    ],
    fulfillment: "pickup",
    name: "Test Customer",
    email: "test@example.com",
    date: "2026-12-12",
    ...overrides,
  };
}

function messages(input: unknown): string[] {
  const result = orderSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("orderSchema", () => {
  // Dates are checked against today in Toronto; pin the clock to 30 Oct 2026.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-30T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a valid mixed Classic + Premium box", () => {
    expect(orderSchema.safeParse(order()).success).toBe(true);
  });

  it("accepts the Tiramisu card (brief §7.2)", () => {
    const result = orderSchema.safeParse(
      order({ items: [{ id: "tiramisu", name: "Tiramisu", tier: "classic", count: 24 }] })
    );
    expect(result.success).toBe(true);
  });

  it("rejects a flavour with fewer than 6 cups", () => {
    const msgs = messages(order({ items: [{ ...mango, count: 4 }, { ...dubai, count: 20 }] }));
    expect(msgs.some((m) => m.includes("at least 6"))).toBe(true);
  });

  it("rejects counts that are not multiples of 6", () => {
    const msgs = messages(order({ items: [{ ...mango, count: 9 }, { ...dubai, count: 15 }] }));
    expect(msgs.some((m) => m.includes("multiples of 6"))).toBe(true);
  });

  it("rejects a box whose cups don't add up to the pack size", () => {
    const msgs = messages(order({ items: [{ ...mango, count: 12 }] }));
    expect(msgs.some((m) => m.includes("must total 24"))).toBe(true);
  });

  it("rejects more flavours than the pack allows", () => {
    const five = ["mango", "strawberry", "blueberry", "tiramisu"].map((id, idx) => ({
      id,
      name: ["Mango Dream", "Strawberry Fields", "Blueberry Haze", "Tiramisu"][idx],
      tier: "classic" as const,
      count: 6,
    }));
    const msgs = messages(order({ items: [...five, { ...dubai, count: 6 }] }));
    expect(msgs.some((m) => m.includes("at most 4 flavours"))).toBe(true);
  });

  it("rejects a Premium flavour submitted at the Classic tier (price tampering)", () => {
    const msgs = messages(order({ items: [{ ...dubai, tier: "classic", count: 24 }] }));
    expect(msgs).toContain("Unknown flavour in your box");
  });

  it("rejects a flavour that isn't on the menu", () => {
    const msgs = messages(order({ items: [{ id: "lemon", name: "Lemon", tier: "classic", count: 24 }] }));
    expect(msgs).toContain("Unknown flavour in your box");
  });

  it("rejects the same flavour listed twice", () => {
    const msgs = messages(order({ items: [{ ...kinder, count: 12 }, { ...kinder, count: 12 }] }));
    expect(msgs.some((m) => m.includes("listed twice"))).toBe(true);
  });

  it("requires a delivery address and a valid postal code for delivery", () => {
    const msgs = messages(order({ fulfillment: "delivery", deliveryAddress: "  ", deliveryPostalCode: "" }));
    expect(msgs.some((m) => m.includes("delivery address"))).toBe(true);
    expect(msgs).toContain("Please enter a postal code like L8P 4R5");
    expect(messages(order({ fulfillment: "delivery", deliveryAddress: "1 Main St, Hamilton", deliveryPostalCode: "90210" }))).toContain(
      "Please enter a postal code like L8P 4R5"
    );
    expect(
      orderSchema.safeParse(order({ fulfillment: "delivery", deliveryAddress: "1 Main St, Hamilton", deliveryPostalCode: "l8p4r5" })).success
    ).toBe(true);
  });

  it("doesn't ask for an address or postal code for pickup", () => {
    expect(orderSchema.safeParse(order({ fulfillment: "pickup", deliveryPostalCode: "nonsense" })).success).toBe(true);
  });

  it("normalises Canadian postal codes and rejects letters Canada Post never uses", () => {
    expect(normalizePostalCode("l8p4r5")).toBe("L8P 4R5");
    expect(normalizePostalCode(" M5V-3L9 ")).toBe("M5V 3L9");
    expect(normalizePostalCode("D8P 4R5")).toBeNull(); // D is never used
    expect(normalizePostalCode("W8P 4R5")).toBeNull(); // W never comes first
    expect(normalizePostalCode("L8P 4R")).toBeNull();
  });

  it("accepts the event types on the order form, and nothing else", () => {
    expect(orderSchema.safeParse(order({ eventType: "wedding" })).success).toBe(true);
    expect(orderSchema.safeParse(order({ eventType: "other" })).success).toBe(true);
    expect(orderSchema.safeParse(order({ eventType: "" })).success).toBe(true);
    expect(messages(order({ eventType: "rave" }))).toContain("Please choose an event type from the list");
  });

  it("rejects past dates and dates more than two years out (typos), and allows today", () => {
    expect(messages(order({ date: "2026-10-29" }))).toContain("Please choose today or a later date");
    expect(messages(order({ date: "2028-11-01" }))).toContain("Please choose a date within the next two years");
    expect(orderSchema.safeParse(order({ date: "2028-02-29" })).success).toBe(true);
    expect(orderSchema.safeParse(order({ date: "2026-10-30" })).success).toBe(true);
  });

  it("only records an on-site path as the source", () => {
    expect(orderSchema.safeParse(order({ source: "/order?pack=48&event=wedding" })).success).toBe(true);
    expect(orderSchema.safeParse(order({ source: "https://evil.example/" })).success).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(orderSchema.safeParse(order({ date: "next saturday" })).success).toBe(false);
  });

  it("rejects calendar dates that don't exist, and accepts leap days", () => {
    expect(orderSchema.safeParse(order({ date: "2026-02-30" })).success).toBe(false);
    expect(orderSchema.safeParse(order({ date: "2026-13-01" })).success).toBe(false);
    expect(orderSchema.safeParse(order({ date: "2027-02-29" })).success).toBe(false);
    expect(orderSchema.safeParse(order({ date: "2027-02-28" })).success).toBe(true);
  });

  it("shows customer-friendly messages for the length caps", () => {
    expect(messages(order({ notes: "x".repeat(2001) }))).toContain("Please keep notes under 2000 characters");
    expect(messages(order({ phone: "1".repeat(41) }))).toContain("Phone number is too long");
  });

  it("accepts exactly one email address (the auto-reply goes to it)", () => {
    for (const email of ["a@x.com,b@y.com", "a@x.com;b@y.com", "a@x.com b@y.com", "a@x.com\nbcc:b@y.com"]) {
      expect(orderSchema.safeParse(order({ email })).success, email).toBe(false);
    }
  });

  it("rejects an invalid email and a too-short name", () => {
    expect(orderSchema.safeParse(order({ email: "not-an-email" })).success).toBe(false);
    expect(orderSchema.safeParse(order({ name: " A " })).success).toBe(false);
  });

  it("rejects unknown cup sizes and pack quantities", () => {
    expect(orderSchema.safeParse({ ...order(), cupSize: "8oz" }).success).toBe(false);
    expect(orderSchema.safeParse({ ...order(), packQty: "12" }).success).toBe(false);
  });

  it("caps free-text lengths", () => {
    expect(orderSchema.safeParse(order({ notes: "x".repeat(2001) })).success).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(orderSchema.safeParse(null).success).toBe(false);
    expect(orderSchema.safeParse("order").success).toBe(false);
  });
});
