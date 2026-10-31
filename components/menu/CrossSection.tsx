import type { Flavor } from "@/lib/flavors";
import { accentTint, layerStrengths, pad2 } from "./menu-data";

/**
 * A cup's layers as a cross-section: a column of accent-tinted bands (purely
 * decorative) beside the layer names. The list is in DOM order bottom → top,
 * so screen readers hear it the way the cup is built, and `flex-col-reverse`
 * stacks it visually with the base at the bottom.
 *
 * No hooks: renders on the server for the menu pages and inside the client
 * lineup cards alike.
 */
export default function CrossSection({
  flavor,
  size = "compact",
  className = "",
}: {
  flavor: Pick<Flavor, "name" | "layers" | "accent" | "visualSignature">;
  size?: "compact" | "full";
  className?: string;
}) {
  const strengths = layerStrengths(flavor.layers.length);
  const full = size === "full";

  if (flavor.layers.length === 0) {
    return <p className={`text-[15px] leading-[1.55] text-ink/80 ${className}`}>{flavor.visualSignature}</p>;
  }

  return (
    <div className={className}>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70 mb-3">
        Layers, bottom to top
      </p>
      <ol
        aria-label={`${flavor.name} layers, from the bottom of the cup to the top`}
        className="flex flex-col-reverse overflow-hidden rounded-[14px] border border-ink/15"
      >
        {flavor.layers.map((layer, i) => (
          <li
            key={`${i}-${layer}`}
            className={`grid grid-cols-[minmax(2.5rem,22%)_1fr] items-stretch ${
              i === flavor.layers.length - 1 ? "" : "border-t border-ink/10"
            }`}
          >
            <span
              aria-hidden="true"
              className="block border-r border-ink/10"
              style={{ background: accentTint(flavor.accent, strengths[i]) }}
            />
            <span
              className={`flex items-baseline gap-3 px-3.5 ${full ? "py-4 md:py-5" : "py-2.5"}`}
              style={{ background: "var(--color-cream)" }}
            >
              <span className="font-mono text-[10px] tracking-[0.16em] text-ink/70 tabular-nums">
                {pad2(i + 1)}
              </span>
              <span
                className={
                  full
                    ? "font-display text-[19px] md:text-[22px] leading-[1.2] tracking-[-0.015em] text-ink"
                    : "text-[14px] leading-[1.35] text-ink"
                }
              >
                {layer}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
