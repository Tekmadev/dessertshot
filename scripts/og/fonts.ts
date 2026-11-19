/**
 * Fonts for the share images: the site's Fraunces (display, italics) and
 * Inter Tight (small UI text), as WOFF 1.0 from @fontsource, which satori can
 * read (it can't read WOFF2). Also measures text with the fonts' own advance
 * widths, so headlines can be sized and broken into lines before rendering.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { inflateSync } from "node:zlib";

const require = createRequire(import.meta.url);

export type FontFace = {
  name: "Fraunces" | "Inter Tight";
  weight: 400 | 500 | 600;
  style: "normal" | "italic";
  data: Buffer;
  /** Advance width of a code point, in em. */
  advance(codePoint: number): number;
};

function woffFile(pkg: string, file: string): Buffer {
  return readFileSync(require.resolve(`${pkg}/files/${file}`));
}

/** The sfnt tables of a WOFF 1.0 file, decompressed. */
function woffTables(buf: Buffer): Map<string, Buffer> {
  if (buf.toString("ascii", 0, 4) !== "wOFF") throw new Error("Not a WOFF 1.0 font");
  const tables = new Map<string, Buffer>();
  const count = buf.readUInt16BE(12);
  for (let i = 0; i < count; i++) {
    const entry = 44 + i * 20;
    const tag = buf.toString("ascii", entry, entry + 4);
    const offset = buf.readUInt32BE(entry + 4);
    const compressed = buf.readUInt32BE(entry + 8);
    const original = buf.readUInt32BE(entry + 12);
    const raw = buf.subarray(offset, offset + compressed);
    tables.set(tag, compressed < original ? inflateSync(raw) : raw);
  }
  return tables;
}

function table(tables: Map<string, Buffer>, tag: string): Buffer {
  const t = tables.get(tag);
  if (!t) throw new Error(`Font has no ${tag} table`);
  return t;
}

/** Code point → glyph id, from the Unicode cmap (format 12 or 4). */
function glyphLookup(cmap: Buffer): (cp: number) => number {
  const subtables = new Map<string, number>();
  for (let i = 0; i < cmap.readUInt16BE(2); i++) {
    const rec = 4 + i * 8;
    subtables.set(`${cmap.readUInt16BE(rec)}/${cmap.readUInt16BE(rec + 2)}`, cmap.readUInt32BE(rec + 4));
  }
  const at = subtables.get("3/10") ?? subtables.get("0/4") ?? subtables.get("3/1") ?? subtables.get("0/3");
  if (at === undefined) throw new Error("Font has no Unicode cmap");
  const format = cmap.readUInt16BE(at);

  if (format === 12) {
    const groups = cmap.readUInt32BE(at + 12);
    return (cp) => {
      for (let g = 0; g < groups; g++) {
        const p = at + 16 + g * 12;
        const start = cmap.readUInt32BE(p);
        const end = cmap.readUInt32BE(p + 4);
        if (cp >= start && cp <= end) return cmap.readUInt32BE(p + 8) + (cp - start);
      }
      return 0;
    };
  }

  if (format === 4) {
    const segX2 = cmap.readUInt16BE(at + 6);
    const ends = at + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const rangeOffsets = deltas + segX2;
    return (cp) => {
      for (let s = 0; s < segX2 / 2; s++) {
        if (cp > cmap.readUInt16BE(ends + s * 2)) continue;
        const start = cmap.readUInt16BE(starts + s * 2);
        if (cp < start) return 0;
        const delta = cmap.readInt16BE(deltas + s * 2);
        const rangeAt = rangeOffsets + s * 2;
        const range = cmap.readUInt16BE(rangeAt);
        if (range === 0) return (cp + delta) & 0xffff;
        const glyph = cmap.readUInt16BE(rangeAt + range + (cp - start) * 2);
        return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
      }
      return 0;
    };
  }

  throw new Error(`Unsupported cmap format ${format}`);
}

function loadFace(pkg: string, file: string, face: Omit<FontFace, "data" | "advance">): FontFace {
  const data = woffFile(pkg, file);
  const tables = woffTables(data);
  const unitsPerEm = table(tables, "head").readUInt16BE(18);
  const metrics = table(tables, "hhea").readUInt16BE(34);
  const hmtx = table(tables, "hmtx");
  const glyphOf = glyphLookup(table(tables, "cmap"));
  return {
    ...face,
    data,
    advance(cp) {
      const glyph = glyphOf(cp);
      if (glyph === 0 && cp !== 0x20) throw new Error(`${face.name} has no glyph for U+${cp.toString(16).toUpperCase()}`);
      return hmtx.readUInt16BE(4 * Math.min(glyph, metrics - 1)) / unitsPerEm;
    },
  };
}

export const FRAUNCES = loadFace("@fontsource/fraunces", "fraunces-latin-400-normal.woff", {
  name: "Fraunces",
  weight: 400,
  style: "normal",
});
export const FRAUNCES_ITALIC = loadFace("@fontsource/fraunces", "fraunces-latin-400-italic.woff", {
  name: "Fraunces",
  weight: 400,
  style: "italic",
});
export const INTER_TIGHT = loadFace("@fontsource/inter-tight", "inter-tight-latin-500-normal.woff", {
  name: "Inter Tight",
  weight: 500,
  style: "normal",
});
export const INTER_TIGHT_SEMIBOLD = loadFace("@fontsource/inter-tight", "inter-tight-latin-600-normal.woff", {
  name: "Inter Tight",
  weight: 600,
  style: "normal",
});

export const FACES = [FRAUNCES, FRAUNCES_ITALIC, INTER_TIGHT, INTER_TIGHT_SEMIBOLD];

/**
 * Width of `text` in px, letter spacing included. Ignores kerning, which in
 * these fonts mostly tightens, so the result errs on the wide side.
 */
export function textWidth(face: FontFace, text: string, size: number, letterSpacing = 0): number {
  let width = 0;
  for (const ch of text) width += face.advance(ch.codePointAt(0)!) * size + letterSpacing;
  return width;
}
