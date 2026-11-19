"use client";

import { FLAVORS, comesInSize, sizeNote } from "@/lib/flavors";
import type { OrderPrefill } from "@/lib/order-prefill";
import { CUP_SIZES, PACKAGES } from "@/lib/packs";
import type { CupSize } from "@/lib/pricing";
import PackCard from "./PackCard";
import { panelId, tabId } from "./SizeTabs";

const SIZE_INTRO: Record<CupSize, string> = {
  "2oz": "Light, elegant, perfect for events where guests try everything on the table.",
  "5oz": "The full experience. Every layer lands the way it was built.",
};

/**
 * One cup size's tab panel: the three packs side by side. Both panels stay
 * in the HTML (the inactive one `hidden`) so every price is in the page.
 */
export default function SizePanel({
  idBase,
  size,
  hidden,
  onOrder,
}: {
  idBase: string;
  size: CupSize;
  hidden: boolean;
  onOrder: (prefill: OrderPrefill) => void;
}) {
  const info = CUP_SIZES.find((c) => c.value === size)!;
  // Tiramisu is Dessert Cups (5 oz) only.
  const notInSize = FLAVORS.filter((f) => !comesInSize(f, size));

  return (
    <div role="tabpanel" id={panelId(idBase, size)} aria-labelledby={tabId(idBase, size)} hidden={hidden}>
      <div className="mb-8 md:mb-10 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-10 md:items-end">
        <div className="md:col-span-7">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">{info.sub}</p>
          <p className="mt-2 max-w-[48ch] text-[17px] leading-[1.55] text-ink/70">{SIZE_INTRO[size]}</p>
        </div>
        {notInSize.length ? (
          <p className="md:col-span-5 md:text-right text-[14px] leading-[1.55] text-ink/70">
            {notInSize.map((f) => `${f.name} is ${sizeNote(f)}.`).join(" ")}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 hairline-top hairline-bottom">
        {PACKAGES.map((pkg, i) => (
          <PackCard key={pkg.size} pkg={pkg} size={size} index={i} onOrder={onOrder} />
        ))}
      </div>
    </div>
  );
}
