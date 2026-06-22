"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { copy, FLAVORS } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { CupGlyph } from "@/components/ui/CupGlyph";

const CATEGORIES = ["All", "Fruit", "Chocolate", "Caramel", "Premium"] as const;

type Cat = (typeof CATEGORIES)[number];

export default function Flavors() {
  const [active, setActive] = useState<Cat>("All");

  const filtered = FLAVORS.filter((f) =>
    active === "All" ? true : f.category === active
  );

  return (
    <section
      id="flavors"
      aria-label="Flavours"
      className="relative py-32 md:py-44 bg-bone hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 md:mb-24">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.9, ease: EASE_CINEMA }}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6"
            >
              {copy.flavors.kicker}
            </motion.div>
            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE_CINEMA }}
              className="font-display text-ink leading-[0.96] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 8vw, 128px)" }}
            >
              {copy.flavors.heading}
              <br />
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
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
            className="md:col-span-5 self-end max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70"
          >
            {copy.flavors.body}
          </motion.p>
        </div>

        {/* Filter rail */}
        <div className="flex flex-wrap items-center gap-2 mb-12 hairline-top pt-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-500 ease-cinema ${
                active === c
                  ? "bg-ink text-bone-soft"
                  : "bg-transparent text-ink/60 hover:text-ink"
              }`}
              style={
                active === c ? { backgroundColor: "var(--color-ink)" } : undefined
              }
            >
              {c}
            </button>
          ))}
          <div className="ml-auto font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
            {filtered.length} on the menu
          </div>
        </div>

        {/* Flavour grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 hairline-top hairline-bottom">
          {filtered.map((flavor, i) => (
            <FlavorCard key={flavor.id} flavor={flavor} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlavorCard({
  flavor,
  index,
}: {
  flavor: (typeof FLAVORS)[number];
  index: number;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: EASE_CINEMA, delay: index * 0.04 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative group bg-bone p-8 md:p-10 flex flex-col gap-7 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
            {flavor.category}
          </div>
          <h3 className="mt-2 font-display text-[28px] md:text-[36px] leading-[1.0] tracking-[-0.03em] text-ink">
            {flavor.name}
          </h3>
          <p className="mt-1 italic text-ink/55 text-[15px]">{flavor.tagline}</p>
        </div>
        <span
          className="font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1 rounded-full"
          style={
            flavor.tier === "premium"
              ? { backgroundColor: "var(--color-ember)", color: "var(--color-bone-soft)" }
              : { border: "1px solid var(--color-ink-15)", color: "var(--color-ink)" }
          }
        >
          {flavor.tier === "premium" ? "Premium" : "Classic"}
        </span>
      </div>

      <div className="flex items-center gap-6 min-h-[180px]">
        <div className="relative">
          <motion.div
            animate={{ scale: hover ? 1.04 : 1, rotate: hover ? -1.5 : 0 }}
            transition={{ duration: 0.7, ease: EASE_CINEMA }}
          >
            <CupGlyph
              size={140}
              layers={layerColors(flavor.id, flavor.accent)}
            />
          </motion.div>
        </div>

        <ul className="flex-1 flex flex-col gap-1.5">
          {flavor.layers.map((l, i) => (
            <li
              key={l}
              className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/55"
            >
              <span
                className="block w-2 h-2 rounded-full"
                style={{
                  background:
                    i === 2 ? flavor.accent : "var(--color-ink-30)",
                }}
              />
              {l}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[15px] leading-[1.55] text-ink/70 max-w-[40ch]">
        {flavor.description}
      </p>

      {/* Accent corner */}
      <span
        aria-hidden="true"
        className="absolute right-6 bottom-6 w-4 h-4"
        style={{
          background: flavor.accent,
          borderRadius: 999,
          opacity: hover ? 1 : 0.4,
          transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </motion.div>
  );
}

function layerColors(id: string, accent: string) {
  const base = { color: "#9c6510", height: 18 };
  const cream = { color: "#f3dfb6", height: 30 };
  const finish = { color: "var(--color-ember)", height: 14 };
  // Some flavour specific tweaks for visual variety.
  switch (id) {
    case "strawberry":
      return [
        { label: "Biscuit", color: "#c89464", height: 18 },
        { label: "Cream", color: "#f8d8dc", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#7a1a26", height: 14 },
      ];
    case "blueberry":
      return [
        { label: "Biscuit", color: "#c89464", height: 18 },
        { label: "Cream", color: "#dad0eb", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#2d1f60", height: 14 },
      ];
    case "kinder":
      return [
        { label: "Biscuit", color: "#7c4a14", height: 18 },
        { label: "Cream", color: "#f3dfb6", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#3a1f08", height: 14 },
      ];
    case "ferrero":
      return [
        { label: "Biscuit", color: "#5c3814", height: 18 },
        { label: "Cream", color: "#d3a86a", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#2a1607", height: 14 },
      ];
    case "biscoff":
      return [
        { label: "Biscuit", color: "#a96a14", height: 18 },
        { label: "Cream", color: "#f0c890", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#7a4810", height: 14 },
      ];
    case "dubai":
      return [
        { label: "Biscuit", color: "#3a4a28", height: 18 },
        { label: "Cream", color: "#cdd9b8", height: 30 },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", color: "#2a1607", height: 14 },
      ];
    case "mango":
    default:
      return [
        { label: "Biscuit", ...base },
        { label: "Cream", ...cream },
        { label: "Concentrate", color: accent, height: 16 },
        { label: "Topping", ...finish },
      ];
  }
}
