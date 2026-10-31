"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type CSSProperties, type UIEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import LineupCard from "@/components/menu/LineupCard";
import { LINEUP_FILTERS, filterFlavors, pad2, type LineupFilter } from "@/components/menu/menu-data";

/**
 * S3, the flavour lineup. Filter chips by category, then one card per
 * flavour. Phones and tablets: a horizontal swipe track with scroll-snap
 * (the track scrolls, never the page). Desktop: the cards stack as you
 * scroll, each sliding over the last; with reduced motion they sit in a
 * plain column instead.
 */
export default function Flavors() {
  const [active, setActive] = useState<LineupFilter>("All");
  const [pos, setPos] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const flavors = filterFlavors(active);

  const choose = (filter: LineupFilter) => {
    setActive(filter);
    setPos(0);
    trackRef.current?.scrollTo({ left: 0 });
  };

  // One card width plus the gap: what a swipe (or an arrow) moves.
  const stepOf = (track: HTMLElement) => {
    const card = track.querySelector("li");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  };

  const onTrackScroll = (e: UIEvent<HTMLUListElement>) => {
    const track = e.currentTarget;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    setPos(atEnd ? flavors.length - 1 : Math.round(track.scrollLeft / stepOf(track)));
  };

  const nudge = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * stepOf(track), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      id="flavors"
      aria-label="Flavours"
      className="relative py-20 sm:py-28 md:py-44 bg-bone hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12 md:mb-20">
          <div className="md:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.9, ease: EASE_CINEMA }}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6"
            >
              {copy.flavors.kicker}
            </motion.p>
            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.96] tracking-[-0.04em] break-words"
              style={{ fontSize: "clamp(38px, 9vw, 120px)" }}
            >
              {copy.flavors.heading}
              <br />
              <em
                className="italic"
                style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
              >
                {copy.flavors.headingItalic}
              </em>
            </motion.h2>
          </div>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.15 }}
            className="md:col-span-5 self-end max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/80"
          >
            {copy.flavors.body}
          </motion.p>
        </div>

        {/* Filter rail */}
        <div className="flex flex-wrap items-center gap-2 mb-8 lg:mb-12 hairline-top pt-6 md:pt-8">
          <div role="group" aria-label="Filter flavours by type" className="flex flex-wrap gap-2">
            {LINEUP_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={active === f}
                onClick={() => choose(f)}
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ease-cinema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  active === f ? "bg-ink text-bone-soft" : "border border-ink/20 text-ink/80 hover:border-ink/50 hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p
            aria-live="polite"
            className="basis-full mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70 sm:basis-auto sm:ml-auto sm:mt-0"
          >
            {flavors.length} on the menu
          </p>
        </div>

        {/* Cards: a swipe track below lg, a sticky stack from lg up. */}
        <ul
          ref={trackRef}
          onScroll={onTrackScroll}
          data-lenis-prevent-horizontal
          className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overflow-y-hidden px-6 pb-2 [scrollbar-width:none] md:-mx-10 md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden lg:mx-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {flavors.map((flavor, i) => (
            <li
              key={flavor.id}
              style={{ "--i": i } as CSSProperties}
              className="w-[min(84vw,24rem)] shrink-0 snap-start md:w-[calc(50%-0.5rem)] lg:mb-10 lg:h-[min(34rem,calc(100svh-13rem))] lg:min-h-[26rem] lg:w-auto lg:last:mb-0 lg:top-[calc(6rem_+_var(--i)_*_0.75rem)] lg:motion-safe:sticky has-[:focus-visible]:z-10"
            >
              <motion.div
                className="h-full"
                // Fixed starting styles (no useReducedMotion branch): they're in the server HTML, so they must
                // match the client's first render. The root MotionConfig skips the rise for reduced motion.
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE_CINEMA }}
              >
                <LineupCard flavor={flavor} index={i} total={flavors.length} />
              </motion.div>
            </li>
          ))}
        </ul>

        {/* Track controls (phones and tablets) */}
        <div className="mt-5 flex items-center justify-between gap-4 lg:hidden">
          <p className="font-mono text-[11px] tracking-[0.2em] text-ink/70 tabular-nums">
            <span className="sr-only">Showing flavour </span>
            {pad2(Math.min(pos, flavors.length - 1) + 1)} / {pad2(flavors.length)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Previous flavour"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Next flavour"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-12 lg:mt-16 flex justify-start">
          <Link
            href="/menu"
            className="group inline-flex min-h-11 items-center gap-2 text-[16px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Prices, sizes and every layer on the full menu
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-500 ease-cinema group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
