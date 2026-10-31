import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Prose from "@/components/content/Prose";
import { resolveTokens, usesDietaryClaim, SITE_TOKENS } from "@/lib/markdown";
import type { PageDraft } from "@/lib/drafts";

/**
 * One page built from a reviewed draft (content/drafts): kicker, h1, intro,
 * sections, FAQ and a call to action. `children` slots extra sections (for
 * example the price grid on /packages) after the draft's own sections.
 */
export default function DraftPage({
  draft,
  kicker,
  children,
}: {
  draft: PageDraft;
  kicker: string;
  children?: React.ReactNode;
}) {
  // A FAQ entry about the dietary claim goes when the claim is switched off.
  const faqs = draft.faqs.filter((f) => !usesDietaryClaim(f.a) || SITE_TOKENS.dietaryClaim);
  const ctaHref = resolveTokens(draft.cta.href) ?? "/order";

  return (
    <>
      <Navbar />
      <main className="relative pt-28 md:pt-32">
        <header className="px-6 md:px-10 pt-10 pb-14 md:pt-16 md:pb-20 hairline-bottom">
          <div className="mx-auto max-w-[1100px]">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">{kicker}</div>
            <h1
              className="font-display text-ink leading-[0.98] tracking-[-0.035em] max-w-[20ch] text-balance"
              style={{ fontSize: "clamp(40px, 6.4vw, 84px)" }}
            >
              {draft.h1}
            </h1>
            <Prose body={draft.intro} className="mt-8 text-[18px] md:text-[20px]" />
          </div>
        </header>

        <div className="px-6 md:px-10">
          <div className="mx-auto max-w-[1100px] flex flex-col">
            {draft.sections.map((s) => (
              <section key={s.heading} className="py-12 md:py-16 hairline-bottom grid gap-6 md:grid-cols-12">
                <h2 className="md:col-span-4 font-display text-[28px] md:text-[34px] leading-[1.1] tracking-[-0.02em] text-ink">
                  {s.heading}
                </h2>
                <Prose body={s.body} className="md:col-span-8" />
              </section>
            ))}
          </div>
        </div>

        {children}

        {faqs.length ? (
          <section className="px-6 md:px-10 py-14 md:py-20" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-[1100px] grid gap-8 md:grid-cols-12">
              <h2 id="faq-heading" className="md:col-span-4 font-display text-[28px] md:text-[34px] leading-[1.1] tracking-[-0.02em] text-ink">
                Questions
              </h2>
              <div className="md:col-span-8 flex flex-col">
                {faqs.map((f) => (
                  <details key={f.q} className="group hairline-top last:border-b last:border-ink/15">
                    <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-5 text-[18px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                      <span>{f.q}</span>
                      <span aria-hidden="true" className="mt-1 font-mono text-ember transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <Prose body={f.a} className="pb-6" />
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-6 md:px-10 pb-24 pt-6">
          <div className="mx-auto max-w-[1100px]">
            <Link
              href={ctaHref}
              className="inline-flex min-h-14 items-center gap-4 rounded-full bg-berry px-7 py-4 text-[15px] text-bone-soft transition-colors duration-500 ease-cinema hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
            >
              {draft.cta.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
