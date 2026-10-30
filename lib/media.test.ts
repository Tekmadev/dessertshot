import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FLAVORS } from "./flavors";
import { HERO_VIDEO, TRAY_VIDEO, productPhoto } from "./media";

const publicFile = (src: string) => fileURLToPath(new URL(`../public${src}`, import.meta.url));

/** Width and height from a lossy WebP's VP8 header. */
function webpSize(src: string): [number, number] {
  const buf = readFileSync(publicFile(src));
  expect(buf.toString("ascii", 0, 4)).toBe("RIFF");
  expect(buf.toString("ascii", 12, 16)).toBe("VP8 ");
  return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
}

describe("product photos", () => {
  it.each(FLAVORS)("$name has its photo, at the size the registry says", (f) => {
    const photo = productPhoto(f);
    expect(existsSync(publicFile(photo.src)), photo.src).toBe(true);
    expect(webpSize(photo.src)).toEqual([photo.width, photo.height]);
    expect(photo.alt).toContain(f.name);
  });
});

describe("videos", () => {
  it.each([
    ["hero", HERO_VIDEO],
    ["tray", TRAY_VIDEO],
  ] as const)("the %s video has every encode and a poster of the stated size", (_, video) => {
    for (const src of [video.mp4, video.webm, video.mobileMp4, video.mobileWebm, video.poster.src]) {
      expect(existsSync(publicFile(src)), src).toBe(true);
    }
    expect(webpSize(video.poster.src)).toEqual([video.poster.width, video.poster.height]);
    expect(video.poster.alt.length).toBeGreaterThan(20);
  });
});
