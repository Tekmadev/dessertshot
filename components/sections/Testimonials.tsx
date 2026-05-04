"use client";

import { motion } from "motion/react";
import { copy, TESTIMONIALS } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What people say"
      className="relative py-32 md:py-44 bg-bone-soft hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 md:mb-20">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.9, ease: EASE_CINEMA }}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6"
            >
              {copy.testimonials.kicker}
            </motion.div>
            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.96] tracking-[-0.035em] max-w-[18ch]"
              style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
            >
              {copy.testimonials.heading}
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/12 hairline-top hairline-bottom">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} index={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  index,
  testimonial,
}: {
  index: number;
  testimonial: (typeof TESTIMONIALS)[number];
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: EASE_CINEMA, delay: index * 0.06 }}
      className="bg-bone-soft p-10 md:p-14 flex flex-col gap-8"
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span
            key={i}
            className="text-ember text-lg"
            style={{ color: "var(--color-ember)" }}
          >
            ★
          </span>
        ))}
      </div>
      <blockquote
        className="font-display text-[26px] md:text-[34px] leading-[1.15] tracking-[-0.025em] text-ink"
      >
        &ldquo;{testimonial.text}&rdquo;
      </blockquote>
      <figcaption className="flex items-center justify-between gap-6 hairline-top pt-6 mt-auto">
        <div>
          <div className="font-display text-[18px] tracking-[-0.02em] text-ink">
            {testimonial.name}
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mt-1">
            {testimonial.location}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
            Ordered
          </div>
          <div className="font-display italic text-[16px] tracking-[-0.01em] text-ember mt-1">
            {testimonial.flavor}
          </div>
        </div>
      </figcaption>
    </motion.figure>
  );
}
