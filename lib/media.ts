/**
 * Every photo and video the pages use (brief §4.3), in one place so paths,
 * sizes and alt text can't drift. Generated with Higgsfield from the owner's
 * photos; the ledger and source jobs are in ASSETS.md. lib/media.test.ts
 * checks that each file exists.
 */
import type { Flavor } from "./flavors";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type VideoAsset = {
  mp4: string;
  webm: string;
  /** Lighter encodes for phones. */
  mobileMp4: string;
  mobileWebm: string;
  /** The first frame, shown before (or instead of) playback. */
  poster: ImageAsset;
};

/** The picked product still for a flavour (ASSETS.md, rows 12–20). */
export function productPhoto(f: Pick<Flavor, "slug" | "name" | "visualSignature">): ImageAsset {
  return {
    src: `/media/products/${f.slug}.webp`,
    width: 1440,
    height: 1800,
    alt: `${f.name} dessert cup. ${f.visualSignature}`,
  };
}

/** P2: slow push-in on the Dubai Chocolate cup (Kling 3.0, ASSETS.md row 21). */
export const HERO_VIDEO: VideoAsset = {
  mp4: "/media/video/hero.mp4",
  webm: "/media/video/hero.webm",
  mobileMp4: "/media/video/hero-mobile.mp4",
  mobileWebm: "/media/video/hero-mobile.webm",
  poster: {
    src: "/media/posters/hero.webp",
    width: 1080,
    height: 1348,
    alt: "A Dubai Chocolate dessert cup: pistachio cream around a band of golden kunafa, under dark ganache with a pistachio swirl, crushed pistachio and rose petals.",
  },
};

/** P3: slow pass across a tray of cups, from the owner's own photo (ASSETS.md row 23). */
export const TRAY_VIDEO: VideoAsset = {
  mp4: "/media/video/tray.mp4",
  webm: "/media/video/tray.webm",
  mobileMp4: "/media/video/tray-mobile.mp4",
  mobileWebm: "/media/video/tray-mobile.webm",
  poster: {
    src: "/media/posters/tray.webp",
    width: 1280,
    height: 720,
    alt: "A tray of Dubai Chocolate, Kinder Bueno and Ferrero Royale dessert cups, made that morning.",
  },
};
