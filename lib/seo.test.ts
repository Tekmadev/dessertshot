import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BUSINESS } from "./business";
import { ROUTES, type RouteMeta } from "./routes";
import { DEFAULT_OG_IMAGE, TITLE_SEPARATOR, pageMetadata } from "./seo";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const routes: RouteMeta[] = Object.values(ROUTES);
const fullTitle = (r: RouteMeta) => (r.absoluteTitle ? r.title : `${r.title}${TITLE_SEPARATOR}${BUSINESS.name}`);

describe("pageMetadata()", () => {
  it("sets a self-referencing canonical and matching og:url", () => {
    const meta = pageMetadata({ title: "Menu", description: "d", path: "/menu" });
    expect(meta.alternates?.canonical).toBe("/menu");
    expect(meta.openGraph?.url).toBe("/menu");
  });

  it("lets the layout template brand a normal title, and brands the share title itself", () => {
    const meta = pageMetadata({ title: "Menu", description: "d", path: "/menu" });
    expect(meta.title).toBe("Menu");
    expect(meta.openGraph?.title).toBe(`Menu${TITLE_SEPARATOR}${BUSINESS.name}`);
  });

  it("uses an absolute title when asked (homepage)", () => {
    const meta = pageMetadata({ title: "Home title", description: "d", path: "/", absoluteTitle: true });
    expect(meta.title).toEqual({ absolute: "Home title" });
    expect(meta.openGraph?.title).toBe("Home title");
  });

  it("keeps noindex pages out of search with a fresh robots object", () => {
    expect(pageMetadata({ title: "x", description: "d", path: "/x", noindex: true }).robots).toEqual({ index: false, follow: true });
    expect(pageMetadata({ title: "x", description: "d", path: "/x" }).robots).toBeUndefined();
  });

  it("always includes a share image", () => {
    const meta = pageMetadata({ title: "x", description: "d", path: "/x" });
    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
  });
});

describe("route map", () => {
  it("has unique paths, titles and descriptions", () => {
    for (const key of ["path", "title", "description"] as const) {
      expect(new Set(routes.map((r) => r[key])).size, key).toBe(routes.length);
    }
  });

  it.each(routes)("$path has a search-friendly title and description length", (r) => {
    expect(r.path.startsWith("/")).toBe(true);
    expect(fullTitle(r).length).toBeLessThanOrEqual(65);
    expect(r.description.length).toBeGreaterThanOrEqual(70);
    expect(r.description.length).toBeLessThanOrEqual(160);
  });
});

describe("site-wide SEO conventions", () => {
  const pageFiles = (readdirSync(join(ROOT, "app"), { recursive: true }) as string[])
    .filter((f) => f.endsWith("page.tsx"))
    .map((f) => join("app", f));

  it("finds the app's pages", () => {
    expect(pageFiles.length).toBeGreaterThanOrEqual(3);
  });

  it.each(pageFiles)("%s builds its metadata from the route map", (file) => {
    const source = readFileSync(join(ROOT, file), "utf8");
    expect(source).toMatch(/pageMetadata\(ROUTES\.\w+\)/);
  });

  it("has a page file for every route in the map", () => {
    for (const r of routes) {
      const file = r.path === "/" ? "app/page.tsx" : `app${r.path}/page.tsx`;
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
  });

  it("never sets a canonical in the root layout (pages would inherit it)", () => {
    // The canonical lives under `alternates`; the layout must not set it.
    expect(readFileSync(join(ROOT, "app/layout.tsx"), "utf8")).not.toMatch(/alternates\s*:/);
  });

  it("resolves canonicals against the host production serves (www)", () => {
    // Production: https://dessertshot.ca → 307 → https://www.dessertshot.ca (200).
    expect(new URL(BUSINESS.url).host).toBe("www.dessertshot.ca");
    expect(new URL(BUSINESS.url).protocol).toBe("https:");
  });

  it("points the default share image at a file that exists", () => {
    expect(existsSync(join(ROOT, "public", DEFAULT_OG_IMAGE.url))).toBe(true);
    expect([DEFAULT_OG_IMAGE.width, DEFAULT_OG_IMAGE.height]).toEqual([1200, 630]);
  });
});
