/**
 * The brand in type: "Dessert Shot" with "by Farhana" signed underneath.
 * Always the full name (lib/business.ts); `light` is for dark backgrounds.
 */
export function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-end font-display leading-none ${light ? "text-bone-soft" : "text-ink"} ${className}`}>
      <span className="flex items-baseline gap-[0.2em] text-[1em] tracking-[-0.025em]">
        <span>Dessert</span>{" "}
        <span
          className="italic"
          style={{
            fontVariationSettings: "'SOFT' 50, 'WONK' 1",
            color: light ? "var(--color-ember-soft)" : "var(--color-ember)",
          }}
        >
          Shot
        </span>
      </span>{" "}
      <span
        className={`mt-[0.18em] text-[0.56em] italic tracking-[-0.01em] ${light ? "text-bone-soft/75" : "text-ink/75"}`}
        style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}
      >
        by Farhana
      </span>
    </span>
  );
}
