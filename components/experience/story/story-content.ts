/**
 * Pure helpers for the homepage story sections (events, FAQ, Instagram).
 * No React, no I/O, so lib/story-content.test.ts can run them directly.
 */
import type { PageDraft } from "@/lib/drafts";
import { plainText, usesDietaryClaim } from "@/lib/markdown";

// ---------------------------------------------------------------------------
// Event summaries (EventsGrid)
// ---------------------------------------------------------------------------

/** The first sentence: up to the first . ! or ? followed by a space and a capital. */
export function firstSentence(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  const m = t.match(/^.+?[.!?](?=\s+["“(]?[A-Z0-9])/);
  return (m ? m[0] : t).trim();
}

/**
 * Shorten to `max` characters without cutting a word: prefer ending at a
 * clause (comma, colon, semicolon, dash) in the back half, else at a word
 * with an ellipsis. Always ends with punctuation.
 */
export function trimSummary(text: string, max = 120): string {
  const t = text.trim().replace(/\s+/g, " ");
  const end = (s: string) => (/[.!?…]$/.test(s) ? s : `${s.replace(/[,;:\s–—-]+$/, "")}.`);
  if (t.length <= max) return end(t);
  const head = t.slice(0, max);
  const clause = Math.max(head.lastIndexOf(", "), head.lastIndexOf(": "), head.lastIndexOf("; "), head.lastIndexOf(" – "), head.lastIndexOf(" — "));
  if (clause >= max * 0.5) return end(head.slice(0, clause));
  const space = head.slice(0, max - 1).lastIndexOf(" ");
  return `${head.slice(0, space > 0 ? space : max - 1).replace(/[,;:\s–—-]+$/, "")}…`;
}

// Markdown to plain text lives in lib/markdown.ts (structured data uses it too).
export { plainText };

/**
 * One line for an event card: the first sentence of the page's meta
 * description (written as a summary), or of its intro when that is missing.
 */
export function eventSummary(draft: Pick<PageDraft, "metaDescription" | "intro">, max = 120): string {
  const source = draft.metaDescription.trim() || plainText(draft.intro) || "";
  return source ? trimSummary(firstSentence(source), max) : "";
}

// ---------------------------------------------------------------------------
// Home FAQ (HomeFaq)
// ---------------------------------------------------------------------------

/**
 * The questions the homepage answers, in order: lead time, delivery,
 * allergens, storage, flavours per pack, deposit. Matched on the question so
 * the FAQ page can be reordered or reworded slightly without breaking this.
 */
export const HOME_FAQ_TOPICS: readonly { topic: string; match: RegExp }[] = [
  { topic: "lead time", match: /how much notice/i },
  { topic: "delivery", match: /\bdeliver/i },
  { topic: "allergens", match: /contain nuts|allergen/i },
  { topic: "storage", match: /fridge|refrigerat/i },
  { topic: "flavours per pack", match: /how many flavou?rs/i },
  { topic: "deposit", match: /deposit/i },
];

type Faq = PageDraft["faqs"][number];

/**
 * The FAQ entries for the homepage, one per topic (first match wins, no
 * repeats). An entry whose answer needs the dietary claim goes when the claim
 * is off, as on the FAQ page (components/content/DraftPage.tsx).
 */
export function pickHomeFaqs(
  faqs: readonly Faq[],
  dietaryClaimOn: boolean,
  topics: readonly { match: RegExp }[] = HOME_FAQ_TOPICS
): Faq[] {
  const usable = faqs.filter((f) => dietaryClaimOn || !usesDietaryClaim(f.a));
  const picked: Faq[] = [];
  for (const { match } of topics) {
    const f = usable.find((x) => match.test(x.q) && !picked.includes(x));
    if (f) picked.push(f);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Instagram grid (Instagram)
// ---------------------------------------------------------------------------

export type GridImage = { src: string; alt: string };

const IMAGE_FILE = /\.(avif|webp|png|jpe?g)$/i;

/** Camera and app default names say nothing about the picture. */
const FILLER_WORDS =
  /\b(img|image|dsc|dscn|dscf|pxl|photo|pic|screenshot|screen|shot|at|ig|insta|instagram|story|post|copy|edited|final|whatsapp|signal)\b/gi;

/** Alt text from a descriptive filename ("dubai-cups-wedding.jpg"), or a plain fallback. */
export function altFromFilename(name: string, index: number, handle: string): string {
  const words = name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const meaningful = words.replace(FILLER_WORDS, "").replace(/[^a-z]/gi, "");
  if (meaningful.length < 3) return `Dessert Shot on Instagram (${handle}), photo ${index + 1}`;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Image files in a public folder, in name order, as grid tiles. */
export function gridImages(files: readonly string[], dir: string, handle: string, max = 8): GridImage[] {
  return files
    .filter((f) => !f.startsWith(".") && IMAGE_FILE.test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .slice(0, max)
    .map((f, i) => ({ src: `${dir.replace(/\/$/, "")}/${encodeURIComponent(f)}`, alt: altFromFilename(f, i, handle) }));
}
