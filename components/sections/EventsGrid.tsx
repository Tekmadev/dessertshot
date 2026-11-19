import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/experience/story/Reveal";
import { eventSummary, firstSentence, plainText } from "@/components/experience/story/story-content";
import { getDraft } from "@/lib/drafts";
import { EVENT_TYPES } from "@/lib/events";

/**
 * S7 · Events. One card per event type (lib/events.ts), each with a line from
 * its own page draft, plus the way to /events. A server component: the
 * drafts stay out of the client bundle. Typography only, no photos (there
 * are none of real events).
 */
const LABELS = {
  kicker: "Events",
  headingPre: "Cups for every",
  headingItalic: "kind of event.",
  allTitle: "Planning any event",
  allBody: "The basics every order shares: sizes, packs, timing and colour themes.",
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

export default function EventsGrid() {
  const hub = getDraft("events");
  const hubPath = hub?.path ?? "/events";
  const intro = hub ? firstSentence(plainText(hub.intro) ?? "") : "";

  const cards = EVENT_TYPES.map((e) => {
    const draft = getDraft(e.slug);
    return {
      slug: e.slug,
      label: e.label,
      href: draft?.path ?? `/events/${e.slug}`,
      summary: draft ? eventSummary(draft) : "",
    };
  });

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="relative py-20 sm:py-28 md:py-40 bg-bone hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 mb-12 md:mb-20 items-end">
          <div className="md:col-span-7">
            <Reveal y={16} className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">
              {LABELS.kicker}
            </Reveal>
            <Reveal>
              <h2
                id="events-heading"
                className="font-display text-ink leading-[0.96] tracking-[-0.04em]"
                style={{ fontSize: "clamp(40px, 6.4vw, 104px)" }}
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
          {intro ? (
            <Reveal delay={0.15} className="md:col-span-5">
              <p className="max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/75">{intro}</p>
            </Reveal>
          ) : null}
        </div>

        <Reveal y={30}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15 hairline-top hairline-bottom">
            {cards.map((c, i) => (
              <li
                key={c.slug}
                className="group relative flex flex-col gap-5 bg-bone p-6 sm:p-8 transition-colors duration-500 ease-cinema hover:bg-bone-soft has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-4 has-[a:focus-visible]:outline-ink"
              >
                <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
                  <span>{pad(i + 1)}</span>
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="text-ink/70 transition-transform duration-500 ease-cinema group-hover:translate-x-1 group-hover:text-ink"
                  />
                </div>
                <h3
                  className="font-display text-ink leading-[1.04] tracking-[-0.03em] text-balance"
                  style={{ fontSize: "clamp(28px, 2.6vw, 38px)" }}
                >
                  {/* The whole card is the link; the name is its accessible label. */}
                  <Link href={c.href} className="outline-none after:absolute after:inset-0 after:content-['']">
                    {c.label}
                  </Link>
                </h3>
                {c.summary ? <p className="mt-auto text-[15px] leading-[1.55] text-ink/75">{c.summary}</p> : null}
              </li>
            ))}

            <li className="group relative flex flex-col gap-5 p-6 sm:p-8 bg-ink text-bone-soft has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-4 has-[a:focus-visible]:outline-bone-soft">
              <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] uppercase text-bone-soft/80">
                <span>{pad(cards.length + 1)}</span>
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-cinema group-hover:translate-x-1"
                />
              </div>
              <h3
                className="font-display leading-[1.04] tracking-[-0.03em] text-balance"
                style={{ fontSize: "clamp(28px, 2.6vw, 38px)" }}
              >
                <Link href={hubPath} className="outline-none after:absolute after:inset-0 after:content-['']">
                  {LABELS.allTitle}
                </Link>
              </h3>
              <p className="mt-auto text-[15px] leading-[1.55] text-bone-soft/85">{LABELS.allBody}</p>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
