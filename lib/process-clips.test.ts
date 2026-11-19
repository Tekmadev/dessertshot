import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SERVICE_AREA } from "./business";
import { PROCESS_CLIPS, PROCESS_STEPS, PROCESS_STEP_IDS, clipFor, clipVideo, type ProcessClip } from "./process-clips";

const publicFile = (src: string) => fileURLToPath(new URL(`../public${src}`, import.meta.url));

// Words the owner ruled out (2026-10-30) or that would claim too much.
const BANNED: [RegExp, string][] = [
  [/\blids?\b/i, "the cups have no lids"],
  [/\bseal/i, "the cups aren't sealed"],
  [/\bbak(e|ed|es|ing)\b/i, "the cups are made, not baked"],
  [/certified|c(o)?eliac/i, "certification or medical claim"],
  [/\bbest\b|#1\b|number one/i, "unverifiable superlative"],
  [/recommend/i, "no flavour recommendations"],
  [/tray/i, "the presentation tray is an extra-cost option, not part of the process"],
];

describe("process steps", () => {
  it("run in the owner's order: pressed, whipped, layered, topped, boxed, handed off", () => {
    expect(PROCESS_STEPS.map((s) => s.id)).toEqual([...PROCESS_STEP_IDS]);
    expect(PROCESS_STEPS.map((s) => s.label)).toEqual(["Pressed", "Whipped", "Layered", "Topped", "Boxed", "Handed off"]);
  });

  it.each(BANNED)("never say %s", (pattern, why) => {
    for (const s of PROCESS_STEPS) {
      expect(s.label, why).not.toMatch(pattern);
      expect(s.body, why).not.toMatch(pattern);
    }
  });

  it("keep each step short", () => {
    for (const s of PROCESS_STEPS) expect(s.body.length, s.id).toBeLessThanOrEqual(150);
  });

  it("box in 24s and hand off by Hamilton pickup or Saturday delivery to every delivery city", () => {
    expect(PROCESS_STEPS.find((s) => s.id === "boxed")!.body).toContain("boxes of 24");
    const handoff = PROCESS_STEPS.find((s) => s.id === "handed-off")!.body;
    expect(handoff).toContain(`pickup in ${SERVICE_AREA.pickupCity}`);
    expect(handoff).toContain("Saturday");
    for (const city of SERVICE_AREA.deliveryCities) expect(handoff).toContain(city);
  });
});

describe("process clips", () => {
  it("name known steps, at most one clip each, with real alt text", () => {
    const steps = PROCESS_CLIPS.map((c) => c.step);
    expect(new Set(steps).size).toBe(steps.length);
    for (const c of PROCESS_CLIPS) {
      expect(PROCESS_STEP_IDS).toContain(c.step);
      expect(c.src, c.step).toMatch(/\.mp4$/);
      expect(c.poster, c.step).toMatch(/\.webp$/);
      expect(c.alt.length, c.step).toBeGreaterThan(20);
      expect(c.alt, c.step).not.toMatch(/\bhands?\b|\bperson\b|\bpeople\b/i);
    }
  });

  it("have every encode and a poster on disk", () => {
    for (const c of PROCESS_CLIPS) {
      const v = clipVideo(c);
      for (const src of [v.mp4, v.webm, v.mobileMp4, v.mobileWebm, v.poster.src]) {
        expect(existsSync(publicFile(src)), src).toBe(true);
      }
    }
  });

  it("finds a step's clip, or none", () => {
    const clip: ProcessClip = {
      step: "layered",
      src: "/media/video/process-layered.mp4",
      poster: "/media/posters/process-layered.webp",
      alt: "Cream piped over a graham crumb base in a clear cup.",
    };
    expect(clipFor("layered", [clip])).toBe(clip);
    expect(clipFor("boxed", [clip])).toBeUndefined();
    expect(clipFor("pressed", [])).toBeUndefined();
  });

  it("derives the encodes the way the hero and tray are named", () => {
    const v = clipVideo({
      step: "pressed",
      src: "/media/video/process-pressed.mp4",
      poster: "/media/posters/process-pressed.webp",
      alt: "Graham crumb pressed into the bottom of a clear cup.",
    });
    expect(v).toMatchObject({
      mp4: "/media/video/process-pressed.mp4",
      webm: "/media/video/process-pressed.webm",
      mobileMp4: "/media/video/process-pressed-mobile.mp4",
      mobileWebm: "/media/video/process-pressed-mobile.webm",
      poster: { src: "/media/posters/process-pressed.webp", alt: "Graham crumb pressed into the bottom of a clear cup." },
    });
  });
});
