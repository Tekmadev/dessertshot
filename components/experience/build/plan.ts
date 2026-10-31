/**
 * The Build (homepage S2): pure data and maths behind the pinned section that
 * reveals the hero cup's product still from the bottom up, layer by layer,
 * with a callout at each layer. No DOM here, so lib/build-plan.test.ts can
 * check the timings and the label layout.
 */
import type { Flavor } from "@/lib/flavors";
import type { VideoAsset } from "@/lib/media";

/** The four builder phases (copy.builder.phases): 0 Base, 1 Cream, 2 Flavour, 3 Finish. */
export type PhaseIndex = 0 | 1 | 2 | 3;

export type PhotoCallout = {
  /** Index into Flavor.layers (bottom → top): the label is the registry's own words. */
  layer: number;
  phase: PhaseIndex;
  /** Short tag above the layer name. */
  tag: string;
  /** Where the dot sits on the photo, in percent of its width and height from the top-left. */
  x: number;
  y: number;
};

export type PhotoBuild = {
  /** How much of the photo (percent from the top) is still hidden when the section starts. */
  start: number;
  /** Where the wipe rests at the end of each phase, in the same units. The last is 0: the whole photo. */
  stops: readonly [number, number, number, 0];
  /** Bottom → top. */
  callouts: readonly PhotoCallout[];
};

/**
 * Measured on public/media/products/dubai-chocolate.webp (1440×1800) down the
 * column at 73% of the width, where the dots sit: dark ganache band 47.6–52%,
 * upper pistachio cream 52.4–59.5%, kunafa 59.6–66%, lower pistachio cream
 * 66.2–75%, glass floor below that (the bands sit ~3% lower at the centre of
 * the cup, which curves towards the camera). The top surface (ganache under
 * the pistachio swirl) spans 16–47%; below 84% is linen.
 *
 * The graham crumb base is not visible in this still, so its dot marks the
 * cup floor. The kunafa sits between two pistachio creams; the upper one has
 * no callout of its own (it would crowd the ganache on a phone).
 */
export const PHOTO_BUILDS: Readonly<Record<string, PhotoBuild>> = {
  "dubai-chocolate": {
    start: 86,
    stops: [76.5, 66, 52.5, 0],
    callouts: [
      { layer: 0, phase: 0, tag: "Base", x: 73, y: 79 },
      { layer: 1, phase: 1, tag: "Cream", x: 73, y: 70 },
      { layer: 2, phase: 2, tag: "Flavour", x: 73, y: 63 },
      { layer: 4, phase: 3, tag: "Ganache", x: 73, y: 50 },
      { layer: 5, phase: 3, tag: "Finish", x: 70, y: 33 },
    ],
  },
};

/** The measured build for a flavour's still, or null when its photo hasn't been measured. */
export function photoBuildFor(f: Pick<Flavor, "slug">): PhotoBuild | null {
  return PHOTO_BUILDS[f.slug] ?? null;
}

/**
 * Process footage for each phase, bottom → top, once it is made (it will be
 * generated later). A clip shows under its phase's text; null shows nothing.
 * Before filling this in: pinned, the four phases share one grid cell, so
 * mount only the current phase's video (as MorningOf's StepClip does), or all
 * four will download and play at once.
 */
export const PHASE_CLIPS: readonly (VideoAsset | null)[] = [null, null, null, null];

/* ---------------------------------------------------------------- timing */

/** Share of the scroll before the first layer starts, and after the last one lands. */
export const LEAD_IN = 0.04;
export const TAIL = 0.06;
/** Share of each phase spent moving the wipe; the rest is a pause to read. */
export const MOVE_SHARE = 0.7;

/** Cubic ease-out (GSAP's "power2.out"): each layer pours in fast, then settles. */
export function easeOut(s: number): number {
  const c = clamp01(s);
  return 1 - (1 - c) ** 3;
}

/** The inverse of easeOut. */
export function easeOutInverse(u: number): number {
  const c = clamp01(u);
  return 1 - Math.cbrt(1 - c);
}

export type Segment = { t0: number; t1: number; from: number; to: number };
export type Window = { start: number; end: number };

export type BuildPlan = {
  start: number;
  /** The wipe's moves on the 0..1 timeline, in order. */
  segments: readonly Segment[];
  /** When each phase's text is on screen. Contiguous, covering 0..1. */
  phases: readonly Window[];
  /** When each callout appears (its layer has been revealed), in callout order. */
  calloutTimes: readonly number[];
};

export function buildPlan(build: PhotoBuild): BuildPlan {
  const span = (1 - LEAD_IN - TAIL) / build.stops.length;
  const segments: Segment[] = [];
  let from = build.start;
  build.stops.forEach((to, i) => {
    const t0 = LEAD_IN + i * span;
    segments.push({ t0, t1: t0 + span * MOVE_SHARE, from, to });
    from = to;
  });

  const phases: Window[] = build.stops.map((_, i) => ({
    start: i === 0 ? 0 : LEAD_IN + i * span,
    end: i === build.stops.length - 1 ? 1 : LEAD_IN + (i + 1) * span,
  }));

  const plan = { start: build.start, segments, phases, calloutTimes: [] as number[] };
  plan.calloutTimes = build.callouts.map((c) => revealTime(plan, c.y));
  return plan;
}

/** How much of the photo is still hidden (percent from the top) at timeline time t. */
export function lineAt(plan: Pick<BuildPlan, "start" | "segments">, t: number): number {
  let line = plan.start;
  for (const s of plan.segments) {
    if (t <= s.t0) return line;
    if (t < s.t1) return s.from + (s.to - s.from) * easeOut((t - s.t0) / (s.t1 - s.t0));
    line = s.to;
  }
  return line;
}

/** The first time the wipe uncovers height y (percent from the top). */
export function revealTime(plan: Pick<BuildPlan, "start" | "segments">, y: number): number {
  if (y >= plan.start) return 0;
  for (const s of plan.segments) {
    if (y >= s.to && y <= s.from) {
      const u = (s.from - y) / (s.from - s.to);
      return s.t0 + easeOutInverse(u) * (s.t1 - s.t0);
    }
  }
  return 1;
}

/** Which phase's text is showing at timeline time t. */
export function phaseAt(plan: Pick<BuildPlan, "phases">, t: number): number {
  const i = plan.phases.findIndex((w) => t < w.end);
  return i === -1 ? plan.phases.length - 1 : i;
}

/* ---------------------------------------------------------------- labels */

/** Rough line count for a label: greedy word wrap at a number of characters. */
export function estimateLines(text: string, charsPerLine: number): number {
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const need = used === 0 ? word.length : used + 1 + word.length;
    if (used > 0 && need > charsPerLine) {
      lines += 1;
      used = word.length;
    } else {
      used = need;
    }
  }
  return lines;
}

export type LabelMetrics = {
  /** The photo frame's typical height at this breakpoint, px. */
  frame: number;
  /** One line of label text, px. */
  line: number;
  /** Everything else in a label (tag, padding), px. */
  chrome: number;
  /** Characters per line at the label's width. */
  chars: number;
  /** Space kept between labels, px. */
  gap: number;
};

/** Phones show the layer name in a small pill; desktops add the tag above a larger name. */
export const LABEL_METRICS = {
  phone: { frame: 300, line: 15, chrome: 9, chars: 18, gap: 5 },
  desktop: { frame: 640, line: 20, chrome: 18, chars: 18, gap: 10 },
} as const satisfies Record<string, LabelMetrics>;

/** A label's height as a percent of the frame. */
export function labelHeight(text: string, m: LabelMetrics): number {
  return ((estimateLines(text, m.chars) * m.line + m.chrome) / m.frame) * 100;
}

export type LabelItem = { anchor: number; size: number };

/**
 * Places labels (centres, percent of the frame height) as close to their
 * anchors as possible without overlapping, keeping them inside [min, max].
 * Overlapping labels merge into a block centred on their anchors, the classic
 * least-squares layout for one axis. Returns positions in input order.
 */
export function spreadLabels(
  items: readonly LabelItem[],
  { min = 0, max = 100, gap = 0 }: { min?: number; max?: number; gap?: number } = {}
): number[] {
  type Block = { idx: number[]; offsets: number[]; height: number; top: number };
  const order = items.map((_, i) => i).sort((a, b) => items[a].anchor - items[b].anchor);

  const place = (b: Omit<Block, "top">): Block => {
    const ideal = b.idx.reduce((sum, i, k) => sum + items[i].anchor - b.offsets[k], 0) / b.idx.length;
    const top = Math.max(min, Math.min(ideal, max - b.height));
    return { ...b, top };
  };

  const blocks: Block[] = [];
  for (const i of order) {
    let block = place({ idx: [i], offsets: [items[i].size / 2], height: items[i].size });
    while (blocks.length && blocks[blocks.length - 1].top + blocks[blocks.length - 1].height + gap > block.top) {
      const prev = blocks.pop()!;
      const shift = prev.height + gap;
      block = place({
        idx: [...prev.idx, ...block.idx],
        offsets: [...prev.offsets, ...block.offsets.map((o) => o + shift)],
        height: prev.height + gap + block.height,
      });
    }
    blocks.push(block);
  }

  const out = new Array<number>(items.length);
  for (const b of blocks) b.idx.forEach((i, k) => (out[i] = b.top + b.offsets[k]));
  return out;
}

/* ---------------------------------------------------------------- copy */

/** "01 . Base" → { number: "01", name: "Base" } for the step rail. */
export function kickerParts(kicker: string): { number: string; name: string } {
  const [number, ...rest] = kicker.split(" . ");
  return rest.length ? { number, name: rest.join(" . ") } : { number: "", name: kicker };
}

/** "Four layers, no shortcuts." → ["Four layers,", "no shortcuts."] so the second half can take the italic. */
export function splitHeading(heading: string): [string, string] {
  const at = heading.indexOf(", ");
  if (at === -1) return [heading, ""];
  return [heading.slice(0, at + 1), heading.slice(at + 2)];
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
