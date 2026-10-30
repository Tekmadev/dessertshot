import { describe, expect, it } from "vitest";
import { DRAFT_TOKENS, PAGE_DRAFTS, draftStrings, type PageDraft } from "./drafts";
import { EVENT_TYPES, EVENT_VALUES } from "./events";
import { FLAVORS, comesInSize } from "./flavors";
import type { CupSize } from "./pricing";

const FIXED_PATHS = new Set(["/", "/menu", "/packages", "/order", "/faq", "/events", "/dessert-cups-hamilton", "/dessert-cups-gta", "/about"]);
const FLAVOR_SLUGS = new Set(FLAVORS.map((f) => f.slug));
const FLAVOR_IDS = new Set(FLAVORS.map((f) => f.id));
const EVENT_SLUGS = new Set(EVENT_TYPES.map((e) => e.slug));

function linksIn(d: PageDraft): string[] {
  const out = draftStrings(d).flatMap((s) => [...s.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]));
  return [...out, d.cta.href];
}

function linkProblem(href: string): string | null {
  if (href.startsWith("{{mailto}}")) return null;
  const [path, query] = href.split("?");
  const clean = path.replace(/#.*$/, "");
  if (clean === "/order" && query) {
    const size = new URLSearchParams(query).get("size") as CupSize | null;
    for (const [k, v] of new URLSearchParams(query)) {
      if (k === "pack" && !["24", "48", "96"].includes(v)) return `bad pack ${v}`;
      if (k === "size" && !["2oz", "5oz"].includes(v)) return `bad size ${v}`;
      if (k === "flavour" && !v.split(",").every((id) => FLAVOR_IDS.has(id))) return `bad flavour ${v}`;
      if (k === "flavour" && size) {
        const off = v.split(",").filter((id) => !comesInSize(FLAVORS.find((f) => f.id === id)!, size));
        if (off.length) return `${off.join(",")} doesn't come in ${size}`;
      }
      if (k === "event" && !EVENT_VALUES.includes(v)) return `bad event ${v}`;
      if (!["pack", "size", "flavour", "event"].includes(k)) return `unknown param ${k}`;
    }
    return null;
  }
  if (FIXED_PATHS.has(clean)) return null;
  const menu = clean.match(/^\/menu\/([a-z0-9-]+)$/);
  if (menu) return FLAVOR_SLUGS.has(menu[1]) ? null : `unknown flavour page ${clean}`;
  const ev = clean.match(/^\/events\/([a-z0-9-]+)$/);
  if (ev) return EVENT_SLUGS.has(ev[1]) ? null : `unknown event page ${clean}`;
  return `link outside the site map: ${href}`;
}

describe("page drafts", () => {
  // 12 public drafts; the /open-a-shop draft stays out of the public repo until approved.
  it("has the pages the plan calls for, one per event type", () => {
    expect(PAGE_DRAFTS).toHaveLength(12);
    const paths = PAGE_DRAFTS.map((d) => d.path);
    for (const e of EVENT_TYPES) expect(paths).toContain(`/events/${e.slug}`);
    for (const p of ["/events", "/dessert-cups-hamilton", "/dessert-cups-gta", "/faq", "/packages"]) expect(paths).toContain(p);
    expect(paths).not.toContain("/open-a-shop");
    expect(new Set(PAGE_DRAFTS.map((d) => d.slug)).size).toBe(12);
  });

  it("are all awaiting the owner's review", () => {
    for (const d of PAGE_DRAFTS) expect(d.status, d.slug).toBe("awaiting-owner-review");
  });

  it.each(PAGE_DRAFTS)("$path has search-friendly meta lengths", (d) => {
    expect(d.metaTitle.length).toBeLessThanOrEqual(55);
    expect(d.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(d.metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("has unique titles, descriptions and h1s", () => {
    for (const k of ["metaTitle", "metaDescription", "h1"] as const) {
      expect(new Set(PAGE_DRAFTS.map((d) => d[k])).size, k).toBe(PAGE_DRAFTS.length);
    }
  });

  it("shares no paragraph between pages (no doorway pages, brief §8.7)", () => {
    const seen = new Map<string, string>();
    for (const d of PAGE_DRAFTS) {
      const paras = [d.intro, ...d.sections.map((s) => s.body)].flatMap((b) => b.split(/\n{2,}/)).map((p) => p.trim()).filter((p) => p.length > 80);
      for (const p of paras) {
        const other = seen.get(p);
        expect(other === undefined || other === d.slug, `"${p.slice(0, 60)}…" is on ${other} and ${d.slug}`).toBe(true);
        seen.set(p, d.slug);
      }
    }
  });

  it.each(PAGE_DRAFTS)("$path links only to real routes, flavours, events and order options", (d) => {
    for (const href of linksIn(d)) expect(linkProblem(href), `${d.slug}: ${href}`).toBeNull();
  });

  it.each(PAGE_DRAFTS)("$path uses only known tokens and no leftover placeholders", (d) => {
    for (const s of draftStrings(d).concat(d.cta.href)) {
      for (const m of s.matchAll(/\{\{([^}]+)\}\}/g)) expect(DRAFT_TOKENS as readonly string[]).toContain(m[1]);
      expect(s).not.toMatch(/\$\{|\[OWNER|TODO|TBD/);
    }
  });

  it.each(PAGE_DRAFTS)("$path makes no banned claims", (d) => {
    const banned = [/certified/i, /c(o)?eliac[- ]safe/i, /allergy[- ]safe/i, /\bbest\b/i, /#1\b/, /number one/i, /visit our (shop|store|caf)/i, /\bbak(e|ed|es|ing)\b/i, /better the value|bigger the pack/i, /flavou?r recommendation|recommend a mix/i, /labell?ed by flavou?r/i, /priced as a classic/i];
    for (const s of draftStrings(d)) for (const re of banned) expect(s, `${d.slug}: ${re}`).not.toMatch(re);
  });

  it.each(PAGE_DRAFTS)("$path only ever denies 'nut-free', never claims it", (d) => {
    for (const s of draftStrings(d)) {
      for (const sentence of s.split(/(?<=[.!?])\s+/)) {
        if (/nut[- ]free/i.test(sentence)) expect(sentence, d.slug).toMatch(/\b(not|never|no)\b|n't/i);
      }
    }
  });

  // Outside the FAQ page, gluten-free/eggless appears only via the {{dietaryClaim}} token, or in a FAQ
  // question whose answer uses that token, so switching the claim off can drop the whole entry.
  it("states the dietary claim only through the {{dietaryClaim}} switch", () => {
    for (const d of PAGE_DRAFTS.filter((x) => x.slug !== "faq")) {
      const faqQs = new Set(d.faqs.filter((f) => f.a.includes("{{dietaryClaim}}")).map((f) => f.q));
      for (const s of draftStrings(d)) {
        if (faqQs.has(s)) continue;
        expect(s, d.slug).not.toMatch(/gluten-free|eggless/i);
      }
    }
  });
});
