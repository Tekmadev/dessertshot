"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "motion/react";
import { copy, PACK_RULES_LINE } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { orderHref, requestOrderPrefill, type OrderPrefill } from "@/lib/order-prefill";
import { CUP_SIZES } from "@/lib/packs";
import type { CupSize } from "@/lib/pricing";
import CupsHelper from "@/components/packages/CupsHelper";
import SizePanel from "@/components/packages/SizePanel";
import SizeTabs from "@/components/packages/SizeTabs";

const PRICE_NOTE =
  "Prices are per pack, in Canadian dollars, before delivery. Mix Classic and Premium in one pack and the total lands in between.";

export default function Packages() {
  const router = useRouter();
  const idBase = useId();
  const [size, setSize] = useState<CupSize>(CUP_SIZES[0].value);

  // Preselect what was clicked in the order form: below on the same page
  // (home, /order), where the form scrolls itself into view and takes focus,
  // otherwise on /order (e.g. from /menu).
  const orderWith = (prefill: OrderPrefill) => {
    if (!document.getElementById("order-form")) return router.push(orderHref(prefill));
    requestOrderPrefill(prefill);
  };

  return (
    // Reduced motion: reveals fade without moving, the tab fill doesn't slide.
    <MotionConfig reducedMotion="user">
      <section id="packages" aria-label="Packages" className="relative py-24 md:py-40 bg-bone hairline-bottom">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-14 md:mb-20">
            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.9, ease: EASE_CINEMA }}
                className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6"
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

          <div className="mb-10 md:mb-14">
            <SizeTabs idBase={idBase} value={size} onChange={setSize} />
          </div>

          {CUP_SIZES.map((s) => (
            <SizePanel key={s.value} idBase={idBase} size={s.value} hidden={s.value !== size} onOrder={orderWith} />
          ))}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
            <p className="md:col-span-7 font-mono text-[11px] tracking-[0.16em] uppercase leading-[1.8] text-ink/70">
              {PACK_RULES_LINE}
            </p>
            <p className="md:col-span-5 text-[14px] leading-[1.55] text-ink/70">
              {PRICE_NOTE} {copy.order.noticeDefault}
            </p>
          </div>

          <CupsHelper onOrder={orderWith} />
        </div>
      </section>
    </MotionConfig>
  );
}
