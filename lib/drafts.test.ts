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
  it("has the pages the plan calls for, one per event type", () => {
    expect(PAGE_DRAFTS).toHaveLength(13);
    const paths = PAGE_DRAFTS.map((d) => d.path);
    for (const e of EVENT_TYPES) expect(paths).toContain(`/events/${e.slug}`);
    for (const p of ["/events", "/dessert-cups-hamilton", "/dessert-cups-gta", "/faq", "/packages", "/open-a-shop"]) expect(paths).toContain(p);
    expect(new Set(PAGE_DRAFTS.map((d) => d.slug)).size).toBe(13);
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

  it.each(PAGE_DRAFTS)("$path states notice deadlines the way the form counts them (to 9 AM)", (d) => {
    // lib/order-timing.ts counts notice to 9 AM on the date; a deadline tied to
    // the delivery or pickup time would promise later than the form accepts.
    const text = draftStrings(d).join("\n");
    expect(text).not.toMatch(
      /same time (of day|on)|counted to the time|(?<!9 AM )the Saturday before|hours before (the time|you|pickup|delivery|your)|least 48 hours before you need|no later than 48 hours/i
    );
  });

  it.each(PAGE_DRAFTS)("$path names the brand in full the first time (Dessert Shot by Farhana)", (d) => {
    // What a visitor reads, top to bottom; "Dessert Shot" alone is fine after that.
    const body = [d.h1, d.intro, ...d.sections.flatMap((s) => [s.heading, s.body]), ...d.faqs.flatMap((f) => [f.q, f.a])].join("\n");
    const first = body.match(/Dessert Shot(?!s\b)( by Farhana)?/);
    if (first) expect(first[1], first.input?.slice(Math.max(0, (first.index ?? 0) - 40), (first.index ?? 0) + 40)).toBe(" by Farhana");
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

  // Gluten-free/eggless appears only via the {{dietaryClaim}} token, or in a FAQ entry whose answer
  // uses that token (dropped whole when the claim is off), so the switch reaches meta and intros too.
  it("states the dietary claim only through the {{dietaryClaim}} switch", () => {
    for (const d of PAGE_DRAFTS) {
      const claimFaqs = d.faqs.filter((f) => f.a.includes("{{dietaryClaim}}"));
      const dropped = new Set(claimFaqs.flatMap((f) => [f.q, f.a]));
      for (const s of draftStrings(d)) {
        if (dropped.has(s)) continue;
        // Elsewhere only the token itself goes, so what's left must not make the claim either.
        expect(s.replaceAll("{{dietaryClaim}}", ""), d.slug).not.toMatch(/gluten-free|eggless/i);
      }
    }
  });
});
