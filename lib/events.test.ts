import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EVENT_TYPES, EVENT_VALUES, getEventBySlug, getEventByValue } from "./events";

const MIGRATION = fileURLToPath(new URL("../supabase/migrations/004_order_details.sql", import.meta.url));

describe("event types", () => {
  it("covers the brief's event pages plus cultural and religious celebrations (§6, S7)", () => {
    expect(EVENT_TYPES.map((e) => e.slug)).toEqual([
      "weddings",
      "baby-showers",
      "bridal-showers",
      "birthdays",
      "graduations",
      "corporate",
      "celebrations",
    ]);
  });

  it("has unique slugs and values in URL-safe form", () => {
    expect(new Set(EVENT_TYPES.map((e) => e.slug)).size).toBe(EVENT_TYPES.length);
    expect(new Set(EVENT_VALUES).size).toBe(EVENT_VALUES.length);
    for (const v of [...EVENT_VALUES, ...EVENT_TYPES.map((e) => e.slug)]) expect(v).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it("looks events up by slug and by stored value", () => {
    expect(getEventBySlug("celebrations")?.value).toBe("cultural");
    expect(getEventByValue("baby-shower")?.slug).toBe("baby-showers");
    expect(getEventBySlug("nope")).toBeUndefined();
  });

  it("matches the orders.event_type CHECK in migration 004 exactly", () => {
    const sql = readFileSync(MIGRATION, "utf8");
    const check = sql.match(/event_type in \(([\s\S]*?)\)/);
    expect(check, "event_type CHECK not found in 004").not.toBeNull();
    const values = [...check![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(values.sort()).toEqual([...EVENT_VALUES].sort());
  });
});
