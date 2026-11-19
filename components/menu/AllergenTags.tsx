import { ALLERGENS } from "@/lib/claims";
import type { Flavor } from "@/lib/flavors";

/** "Contains: Dairy · Tree nuts", from the flavour registry and lib/claims.ts. */
export default function AllergenTags({
  flavor,
  className = "",
}: {
  flavor: Pick<Flavor, "allergens">;
  className?: string;
}) {
  if (flavor.allergens.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">Contains</span>
      <ul className="flex flex-wrap gap-1.5" aria-label="Allergens">
        {flavor.allergens.map((id) => (
          <li
            key={id}
            className="rounded-full border border-ink/25 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase text-ink"
          >
            {ALLERGENS[id].short}
          </li>
        ))}
      </ul>
    </div>
  );
}
