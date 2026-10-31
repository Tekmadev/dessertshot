import { describe, expect, it } from "vitest";
import { BUSINESS, SERVICE_AREA } from "./business";
import { PAGE_DRAFTS } from "./drafts";
import { FLAVORS, comesInSize } from "./flavors";
import { SITE_TOKENS } from "./markdown";
import { MENU_PRICES } from "./pricing";
import { allRoutes } from "./routes";
import {
  BUSINESS_ID,
  WEBSITE_ID,
  businessNode,
  crumbsFor,
  faqNode,
  flavorOffers,
  flavorProductNode,
  entryOffer,
  menuNode,
  pageGraph,
  priceBounds,
  serializeJsonLd,
  siteGraph,
  websiteNode,
} from "./structured-data";

const HOST = "https://www.dessertshot.ca";
const indexable = allRoutes().filter((r) => !r.noindex);
const everyGraph = () => [siteGraph(), ...indexable.map((r) => pageGraph(r.path)).filter((g) => g !== null)];

/** Every string anywhere in a JSON value, with the key it sits under. */
function strings(value: unknown, key = ""): { key: string; value: string }[] {
  if (typeof value === "string") return [{ key, value }];
  if (Array.isArray(value)) return value.flatMap((v) => strings(v, key));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => strings(v, k));
  return [];
}
function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => [k, ...keys(v)]);
  return [];
}

describe("the site graph (every page)", () => {
  it("names the site and business by the full brand, with the short form as an alternate", () => {
    const site = websiteNode();
    expect(site.name).toBe("Dessert Shot by Farhana");
    expect(site.alternateName).toContain("Dessert Shot");
    expect(site.url).toBe(HOST);
    const biz = businessNode() as unknown as Record<string, unknown>;
    expect(biz.name).toBe("Dessert Shot by Farhana");
    expect(biz.alternateName).toBe("Dessert Shot");
  });

  it("describes a service-area business: city-level address, no street, no coordinates", () => {
    const biz = businessNode() as unknown as Record<string, unknown>;
    expect(biz.address).toEqual({ "@type": "PostalAddress", addressLocality: "Hamilton", addressRegion: "ON", addressCountry: "CA" });
    expect(keys(siteGraph())).not.toEqual(expect.arrayContaining(["streetAddress"]));
    for (const k of ["streetAddress", "postalCode", "geo", "latitude", "longitude", "hasMap"]) expect(keys(siteGraph())).not.toContain(k);
    const served = (biz.areaServed as { name: string }[]).map((c) => c.name);
    expect(served).toEqual([...SERVICE_AREA.deliveryCities]);
  });

  it("takes the price range, contact details and profiles from the fact sources", () => {
    const biz = businessNode() as unknown as Record<string, unknown>;
    expect(priceBounds()).toEqual({ low: 45, high: 499 });
    expect(biz.priceRange).toBe("$45–$499");
    expect(biz.telephone).toBe("+1-438-700-3223");
    expect(biz.email).toBe(BUSINESS.email);
    expect(biz.sameAs).toEqual([BUSINESS.instagram.url, BUSINESS.facebook.url]);
    expect(biz.foundingDate).toBe("2024");
  });

  it("never claims what the pages don't: no ratings, reviews, hours or certifications", () => {
    for (const g of everyGraph()) {
      for (const k of ["aggregateRating", "review", "reviewRating", "openingHours", "openingHoursSpecification", "award", "hasCredential", "suitableForDiet"]) {
        expect(keys(g)).not.toContain(k);
      }
    }
  });
});

describe("per-page graphs", () => {
  it("gives every indexable inner page breadcrumbs that start at Home and end on the page", () => {
    for (const r of indexable.filter((x) => x.path !== "/")) {
      const crumbs = crumbsFor(r.path);
      expect(crumbs[0]).toEqual({ name: "Home", path: "/" });
      expect(crumbs.at(-1)!.path).toBe(r.path);
      for (const c of crumbs) expect(c.name, r.path).not.toMatch(/^[a-z-]+$/); // a real name, not a slug
      const list = pageGraph(r.path)!["@graph"].find((n) => (n as { "@type": string })["@type"] === "BreadcrumbList") as unknown as {
        itemListElement: { position: number; item: string }[];
      };
      expect(list.itemListElement.map((i) => i.position)).toEqual(crumbs.map((_, i) => i + 1));
      expect(list.itemListElement.at(-1)!.item).toBe(`${HOST}${r.path}`);
    }
    expect(pageGraph("/")).toBeNull();
  });

  it("uses only absolute production URLs and leaves no markup or tokens behind", () => {
    for (const g of everyGraph()) {
      for (const { key, value } of strings(g)) {
        if (["url", "item", "image", "logo", "hasMenu", "sameAs", "@id", "availability"].includes(key)) {
          expect(value, key).toMatch(/^https:\/\//);
          if (!["sameAs", "availability"].includes(key)) expect(value.startsWith(HOST), value).toBe(true);
        }
        expect(value).not.toMatch(/\{\{|\*\*|\]\(|undefined|NaN/);
      }
    }
  });

  it("ties page nodes to the site: offers name the business as seller, FAQ pages belong to the WebSite", () => {
    for (const r of indexable.filter((x) => x.path !== "/")) {
      for (const node of pageGraph(r.path)!["@graph"] as { "@type": string; offers?: unknown; isPartOf?: unknown }[]) {
        if (node["@type"] === "Product") expect((node.offers as { seller: unknown }).seller, r.path).toEqual({ "@id": BUSINESS_ID });
        if (node["@type"] === "FAQPage") expect(node.isPartOf, r.path).toEqual({ "@id": WEBSITE_ID });
      }
    }
    const menuSellers = strings(pageGraph("/menu")).filter((s) => s.key === "@id" && s.value === BUSINESS_ID);
    expect(menuSellers.length).toBeGreaterThan(0);
  });
});

describe("offers", () => {
  it("lists every pack of each flavour from lib/pricing.ts, in the sizes it comes in (the /menu Menu)", () => {
    for (const f of FLAVORS) {
      const offers = flavorOffers(f);
      const sizes = (["2oz", "5oz"] as const).filter((s) => comesInSize(f, s));
      expect(offers).toHaveLength(sizes.length * 3);
      const expected = sizes.flatMap((s) => [24, 48, 96].map((p) => MENU_PRICES[s][f.tier][p as 24 | 48 | 96].toFixed(2)));
      expect(offers.map((o) => o.price)).toEqual(expected);
      for (const o of offers) expect(String(o.name)).toMatch(new RegExp(`^${f.name} .+, pack of (24|48|96)$`));
    }
    const tiramisu = FLAVORS.find((f) => f.id === "tiramisu")!;
    expect(flavorOffers(tiramisu).every((o) => String(o.name).includes("5 oz"))).toBe(true);
  });

  it("gives each flavour product one Offer, named for the pack it prices, with no availability Google doesn't list", () => {
    for (const f of FLAVORS) {
      const product = flavorProductNode(f) as unknown as { name: string; offers: { "@type": string; name: string; price: string; availability?: string } };
      expect(product.name).toBe(`${f.name} dessert cups`);
      expect(product.offers["@type"]).toBe("Offer");
      expect(product.offers).toEqual(entryOffer(f));
      const size = comesInSize(f, "2oz") ? "2oz" : "5oz";
      expect(product.offers.price).toBe(MENU_PRICES[size][f.tier][24].toFixed(2));
      expect(product.offers.name).toMatch(/, pack of 24$/);
      expect(product.offers.availability).toBeUndefined();
    }
    for (const g of everyGraph()) expect(keys(g)).not.toContain("AggregateOffer");
    expect(JSON.stringify(everyGraph())).not.toContain('"AggregateOffer"');
  });

  it("lists every flavour on the menu once, by tier", () => {
    const sections = (menuNode() as unknown as { hasMenuSection: { hasMenuItem: { name: string }[] }[] }).hasMenuSection;
    expect(sections.flatMap((s) => s.hasMenuItem.map((i) => i.name)).sort()).toEqual(FLAVORS.map((f) => f.name).sort());
  });

  it("keeps product markup off /packages, a listing page", () => {
    const types = pageGraph("/packages")!["@graph"].map((n) => (n as { "@type": string })["@type"]);
    expect(types).not.toContain("Product");
    expect(types).not.toContain("ItemList");
  });
});

describe("FAQ", () => {
  it("marks up exactly the questions a draft page shows, as plain text", () => {
    for (const d of PAGE_DRAFTS) {
      const node = faqNode(d.path, d.faqs) as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | null;
      if (!d.faqs.length) {
        expect(node).toBeNull();
        continue;
      }
      expect(node!.mainEntity.map((q) => q.name)).toEqual(d.faqs.map((f) => f.q));
      for (const q of node!.mainEntity) expect(q.acceptedAnswer.text).not.toMatch(/\*\*|\]\(|\{\{/);
    }
  });

  it("drops the questions built on the dietary claim when it's switched off", () => {
    const off = { ...SITE_TOKENS, dietaryClaim: null };
    const faq = PAGE_DRAFTS.find((d) => d.slug === "faq")!;
    const node = faqNode(faq.path, faq.faqs, off) as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(node.mainEntity.map((q) => q.name)).not.toContain("Are your dessert cups gluten-free and eggless?");
    for (const q of node.mainEntity) expect(`${q.name} ${q.acceptedAnswer.text}`).not.toMatch(/gluten-free|eggless/i);
  });
});

describe("serializeJsonLd", () => {
  it("can't be broken out of its <script> tag", () => {
    const out = serializeJsonLd({ "@context": "https://schema.org", "@graph": [{ "@type": "Thing", name: "</script><b>&" }] });
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)["@graph"][0].name).toBe("</script><b>&");
  });
});
