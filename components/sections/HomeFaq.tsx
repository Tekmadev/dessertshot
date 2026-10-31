import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Prose from "@/components/content/Prose";
import Reveal from "@/components/experience/story/Reveal";
import { pickHomeFaqs } from "@/components/experience/story/story-content";
import { getDraft } from "@/lib/drafts";
import { SITE_TOKENS } from "@/lib/markdown";

/**
 * S9 · The questions people ask before ordering (lead time, delivery,
 * allergens, storage, flavours per pack, deposit), straight from the FAQ
 * draft, as native details/summary: no JavaScript to open one. A server
 * component, so the FAQ copy stays out of the client bundle.
 */
const LABELS = {
  kicker: "Good to know",
  headingPre: "Before",
  headingItalic: "you order.",
  allLink: "Every question, answered",
} as const;

export default function HomeFaq() {
  const draft = getDraft("faq");
  if (!draft) return null;
  const faqs = pickHomeFaqs(draft.faqs, Boolean(SITE_TOKENS.dietaryClaim));
  if (!faqs.length) return null;

  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className="relative py-20 sm:py-28 md:py-40 bg-bone hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div>
            <Reveal y={16} className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">
              {LABELS.kicker}
            </Reveal>
            <Reveal>
              <h2
                id="home-faq-heading"
                className="font-display text-ink leading-[0.96] tracking-[-0.035em]"
                style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
              >
                {LABELS.headingPre}{" "}
                <em
                  className="italic"
                  style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
                >
                  {LABELS.headingItalic}
                </em>
              </h2>
            </Reveal>
          </div>
          <Link
            href={draft.path}
            className="group hidden lg:inline-flex min-h-11 self-start items-center gap-2 text-[16px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {LABELS.allLink}
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-500 ease-cinema group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-col border-b border-ink/15">
            {faqs.map((f) => (
              <details key={f.q} className="group border-t border-ink/15">
                <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-5 text-[18px] md:text-[20px] leading-[1.35] tracking-[-0.01em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 font-mono text-[20px] leading-none text-ember transition-transform duration-500 ease-cinema group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <Prose body={f.a} className="pb-7 pr-8" />
              </details>
            ))}
          </div>

          <Link
            href={draft.path}
            className="group mt-8 inline-flex min-h-11 items-center gap-2 text-[16px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
          >
            {LABELS.allLink}
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-500 ease-cinema group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
