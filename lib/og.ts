/**
 * Per-page Open Graph share images (brief §4 asset spec: "Per-page OG images
 * (1200×630)"). Every indexable route has one JPG at public/og/{key}.jpg,
 * rendered by `npm run og` (scripts/og/generate.tsx) from the cards below.
 *
 * Every word on a card comes from the page itself: its H1 or a leading part
 * of it (content/drafts, lib/copy.ts), the flavour's name and tagline
 * (lib/flavors.ts). No prices, ratings or claims. Change a card here, then
 * run `npm run og` so the image matches. lib/og.test.ts checks every file.
 */
import { BUSINESS } from "./business";
import { copy } from "./copy";
import { getDraft } from "./drafts";
import { getEventBySlug } from "./events";
import { getFlavorBySlug, type Flavor } from "./flavors";
import { HERO_VIDEO, TRAY_VIDEO, productPhoto, type ImageAsset } from "./media";
import { allRoutes } from "./routes";
import type { OgImage } from "./seo";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** A run of headline words; `accent` runs are set in rose italic, as on the site's H1s. */
export type OgRun = { text: string; accent?: boolean };

export type OgCard = {
  path: string;
  /** File name under public/og, without ".jpg". */
  key: string;
  kicker: string;
  headline: OgRun[];
  /** A line in rose italic under the headline (a flavour's tagline). */
  subline?: string;
  /** The still on the right, cropped to 4:5. */
  photo: ImageAsset;
  alt: string;
};

/** "/" → "home", "/menu/dubai-chocolate" → "menu-dubai-chocolate". */
export function ogKey(path: string): string {
  return path.slice(1).replaceAll("/", "-") || "home";
}

type CardSpec = Pick<OgCard, "kicker" | "headline" | "subline" | "photo">;

function flavor(slug: string): Flavor {
  const f = getFlavorBySlug(slug);
  if (!f) throw new Error(`OG card: no flavour "${slug}"`);
  return f;
}

function h1(slug: string): string {
  const d = getDraft(slug);
  if (!d) throw new Error(`OG card: no page draft "${slug}"`);
  return d.h1;
}

/** `text` as runs, with `accent` (a part of it) in rose italic. */
function accented(text: string, accent?: string): OgRun[] {
  if (!accent) return [{ text }];
  const at = text.indexOf(accent);
  if (at < 0) throw new Error(`OG card: "${accent}" is not part of "${text}"`);
  const runs: OgRun[] = [
    { text: text.slice(0, at).trim() },
    { text: accent, accent: true },
    { text: text.slice(at + accent.length).trim() },
  ];
  return runs.filter((r) => r.text);
}

/** The part of `text` from `from` through `to`, first letter capitalised: trims a long H1 to a headline. */
function excerpt(text: string, from: string, to: string): string {
  const start = text.indexOf(from);
  const end = text.indexOf(to, start);
  if (start < 0 || end < 0) throw new Error(`OG card: can't cut "${from}…${to}" from "${text}"`);
  const part = text.slice(start, end + to.length);
  return part[0].toUpperCase() + part.slice(1);
}

/** A page built from a draft: its H1 (or a leading part of it), with the rose italic on its second half. */
function draftCard(slug: string, kicker: string, photo: ImageAsset, accent: string, cut?: [string, string]): CardSpec {
  const text = cut ? excerpt(h1(slug), ...cut) : h1(slug);
  return { kicker, headline: accented(text, accent), photo };
}

function eventKicker(slug: string): string {
  const e = getEventBySlug(slug);
  if (!e) throw new Error(`OG card: no event type "${slug}"`);
  return `Events · ${e.label}`;
}

const product = (slug: string) => productPhoto(flavor(slug));

const hero = copy.hero;

/**
 * The fixed and draft pages. Photos: the hero flavour on the homepage, the
 * tray for the pages about packs and areas, and a fitting product still
 * for the rest.
 */
const PAGE_CARDS: Record<string, CardSpec> = {
  "/": {
    // The hero's first line, shortened to fit the card ("Hand-layered dessert cups in Hamilton, Ontario").
    kicker: "Hand-layered in Hamilton, Ontario",
    headline: accented(`${hero.line1} ${hero.line2Pre}${hero.line2Italic}${hero.line2Post} ${hero.line3}`, hero.line2Italic),
    photo: HERO_VIDEO.poster,
  },
  // The H1s of app/menu/page.tsx and app/order/page.tsx, and their small first lines (lib/copy.ts).
  "/menu": {
    kicker: copy.menuPage.kicker,
    headline: accented(`${copy.menuPage.headingPre} ${copy.menuPage.headingItalic}`, copy.menuPage.headingItalic),
    photo: product("strawberry-fields"),
  },
  "/order": {
    kicker: copy.orderPage.kicker,
    headline: accented(`${copy.orderPage.headingPre} ${copy.orderPage.headingItalic}`, copy.orderPage.headingItalic),
    photo: product("biscoff-bliss"),
  },

  "/events": draftCard("events", "Events", product("kinder-bueno"), "every kind of event"),
  "/events/weddings": draftCard("weddings", eventKicker("weddings"), product("ferrero-royale"), "the dessert table", ["Wedding", "dessert table"]),
  "/events/baby-showers": draftCard("baby-showers", eventKicker("baby-showers"), product("blueberry-haze"), "picked by colour"),
  // These two H1s are too long to set large; the kicker already names the event.
  "/events/bridal-showers": draftCard("bridal-showers", eventKicker("bridal-showers"), product("dubai-chocolate"), "dessert cups", ["Bridal", "dessert cups"]),
  "/events/birthdays": draftCard("birthdays", eventKicker("birthdays"), product("strawberry-fields"), "hand-layered in Hamilton"),
  "/events/graduations": draftCard("graduations", eventKicker("graduations"), product("mango-dream"), "for the open-house crowd", ["dessert cups", "crowd"]),
  "/events/corporate": draftCard("corporate", eventKicker("corporate"), product("tiramisu"), "hand-layered for the office"),
  "/events/celebrations": draftCard("celebrations", eventKicker("celebrations"), product("mango-dream"), "cultural and religious celebrations"),

  "/dessert-cups-hamilton": draftCard("dessert-cups-hamilton", "Hamilton", TRAY_VIDEO.poster, "made fresh the morning of pickup"),
  "/dessert-cups-gta": draftCard("dessert-cups-gta", "Across the GTA", TRAY_VIDEO.poster, "delivered on Saturdays", ["Dessert cups", "on Saturdays"]),
  "/packages": draftCard("packages", "Packages", TRAY_VIDEO.poster, "from mini shooters to full cups"),
  "/faq": draftCard("faq", "Questions and answers", product("blueberry-haze"), "before you order", ["good to know", "you order"]),
  "/open-a-shop": draftCard("open-a-shop", "Our first shop", product("dubai-chocolate"), "our first shop"),
};

/**
 * /menu/[flavour]: the flavour's own photo, name and tagline. The kicker
 * leaves out the filter category, which is still open for Tiramisu.
 */
function flavorCard(f: Flavor): CardSpec {
  return {
    kicker: `Menu · ${f.tier === "premium" ? "Premium" : "Classic"}`,
    headline: [{ text: f.name }],
    subline: f.tagline,
    photo: productPhoto(f),
  };
}

function lowerFirst(s: string): string {
  return s[0].toLowerCase() + s.slice(1);
}

/** What the photo shows, as a phrase: "a Mango Dream dessert cup: saffron-orange mango layer …". */
function photoPhrase(photo: ImageAsset): string {
  const slug = /^\/media\/products\/(.+)\.webp$/.exec(photo.src)?.[1];
  if (slug) {
    const f = flavor(slug);
    return `a ${f.name} dessert cup: ${lowerFirst(f.visualSignature)}`;
  }
  return lowerFirst(photo.alt);
}

function quoted(s: string): string {
  return `“${s}”`;
}

export function headlineText(card: Pick<OgCard, "headline">): string {
  return card.headline.map((r) => r.text).join(" ");
}

function altText(spec: CardSpec): string {
  const words = [headlineText(spec), spec.subline].filter((s): s is string => Boolean(s));
  const what = words.length > 1 ? `the words ${words.map(quoted).join(" and ")}` : `the headline ${quoted(words[0])}`;
  const stop = /[.!?]$/.test(words[words.length - 1]) ? "" : ".";
  return `Photo of ${photoPhrase(spec.photo)} Beside it, the ${BUSINESS.name} wordmark and ${what}${stop}`;
}

function specFor(path: string): CardSpec | undefined {
  const flavorSlug = /^\/menu\/([^/]+)$/.exec(path)?.[1];
  if (flavorSlug) {
    const f = getFlavorBySlug(flavorSlug);
    return f && flavorCard(f);
  }
  return PAGE_CARDS[path];
}

/** One card per indexable route (noindex pages such as /order/thanks keep the default image). */
export function ogCards(): OgCard[] {
  return allRoutes()
    .filter((r) => !r.noindex)
    .map((r) => {
      const spec = specFor(r.path);
      if (!spec) throw new Error(`OG card: no card for ${r.path}; add one to lib/og.ts and run npm run og`);
      return { path: r.path, key: ogKey(r.path), ...spec, alt: altText(spec) };
    });
}

/** The share image for a route, or null when it has none (noindex or unknown paths). */
export function ogImageFor(path: string): OgImage | null {
  const route = allRoutes().find((r) => r.path === path);
  if (!route || route.noindex) return null;
  const spec = specFor(path);
  if (!spec) return null;
  return { url: `/og/${ogKey(path)}.jpg`, width: OG_WIDTH, height: OG_HEIGHT, alt: altText(spec) };
}
