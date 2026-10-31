import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { allRoutes } from "@/lib/routes";
import robots from "./robots";
import sitemap from "./sitemap";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOST = "https://www.dessertshot.ca";

describe("sitemap.xml", () => {
  const entries = sitemap();

  it("lists every indexable route once, on the production host, and nothing noindex", () => {
    const expected = allRoutes().filter((r) => !r.noindex).map((r) => (r.path === "/" ? HOST : `${HOST}${r.path}`));
    expect(entries.map((e) => e.url)).toEqual(expected);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
    expect(entries.map((e) => e.url)).not.toContain(`${HOST}/order/thanks`);
  });

  it("points its image entries at files that exist", () => {
    const images = entries.flatMap((e) => e.images ?? []);
    expect(images.length).toBeGreaterThan(8);
    for (const url of images) {
      expect(url.startsWith(`${HOST}/`), url).toBe(true);
      expect(existsSync(join(ROOT, "public", url.slice(HOST.length))), url).toBe(true);
    }
  });
});

describe("robots.txt", () => {
  const original = process.env.VERCEL_ENV;
  afterEach(() => {
    if (original === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = original;
  });

  it("lets crawlers in on production, except the API and signed-in areas, and names the sitemap", () => {
    process.env.VERCEL_ENV = "production";
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/admin"] });
    expect(r.sitemap).toBe(`${HOST}/sitemap.xml`);
  });

  it("keeps /order/thanks crawlable so its noindex is seen", () => {
    delete process.env.VERCEL_ENV;
    const disallow = [robots().rules].flat().flatMap((rule) => [rule.disallow ?? []].flat());
    expect(disallow.some((d) => "/order/thanks".startsWith(d))).toBe(false);
  });

  it("shuts crawlers out of preview deployments", () => {
    process.env.VERCEL_ENV = "preview";
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
