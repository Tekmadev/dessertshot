"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { EASE_CINEMA } from "@/lib/constants";
import {
  formatPrice,
  packName,
  packsLabel,
  suggestCups,
  wholeGuests,
  type ServingStyle,
} from "@/lib/cups-helper";
import type { OrderPrefill } from "@/lib/order-prefill";
import { cupSizeLabel } from "@/lib/packs";
import OrderLink from "./OrderLink";

// The ratios live in lib/cups-helper (SERVING_RATIOS); these are their labels.
const STYLES = [
  { value: "dessert", label: "The dessert itself", hint: "About one Dessert Cup (5 oz) per guest" },
  { value: "alongside", label: "Alongside cake or other desserts", hint: "About two Mini Shots (2 oz) per guest" },
] as const satisfies readonly { value: ServingStyle; label: string; hint: string }[];

const DEFAULT_GUESTS = "40";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

/** "How many cups?": guests and serving style in, a size and packs out (a suggestion). */
export default function CupsHelper({ onOrder }: { onOrder: (prefill: OrderPrefill) => void }) {
  const id = useId();
  const [guestsText, setGuestsText] = useState(DEFAULT_GUESTS);
  const [style, setStyle] = useState<ServingStyle>("dessert");

  const guests = wholeGuests(Number(guestsText));
  const suggestion = suggestCups(guests, style);
  const step = (by: number) => setGuestsText(String(Math.max(1, guests + by)));

  // Screen readers hear one short line once typing settles, not the whole panel per keystroke.
  const summary = suggestion
    ? `Suggestion: ${packsLabel(suggestion.packs)}, ${suggestion.totalCups} ${cupSizeLabel(suggestion.size)} for ${suggestion.guests} ${suggestion.guests === 1 ? "guest" : "guests"}.`
    : "";
  const [announced, setAnnounced] = useState(summary);
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(summary), 600);
    return () => clearTimeout(t);
  }, [summary]);

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mt-20 md:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink/15 hairline-top hairline-bottom"
    >
      {/* Inputs */}
      <div className="lg:col-span-6 bg-bone p-6 sm:p-8 md:p-10">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">Planning helper</p>
        <h3
          id={`${id}-heading`}
          className="mt-4 font-display text-ink leading-[0.98] tracking-[-0.035em]"
          style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
        >
          How many{" "}
          <em
            className="italic"
            style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
          >
            cups?
          </em>
        </h3>
        <p className="mt-4 max-w-[44ch] text-[16px] leading-[1.55] text-ink/70">
          Enter your guest count and how the cups will be served, and see a size and the packs that cover it.
        </p>

        <div className="mt-10">
          <label htmlFor={`${id}-guests`} className="block font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
            Guests
          </label>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => guests > 1 && step(-1)}
              // aria-disabled, not disabled: a disabled button would drop keyboard focus at 1.
              aria-disabled={guests <= 1}
              aria-label="One guest fewer"
              className={`grid size-12 shrink-0 place-items-center rounded-full border border-ink/25 text-ink transition-colors duration-500 ease-cinema hover:border-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-ink/25 ${focusRing}`}
            >
              <Minus aria-hidden="true" size={18} />
            </button>
            <input
              id={`${id}-guests`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={guestsText}
              onChange={(e) => setGuestsText(e.target.value)}
              className={`w-full min-w-0 border-b border-ink/25 bg-transparent py-2 text-center font-display text-[40px] leading-none tracking-[-0.03em] text-ink transition-colors duration-500 ease-cinema focus:border-ember [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${focusRing}`}
            />
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="One guest more"
              className={`grid size-12 shrink-0 place-items-center rounded-full border border-ink/25 text-ink transition-colors duration-500 ease-cinema hover:border-ink ${focusRing}`}
            >
              <Plus aria-hidden="true" size={18} />
            </button>
          </div>
        </div>

        <fieldset className="mt-10">
          <legend className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
            How the cups are served
          </legend>
          <div className="mt-3 grid gap-3">
            {STYLES.map((s) => {
              const checked = s.value === style;
              return (
                <label
                  key={s.value}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-4 border p-4 sm:p-5 transition-colors duration-500 ease-cinema has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                    checked ? "border-ink bg-bone-soft" : "border-ink/20 hover:border-ink/50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-style`}
                    value={s.value}
                    checked={checked}
                    onChange={() => setStyle(s.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500 ease-cinema ${
                      checked ? "border-ink" : "border-ink/40"
                    }`}
                  >
                    <span
                      className={`size-2.5 rounded-full bg-ember transition-transform duration-300 ease-cinema ${
                        checked ? "scale-100" : "scale-0"
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-[17px] leading-[1.35] text-ink">{s.label}</span>
                    <span className="mt-1 block text-[14px] leading-[1.45] text-ink/70">{s.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Suggestion */}
      <div className="lg:col-span-6 bg-bone-soft p-6 sm:p-8 md:p-10 flex flex-col">
        <p role="status" className="sr-only">
          {announced}
        </p>
        <div className="flex flex-col">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">Our suggestion</p>
          {suggestion ? (
            <>
              {/* No entrance on first paint (it's in the server HTML); a fade when it changes. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.p
                  key={packsLabel(suggestion.packs)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_CINEMA }}
                  className="mt-4 font-display text-ink leading-[1] tracking-[-0.035em]"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  {packsLabel(suggestion.packs)}
                </motion.p>
              </AnimatePresence>
              <p className="mt-4 text-[19px] leading-[1.4] text-ink">
                {suggestion.totalCups} {cupSizeLabel(suggestion.size)}
              </p>
              <p className="mt-1 text-[15px] leading-[1.55] text-ink/70">
                You need about {suggestion.cupsNeeded} for {suggestion.guests}{" "}
                {suggestion.guests === 1 ? "guest" : "guests"}
                {suggestion.totalCups > suggestion.cupsNeeded
                  ? `; this leaves ${suggestion.totalCups - suggestion.cupsNeeded} spare.`
                  : "."}
              </p>
              <p className="mt-6 pt-5 hairline-top text-[15px] leading-[1.55] text-ink/70">
                Estimated {formatPrice(suggestion.estimate.classic)} (all Classic) to{" "}
                {formatPrice(suggestion.estimate.premium)} (all Premium), before delivery. A mix of the two lands in
                between.
              </p>
              {suggestion.rest.length ? (
                <p className="mt-3 text-[15px] leading-[1.55] text-ink/70">
                  The order form takes one pack per request, so this starts it with {packName(suggestion.lead)}.
                  Mention the rest in your notes: {packsLabel(suggestion.rest)}.
                </p>
              ) : null}
              {suggestion.packs.some((p) => p.pack === 96) ? (
                <p className="mt-3 text-[15px] leading-[1.55] text-ink/70">A 96 needs at least 7 days&apos; notice.</p>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-[17px] leading-[1.55] text-ink/70">
              Enter how many guests you&apos;re expecting to see a suggestion.
            </p>
          )}
        </div>

        {suggestion ? (
          <OrderLink
            prefill={{ pack: suggestion.lead, size: suggestion.size }}
            onOrder={onOrder}
            className={`group mt-8 inline-flex min-h-[56px] w-full sm:w-auto sm:self-start items-center justify-between gap-6 rounded-full bg-ink px-7 py-4 text-[15px] tracking-[-0.01em] text-bone-soft ${focusRing}`}
          >
            <span>Order this</span>
            <span className="sr-only">: </span>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-bone-soft/80">
              {packName(suggestion.lead)} · {suggestion.size.replace("oz", " oz")}
              <ArrowRight
                aria-hidden="true"
                size={14}
                className="transition-transform duration-500 ease-cinema group-hover:translate-x-1"
              />
            </span>
          </OrderLink>
        ) : null}

        <p className="mt-auto pt-8 text-[13px] leading-[1.55] text-ink/70">
          A suggestion, not a rule: appetites, the rest of the menu and how long the event runs all move the number.
        </p>
      </div>
    </section>
  );
}
