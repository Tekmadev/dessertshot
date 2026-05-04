"use client";

import { motion } from "motion/react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";

export default function Story() {
  return (
    <section
      id="story"
      aria-label="What lives in a cup"
      className="relative py-32 md:py-44 bg-bone hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-end">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-25% 0px" }}
              transition={{ duration: 0.9, ease: EASE_CINEMA }}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6"
            >
              {copy.feature.kicker}
            </motion.div>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-25% 0px" }}
              transition={{ duration: 1.1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.95] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 8vw, 132px)" }}
            >
              Four{" "}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                layers,
              </em>
              <br />
              no shortcuts.
            </motion.h2>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-25% 0px" }}
            transition={{ duration: 1.1, ease: EASE_CINEMA, delay: 0.15 }}
            className="md:col-span-5 max-w-[44ch] text-[18px] md:text-[20px] leading-[1.55] tracking-[-0.005em] text-ink/75"
          >
            {copy.feature.body}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
