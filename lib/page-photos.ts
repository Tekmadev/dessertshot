/**
 * The photos each page shows, in one place: the pages render them and the
 * image sitemap (app/sitemap.ts) lists them, so the two can't disagree.
 * Draft pages show the flavours their own copy names, in the order it names
 * them (up to three), or the tray when they name none.
 */
import { PAGE_DRAFTS } from "./drafts";
import { EVENT_TYPES, type EventType } from "./events";
import { FLAVORS, type Flavor } from "./flavors";
import { HERO_VIDEO, TRAY_VIDEO, productPhoto, type ImageAsset } from "./media";

export const DRAFT_PHOTO_LIMIT = 3;

export type PagePhoto = ImageAsset & { flavor?: Pick<Flavor, "name" | "slug"> };

const flavorPhoto = (f: Flavor): PagePhoto => ({ ...productPhoto(f), flavor: { name: f.name, slug: f.slug } });

/** Flavours a draft's intro and sections name, first mention first. */
export function flavorsNamedIn(text: string): Flavor[] {
  return FLAVORS.map((f) => ({ f, at: text.indexOf(f.name) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((x) => x.f);
}

export function pagePhotos(path: string): PagePhoto[] {
  if (path === "/") return [HERO_VIDEO.poster, ...FLAVORS.map(flavorPhoto), TRAY_VIDEO.poster];
  if (path === "/menu") return [TRAY_VIDEO.poster, ...FLAVORS.map(flavorPhoto)];
  const flavor = FLAVORS.find((f) => path === `/menu/${f.slug}`);
  if (flavor) return [flavorPhoto(flavor)];
  const draft = PAGE_DRAFTS.find((d) => d.path === path);
  if (draft) {
    const named = flavorsNamedIn([draft.intro, ...draft.sections.map((s) => s.body)].join("\n"));
    return named.length ? named.slice(0, DRAFT_PHOTO_LIMIT).map(flavorPhoto) : [TRAY_VIDEO.poster];
  }
  return [];
}

/** Event pages whose own copy names this flavour (for "In our event guides" on its page). */
export function eventsNaming(f: Pick<Flavor, "name">): EventType[] {
  return EVENT_TYPES.filter((e) => {
    const d = PAGE_DRAFTS.find((x) => x.path === `/events/${e.slug}`);
    return d ? [d.intro, ...d.sections.map((s) => s.body)].join("\n").includes(f.name) : false;
  });
}
