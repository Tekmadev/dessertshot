import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getDraft } from "./drafts";
import { FLAVORS } from "./flavors";
import { OG_HEIGHT, OG_WIDTH, headlineText, ogCards, ogImageFor, ogKey } from "./og";
import { allRoutes } from "./routes";

const publicFile = (src: string) => fileURLToPath(new URL(`../public${src}`, import.meta.url));

const indexable = allRoutes().filter((r) => !r.noindex);

type JpegInfo = { width: number; height: number; markers: number[] };

/** Walks the JPEG's segments up to the first scan: frame size from the SOF marker, and every marker seen. */
function jpegInfo(buf: Buffer): JpegInfo {
  expect(buf.readUInt16BE(0), "starts with SOI").toBe(0xffd8);
  const markers: number[] = [];
  let size: { width: number; height: number } | undefined;
  let at = 2;
  while (at < buf.length) {
    expect(buf[at], `segment marker at byte ${at}`).toBe(0xff);
    const marker = buf[at + 1];
    markers.push(marker);
    if (marker === 0xda) break; // start of scan: image data follows
    const length = buf.readUInt16BE(at + 2);
    // SOF0–SOF15, except DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      size = { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
    }
    at += 2 + length;
  }
  expect(size, "has a SOF marker").toBeDefined();
  return { ...size!, markers };
}

describe("ogKey", () => {
  it("names the file after the path", () => {
    expect(ogKey("/")).toBe("home");
    expect(ogKey("/menu")).toBe("menu");
    expect(ogKey("/menu/dubai-chocolate")).toBe("menu-dubai-chocolate");
    expect(ogKey("/events/baby-showers")).toBe("events-baby-showers");
  });
});

describe("ogImageFor", () => {
  it.each(indexable.map((r) => [r.path]))("%s has its own share image", (path) => {
    const image = ogImageFor(path);
    expect(image).toEqual({ url: `/og/${ogKey(path)}.jpg`, width: OG_WIDTH, height: OG_HEIGHT, alt: expect.any(String) });
  });

  it("leaves noindex and unknown pages on the default image", () => {
    expect(ogImageFor("/order/thanks")).toBeNull();
    expect(ogImageFor("/no-such-page")).toBeNull();
  });

  it("gives every image its own alt text, naming the photo and the headline", () => {
    const cards = ogCards();
    const alts = cards.map((c) => c.alt);
    expect(new Set(alts).size).toBe(alts.length);
    for (const card of cards) {
      expect(ogImageFor(card.path)?.alt).toBe(card.alt);
      expect(card.alt).toMatch(/^Photo of /);
      expect(card.alt).toContain(headlineText(card));
      if (card.subline) expect(card.alt).toContain(card.subline);
    }
  });
});

describe("share image files", () => {
  it.each(indexable.map((r) => [r.path]))("%s: a 1200×630 JPEG under 250 KB with no metadata", (path) => {
    const { url } = ogImageFor(path)!;
    const file = publicFile(url);
    expect(existsSync(file), `${url} is missing: run npm run og`).toBe(true);
    expect(statSync(file).size).toBeLessThan(250 * 1024);

    const buf = readFileSync(file);
    const { width, height, markers } = jpegInfo(buf);
    expect([width, height]).toEqual([OG_WIDTH, OG_HEIGHT]);
    // No APP1 (Exif, XMP) or any other application segment but a JFIF APP0, and no comments.
    expect(markers).not.toContain(0xe1);
    expect(markers.filter((m) => m >= 0xe1 && m <= 0xef)).toEqual([]);
    expect(markers).not.toContain(0xfe);
    expect(buf.includes("Exif\0\0")).toBe(false);
    expect(buf.includes("ns.adobe.com/xap")).toBe(false);
  });

  it("has no stale images for pages that are gone", () => {
    const expected = new Set([...indexable.map((r) => `${ogKey(r.path)}.jpg`), "default.jpg"]);
    const files = readdirSync(publicFile("/og")).filter((f) => f.endsWith(".jpg"));
    expect(files.filter((f) => !expected.has(f))).toEqual([]);
  });
});

describe("card content", () => {
  it("says nothing the pages don't: no prices, numbers, ratings or dietary claims", () => {
    for (const card of ogCards()) {
      const text = [card.kicker, headlineText(card), card.subline ?? ""].join(" ");
      expect(text, card.path).not.toMatch(/[$\d]|gluten|eggless|rated|review|award|best|certified/i);
    }
  });

  it("takes each draft page's headline from its H1", () => {
    const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, " ");
    for (const card of ogCards()) {
      const draft = getDraft(card.path.split("/").pop() || "");
      if (!draft || draft.path !== card.path) continue;
      expect(normalise(draft.h1), card.path).toContain(normalise(headlineText(card)));
    }
  });

  it.each(FLAVORS.map((f) => [f.name, f] as const))("%s: its own photo, name and tagline", (_, f) => {
    const card = ogCards().find((c) => c.path === `/menu/${f.slug}`);
    expect(card?.photo.src).toBe(`/media/products/${f.slug}.webp`);
    expect(card && headlineText(card)).toBe(f.name);
    expect(card?.subline).toBe(f.tagline);
  });
});
