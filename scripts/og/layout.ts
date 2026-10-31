/**
 * Sizes a headline to fit the card's text column and breaks it into lines.
 * Lines are rendered one per row, so satori never re-wraps them.
 *
 * Every size and split into at most `maxLines` lines is tried, and the
 * winner has the best score: large type, with few breaks inside a phrase,
 * after a weak word like "the", "for" or "dessert", or leaving a word alone
 * on a line, and lines of even length.
 */
import type { OgRun } from "../../lib/og";
import { FRAUNCES, FRAUNCES_ITALIC, textWidth } from "./fonts";

export type Word = { text: string; accent: boolean };
export type FittedText = { size: number; lines: Word[][] };

export type FitOptions = {
  maxWidth: number;
  maxHeight: number;
  maxLines: number;
  sizes: { max: number; min: number };
  lineHeight: number;
  /** Tracking in em (negative tightens), as on the site's display type. */
  tracking: number;
  /** Set every word in italic (sublines). */
  italic?: boolean;
};

export function toWords(runs: OgRun[]): Word[] {
  return runs.flatMap((r) => r.text.split(/\s+/).filter(Boolean).map((text) => ({ text, accent: Boolean(r.accent) })));
}

function face(w: Word, italic: boolean) {
  return italic || w.accent ? FRAUNCES_ITALIC : FRAUNCES;
}

/** Width of one line: each word in its own face, each space in the face of the word before it. */
export function lineWidth(words: Word[], size: number, tracking: number, italic = false): number {
  const spacing = tracking * size;
  return words.reduce((sum, w, i) => {
    const f = face(w, italic);
    return sum + textWidth(f, w.text, size, spacing) + (i < words.length - 1 ? textWidth(f, " ", size, spacing) : 0);
  }, 0);
}

/** Every way to cut `n` words into `lines` non-empty lines, as the index each later line starts at. */
function* cuts(n: number, lines: number, from = 1): Generator<number[]> {
  if (lines === 1) {
    yield [];
    return;
  }
  for (let i = from; i <= n - (lines - 1); i++) {
    for (const rest of cuts(n, lines - 1, i + 1)) yield [i, ...rest];
  }
}

function split(words: Word[], at: number[]): Word[][] {
  const bounds = [0, ...at, words.length];
  return bounds.slice(0, -1).map((b, i) => words.slice(b, bounds[i + 1]));
}

/** Words that open a phrase: a break before one reads fairly well. */
const PHRASE_STARTS = new Set(["and", "at", "by", "for", "from", "in", "of", "on", "or", "to", "when", "with"]);
/** Words a line shouldn't end on: they belong with what follows ("the …", "dessert cups"). */
const WEAK_ENDINGS = new Set([
  ...["a", "an", "and", "at", "by", "every", "for", "from", "in", "of", "on", "or", "the", "to", "us", "with"],
  ...["dessert", "full", "mini", "open-house", "party", "premium", "shower"],
]);

const bare = (w: Word) => w.text.toLowerCase().replace(/[^a-z-]/g, "");

/**
 * How badly the breaks read, 0 at best. Free: after punctuation, or where
 * the italic starts or ends. 0.25: before a phrase-opening word. 0.5: any
 * other break between words. 1: a line ending on a weak word, or a line of
 * one word in a longer headline. A two-word headline breaks anywhere.
 */
function breakCost(lines: Word[][]): number {
  const words = lines.reduce((n, l) => n + l.length, 0);
  if (words <= 2) return 0;
  let cost = words >= 4 ? lines.filter((l) => l.length === 1).length : 0;
  for (let i = 0; i < lines.length - 1; i++) {
    const last = lines[i][lines[i].length - 1];
    const next = lines[i + 1][0];
    if (WEAK_ENDINGS.has(bare(last))) cost += 1;
    else if (/[,.:;]$/.test(last.text) || last.accent !== next.accent) continue;
    else cost += PHRASE_STARTS.has(bare(next)) ? 0.25 : 0.5;
  }
  return cost;
}

type Candidate = FittedText & { score: number };

/** Score: the type size, less 30% per unit of break cost, 20% for raggedness and 3% per extra line. */
function candidate(lines: Word[][], size: number, o: FitOptions): Candidate | undefined {
  if (lines.length * o.lineHeight * size > o.maxHeight) return undefined;
  const widths = lines.map((l) => lineWidth(l, size, o.tracking, o.italic));
  const widest = Math.max(...widths);
  if (widest > o.maxWidth) return undefined;
  // Slack on every line but the last, as a share of the column.
  const ragged = widths.slice(0, -1).reduce((sum, w) => sum + (widest - w) / o.maxWidth, 0);
  const score = size * (1 - 0.3 * breakCost(lines) - 0.2 * ragged - 0.03 * (lines.length - 1));
  return { size, lines, score };
}

export function fitText(words: Word[], o: FitOptions): FittedText {
  let best: Candidate | undefined;
  for (let size = o.sizes.max; size >= o.sizes.min; size -= 1) {
    for (let count = 1; count <= Math.min(o.maxLines, words.length); count++) {
      for (const at of cuts(words.length, count)) {
        const c = candidate(split(words, at), size, o);
        if (c && (!best || c.score > best.score)) best = c;
      }
    }
  }
  if (!best) throw new Error(`"${words.map((w) => w.text).join(" ")}" doesn't fit in ${o.maxLines} lines at ${o.sizes.min}px`);
  return { size: best.size, lines: best.lines };
}
