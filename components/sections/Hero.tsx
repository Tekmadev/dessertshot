"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { BUSINESS } from "@/lib/business";
import { CupGlyph } from "@/components/ui/CupGlyph";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const cupY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const cupRotate = useTransform(scrollYProgress, [0, 1], [-2, 4]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      aria-label="Hero"
      className="relative min-h-[100svh] overflow-hidden flex items-center pt-32 md:pt-36 pb-20"
    >
      {/* Background numerals */}
      <BackgroundFlair />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="relative z-10 col-span-1 lg:col-span-7"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_CINEMA, delay: 0.2 }}
            className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/55 mb-7"
          >
            {copy.hero.eyebrow}
          </motion.div>

          <h1
            className="font-display text-ink leading-[0.93] tracking-[-0.04em]"
            style={{ fontSize: "clamp(40px, 11vw, 144px)" }}
          >
            <Line delay={0.0}>{copy.hero.line1}</Line>
            <Line delay={0.2}>
              {copy.hero.line2Pre}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                {copy.hero.line2Italic}
              </em>
              {copy.hero.line2Post}
            </Line>
            <Line delay={0.4}>{copy.hero.line3}</Line>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1.05, ease: EASE_CINEMA }}
            className="mt-8 md:mt-10 max-w-[52ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70"
          >
            {copy.hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 1, ease: EASE_CINEMA }}
            className="mt-10 md:mt-12 flex flex-col gap-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              <Link
                href={copy.hero.primaryCta.href}
                className="group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] text-bone-soft transition-all duration-500 ease-cinema hover:gap-9"
                style={{ backgroundColor: "var(--color-ember)" }}
              >
                <span>{copy.hero.primaryCta.label}</span>
                <ArrowRight size={18} strokeWidth={1.6} />
              </Link>
              <Link
                href={copy.hero.secondaryCta.href}
                className="group relative inline-flex items-center gap-2 py-3 -my-3 text-[15px] tracking-[-0.01em] text-ink"
              >
                <span className="relative">
                  {copy.hero.secondaryCta.label}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-px bg-ink origin-left scale-x-100 transition-transform duration-500 ease-cinema group-hover:scale-x-0"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-px bg-ember origin-right scale-x-0 transition-transform duration-500 ease-cinema group-hover:scale-x-100"
                  />
                </span>
              </Link>
            </div>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink/55 max-w-[42ch]">
              {copy.hero.note}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.6, ease: EASE_CINEMA }}
          style={{ y: cupY, rotate: cupRotate }}
          className="relative col-span-1 lg:col-span-5 hidden lg:flex items-center justify-center"
        >
          <div className="relative">
            {/* Soft glow under cup */}
            <div
              aria-hidden="true"
              className="absolute -inset-12 rounded-full blur-3xl opacity-60"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(208,72,100,0.22) 0%, rgba(208,72,100,0) 70%)",
              }}
            />
            <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] mx-auto">
              <CupGlyph
                size={420}
                showLabels
                layers={[
                  { label: "Biscuit", color: "#a86060", height: 22 },
                  { label: "Cream", color: "#fde0e6", height: 38 },
                  { label: "Compote", color: "#d04864", height: 18 },
                  { label: "Topping", color: "#a82a48", height: 18 },
                ]}
              />
            </div>

            {/* Floating tag */}
            <div
              className="absolute -left-2 md:-left-12 bottom-4 md:bottom-12 max-w-[60%] md:max-w-none px-4 py-3 rounded-2xl bg-bone-soft border border-ink/10"
              style={{ boxShadow: "0 24px 60px -20px rgba(58,29,40,0.18)" }}
            >
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/55 mb-1">
                Today&apos;s drop
              </div>
              <div className="font-display text-[20px] tracking-[-0.02em] text-ink leading-none">
                Strawberry Fields
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.2, ease: EASE_CINEMA }}
        style={{ opacity: cueOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
          Scroll
        </span>
        <span className="block w-px h-10 bg-ink/30" />
      </motion.div>
    </section>
  );
}

function Line({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="line-mask">
      <motion.span
        className="block will-change-transform"
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.4, ease: EASE_CINEMA, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function BackgroundFlair() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(208,72,100,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(234,130,152,0.10) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute right-6 md:right-10 top-32 hidden md:flex flex-col items-end gap-1"
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/40">
          ◇ Est. 2024
        </span>
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/40">
          ◇ {BUSINESS.location.city}, {BUSINESS.location.provinceShort}
        </span>
      </div>
    </>
  );
}
