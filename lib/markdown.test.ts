import { describe, expect, it } from "vitest";
import { PAGE_DRAFTS, draftStrings } from "./drafts";
import { inlineText, parseBlocks, parseInline, resolveTokens } from "./markdown";
import { MENU_PRICES, type PackQty, type Tier } from "./pricing";

describe("parseInline", () => {
  it("reads bold and links, including bold inside a link and a link inside bold", () => {
    expect(parseInline("Hi **there** [menu](/menu) now")).toEqual([
      { kind: "text", text: "Hi " },
      { kind: "bold", children: [{ kind: "text", text: "there" }] },
      { kind: "text", text: " " },
      { kind: "link", href: "/menu", children: [{ kind: "text", text: "menu" }] },
      { kind: "text", text: " now" },
    ]);
    expect(parseInline("**[Weddings](/events/weddings)**")[0]).toEqual({
      kind: "bold",
      children: [{ kind: "link", href: "/events/weddings", children: [{ kind: "text", text: "Weddings" }] }],
    });
  });
});

describe("parseBlocks", () => {
  it("splits paragraphs and groups list lines, even right after a paragraph line", () => {
    const blocks = parseBlocks("Intro line\n- one\n- two\n\n1. first\n2. second\n\nLast **para**.");
    expect(blocks.map((b) => b.kind)).toEqual(["p", "ul", "ol", "p"]);
    expect(blocks[1].kind === "ul" && blocks[1].items.map(inlineText)).toEqual(["one", "two"]);
    expect(blocks[3].kind === "p" && inlineText(blocks[3].children)).toBe("Last para.");
  });

  it("parses tables: header, rule, rows; a lone pipe line stays text", () => {
    const [p, t] = parseBlocks("**Sizes**\n\n| Tier | 24 |\n|---|---|\n| Classic | **$45** |");
    expect(p.kind).toBe("p");
    expect(t.kind === "table" && t.head.map(inlineText)).toEqual(["Tier", "24"]);
    expect(t.kind === "table" && t.rows.map((r) => r.map(inlineText))).toEqual([["Classic", "$45"]]);
    expect(parseBlocks("| not a table |").map((b) => b.kind)).toEqual(["p"]);
  });

  it("parses every draft without leaving Markdown behind", () => {
    for (const d of PAGE_DRAFTS) {
      for (const body of [d.intro, ...d.sections.map((s) => s.body), ...d.faqs.map((f) => f.a)]) {
        for (const b of parseBlocks(body)) {
          const texts =
            b.kind === "p" ? [inlineText(b.children)] : b.kind === "table" ? [...b.head, ...b.rows.flat()].map(inlineText) : b.items.map(inlineText);
          for (const t of texts) expect(t, d.slug).not.toMatch(/\*\*|\]\(|^\s*[-*] |\||---/);
        }
      }
      expect(draftStrings(d).length).toBeGreaterThan(0);
    }
  });

  it("keeps the /packages price tables equal to lib/pricing.ts", () => {
    const d = PAGE_DRAFTS.find((x) => x.slug === "packages")!;
    const tables = d.sections.flatMap((s) => parseBlocks(s.body)).filter((b) => b.kind === "table");
    expect(tables).toHaveLength(2);
    (["2oz", "5oz"] as const).forEach((size, i) => {
      const t = tables[i];
      if (t.kind !== "table") throw new Error("not a table");
      const packs = t.head.slice(1).map((c) => Number(inlineText(c))) as PackQty[];
      for (const row of t.rows) {
        const tier = inlineText(row[0]).toLowerCase() as Tier;
        row.slice(1).forEach((c, j) => expect(inlineText(c), `${size} ${tier} ${packs[j]}`).toBe(`$${MENU_PRICES[size][tier][packs[j]]}`));
      }
    });
  });
});

describe("resolveTokens", () => {
  const on = { contactEmail: "a@b.c", mailto: "mailto:a@b.c", dietaryClaim: "We say so." };
  it("fills in contact details and the dietary sentence", () => {
    expect(resolveTokens("Write to {{contactEmail}} ([email]({{mailto}})). {{dietaryClaim}}", on)).toBe(
      "Write to a@b.c ([email](mailto:a@b.c)). We say so."
    );
  });
  it("drops only the claim when it's switched off, keeping the advice around it", () => {
    const off = { ...on, dietaryClaim: null };
    expect(resolveTokens("{{dietaryClaim}}", off)).toBeNull();
    expect(resolveTokens("No claim here", off)).toBe("No claim here");
    expect(resolveTokens("{{dietaryClaim}}\n\nNuts: three flavours.", off)).toBe("Nuts: three flavours.");
    expect(resolveTokens("{{dietaryClaim}} If a guest has an allergy, message us.\n\n- Dairy in every cup", off)).toBe(
      "If a guest has an allergy, message us.\n\n- Dairy in every cup"
    );
  });

  it("keeps every draft section's body when the claim is off", () => {
    const off = { ...on, dietaryClaim: null };
    for (const d of PAGE_DRAFTS) {
      for (const s of d.sections) {
        const text = resolveTokens(s.body, off);
        expect(text, `${d.slug}: ${s.heading}`).not.toBeNull();
        expect(text, `${d.slug}: ${s.heading}`).not.toContain("{{");
      }
    }
  });
});
