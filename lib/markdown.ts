/**
 * The Markdown subset the page drafts use (lib/drafts.ts): paragraphs,
 * "- " and "1. " lists, "| a | b |" tables (header row, then a "|---|" rule),
 * **bold** and [text](href) links, plus the tokens
 * {{contactEmail}}, {{mailto}} and {{dietaryClaim}}. Parsed into a small
 * tree so pages render it as React elements: no HTML strings, so nothing to
 * sanitise.
 */
import { CONTACT_EMAIL, mailtoLink } from "./business";
import { dietaryClaimSentence } from "./claims";

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: Inline[] }
  | { kind: "link"; href: string; children: Inline[] };

export type Block =
  | { kind: "p"; children: Inline[] }
  | { kind: "ul" | "ol"; items: Inline[][] }
  | { kind: "table"; head: Inline[][]; rows: Inline[][][] };

export type Tokens = { contactEmail: string; mailto: string; dietaryClaim: string | null };

export const SITE_TOKENS: Tokens = {
  contactEmail: CONTACT_EMAIL,
  mailto: mailtoLink,
  dietaryClaim: dietaryClaimSentence(),
};

const DIETARY = "{{dietaryClaim}}";

export function usesDietaryClaim(text: string): boolean {
  return text.includes(DIETARY);
}

/**
 * Fill in the tokens. With the dietary claim switched off, only the claim
 * itself goes: the rest of its line and the other paragraphs stay (a section
 * about allergens keeps its nut and cross-contact advice). Null when nothing
 * is left. FAQ entries about the claim are dropped whole by their callers
 * (usesDietaryClaim on the answer).
 */
export function resolveTokens(text: string, tokens: Tokens = SITE_TOKENS): string | null {
  let out = text.replaceAll("{{contactEmail}}", tokens.contactEmail).replaceAll("{{mailto}}", tokens.mailto);
  if (tokens.dietaryClaim) return out.replaceAll(DIETARY, tokens.dietaryClaim);
  if (!usesDietaryClaim(out)) return out;
  out = out
    .split("\n")
    .map((line) => (line.includes(DIETARY) ? line.replaceAll(DIETARY, "").replace(/\s{2,}/g, " ").trim() : line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return out || null;
}

const INLINE_RE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "bold", children: parseInline(m[1]) });
    else out.push({ kind: "link", href: m[3], children: parseInline(m[2]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

const UL_RE = /^[-*] /;
const OL_RE = /^\d+\. /;
const ROW_RE = /^\|.*\|$/;
const RULE_RE = /^\|(\s*:?-{3,}:?\s*\|)+$/;

const cells = (line: string): Inline[][] =>
  line
    .slice(1, -1)
    .split("|")
    .map((c) => parseInline(c.trim()));

/** Blank lines separate blocks; inside a block, list lines group into lists and "|" lines into a table. */
export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.split(/\n{2,}/)) {
    let para: string[] = [];
    let list: { kind: "ul" | "ol"; items: Inline[][] } | null = null;
    let table: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ kind: "p", children: parseInline(para.join(" ")) });
      para = [];
    };
    const flushList = () => {
      if (list) blocks.push(list);
      list = null;
    };
    const flushTable = () => {
      if (!table.length) return;
      // A real table has a header row and a rule under it; anything else stays text.
      if (table.length >= 2 && RULE_RE.test(table[1])) {
        blocks.push({ kind: "table", head: cells(table[0]), rows: table.slice(2).map(cells) });
      } else {
        blocks.push({ kind: "p", children: parseInline(table.join(" ")) });
      }
      table = [];
    };
    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (ROW_RE.test(line)) {
        flushPara();
        flushList();
        table.push(line);
        continue;
      }
      flushTable();
      const kind = UL_RE.test(line) ? "ul" : OL_RE.test(line) ? "ol" : null;
      if (kind) {
        flushPara();
        if (!list || list.kind !== kind) {
          flushList();
          list = { kind, items: [] };
        }
        list.items.push(parseInline(line.replace(kind === "ul" ? UL_RE : OL_RE, "")));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
    flushTable();
  }
  return blocks;
}

/** Markdown (this subset) to plain text, tokens resolved; null when nothing is left. */
export function plainText(markdown: string, tokens: Tokens = SITE_TOKENS): string | null {
  const text = resolveTokens(markdown, tokens);
  if (text === null) return null;
  return parseBlocks(text)
    .map((b) =>
      b.kind === "p"
        ? inlineText(b.children)
        : b.kind === "table"
          ? b.rows.map((r) => r.map(inlineText).join(" ")).join("; ")
          : b.items.map(inlineText).join(", ")
    )
    .join(" ");
}

/** Plain text of inline nodes (for JSON-LD and metadata). */
export function inlineText(nodes: Inline[]): string {
  return nodes.map((n) => (n.kind === "text" ? n.text : inlineText(n.children))).join("");
}
