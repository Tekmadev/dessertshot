// Tests for the homepage story helpers (components/experience/story/story-content.ts),
// kept under lib/ because Vitest only collects lib/ and app/ tests.
import { describe, expect, it } from "vitest";
import {
  HOME_FAQ_TOPICS,
  altFromFilename,
  eventSummary,
  firstSentence,
  gridImages,
  pickHomeFaqs,
  plainText,
  trimSummary,
} from "@/components/experience/story/story-content";
import { getDraft } from "./drafts";
import { EVENT_TYPES } from "./events";

describe("firstSentence", () => {
  it("stops at the first full stop before a new sentence", () => {
    expect(firstSentence("Wedding cups, made in Hamilton. Plan the table: the 96.")).toBe("Wedding cups, made in Hamilton.");
  });

  it("returns a single sentence whole and keeps decimals and inner punctuation", () => {
    expect(firstSentence("Packs of 24, 48 or 96: made fresh.")).toBe("Packs of 24, 48 or 96: made fresh.");
    expect(firstSentence("About 2.5 hours out of the fridge. Then serve.")).toBe("About 2.5 hours out of the fridge.");
  });
});

describe("trimSummary", () => {
  it("leaves short text alone and adds a full stop when missing", () => {
    expect(trimSummary("Hand-layered cups")).toBe("Hand-layered cups.");
    expect(trimSummary("Hand-layered cups!")).toBe("Hand-layered cups!");
  });

  it("cuts long text at a clause in the back half", () => {
    const long = "Hand-layered dessert cups and mini shots for cultural and religious celebrations and big family gatherings, made fresh in Hamilton with Saturday GTA delivery.";
    expect(trimSummary(long, 120)).toBe(
      "Hand-layered dessert cups and mini shots for cultural and religious celebrations and big family gatherings."
    );
  });

  it("falls back to a word boundary and an ellipsis, never mid-word", () => {
    const out = trimSummary("one two three four five six seven eight nine ten eleven twelve", 30);
    expect(out.length).toBeLessThanOrEqual(30);
    expect(out).toMatch(/^one two three four five six…$/);
  });
});

describe("plainText", () => {
  it("drops the Markdown and keeps the words", () => {
    expect(plainText("See **packs** on [packages](/packages).\n\n- one\n- two")).toBe("See packs on packages. one, two");
  });
});

describe("eventSummary", () => {
  it.each(EVENT_TYPES.map((e) => [e.slug] as const))("%s has a short, clean one-line summary from its draft", (slug) => {
    const draft = getDraft(slug)!;
    expect(draft, slug).toBeDefined();
    const s = eventSummary(draft);
    expect(s.length).toBeGreaterThan(30);
    expect(s.length).toBeLessThanOrEqual(120);
    expect(s).toMatch(/[.!?…]$/);
    expect(s).not.toMatch(/[*[\]{}]/);
    // It comes from the draft, word for word, up to the cut.
    expect(draft.metaDescription.replace(/\s+/g, " ")).toContain(s.replace(/[.…]$/, ""));
  });

  it("falls back to the intro's first sentence when there is no meta description", () => {
    expect(eventSummary({ metaDescription: "", intro: "Cups for a **crowd**. More below." })).toBe("Cups for a crowd.");
  });
});

describe("pickHomeFaqs", () => {
  const faqs = getDraft("faq")!.faqs;

  it("answers lead time, delivery, allergens, storage, flavours per pack and deposit, in that order", () => {
    const picked = pickHomeFaqs(faqs, true);
    expect(picked).toHaveLength(HOME_FAQ_TOPICS.length);
    expect(picked.map((f) => f.q)).toEqual([
      "How much notice do you need?",
      "Do you deliver, and how much does delivery cost?",
      "Which flavours contain nuts?",
      "Do the cups need to stay in the fridge?",
      "How many flavours can I put in one pack?",
      "How do I pay? Is there a deposit?",
    ]);
  });

  it("never repeats an entry and skips topics with no match", () => {
    const q = (s: string) => ({ q: s, a: "Yes." });
    const picked = pickHomeFaqs([q("Do you deliver on Saturdays?"), q("Is there a deposit?")], true);
    expect(picked.map((f) => f.q)).toEqual(["Do you deliver on Saturdays?", "Is there a deposit?"]);
    expect(new Set(pickHomeFaqs(faqs, true)).size).toBe(HOME_FAQ_TOPICS.length);
  });

  it("drops an entry that needs the dietary claim when the claim is off", () => {
    const entries = [
      { q: "Which flavours contain nuts?", a: "{{dietaryClaim}} Three do." },
      { q: "Is there an allergen list?", a: "Dairy and tree nuts." },
    ];
    expect(pickHomeFaqs(entries, true, [{ match: /nuts|allergen/i }])[0].q).toBe("Which flavours contain nuts?");
    expect(pickHomeFaqs(entries, false, [{ match: /nuts|allergen/i }])[0].q).toBe("Is there an allergen list?");
  });
});

describe("Instagram grid images", () => {
  it("keeps image files only, in name order, up to the limit", () => {
    const files = [".DS_Store", "notes.txt", "b-10.jpg", "b-2.webp", "a.PNG", "clip.mp4", "c.avif"];
    const out = gridImages(files, "/testimonials/", "@dessertshot.ca", 3);
    expect(out.map((i) => i.src)).toEqual(["/testimonials/a.PNG", "/testimonials/b-2.webp", "/testimonials/b-10.jpg"]);
  });

  it("encodes filenames for the URL", () => {
    expect(gridImages(["dubai cups.jpg"], "/testimonials", "@x")[0].src).toBe("/testimonials/dubai%20cups.jpg");
  });

  it("describes a picture from a descriptive filename, with a plain fallback for camera names", () => {
    expect(altFromFilename("dubai-cups_bridal-shower.jpg", 0, "@dessertshot.ca")).toBe("Dubai cups bridal shower");
    expect(altFromFilename("IMG_1234.JPG", 2, "@dessertshot.ca")).toBe("Dessert Shot on Instagram (@dessertshot.ca), photo 3");
    expect(altFromFilename("Screenshot 2026-05-01 at 10.22.33.png", 0, "@d")).toBe("Dessert Shot on Instagram (@d), photo 1");
    expect(altFromFilename("PXL_20260501_102233.webp", 0, "@d")).toBe("Dessert Shot on Instagram (@d), photo 1");
  });

  it("returns nothing when the folder is empty", () => {
    expect(gridImages([], "/testimonials", "@x")).toEqual([]);
  });
});
