import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { copy, HOW_STEPS, PACKAGES, PACK_RULES_LINE } from "./copy";
import { FLAVORS } from "./flavors";
import { MIN_ORDER_CUPS } from "./packs";
import { MIN_CUPS_PER_FLAVOR, maxFlavorsForPack } from "./pricing";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

// Wrong or unverifiable copy that must never come back (brief §0.3, §1, §2.1, §2.4).
const BANNED: [RegExp, string][] = [
  [/\bbiscuits?\b/i, "old 'biscuit' base copy (the base is graham or Biscoff crumb)"],
  [/concentrat/i, "invented 'concentrate' layer"],
  [/brown butter/i, "invented ingredient"],
  [/mascarpone/i, "invented ingredient"],
  [/\bbak(e|ed|es|ing)\b/i, "the cups are made, not baked"],
  [/certified/i, "certification claim"],
  [/c(o)?eliac/i, "medical claim"],
  [/today(&apos;|')?s drop/i, "fabricated status tag"],
  [/visit our (shop|store|caf)/i, "there is no shop yet"],
  [/better the value|bigger the pack/i, "false at 5 oz: the 48 costs more per cup than the 24"],
  [/reply by tomorrow/i, "the brief promises confirmation within the day"],
  [/flavou?r recommendation|recommend a mix/i, "the owner doesn't offer flavour recommendations (2026-10-30)"],
  [/labell?ed by flavou?r/i, "no flavour labels on the cups for now (owner, 2026-10-30)"],
  [/presentation tray included|tray included/i, "the presentation tray is an extra-cost option (owner, 2026-10-30)"],
  [/\blids?\b/i, "the cups have no lids; they come in boxes (owner, 2026-10-30)"],
  [/farhanaakter/i, "the owner's personal email"],
];
// Copy-only: superlatives (source files legitimately say "best-effort" in comments).
const BANNED_IN_COPY: [RegExp, string][] = [
  ...BANNED,
  [/\bbest\b/i, "unverifiable superlative"],
  [/#1\b|number one/i, "unverifiable superlative"],
];

describe("marketing copy", () => {
  const strings = allStrings([copy, HOW_STEPS, PACKAGES, PACK_RULES_LINE]);

  it("has strings to check", () => {
    expect(strings.length).toBeGreaterThan(30);
  });

  it.each(BANNED_IN_COPY)("contains no %s", (pattern, why) => {
    for (const s of strings) expect(s, why).not.toMatch(pattern);
  });

  it("lists every confirmed flavour's own cream in the builder", () => {
    const body = copy.builder.phases[1].body.toLowerCase();
    for (const f of FLAVORS.filter((x) => x.layers.length > 1)) {
      expect(body, f.name).toContain(f.layers[1].toLowerCase());
    }
  });
});

describe("component and page source", () => {
  const files = ["components", "app"].flatMap((dir) =>
    (readdirSync(join(ROOT, dir), { recursive: true }) as string[])
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .map((f) => join(dir, f))
  );

  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(BANNED)("contains no %s", (pattern, why) => {
    for (const file of files) {
      expect(readFileSync(join(ROOT, file), "utf8"), `${file}: ${why}`).not.toMatch(pattern);
    }
  });
});

describe("packs (brief §2.2, §2.3)", () => {
  it("states each pack's flavour limit from the pricing rules", () => {
    for (const pack of PACKAGES) {
      expect(pack.perks).toContain(`Mix up to ${maxFlavorsForPack(pack.size)} flavours`);
    }
  });

  it("states the minimum order and per-flavour minimum from the pricing rules", () => {
    expect(MIN_ORDER_CUPS).toBe(24);
    expect(PACK_RULES_LINE).toContain(`Minimum order ${MIN_ORDER_CUPS} cups`);
    expect(PACK_RULES_LINE).toContain(`Minimum ${MIN_CUPS_PER_FLAVOR} cups per flavour`);
  });

  it("gives the 48 and 96 the perks the brief lists, minus what the owner doesn't offer", () => {
    const p48 = PACKAGES.find((p) => p.size === 48)!;
    const p96 = PACKAGES.find((p) => p.size === 96)!;
    expect(p48.featured).toBe(true);
    expect(p48.perks).toContain("Priority preparation");
    expect(p96.perks).toEqual(
      expect.arrayContaining(["Custom label option", "Event day pickup", "Presentation tray (extra cost)"])
    );
    expect(PACKAGES.filter((p) => p.featured)).toHaveLength(1);
  });
});
