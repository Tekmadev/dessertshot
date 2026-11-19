import { describe, expect, it } from "vitest";
import { businessEmailParams, customerEmailParams, escapeHtml, greetingName } from "./order-email";
import { buildOrderSummary } from "./order-summary";

const summary = buildOrderSummary(
  {
    cupSize: "2oz",
    packQty: "48",
    items: [
      { id: "kinder", name: "Kinder Bueno", tier: "premium", count: 24 },
      { id: "mango", name: "Mango Dream", tier: "classic", count: 24 },
    ],
    fulfillment: "delivery",
    deliveryAddress: "1 Main St, Toronto",
    deliveryPostalCode: "m5v3l9",
    name: "Test Customer",
    email: "customer@example.com",
    date: "2026-10-31",
    notes: '<script>alert("x")</script>\nSecond line',
    eventType: "birthday",
  },
  "1a2b3c4d-0000-4000-8000-000000000000",
  new Date("2026-10-30T12:00:00Z")
);

describe("order email variables", () => {
  it("keeps the variable names the live business template already uses", () => {
    const p = businessEmailParams(summary);
    for (const key of ["to_email", "from_name", "from_email", "phone", "cup_size", "tier", "package_size", "urgency", "fulfillment", "flavors", "desired_date", "notes", "reply_to"]) {
      expect(p, key).toHaveProperty(key);
    }
    expect(p.to_email).toBe("dessertshot.ca@gmail.com");
    expect(p.reply_to).toBe("customer@example.com");
    expect(p.tier).toBe("Mixed");
    expect(p.postal_code).toBe("M5V 3L9");
    expect(p.subject).toContain("URGENT");
  });

  it("addresses the auto-reply to the customer, with replies going to the business", () => {
    const p = customerEmailParams(summary);
    expect(p.to_email).toBe("customer@example.com");
    expect(p.reply_to).toBe("dessertshot.ca@gmail.com");
    expect(p.to_name).toBe("Test");
    expect(p.order_ref).toBe("DS-1A2B3C4D");
    expect(p.order_summary).toContain("Kinder Bueno ×24 (Dairy, Tree nuts)");
    expect(p.order_summary).toContain("Delivery to postal code M5V 3L9.");
    expect(p.allergen_notice).toContain("contain tree nuts");
  });

  it("never repeats sender-typed text in the auto-reply (it goes to an unverified address)", () => {
    const all = JSON.stringify(customerEmailParams(summary));
    for (const typed of ["alert", "Second line", "1 Main St", "Test Customer"]) expect(all).not.toContain(typed);
    expect(customerEmailParams(summary).order_summary).toContain("Your notes: received.");
  });

  it("escapes customer text in the owner's HTML summary and keeps its line breaks", () => {
    const html = businessEmailParams(summary).order_summary_html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>Second line");
    expect(html).toContain("1 Main St, Toronto, M5V 3L9");
  });

  it("greets by first name only when it is plainly a name", () => {
    expect(greetingName("Ana Smith")).toBe("Ana");
    expect(greetingName("Zoë")).toBe("Zoë");
    expect(greetingName("Mary-Jane O'Brien")).toBe("Mary-Jane");
    for (const sneaky of ["VISIT-https://evil.example/x Smith", "bit.ly/abc", "Win$100", "x".repeat(25)]) {
      expect(greetingName(sneaky), sneaky).toBe("there");
    }
  });

  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });

  it("stays well inside EmailJS's 50 KB limit at the maximum field lengths", () => {
    const big = buildOrderSummary(
      {
        cupSize: "5oz",
        packQty: "96",
        items: ["mango", "strawberry", "blueberry", "tiramisu", "kinder", "ferrero", "biscoff", "dubai"].map((id) => ({
          id,
          name: "",
          tier: "classic" as const,
          count: 12,
        })),
        fulfillment: "delivery",
        deliveryAddress: "x".repeat(300),
        deliveryPostalCode: "L8P 4R5",
        name: "n".repeat(120),
        email: "customer@example.com",
        phone: "1".repeat(40),
        date: "2026-12-12",
        notes: "<&>".repeat(666),
      },
      "1a2b3c4d-0000-4000-8000-000000000000",
      new Date("2026-10-30T12:00:00Z")
    );
    for (const params of [businessEmailParams(big), customerEmailParams(big)]) {
      expect(new TextEncoder().encode(JSON.stringify(params)).length).toBeLessThan(40_000);
    }
  });
});
