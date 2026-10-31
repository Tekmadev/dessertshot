import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PAGE_DRAFTS } from "./drafts";
import { FLAVORS } from "./flavors";
import { DRAFT_PHOTO_LIMIT, eventsNaming, pagePhotos } from "./page-photos";
import { allRoutes, flavorRoute } from "./routes";

const PUBLIC = fileURLToPath(new URL("../public", import.meta.url));
const draftText = (path: string) => {
  const d = PAGE_DRAFTS.find((x) => x.path === path)!;
  return [d.intro, ...d.sections.map((s) => s.body)].join("\n");
};

describe("page photos", () => {
  it("gives every indexable page at least one photo, each a real file with alt text", () => {
    for (const r of allRoutes().filter((x) => !x.noindex && x.path !== "/order")) {
      const photos = pagePhotos(r.path);
      expect(photos.length, r.path).toBeGreaterThan(0);
      for (const p of photos) {
        expect(existsSync(join(PUBLIC, p.src)), p.src).toBe(true);
        expect(p.alt.length, p.src).toBeGreaterThan(20);
      }
    }
  });

  it("shows on a draft page only flavours its own copy names, first mention first", () => {
    for (const d of PAGE_DRAFTS) {
      const photos = pagePhotos(d.path).filter((p) => p.flavor);
      expect(photos.length).toBeLessThanOrEqual(DRAFT_PHOTO_LIMIT);
      const text = draftText(d.path);
      const at = photos.map((p) => text.indexOf(p.flavor!.name));
      for (const i of at) expect(i, d.path).toBeGreaterThanOrEqual(0);
      // In order of first mention, checked against the text itself (not the helper)...
      for (let i = 1; i < at.length; i++) expect(at[i], d.path).toBeGreaterThan(at[i - 1]);
      // ...and no flavour left out of the strip is named before the last one shown.
      const shown = new Set(photos.map((p) => p.flavor!.slug));
      const lastShown = Math.max(...at, -1);
      for (const f of FLAVORS.filter((x) => !shown.has(x.slug))) {
        const i = text.indexOf(f.name);
        if (i >= 0 && photos.length === DRAFT_PHOTO_LIMIT) expect(i, `${d.path}: ${f.name}`).toBeGreaterThan(lastShown);
        if (i >= 0 && photos.length < DRAFT_PHOTO_LIMIT) throw new Error(`${d.path} names ${f.name} but leaves it out with room to spare`);
      }
    }
    expect(pagePhotos("/events/weddings").map((p) => p.flavor?.name)).toEqual(["Dubai Chocolate", "Strawberry Fields", "Mango Dream"]);
    expect(pagePhotos("/faq").map((p) => p.flavor?.name)).toEqual(["Ferrero Royale", "Dubai Chocolate", "Kinder Bueno"]);
  });
});

describe("event guides on flavour pages", () => {
  it("links a flavour only to event pages whose copy names it, and every flavour to at least one", () => {
    for (const f of FLAVORS) {
      const events = eventsNaming(f);
      expect(events.length, f.name).toBeGreaterThan(0);
      for (const e of events) expect(draftText(`/events/${e.slug}`), `${f.name} → ${e.slug}`).toContain(f.name);
    }
  });
});

describe("flavour page descriptions", () => {
  it("lead with the flavour's dessert-cup intent and fit search results", () => {
    for (const f of FLAVORS) {
      const d = flavorRoute(f).description;
      expect(d, f.slug).toMatch(/dessert cups:/);
      expect(d.length, f.slug).toBeGreaterThanOrEqual(120);
      expect(d.length, f.slug).toBeLessThanOrEqual(160);
      expect(d, f.slug).toContain(f.tier === "premium" ? "Premium" : "Classic");
    }
    expect(new Set(FLAVORS.map((f) => flavorRoute(f).description)).size).toBe(FLAVORS.length);
  });
});
