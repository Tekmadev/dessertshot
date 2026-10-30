import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { OrderApiResponse } from "@/lib/order-api";

const state = vi.hoisted(() => ({
  db: null as unknown,
  ownerEmailed: true,
  customerEmailed: true,
  business: null as unknown as ReturnType<typeof import("vitest").vi.fn>,
  customer: null as unknown as ReturnType<typeof import("vitest").vi.fn>,
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));
vi.mock("@/lib/server/supabase", () => ({
  serviceClient: () => state.db,
  publicClient: () => null,
}));
vi.mock("@/lib/server/emailjs", () => ({
  createOrderMailer: () => ({ business: state.business, customer: state.customer }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));

const { POST } = await import("./route");

type Insert = { table: string; rows: Record<string, unknown> | Record<string, unknown>[] };

function fakeDb(opts: { migrated?: boolean; fail?: boolean; duplicate?: boolean; deny?: string[] } = {}) {
  const { migrated = true, fail = false, duplicate = false, deny = [] } = opts;
  const inserts: Insert[] = [];
  return {
    inserts,
    rpc: async (_fn: string, args: { p_bucket: string }) => ({ data: !deny.includes(args.p_bucket), error: null }),
    from: (table: string) => ({
      insert: async (rows: Insert["rows"]) => {
        inserts.push({ table, rows });
        const json = JSON.stringify(rows);
        if (!migrated && (json.includes('"event_type"') || json.includes('"flavor_id"'))) {
          return { error: { code: "PGRST204", message: "Could not find the column" } };
        }
        if (duplicate && table === "orders") return { error: { code: "23505", message: "duplicate key" } };
        return { error: fail ? { code: "XX000", message: "down" } : null };
      },
    }),
  };
}

const VALID = {
  cupSize: "5oz",
  packQty: "24",
  items: [
    { id: "mango", name: "Mango Dream", tier: "classic", count: 12 },
    { id: "dubai", name: "Dubai Chocolate", tier: "premium", count: 12 },
  ],
  fulfillment: "delivery",
  deliveryAddress: "1 Main St, Hamilton",
  deliveryPostalCode: "l8p4r5",
  eventType: "wedding",
  name: "Test Customer",
  email: "customer@example.com",
  date: "2026-10-31", // tomorrow: urgent
  source: "/order?pack=24&event=wedding",
  website: "",
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest("http://localhost/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost", "x-real-ip": "203.0.113.7", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

async function json(res: Response) {
  return (await res.json()) as OrderApiResponse;
}

const db = () => state.db as ReturnType<typeof fakeDb>;
const orderRow = () => db().inserts.filter((i) => i.table === "orders").at(-1)!.rows as Record<string, unknown>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-30T12:00:00Z")); // Friday, 08:00 in Toronto
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  state.db = fakeDb();
  state.business = vi.fn(async () => state.ownerEmailed);
  state.customer = vi.fn(async () => state.customerEmailed);
  state.ownerEmailed = true;
  state.customerEmailed = true;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete process.env.ORDER_DRY_RUN;
});

describe("POST /api/orders", () => {
  it("rejects an invalid order with field-level issues and does nothing else", async () => {
    const res = await post({ ...VALID, items: [{ ...VALID.items[0], count: 24 }, { ...VALID.items[1], tier: "classic" }] });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.ok).toBe(false);
    expect(!body.ok && body.issues?.some((i) => i.path === "items")).toBe(true);
    expect(db().inserts).toHaveLength(0);
    expect(state.business).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("only accepts JSON from the site itself (no cross-site form posts)", async () => {
    expect((await post(VALID, { "content-type": "text/plain" })).status).toBe(415);
    expect((await post(VALID, { origin: "https://evil.example" })).status).toBe(403);
    expect((await post(VALID, { "sec-fetch-site": "cross-site" })).status).toBe(403);
    expect(state.business).not.toHaveBeenCalled();
    expect((await post(VALID, { origin: "http://localhost", "sec-fetch-site": "same-origin" })).status).toBe(201);
    // Whatever address the browser used, e.g. a phone on the same Wi-Fi.
    expect((await post(VALID, { origin: "http://192.168.1.20:3000", host: "192.168.1.20:3000" })).status).toBe(201);
  });

  it("saves and emails a valid order, priced and timed on the server", async () => {
    const res = await post({ ...VALID, estimatedTotal: 1, urgency: "standard", tier: "classic" });
    expect(res.status).toBe(201);
    const body = await json(res);
    if (!body.ok) throw new Error("expected success");

    expect(body.summary.estimatedTotal).toBe(114);
    expect(body.summary.urgent).toBe(true);
    expect(body.confirmationEmailSent).toBe(true);
    expect(body.reference).toMatch(/^DS-[0-9A-F]{8}$/);

    expect(orderRow()).toMatchObject({
      total_price: 114,
      is_rush: true,
      tier: "mixed",
      event_type: "wedding",
      delivery_address: "1 Main St, Hamilton",
      delivery_postal_code: "L8P 4R5",
      source: "/order?pack=24&event=wedding",
      status: "pending",
    });
    expect(body.reference).toBe(`DS-${String(orderRow().id).replace(/-/g, "").slice(0, 8).toUpperCase()}`);
    const items = db().inserts.find((i) => i.table === "order_items")!.rows as Record<string, unknown>[];
    expect(items.map((i) => [i.flavor_id, i.quantity, i.price_per_cup])).toEqual([
      ["mango", 12, 4.13],
      ["dubai", 12, 5.38],
    ]);
    expect(state.business).toHaveBeenCalledTimes(1);
    expect(state.customer).toHaveBeenCalledTimes(1);
  });

  it("uses the form's request id, and doesn't save or email a retried request twice", async () => {
    const requestId = "0f8fad5b-d9cb-469f-a165-70867728950e";
    await post({ ...VALID, requestId });
    expect(orderRow().id).toBe(requestId);

    state.db = fakeDb({ duplicate: true });
    state.business.mockClear();
    const res = await post({ ...VALID, requestId });
    expect(res.status).toBe(201);
    expect(await json(res)).toMatchObject({ ok: true, reference: "DS-0F8FAD5B" });
    expect(state.business).not.toHaveBeenCalled();
    expect(state.customer).toHaveBeenCalledTimes(1); // only from the first request
  });

  it("answers a filled honeypot as if it worked, but saves and sends nothing", async () => {
    const res = await post({ ...VALID, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect((await json(res)).ok).toBe(true);
    expect(db().inserts).toHaveLength(0);
    expect(state.business).not.toHaveBeenCalled();
  });

  it.each(["ip", "ip_day"])("refuses with 429 once the %s limit is reached", async (bucket) => {
    state.db = fakeDb({ deny: [bucket] });
    const res = await post(VALID);
    expect(res.status).toBe(429);
    expect(await json(res)).toEqual({ ok: false, error: "rate-limited" });
    expect(state.business).not.toHaveBeenCalled();
  });

  it.each(["email", "autoreply"])(
    "past the %s auto-reply limit, still saves and emails the owner but skips the auto-reply",
    async (bucket) => {
      state.db = fakeDb({ deny: [bucket] });
      const res = await post(VALID);
      expect(res.status).toBe(201);
      expect(await json(res)).toMatchObject({ ok: true, confirmationEmailSent: false });
      expect(orderRow().customer_email).toBe("customer@example.com");
      expect(state.business).toHaveBeenCalledTimes(1);
      expect(state.customer).not.toHaveBeenCalled();
    }
  );

  it("saves in the old shape until migration 004 has run", async () => {
    state.db = fakeDb({ migrated: false });
    const res = await post(VALID);
    expect(res.status).toBe(201);
    const row = orderRow();
    expect(row).not.toHaveProperty("event_type");
    expect(row).not.toHaveProperty("delivery_postal_code");
    expect(row.additional_notes).toBe("Delivery address: 1 Main St, Hamilton, L8P 4R5");
  });

  it("succeeds when only one of the database and the owner's email worked", async () => {
    state.db = fakeDb({ fail: true });
    expect((await post(VALID)).status).toBe(201);

    state.db = fakeDb();
    state.ownerEmailed = false;
    state.customerEmailed = false;
    const res = await post(VALID);
    expect(res.status).toBe(201);
    expect(await json(res)).toMatchObject({ ok: true, confirmationEmailSent: false });
  });

  it("fails with a generic 500 and sends no auto-reply when the order reached nobody", async () => {
    state.db = fakeDb({ fail: true });
    state.ownerEmailed = false;
    const res = await post(VALID);
    expect(res.status).toBe(500);
    expect(await json(res)).toEqual({ ok: false, error: "server" });
    expect(state.customer).not.toHaveBeenCalled();
  });

  it("validates but never saves or emails in a dry run", async () => {
    process.env.ORDER_DRY_RUN = "1";
    const res = await post(VALID);
    expect(res.status).toBe(201);
    expect(await json(res)).toMatchObject({ ok: true, confirmationEmailSent: false });
    expect(db().inserts).toHaveLength(0);
    expect(state.business).not.toHaveBeenCalled();
  });
});
