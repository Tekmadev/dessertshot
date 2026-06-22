"use client";

import { motion } from "motion/react";
import { HOW_STEPS } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";

export default function HowItsMade() {
  return (
    <section
      id="how"
      aria-label="How it works"
      className="relative py-20 sm:py-28 md:py-44 bg-bone-soft hairline-top hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 mb-20">
          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.9, ease: EASE_CINEMA }}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6"
            >
              The order flow
            </motion.div>
            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.96] tracking-[-0.035em]"
              style={{ fontSize: "clamp(34px, 6vw, 96px)" }}
            >
              Three steps,{" "}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                no surprises.
              </em>
            </motion.h2>
          </div>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.15 }}
            className="md:col-span-6 md:col-start-7 self-end max-w-[52ch] text-[18px] md:text-[20px] leading-[1.55] tracking-[-0.005em] text-ink/70"
          >
            We confirm the order the same day, bake the morning of, and hand it
            off in a sealed cooler. The whole flow is built so the cup arrives
            tasting like it did when it left the kitchen.
          </motion.p>
        </div>

        <div className="flex flex-col">
          {HOW_STEPS.map((step, i) => (
            <Step key={i} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step }: { step: (typeof HOW_STEPS)[number] }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.05 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 hairline-top py-10 md:py-14"
    >
      <div className="md:col-span-2 font-mono text-[11px] tracking-[0.2em] uppercase text-ember">
        {step.kicker}
      </div>
      <div className="md:col-span-10">
        <h3
          className="font-display tracking-[-0.025em] text-ink leading-[1.02] max-w-[20ch]"
          style={{ fontSize: "clamp(28px, 3.6vw, 52px)" }}
        >
          {step.title}
        </h3>
        <p className="mt-5 max-w-[60ch] text-[17px] md:text-[19px] leading-[1.55] tracking-[-0.005em] text-ink/70">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}
