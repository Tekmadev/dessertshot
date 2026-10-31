import type { Flavor } from "@/lib/flavors";
import { sizeNote } from "@/lib/flavors";
import { PACK_SIZES } from "@/lib/packs";
import { flavorPrices, formatDollars, tierLabel } from "./menu-data";

/**
 * Per-cup prices for one flavour at each pack size, for every cup size it
 * comes in (Tiramisu: Dessert Cups only). All numbers come from lib/pricing
 * through flavorPrices().
 */
export default function PriceTable({
  flavor,
  className = "",
}: {
  flavor: Pick<Flavor, "name" | "tier" | "sizes">;
  className?: string;
}) {
  const sizes = flavorPrices(flavor);
  const note = sizeNote(flavor);

  return (
    <div className={className}>
      <table className="w-full border-collapse text-left">
        <caption className="mb-3 text-left font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">
          {tierLabel(flavor)} prices, per cup
        </caption>
        <thead>
          <tr className="border-b border-ink/15">
            <th scope="col" className="py-2 pr-3 font-mono text-[10px] tracking-[0.16em] uppercase font-normal text-ink/70">
              Pack
            </th>
            {sizes.map((s) => (
              <th
                key={s.size}
                scope="col"
                className="py-2 px-2 text-right font-mono text-[10px] tracking-[0.16em] uppercase font-normal text-ink/70"
              >
                {s.label}
                <span className="block normal-case tracking-[0.04em] text-ink/70">{s.size.replace("oz", " oz")}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PACK_SIZES.map((pack) => (
            <tr key={pack} className="border-b border-ink/10 last:border-b-0">
              <th scope="row" className="py-3 pr-3 font-mono text-[11px] tracking-[0.14em] uppercase font-normal text-ink/80 whitespace-nowrap">
                {pack} cups
              </th>
              {sizes.map((s) => {
                const cell = s.cells.find((c) => c.pack === pack)!;
                return (
                  <td key={s.size} className="py-3 px-2 text-right align-top">
                    <span className="block font-display text-[20px] md:text-[22px] leading-none tracking-[-0.02em] text-ink tabular-nums">
                      {formatDollars(cell.perCup)}
                    </span>
                    <span className="mt-1 block text-[12px] text-ink/70 tabular-nums">
                      {formatDollars(cell.packPrice)} for {pack}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {note ? (
        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70">{note}</p>
      ) : null}
    </div>
  );
}
