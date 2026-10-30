import { describe, expect, it } from "vitest";
import { firstName, toStoredOrder } from "./order-api";
import { buildOrderSummary } from "./order-summary";

describe("toStoredOrder", () => {
  it("keeps only what the thanks page shows, with a timestamp", () => {
    const summary = buildOrderSummary(
      {
        cupSize: "5oz",
        packQty: "24",
        items: [{ id: "mango", name: "Mango Dream", tier: "classic", count: 24 }],
        fulfillment: "pickup",
        name: "  Mary-Jane O'Brien ",
        email: "mj@example.com",
        phone: "905-555-0100",
        notes: "Private note",
        date: "2026-12-12",
      },
      "1a2b3c4d-0000-4000-8000-000000000000",
      new Date("2026-10-30T12:00:00Z")
    );
    const stored = toStoredOrder({ ok: true, reference: summary.reference, summary, confirmationEmailSent: true }, 123);
    expect(stored.savedAt).toBe(123);
    expect(stored.summary).toMatchObject({ name: "Mary-Jane", phone: null, notes: null, email: "mj@example.com" });
    expect(JSON.stringify(stored)).not.toContain("Private note");
  });

  it("shortens names to a first name", () => {
    expect(firstName("Ana")).toBe("Ana");
    expect(firstName("x".repeat(50))).toHaveLength(30);
  });
});
