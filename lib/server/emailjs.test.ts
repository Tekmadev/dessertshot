import { describe, expect, it, vi } from "vitest";
import { buildOrderSummary } from "../order-summary";
import { createOrderMailer, emailConfig, type EmailConfig } from "./emailjs";

const summary = buildOrderSummary(
  {
    cupSize: "5oz",
    packQty: "24",
    items: [{ id: "dubai", name: "Dubai Chocolate", tier: "premium", count: 24 }],
    fulfillment: "pickup",
    name: "Test Customer",
    email: "customer@example.com",
    date: "2026-12-12",
    notes: "Please leave at the side door",
  },
  "1a2b3c4d-0000-4000-8000-000000000000",
  new Date("2026-10-30T12:00:00Z")
);

const CONFIG: EmailConfig = {
  serviceId: "service_x",
  publicKey: "public_x",
  privateKey: "private_x",
  businessTemplateId: "template_business",
  customerTemplateId: "template_customer",
};

/** fetch that answers each call with the next status (200 once the list runs out). */
function fetchWith(...statuses: (number | "throw")[]) {
  return vi.fn<typeof fetch>(async () => {
    const status = statuses.shift() ?? 200;
    if (status === "throw") throw new Error("network down");
    return new Response(status === 200 ? "OK" : "nope", { status });
  });
}

function sentBodies(fetchMock: ReturnType<typeof fetchWith>) {
  return fetchMock.mock.calls.map((c) => JSON.parse(c[1]!.body as string));
}

function mailer(fetchMock: ReturnType<typeof fetchWith>, config: EmailConfig | null = CONFIG) {
  let clock = 0;
  const wait = vi.fn(async (ms: number) => {
    clock += ms;
  });
  return { wait, mail: createOrderMailer(config, { fetchImpl: fetchMock, wait, now: () => clock }) };
}

describe("emailConfig", () => {
  it("reads the server names, falling back to the old NEXT_PUBLIC_ ones", () => {
    expect(
      emailConfig({
        NEXT_PUBLIC_EMAILJS_SERVICE_ID: "s",
        NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "p",
        NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "t",
        EMAILJS_PRIVATE_KEY: "k",
      })
    ).toEqual({ serviceId: "s", publicKey: "p", businessTemplateId: "t", privateKey: "k", customerTemplateId: null });
    expect(emailConfig({ EMAILJS_SERVICE_ID: "s" })).toBeNull();
  });
});

describe("createOrderMailer", () => {
  it("sends the owner's notification, then the auto-reply at least a second later", async () => {
    const fetchMock = fetchWith();
    const { mail, wait } = mailer(fetchMock);
    expect(await mail.business(summary)).toBe(true);
    expect(await mail.customer(summary)).toBe(true);

    const [business, customer] = sentBodies(fetchMock);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.emailjs.com/api/v1.0/email/send");
    expect(business).toMatchObject({ service_id: "service_x", template_id: "template_business", user_id: "public_x", accessToken: "private_x" });
    expect(business.template_params).toMatchObject({ to_email: "dessertshot.ca@gmail.com", reply_to: "customer@example.com" });
    expect(customer.template_id).toBe("template_customer");
    expect(customer.template_params).toMatchObject({ to_email: "customer@example.com", reply_to: "dessertshot.ca@gmail.com" });
    // EmailJS takes one request per second.
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait.mock.calls[0][0]).toBeGreaterThanOrEqual(1100);
  });

  it("retries the owner's email once when EmailJS is busy or down", async () => {
    for (const first of [429, 503, "throw"] as const) {
      const fetchMock = fetchWith(first, 200);
      const { mail, wait } = mailer(fetchMock);
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(await mail.business(summary), String(first)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(wait.mock.calls[0][0]).toBeGreaterThanOrEqual(1500);
    }
    vi.restoreAllMocks();
  });

  it("doesn't retry a configuration error, and gives up after one retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const forbidden = fetchWith(403);
    expect(await mailer(forbidden).mail.business(summary)).toBe(false);
    expect(forbidden).toHaveBeenCalledTimes(1);

    const busy = fetchWith(429, 429, 200);
    expect(await mailer(busy).mail.business(summary)).toBe(false);
    expect(busy).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it("skips the auto-reply when its template isn't set, and everything when unconfigured", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = fetchWith();
    expect(await mailer(fetchMock, { ...CONFIG, customerTemplateId: null }).mail.customer(summary)).toBe(false);
    expect(await mailer(fetchMock, null).mail.business(summary)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("omits the private key when none is configured", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = fetchWith();
    await mailer(fetchMock, { ...CONFIG, privateKey: null }).mail.business(summary);
    expect(sentBodies(fetchMock)[0]).not.toHaveProperty("accessToken");
    vi.restoreAllMocks();
  });
});
