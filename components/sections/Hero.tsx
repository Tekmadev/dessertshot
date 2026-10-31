import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroFrame from "@/components/experience/hero/HeroFrame";
import styles from "@/components/experience/hero/hero.module.css";
import { BUSINESS } from "@/lib/business";
import { copy } from "@/lib/copy";

/**
 * Homepage S1. A server component: the entrance is CSS (it plays from the
 * first paint), and the only client code is the hero video. Phones stack
 * kicker, headline, the 4:5 video, then the subhead and calls to action;
 * desktops put the video in the right-hand column.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative overflow-hidden pb-16 pt-24 md:pt-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-28"
    >
      <Backdrop />

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-y-8 px-6 md:px-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-10">
        <div className="lg:col-span-7 lg:row-start-1 lg:self-end">
          <p
            className={`mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70 md:mb-7 ${styles.fade}`}
            style={{ animationDelay: "0.05s" }}
          >
            {copy.hero.eyebrow}
          </p>
          <h1 className="font-display text-[length:clamp(40px,11vw,76px)] leading-[0.95] tracking-[-0.04em] text-ink lg:text-[length:clamp(56px,5.4vw,96px)]">
            <Line delay={0.1}>{copy.hero.line1}</Line>{" "}
            <Line delay={0.2}>
              {copy.hero.line2Pre}
              <em className="italic" style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
                {copy.hero.line2Italic}
              </em>
              {copy.hero.line2Post}
            </Line>{" "}
            <Line delay={0.3}>{copy.hero.line3}</Line>
          </h1>
        </div>

        <HeroFrame className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center" />

        <div className="lg:col-span-7 lg:row-start-2 lg:self-start">
          <p
            className={`max-w-[52ch] text-[17px] leading-[1.55] text-ink/70 md:text-[19px] ${styles.fade}`}
            style={{ animationDelay: "0.45s" }}
          >
            {copy.hero.subhead}
          </p>

          <div
            className={`mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 md:mt-10 ${styles.fade}`}
            style={{ animationDelay: "0.55s" }}
          >
            <Link
              href={copy.cta.primary.href}
              className="group inline-flex min-h-14 w-full items-center justify-between gap-6 rounded-full bg-berry px-7 py-4 text-[15px] tracking-[-0.01em] text-bone-soft transition-colors duration-500 ease-cinema hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:w-auto"
            >
              <span>{copy.cta.primary.label}</span>
              <ArrowRight
                aria-hidden="true"
                size={18}
                strokeWidth={1.6}
                className="transition-transform duration-500 ease-cinema group-hover:translate-x-1.5"
              />
            </Link>
            <Link
              href={copy.hero.secondaryCta.href}
              className="group relative inline-flex min-h-11 items-center self-start text-[15px] tracking-[-0.01em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:self-auto"
            >
              <span className="relative">
                {copy.hero.secondaryCta.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-px origin-left scale-x-100 bg-ink transition-transform duration-500 ease-cinema group-hover:scale-x-0"
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-px origin-right scale-x-0 bg-ember transition-transform duration-500 ease-cinema group-hover:scale-x-100"
                />
              </span>
            </Link>
          </div>

          <p
            className={`mt-6 max-w-[46ch] font-mono text-[11px] uppercase leading-[1.7] tracking-[0.16em] text-ink/70 ${styles.fade}`}
            style={{ animationDelay: "0.65s" }}
          >
            {copy.hero.note}
          </p>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="line-mask">
      <span className={`block text-balance ${styles.rise}`} style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

function Backdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(208,72,100,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(234,130,152,0.10) 0%, transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute bottom-9 left-10 hidden gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70 lg:flex">
        <span>
          <span aria-hidden="true">◇ </span>Est. {BUSINESS.founded}
        </span>
        <span>
          <span aria-hidden="true">◇ </span>
          {BUSINESS.location.city}, {BUSINESS.location.provinceShort}
        </span>
      </div>
    </>
  );
}

/** Desktop only: on phones the hero runs past the fold and the video already invites the scroll. */
function ScrollCue() {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex ${styles.fade}`}
      style={{ animationDelay: "1.1s" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">Scroll</span>
      <span className="relative block h-10 w-px overflow-hidden bg-ink/20">
        <span className={`absolute inset-x-0 top-0 block h-1/2 bg-ink ${styles.cue}`} />
      </span>
    </div>
  );
}
