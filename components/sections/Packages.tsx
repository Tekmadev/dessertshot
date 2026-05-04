"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { copy, PACKAGES } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";

export default function Packages() {
  const addItem = useCartStore((s) => s.addItem);
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAdd = (pkg: (typeof PACKAGES)[number]) => {
    addItem({
      id: `package-${pkg.size}`,
      name: pkg.label,
      flavor: "Mixed",
      packageSize: pkg.size as 6 | 12 | 24,
      price: pkg.total,
      quantity: 1,
    });
    setAddedId(pkg.size);
    window.setTimeout(() => setAddedId(null), 1800);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 hairline-top hairline-bottom">
          {PACKAGES.map((pkg, i) => (
            <PackageCard
              key={pkg.size}
              pkg={pkg}
              index={i}
              added={addedId === pkg.size}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  index,
  added,
  onAdd,
}: {
  pkg: (typeof PACKAGES)[number];
  index: number;
  added: boolean;
  onAdd: (p: (typeof PACKAGES)[number]) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.95, ease: EASE_CINEMA, delay: index * 0.08 }}
      className={`relative bg-bone p-8 md:p-10 flex flex-col gap-8 ${
        pkg.featured ? "bg-bone-soft" : ""
      }`}
      style={pkg.featured ? { backgroundColor: "var(--color-bone-soft)" } : undefined}
    >
      {pkg.featured ? (
        <div className="absolute top-6 right-6 font-mono text-[10px] tracking-[0.22em] uppercase px-3 py-1 rounded-full bg-ink text-bone-soft" style={{backgroundColor: "var(--color-ink)"}}>
          Most ordered
        </div>
      ) : null}

      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
          The {pkg.size} cup box
        </div>
        <h3 className="mt-3 font-display text-[40px] md:text-[56px] leading-[1.0] tracking-[-0.035em] text-ink">
          {pkg.label}
        </h3>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-[1.55] text-ink/65">
          {pkg.description}
        </p>
      </div>

      <div className="flex items-baseline gap-3 hairline-top pt-6">
        <span
          className="font-display text-[64px] leading-none tracking-[-0.04em] text-ink"
        >
          ${pkg.total.toFixed(0)}
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/45">
          ${pkg.pricePerCup.toFixed(2)} per cup
        </span>
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
        onClick={() => onAdd(pkg)}
        className="mt-auto group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] transition-all duration-500 ease-cinema"
        style={{
          backgroundColor: pkg.featured
            ? "var(--color-ember)"
            : "var(--color-ink)",
          color: "var(--color-bone-soft)",
        }}
      >
        <span>{added ? "Added to box" : `Add ${pkg.label}`}</span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
          {added ? "Done" : `${pkg.size} cups`}
        </span>
      </button>
    </motion.div>
  );
}
