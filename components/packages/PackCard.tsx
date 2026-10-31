"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { EASE_CINEMA } from "@/lib/constants";
import { formatPrice } from "@/lib/cups-helper";
import type { OrderPrefill } from "@/lib/order-prefill";
import { CUP_SIZES, type Pack } from "@/lib/packs";
import { MENU_PRICES, perCupPrice, type CupSize, type Tier } from "@/lib/pricing";
import OrderLink from "./OrderLink";

const TIERS: { tier: Tier; label: string }[] = [
  { tier: "classic", label: "Classic" },
  { tier: "premium", label: "Premium" },
];

/** One pack at one cup size: both tier prices, per-cup prices, perks and an order link. */
export default function PackCard({
  pkg,
  size,
  index,
  onOrder,
}: {
  pkg: Pack;
  size: CupSize;
  index: number;
  onOrder: (prefill: OrderPrefill) => void;
}) {
  const headingId = useId();
  const sizeLabel = CUP_SIZES.find((c) => c.value === size)!.label;

  return (
    <motion.article
      aria-labelledby={headingId}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.95, ease: EASE_CINEMA, delay: index * 0.08 }}
      className={`relative flex flex-col gap-8 p-6 sm:p-8 md:p-10 ${pkg.featured ? "bg-bone-soft" : "bg-bone"}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
            {pkg.size} {sizeLabel}
          </p>
          {pkg.featured ? (
            <span className="-mt-1 shrink-0 bg-ink px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-bone-soft">
              Most popular
            </span>
          ) : null}
        </div>
        <h3
          id={headingId}
          className="mt-3 font-display text-[44px] md:text-[52px] lg:text-[60px] leading-none tracking-[-0.035em] text-ink"
        >
          {pkg.label}
        </h3>
        <p className="mt-3 max-w-[36ch] text-[15px] leading-[1.55] text-ink/70">{pkg.description}</p>
      </div>

      <dl className="hairline-top">
        {TIERS.map(({ tier, label }) => (
          <div key={tier} className="flex items-baseline justify-between gap-4 py-4 hairline-bottom">
            <dt className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">{label}</dt>
            <dd className="text-right">
              <span
                className="block font-display text-[32px] leading-none tracking-[-0.025em] text-ink"
                style={tier === "premium" ? { color: "var(--color-ember)" } : undefined}
              >
                {formatPrice(MENU_PRICES[size][tier][pkg.size])}
                <span className="sr-only"> a pack,</span>
              </span>
              <span className="mt-2 block text-[13px] text-ink/70">
                {formatPrice(perCupPrice(size, tier, pkg.size))} per cup
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="flex flex-col gap-3">
        {pkg.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-[15px] leading-[1.45] text-ink/80">
            <Check aria-hidden="true" size={14} strokeWidth={2} className="mt-1 shrink-0 text-ember" />
            {perk}
          </li>
        ))}
      </ul>

      <OrderLink
        prefill={{ pack: pkg.size, size }}
        onOrder={onOrder}
        className="group mt-auto inline-flex min-h-[56px] items-center justify-between gap-4 rounded-full bg-ink px-6 py-4 text-[15px] tracking-[-0.01em] text-bone-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        <span>Order the {pkg.size}</span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-bone-soft/80">
          {sizeLabel}
          <ArrowRight
            aria-hidden="true"
            size={14}
            className="transition-transform duration-500 ease-cinema group-hover:translate-x-1"
          />
        </span>
      </OrderLink>
    </motion.article>
  );
}
