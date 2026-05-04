"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";

export default function Numbers() {
  return (
    <section
      id="numbers"
      aria-label="By the numbers"
      className="relative bg-bone py-32 md:py-44 overflow-hidden hairline-top"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.9, ease: EASE_CINEMA }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/55 max-w-2xl"
        >
          {copy.numbers.intro}
        </motion.p>

        <div className="mt-16 md:mt-24 flex flex-col gap-32 md:gap-44">
          {copy.numbers.stats.map((s, i) => (
            <Stat key={i} index={i} stat={s} total={copy.numbers.stats.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  index,
  stat,
  total,
}: {
  index: number;
  stat: (typeof copy.numbers.stats)[number];
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });
  const value = useMotionValue(0);
  const display = useTransform(value, (v) => formatStat(v, stat.format));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, stat.value, {
      duration: 1.6,
      ease: EASE_CINEMA,
    });
    return () => controls.stop();
  }, [inView, stat.value, value]);

  const isReverse = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-6 md:gap-8 ${
        isReverse ? "md:items-end md:text-right" : ""
      }`}
    >
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/40">
        0{index + 1} of 0{total}
      </div>
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE_CINEMA }}
        className="font-display leading-[0.88] tracking-[-0.045em] text-ink"
        style={{ fontSize: "clamp(96px, 17vw, 240px)" }}
      >
        <motion.span>{display}</motion.span>
      </motion.div>
      <motion.p
        initial={{ y: 18, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.15, duration: 0.9, ease: EASE_CINEMA }}
        className="max-w-[44ch] text-[18px] md:text-[21px] leading-[1.45] tracking-[-0.005em] text-ink/75"
      >
        {stat.label}
      </motion.p>
    </div>
  );
}

function formatStat(v: number, format: "plus" | "hours" | "percent"): string {
  if (format === "plus") return `${Math.round(v).toLocaleString("en-US")}+`;
  if (format === "hours") return `${Math.round(v)}h`;
  return `${Math.round(v)}%`;
}
