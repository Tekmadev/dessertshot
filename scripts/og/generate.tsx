/**
 * Renders the per-page share images: public/og/{key}.jpg, 1200×630, one per
 * indexable route (lib/og.ts). `npm run og` renders them all; pass keys to
 * render only those (`npm run og -- home menu-tiramisu`).
 *
 * satori (via next/og's ImageResponse) draws the card to PNG, sharp turns it
 * into a JPEG with no metadata at all (no EXIF, XMP or ICC). The default
 * image, public/og/default.jpg, is never touched.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OG_HEIGHT, OG_WIDTH, ogCards, type OgCard } from "../../lib/og";
import { Card, COLUMN, LOGO, PHOTO, TYPE } from "./card";
import { FACES, INTER_TIGHT_SEMIBOLD, textWidth } from "./fonts";
import { fitText, toWords, type FittedText } from "./layout";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = join(ROOT, "public/og");
/** Stays well under the 250 KB the test allows. */
const MAX_BYTES = 230_000;

/**
 * Where to cut a 4:5 frame from a still that isn't 4:5 (source pixels).
 * The tray poster is 16:9: this keeps the Dubai Chocolate swirl in the
 * middle with Kinder Bueno cups above it.
 */
const CROPS: Record<string, { left: number; top: number; width: number; height: number }> = {
  "/media/posters/tray.webp": { left: 290, top: 0, width: 576, height: 720 },
};

/** Vertical room in the text column for kicker + headline + subline. */
const WORDMARK_HEIGHT = LOGO.height;
const MIN_GAP = 40;
const KICKER_BLOCK = TYPE.kicker.size + 24;
const MIDDLE_HEIGHT = OG_HEIGHT - COLUMN.top - COLUMN.bottom - WORDMARK_HEIGHT - TYPE.footer.size - 2 * MIN_GAP;

async function dataUri(file: string, width: number, height: number, crop?: (typeof CROPS)[string]): Promise<string> {
  let img = sharp(file);
  if (crop) img = img.extract(crop);
  const isPng = file.endsWith(".png");
  img = img.resize(width, height, { fit: "cover", kernel: "lanczos3" });
  const buf = await (isPng ? img.png() : img.jpeg({ quality: 92 })).toBuffer();
  return `data:image/${isPng ? "png" : "jpeg"};base64,${buf.toString("base64")}`;
}

function fit(card: OgCard): { headline: FittedText; subline?: FittedText } {
  // 42: the rose rule in front of the kicker and its gap.
  const kickerWidth = 42 + textWidth(INTER_TIGHT_SEMIBOLD, card.kicker.toUpperCase(), TYPE.kicker.size, TYPE.kicker.tracking * TYPE.kicker.size);
  if (kickerWidth > COLUMN.width) throw new Error(`${card.key}: kicker "${card.kicker}" is too long`);

  const subline = card.subline
    ? fitText(toWords([{ text: card.subline }]), {
        maxWidth: COLUMN.width,
        maxHeight: 2 * 34 * TYPE.subline.lineHeight,
        maxLines: 2,
        sizes: { max: 34, min: 26 },
        lineHeight: TYPE.subline.lineHeight,
        tracking: TYPE.subline.tracking,
        italic: true,
      })
    : undefined;
  const sublineHeight = subline ? 18 + subline.lines.length * subline.size * TYPE.subline.lineHeight : 0;

  const headline = fitText(toWords(card.headline), {
    // A little narrower than the column: measurements ignore kerning, and italics overhang.
    maxWidth: COLUMN.width - 8,
    maxHeight: MIDDLE_HEIGHT - KICKER_BLOCK - sublineHeight,
    maxLines: 3,
    sizes: { max: 92, min: 44 },
    lineHeight: TYPE.headline.lineHeight,
    tracking: TYPE.headline.tracking,
  });
  return { headline, subline };
}

async function toJpeg(png: Buffer): Promise<Buffer> {
  for (let quality = 88; quality >= 60; quality -= 4) {
    // sharp writes no EXIF, XMP or ICC unless asked (no withMetadata()).
    const jpg = await sharp(png).flatten({ background: "#fce4e7" }).jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
    if (jpg.length <= MAX_BYTES) return jpg;
  }
  throw new Error(`Can't get the JPEG under ${MAX_BYTES} bytes`);
}

function describe(text: FittedText): string {
  return `${text.size}px  ${text.lines.map((l) => l.map((w) => w.text).join(" ")).join(" / ")}`;
}

async function main() {
  const args = process.argv.slice(2);
  // --dry: print each card's headline size and line breaks without rendering.
  const dry = args.includes("--dry");
  const only = new Set(args.filter((a) => a !== "--dry"));
  const cards = ogCards().filter((c) => only.size === 0 || only.has(c.key));
  if (only.size && cards.length !== only.size) throw new Error(`Unknown key in: ${[...only].join(", ")}`);
  if (dry) {
    for (const card of cards) {
      const { headline, subline } = fit(card);
      console.log(`${card.key}  ${describe(headline)}${subline ? `  |  ${describe(subline)}` : ""}`);
    }
    return;
  }

  const fonts = FACES.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }));
  const logo = await dataUri(join(ROOT, "public/logo.png"), LOGO.width * 2, LOGO.height * 2);
  mkdirSync(OUT_DIR, { recursive: true });

  for (const card of cards) {
    const { headline, subline } = fit(card);
    const photo = await dataUri(join(ROOT, "public", card.photo.src), PHOTO.width, PHOTO.height, CROPS[card.photo.src]);
    const response = new ImageResponse(<Card card={card} headline={headline} subline={subline} photo={photo} logo={logo} />, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    });
    const png = Buffer.from(await response.arrayBuffer());
    const jpg = await toJpeg(png);
    writeFileSync(join(OUT_DIR, `${card.key}.jpg`), jpg);
    console.log(`${card.key}.jpg  ${(jpg.length / 1024).toFixed(0)} KB  ${describe(headline)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
