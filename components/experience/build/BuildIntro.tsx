"use client";

import { MotionConfig, motion } from "motion/react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { splitHeading } from "./plan";

const [LEAD, TAIL] = splitHeading(copy.feature.heading);
const inView = { once: true, margin: "-20% 0px" } as const;

/** The heading above the pinned build: kicker, "Four layers, no shortcuts." and the short body. */
export default function BuildIntro() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 pb-6 pt-20 sm:pt-28 md:grid-cols-12 md:items-end md:gap-16 md:px-10 md:pb-12 md:pt-40">
        <div className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.9, ease: EASE_CINEMA }}
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70"
          >
            {copy.feature.kicker}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 1, ease: EASE_CINEMA }}
            className="font-display leading-[0.96] tracking-[-0.04em] text-ink"
            style={{ fontSize: "clamp(40px, 8vw, 112px)" }}
          >
            {LEAD}
            {TAIL ? (
              <>
                <br />
                <em
                  className="italic"
                  style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
                >
                  {TAIL}
                </em>
              </>
            ) : null}
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.15 }}
          className="max-w-[44ch] text-[17px] leading-[1.55] text-ink/70 md:col-span-5 md:text-[19px]"
        >
          {copy.feature.body}
        </motion.p>
      </div>
    </MotionConfig>
  );
}
