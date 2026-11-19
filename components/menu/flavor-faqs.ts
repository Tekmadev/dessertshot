/**
 * The FAQ entries a flavour page shows, picked from the reviewed FAQ draft
 * (content/drafts/faq.json) so the answers never drift from /faq. Matched by
 * topic rather than exact wording, so small copy edits don't drop them.
 * Server-side only: it pulls in the drafts.
 */
import { getDraft, type PageDraft } from "@/lib/drafts";
import { SITE_TOKENS, usesDietaryClaim, type Tokens } from "@/lib/markdown";

export type Faq = { q: string; a: string };

/** Allergens (nuts, dairy), storage, flavours per pack, in this order. */
export const FLAVOR_FAQ_TOPICS: readonly RegExp[] = [
  /contain (tree )?nuts/i,
  /contain dairy/i,
  /fridge|refrigerat/i,
  /how many flavou?rs/i,
];

export function flavorFaqs(
  /** Defaults to the FAQ draft; null when there is none. */
  draft: Pick<PageDraft, "faqs"> | null = getDraft("faq") ?? null,
  tokens: Tokens = SITE_TOKENS
): Faq[] {
  if (!draft) return [];
  const picked: Faq[] = [];
  for (const topic of FLAVOR_FAQ_TOPICS) {
    const faq = draft.faqs.find((f) => topic.test(f.q));
    // Same rule as DraftPage: an answer built on the dietary claim goes when it's off.
    if (faq && !picked.includes(faq) && (!usesDietaryClaim(faq.a) || tokens.dietaryClaim)) picked.push(faq);
  }
  return picked;
}
