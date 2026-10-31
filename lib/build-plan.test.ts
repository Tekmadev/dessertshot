import { describe, expect, it } from "vitest";
import {
  LABEL_METRICS,
  PHASE_CLIPS,
  PHOTO_BUILDS,
  buildPlan,
  easeOut,
  easeOutInverse,
  estimateLines,
  kickerParts,
  labelHeight,
  lineAt,
  phaseAt,
  photoBuildFor,
  revealTime,
  splitHeading,
  spreadLabels,
} from "@/components/experience/build/plan";
import { copy } from "./copy";
import { FLAVORS, HERO_FLAVOR, getFlavorBySlug } from "./flavors";

const hero = photoBuildFor(HERO_FLAVOR)!;

describe("the Build's photo data", () => {
  it("has a measured build for the hero flavour's still", () => {
    expect(hero).not.toBeNull();
  });

  it("only measures stills of real flavours", () => {
    for (const slug of Object.keys(PHOTO_BUILDS)) expect(getFlavorBySlug(slug), slug).toBeDefined();
  });

  it.each(Object.entries(PHOTO_BUILDS))("%s: callouts name real layers, bottom to top, inside the photo", (slug, build) => {
    const f = FLAVORS.find((x) => x.slug === slug)!;
    const layers = build.callouts.map((c) => c.layer);
    const heights = build.callouts.map((c) => c.y);
    for (const c of build.callouts) {
      expect(f.layers[c.layer], `${slug} layer ${c.layer}`).toBeTruthy();
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(100);
      expect(c.y).toBeLessThan(build.start);
      expect(c.y).toBeGreaterThan(0);
    }
    expect(layers).toEqual([...layers].sort((a, b) => a - b));
    expect(heights).toEqual([...heights].sort((a, b) => b - a));
    // The base comes first and the finish (top layer) last.
    expect(layers[0]).toBe(0);
    expect(layers.at(-1)).toBe(f.layers.length - 1);
  });

  it("covers every builder phase, in order", () => {
    const phases = hero.callouts.map((c) => c.phase);
    expect(new Set(phases)).toEqual(new Set([0, 1, 2, 3]));
    expect(phases).toEqual([...phases].sort());
    expect(copy.builder.phases).toHaveLength(4);
    expect(PHASE_CLIPS).toHaveLength(copy.builder.phases.length);
  });

  it("wipes upwards and ends on the whole photo", () => {
    let prev = hero.start;
    for (const s of hero.stops) {
      expect(s).toBeLessThan(prev);
      prev = s;
    }
    expect(hero.stops.at(-1)).toBe(0);
  });
});

describe("easing", () => {
  it("runs 0 → 1 and inverts", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeCloseTo(0.875); // GSAP power2.out
    for (const u of [0, 0.1, 0.37, 0.5, 0.9, 1]) expect(easeOut(easeOutInverse(u))).toBeCloseTo(u, 10);
  });
});

describe("buildPlan", () => {
  const plan = buildPlan(hero);

  it("starts on the start line and finishes on the whole photo", () => {
    expect(lineAt(plan, 0)).toBe(hero.start);
    expect(lineAt(plan, 1)).toBe(0);
  });

  it("only ever wipes upwards", () => {
    let prev = Infinity;
    for (let t = 0; t <= 1.0001; t += 0.005) {
      const line = lineAt(plan, t);
      expect(line).toBeLessThanOrEqual(prev + 1e-9);
      prev = line;
    }
  });

  it("rests at each phase's stop before the next phase", () => {
    plan.phases.forEach((w, i) => {
      if (i < plan.phases.length - 1) expect(lineAt(plan, w.end - 1e-6)).toBeCloseTo(hero.stops[i], 6);
    });
  });

  it("splits the scroll into contiguous phase windows", () => {
    expect(plan.phases[0].start).toBe(0);
    expect(plan.phases.at(-1)!.end).toBe(1);
    for (let i = 1; i < plan.phases.length; i++) expect(plan.phases[i].start).toBe(plan.phases[i - 1].end);
    expect(phaseAt(plan, 0)).toBe(0);
    expect(phaseAt(plan, 0.999)).toBe(3);
  });

  it("shows each callout when the wipe reaches its layer, during its own phase", () => {
    hero.callouts.forEach((c, i) => {
      const t = plan.calloutTimes[i];
      expect(lineAt(plan, t)).toBeCloseTo(c.y, 6);
      expect(lineAt(plan, t - 0.001)).toBeGreaterThan(c.y);
      expect(phaseAt(plan, t)).toBe(c.phase);
    });
  });

  it("shows callouts in order, bottom to top", () => {
    expect(plan.calloutTimes).toEqual([...plan.calloutTimes].sort((a, b) => a - b));
  });

  it("treats heights already showing as revealed at the start", () => {
    expect(revealTime(plan, hero.start + 1)).toBe(0);
  });
});

describe("estimateLines", () => {
  it("wraps by words", () => {
    expect(estimateLines("Graham crumb", 18)).toBe(1);
    expect(estimateLines("Pistachio-paste swirl and crushed pistachio", 18)).toBe(3);
    expect(estimateLines("", 10)).toBe(1);
    expect(estimateLines("averyveryverylongword", 5)).toBe(1);
  });
});

describe("spreadLabels", () => {
  it("leaves labels that don't touch on their anchors", () => {
    expect(spreadLabels([{ anchor: 20, size: 5 }, { anchor: 60, size: 5 }])).toEqual([20, 60]);
  });

  it("pushes overlapping labels apart around their anchors", () => {
    const [a, b] = spreadLabels([{ anchor: 50, size: 10 }, { anchor: 52, size: 10 }], { gap: 2 });
    expect(b - a).toBeCloseTo(12);
    expect((a + b) / 2).toBeCloseTo(51);
  });

  it("keeps input order and bounds", () => {
    const items = [
      { anchor: 95, size: 10 },
      { anchor: 3, size: 10 },
      { anchor: 94, size: 10 },
    ];
    const out = spreadLabels(items, { min: 0, max: 100, gap: 1 });
    expect(out[1]).toBeGreaterThanOrEqual(5);
    expect(out[0]).toBeLessThanOrEqual(95);
    expect(out[0] - out[2]).toBeGreaterThanOrEqual(11 - 1e-9);
  });

  it.each(Object.entries(LABEL_METRICS))("lays the hero callouts out without overlaps (%s)", (_, m) => {
    const f = HERO_FLAVOR;
    const items = hero.callouts.map((c) => ({ anchor: c.y, size: labelHeight(f.layers[c.layer], m) }));
    const gap = (m.gap / m.frame) * 100;
    const out = spreadLabels(items, { min: 2, max: 98, gap });
    const sorted = items.map((it, i) => ({ ...it, at: out[i] })).sort((a, b) => a.at - b.at);
    for (let i = 1; i < sorted.length; i++) {
      const space = sorted[i].at - sorted[i - 1].at - (sorted[i].size + sorted[i - 1].size) / 2;
      expect(space).toBeGreaterThanOrEqual(gap - 1e-9);
    }
    expect(sorted[0].at - sorted[0].size / 2).toBeGreaterThanOrEqual(2 - 1e-9);
    expect(sorted.at(-1)!.at + sorted.at(-1)!.size / 2).toBeLessThanOrEqual(98 + 1e-9);
  });
});

describe("kickerParts", () => {
  it("splits the builder kickers into number and name", () => {
    expect(copy.builder.phases.map((p) => kickerParts(p.kicker))).toEqual([
      { number: "01", name: "Base" },
      { number: "02", name: "Cream" },
      { number: "03", name: "Flavour" },
      { number: "04", name: "Finish" },
    ]);
    expect(kickerParts("Plain")).toEqual({ number: "", name: "Plain" });
  });
});

describe("splitHeading", () => {
  it("splits after the first comma", () => {
    expect(splitHeading(copy.feature.heading)).toEqual(["Four layers,", "no shortcuts."]);
    expect(splitHeading("No comma")).toEqual(["No comma", ""]);
  });
});
