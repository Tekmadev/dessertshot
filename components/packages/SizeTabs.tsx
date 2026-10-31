"use client";

import { motion } from "motion/react";
import { EASE_CINEMA } from "@/lib/constants";
import { CUP_SIZES } from "@/lib/packs";
import type { CupSize } from "@/lib/pricing";

export const tabId = (base: string, size: CupSize) => `${base}-tab-${size}`;
export const panelId = (base: string, size: CupSize) => `${base}-panel-${size}`;

/**
 * Mini Shots / Dessert Cups, as an ARIA tablist: arrow keys, Home and End
 * move between the tabs (automatic activation), Tab moves into the panel.
 */
export default function SizeTabs({
  idBase,
  value,
  onChange,
}: {
  idBase: string;
  value: CupSize;
  onChange: (size: CupSize) => void;
}) {
  const select = (index: number) => {
    const size = CUP_SIZES[(index + CUP_SIZES.length) % CUP_SIZES.length].value;
    onChange(size);
    document.getElementById(tabId(idBase, size))?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const next =
      e.key === "ArrowRight" ? index + 1
      : e.key === "ArrowLeft" ? index - 1
      : e.key === "Home" ? 0
      : e.key === "End" ? CUP_SIZES.length - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next);
  };

  return (
    <div
      role="tablist"
      aria-label="Cup size"
      className="grid grid-cols-2 gap-1 p-1 w-full sm:w-auto sm:min-w-[420px] bg-bone-soft hairline-top hairline-bottom"
    >
      {CUP_SIZES.map((s, i) => {
        const selected = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            role="tab"
            id={tabId(idBase, s.value)}
            aria-selected={selected}
            aria-controls={panelId(idBase, s.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="relative min-h-[56px] px-4 py-3 flex flex-col items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            {selected ? (
              <motion.span
                layoutId={`${idBase}-tab-fill`}
                aria-hidden="true"
                className="absolute inset-0 bg-ink"
                transition={{ duration: 0.6, ease: EASE_CINEMA }}
              />
            ) : null}
            <span
              className={`relative text-[16px] tracking-[-0.01em] transition-colors duration-500 ease-cinema ${
                selected ? "text-bone-soft" : "text-ink"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`relative font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ease-cinema ${
                selected ? "text-bone-soft/80" : "text-ink/70"
              }`}
            >
              {s.value.replace("oz", " oz")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
