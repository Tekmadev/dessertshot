import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RATE_LIMITS, clientIp, hashKey, inboxKey, takeMemoryRateLimit, takeRateLimit } from "./rate-limit";

const MIGRATION = fileURLToPath(new URL("../../supabase/migrations/004_order_details.sql", import.meta.url));

describe("clientIp", () => {
  it("prefers Vercel's own header, then x-real-ip, then the first x-forwarded-for entry", () => {
    expect(clientIp(new Headers({ "x-vercel-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers({ "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" }))).toBe("3.3.3.3");
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("hashKey", () => {
  it("is keyed, stable, and ignores case and spaces in emails", () => {
    expect(hashKey("A@Example.com ", "s")).toBe(hashKey("a@example.com", "s"));
    expect(hashKey("a@example.com", "s")).not.toBe(hashKey("a@example.com", "t"));
    expect(hashKey("1.1.1.1", "s")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("inboxKey", () => {
  it("counts plus-tags and Gmail dots as the same inbox", () => {
    expect(inboxKey("Jo.Doe+party@googlemail.com ")).toBe("jodoe@gmail.com");
    expect(inboxKey("j.o.doe@gmail.com")).toBe("jodoe@gmail.com");
    expect(inboxKey("jo.doe+x@example.com")).toBe("jo.doe@example.com");
  });
});

describe("rate limits", () => {
  it("uses exactly the buckets migration 004 allows", () => {
    const sql = readFileSync(MIGRATION, "utf8");
    const check = sql.match(/bucket in \(([^)]*)\)/);
    expect(check, "bucket CHECK not found in 004").not.toBeNull();
    const buckets = [...check![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(buckets.sort()).toEqual(Object.keys(RATE_LIMITS).sort());
  });

  it("allows the limit, then refuses until the window passes (memory fallback)", () => {
    const { max, windowMinutes } = RATE_LIMITS.ip;
    const t0 = 1_000_000;
    for (let i = 0; i < max; i++) expect(takeMemoryRateLimit("ip", "k-mem", t0 + i)).toBe(true);
    expect(takeMemoryRateLimit("ip", "k-mem", t0 + max)).toBe(false);
    expect(takeMemoryRateLimit("ip", "k-mem", t0 + windowMinutes * 60_000 + 1)).toBe(true);
  });

  it("uses the database answer when it has one", async () => {
    const db = { rpc: async () => ({ data: false, error: null }) };
    expect(await takeRateLimit(db as never, "email", "k-db")).toBe(false);
  });

  it("falls back to memory when the database can't answer (migration not run yet)", async () => {
    const db = { rpc: async () => ({ data: null, error: { code: "PGRST202" } }) };
    expect(await takeRateLimit(db as never, "email", "k-fallback")).toBe(true);
    expect(await takeRateLimit(null, "email", "k-nodb")).toBe(true);
  });
});
