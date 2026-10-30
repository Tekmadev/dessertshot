/**
 * Page drafts awaiting the owner's review (Step 2 → review round 1). Each is
 * built into a real page in Step 4 once approved. Copy uses a small Markdown
 * subset (paragraphs, - and 1. lists, **bold**, [text](/path)) and these
 * tokens, resolved from config when rendered:
 *   {{contactEmail}}  the public business email (lib/business.ts)
 *   {{mailto}}        a mailto: link to it
 *   {{dietaryClaim}}  the owner's dietary statement, or nothing when the
 *                     claim is switched off in lib/claims.ts. A FAQ entry
 *                     whose answer uses it asks about gluten-free/eggless,
 *                     so the renderer drops the whole entry when it is off.
 */
import birthdays from "@/content/drafts/birthdays.json";
import babyShowers from "@/content/drafts/baby-showers.json";
import bridalShowers from "@/content/drafts/bridal-showers.json";
import celebrations from "@/content/drafts/celebrations.json";
import corporate from "@/content/drafts/corporate.json";
import gta from "@/content/drafts/dessert-cups-gta.json";
import hamilton from "@/content/drafts/dessert-cups-hamilton.json";
import events from "@/content/drafts/events.json";
import faq from "@/content/drafts/faq.json";
import graduations from "@/content/drafts/graduations.json";
import packages from "@/content/drafts/packages.json";
import weddings from "@/content/drafts/weddings.json";

export type DraftStatus = "awaiting-owner-review" | "approved";

export type PageDraft = {
  slug: string;
  path: string;
  status: DraftStatus;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
  cta: { label: string; href: string };
};

export const DRAFT_TOKENS = ["contactEmail", "mailto", "dietaryClaim"] as const;

// The /open-a-shop draft is kept in content/private/ (gitignored) until the
// owner approves publishing it: the repo is public.
export const PAGE_DRAFTS = [
  events,
  weddings,
  babyShowers,
  bridalShowers,
  birthdays,
  graduations,
  corporate,
  celebrations,
  hamilton,
  gta,
  faq,
  packages,
] as PageDraft[];

export function getDraft(slug: string): PageDraft | undefined {
  return PAGE_DRAFTS.find((d) => d.slug === slug);
}

/** Every string a visitor would read on the page (excludes the slug/path). */
export function draftStrings(d: PageDraft): string[] {
  return [
    d.metaTitle,
    d.metaDescription,
    d.h1,
    d.intro,
    ...d.sections.flatMap((s) => [s.heading, s.body]),
    ...d.faqs.flatMap((f) => [f.q, f.a]),
    d.cta.label,
  ];
}
