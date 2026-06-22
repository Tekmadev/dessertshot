"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { copy, PACKAGES, MENU_PRICES } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";

const QUANTITIES: (24 | 48 | 96)[] = [24, 48, 96];

export default function Packages() {
  const scrollToOrder = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="packages"
      aria-label="Packages"
      className="relative py-32 md:py-44 bg-bone hairline-bottom"
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
              {copy.packages.kicker}
            </motion.div>
            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.96] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
            >
              {copy.packages.heading}
              <br />
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                {copy.packages.headingItalic}
              </em>
            </motion.h2>
          </div>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.15 }}
            className="md:col-span-5 self-end max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70"
          >
            {copy.packages.body}
          </motion.p>
        </div>

        {/* Size cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-ink/15 hairline-top hairline-bottom mb-16">
          <SizeBlock
            cupSize="2oz"
            label="Mini Shots"
            subtitle="2 oz · tasting size"
            description="Light, elegant, perfect for events where guests try everything on the table."
            index={0}
            onOrder={scrollToOrder}
          />
          <SizeBlock
            cupSize="5oz"
            label="Dessert Cups"
            subtitle="5 oz · full serving"
            description="The full experience. Every layer lands the way it was built."
            index={1}
            onOrder={scrollToOrder}
          />
        </div>

        {/* Pack info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 hairline-top hairline-bottom">
          {PACKAGES.map((pkg, i) => (
            <PackCard key={pkg.size} pkg={pkg} index={i} onOrder={scrollToOrder} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.3 }}
          className="mt-8 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/45 leading-[1.8]"
        >
          Minimum order 24 cups · Flavours packed in sets of 5 · Mix Classic and Premium in the same box
        </motion.p>
      </div>
    </section>
  );
}

function SizeBlock({
  cupSize,
  label,
  subtitle,
  description,
  index,
  onOrder,
}: {
  cupSize: "2oz" | "5oz";
  label: string;
  subtitle: string;
  description: string;
  index: number;
  onOrder: () => void;
}) {
  const prices = MENU_PRICES[cupSize];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.95, ease: EASE_CINEMA, delay: index * 0.08 }}
      className="bg-bone p-8 md:p-10 flex flex-col gap-8"
    >
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45 mb-2">
          {subtitle}
        </div>
        <h3
          className="font-display leading-[1.0] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          {label}
        </h3>
        <p className="mt-3 max-w-[40ch] text-[15px] leading-[1.55] text-ink/65">
          {description}
        </p>
      </div>

      {/* Price grid */}
      <div className="hairline-top pt-6 flex flex-col gap-0">
        <div className="grid grid-cols-3 gap-0 mb-3">
          <div />
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 text-center">Classic</div>
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 text-center">Premium</div>
        </div>
        {QUANTITIES.map((qty) => (
          <div key={qty} className="grid grid-cols-3 gap-0 py-3 hairline-top">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/55 self-center">
              {qty} cups
            </div>
            <div className="font-display text-[22px] tracking-[-0.025em] text-ink text-center">
              ${prices.classic[qty]}
            </div>
            <div className="font-display text-[22px] tracking-[-0.025em] text-center" style={{ color: "var(--color-ember)" }}>
              ${prices.premium[qty]}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onOrder}
        className="mt-auto inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] transition-all duration-500 ease-cinema text-bone-soft"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <span>Order {label}</span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">
          From ${Math.min(prices.classic[24], prices.premium[24])}
        </span>
      </button>
    </motion.div>
  );
}

function PackCard({
  pkg,
  index,
  onOrder,
}: {
  pkg: (typeof PACKAGES)[number];
  index: number;
  onOrder: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.95, ease: EASE_CINEMA, delay: index * 0.08 }}
      className="relative bg-bone p-8 md:p-10 flex flex-col gap-8"
      style={pkg.featured ? { backgroundColor: "var(--color-bone-soft)" } : undefined}
    >
      {pkg.featured ? (
        <div
          className="absolute top-6 right-6 font-mono text-[10px] tracking-[0.22em] uppercase px-3 py-1 rounded-full text-bone-soft"
          style={{ backgroundColor: "var(--color-ink)" }}
        >
          Most popular
        </div>
      ) : null}

      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
          {pkg.size} cups
        </div>
        <h3 className="mt-3 font-display text-[40px] md:text-[56px] leading-[1.0] tracking-[-0.035em] text-ink">
          {pkg.label}
        </h3>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-[1.55] text-ink/65">
          {pkg.description}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {pkg.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-3 text-[15px] text-ink/75 leading-[1.45]"
          >
            <Check
              size={14}
              strokeWidth={2}
              className="mt-1 flex-shrink-0"
              style={{ color: "var(--color-ember)" }}
            />
            {perk}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onOrder}
        className="mt-auto group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] transition-all duration-500 ease-cinema text-bone-soft"
        style={{
          backgroundColor: pkg.featured ? "var(--color-ember)" : "var(--color-ink)",
        }}
      >
        <span>Order {pkg.size} cups</span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
          Place request
        </span>
      </button>
    </motion.div>
  );
}
