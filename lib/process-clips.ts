/**
 * The morning-of process on the homepage (components/sections/MorningOf.tsx):
 * six steps from the crumb to the hand-off, and the short clips that will
 * show them.
 *
 * Process footage is generated later (no people or hands in frame). Until a
 * step has a clip, the section plays the tray video for every step. To add
 * one, encode it the way the hero and tray are encoded (lib/media.ts): beside
 * `name.mp4` sit `name.webm`, `name-mobile.mp4` and `name-mobile.webm`, and a
 * WebP poster of the first frame. Then list it in PROCESS_CLIPS. The tests
 * check that every file exists.
 *
 * Step copy states only owner-confirmed facts: made fresh the morning of
 * pickup or delivery, boxes of 24, free Hamilton pickup, Saturday delivery.
 */
import { SERVICE_AREA } from "./business";
import type { VideoAsset } from "./media";

export const PROCESS_STEP_IDS = ["pressed", "whipped", "layered", "topped", "boxed", "handed-off"] as const;

export type ProcessStepId = (typeof PROCESS_STEP_IDS)[number];

export type ProcessStep = {
  id: ProcessStepId;
  /** One word (or two) for the timeline. */
  label: string;
  /** One or two short, factual sentences. */
  body: string;
};

export type ProcessClip = {
  step: ProcessStepId;
  /** The desktop MP4, e.g. "/media/video/process-pressed.mp4". */
  src: string;
  /** The first frame as WebP, e.g. "/media/posters/process-pressed.webp". */
  poster: string;
  /** What the clip shows, for the poster's alt text. */
  alt: string;
};

/** "a, b and c". */
function listFormat(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: "pressed",
    label: "Pressed",
    body: "Most cups start with a crumb base, graham or Biscoff, pressed into the bottom.",
  },
  {
    id: "whipped",
    label: "Whipped",
    body: "The creams are whipped the same morning, one for each flavour.",
  },
  {
    id: "layered",
    label: "Layered",
    body: "Built by hand, bottom to top, each flavour in its own layers: fruit compote, ganache, melted Biscoff, kunafa.",
  },
  {
    id: "topped",
    label: "Topped",
    body: "Each flavour gets its own finish: cream rosettes, fresh blueberries, crushed pistachio, a Biscoff cookie standing upright.",
  },
  {
    id: "boxed",
    label: "Boxed",
    body: "Packed in boxes of 24: one box for a 24, two for a 48, four for a 96.",
  },
  {
    id: "handed-off",
    label: "Handed off",
    body: `Free pickup in ${SERVICE_AREA.pickupCity}, or Saturday delivery to ${listFormat(SERVICE_AREA.deliveryCities)}. Then into the fridge until dessert.`,
  },
];

/**
 * Generated process clips, at most one per step. Empty until the footage is
 * made: the section falls back to the tray video.
 */
export const PROCESS_CLIPS: readonly ProcessClip[] = [];

/** The clip for a step, if there is one. */
export function clipFor(step: ProcessStepId, clips: readonly ProcessClip[] = PROCESS_CLIPS): ProcessClip | undefined {
  return clips.find((c) => c.step === step);
}

/**
 * A clip as a VideoAsset (the shape components/media/LoopVideo.tsx plays),
 * with the encodes named the way lib/media.ts names the hero and tray. The
 * poster fills its frame, so its pixel size is nominal (16:9).
 */
export function clipVideo(clip: ProcessClip): VideoAsset {
  const base = clip.src.replace(/\.mp4$/i, "");
  return {
    mp4: `${base}.mp4`,
    webm: `${base}.webm`,
    mobileMp4: `${base}-mobile.mp4`,
    mobileWebm: `${base}-mobile.webm`,
    poster: { src: clip.poster, width: 1280, height: 720, alt: clip.alt },
  };
}
