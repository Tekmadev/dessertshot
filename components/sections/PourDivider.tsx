import type { CSSProperties } from "react";

/**
 * S4 · A pour of ganache, caramel or pistachio across a section edge, its
 * drips lengthening as the divider scrolls into view. Pure SVG and CSS: a
 * scroll-driven animation (animation-timeline: view()) where the browser has
 * one and motion is welcome; everywhere else, and with reduced motion, the
 * drips simply hang at full length. No JavaScript, no images, decorative.
 *
 * Place it at the top of a section (drips hang down) or, with `flip`, at the
 * bottom (drips rise). The band starts flush with the edge it sits on.
 */
export type PourVariant = "ganache" | "caramel" | "pistachio";

const FILL: Record<PourVariant, string> = {
  ganache: "var(--color-cacao)",
  caramel: "var(--color-caramel)",
  pistachio: "var(--color-pistachio)",
};

// Gloss strength per variant: lighter fills need less.
const GLOSS: Record<PourVariant, number> = { ganache: 0.22, caramel: 0.3, pistachio: 0.35 };

const W = 1440;
const H = 140;
/** Depth of the solid band along the edge. */
const B = 30;
/** Radius of the curve where the band turns down into a drip. */
const F = 9;

/** Drips left to right: centre x, width, length below the band. Spaced so phones (the middle ~650 units) still get a mix. */
const DRIPS = [
  { x: 52, w: 16, len: 34 },
  { x: 150, w: 26, len: 86 },
  { x: 262, w: 14, len: 28 },
  { x: 356, w: 22, len: 64 },
  { x: 470, w: 30, len: 100 },
  { x: 588, w: 16, len: 40 },
  { x: 690, w: 24, len: 74 },
  { x: 800, w: 14, len: 30 },
  { x: 902, w: 28, len: 94 },
  { x: 1018, w: 18, len: 46 },
  { x: 1122, w: 24, len: 70 },
  { x: 1236, w: 14, len: 32 },
  { x: 1338, w: 26, len: 84 },
] as const;

/** The band: straight along the edge, a soft wave below, and a curved neck into each drip. */
function bandPath(): string {
  let d = `M0 0H${W}V${B}`;
  let x = W;
  [...DRIPS].reverse().forEach((dr, i) => {
    const r = dr.x + dr.w / 2;
    const l = dr.x - dr.w / 2;
    const sag = i % 2 ? 6 : -3;
    d += `Q${(x + r + F) / 2} ${B + sag} ${r + F} ${B}`;
    d += `Q${r} ${B} ${r} ${B + F}H${l}Q${l} ${B} ${l - F} ${B}`;
    x = l - F;
  });
  d += `Q${x / 2} ${B + 5} 0 ${B}Z`;
  return d;
}

const BAND = bandPath();

const CSS = `
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .ds-pour { view-timeline: --ds-pour block; }
    .ds-pour-drip {
      animation-name: ds-pour-drip;
      animation-duration: auto;
      animation-timing-function: cubic-bezier(0.33, 0, 0.2, 1);
      animation-fill-mode: both;
      animation-timeline: --ds-pour;
      animation-range: entry 0% cover var(--ds-end, 60%);
    }
  }
}
@keyframes ds-pour-drip {
  from { transform: translateY(calc(var(--ds-len) * -1)); }
  to { transform: translateY(0); }
}
`;

export default function PourDivider({
  variant = "ganache",
  flip = false,
  className = "",
}: {
  variant?: PourVariant;
  /** Drips rise from the bottom edge instead of hanging from the top. */
  flip?: boolean;
  className?: string;
}) {
  const fill = FILL[variant];
  const gloss = GLOSS[variant];

  return (
    <div aria-hidden="true" className={`ds-pour pointer-events-none relative w-full select-none ${className}`}>
      <style href="ds-pour-divider" precedence="default">
        {CSS}
      </style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
        className="block w-full"
        // Below ~864px wide the height holds at 84px and the sides crop, so drips keep their shape.
        // No upper cap: past the viewBox's 1440:140 ratio, `slice` would crop the longest drip flat.
        style={{ height: "max(84px, 9.72vw)", transform: flip ? "scaleY(-1)" : undefined }}
      >
        {/* Drips first: the band covers their tops, so each one slides out from under it. */}
        {DRIPS.map((d, i) => {
          const bulb = d.w * 0.6;
          const style = {
            "--ds-len": `${d.len}px`,
            "--ds-end": `${48 + ((i * 17) % 36)}%`,
          } as CSSProperties;
          return (
            <g key={d.x} className="ds-pour-drip" style={style}>
              <rect x={d.x - d.w / 2} y={0} width={d.w} height={B + d.len - bulb} fill={fill} />
              <circle cx={d.x} cy={B + d.len - bulb} r={bulb} fill={fill} />
              {d.len > 40 ? (
                <rect
                  x={d.x - d.w * 0.3}
                  y={B + F}
                  width={Math.max(2, d.w * 0.14)}
                  height={d.len - bulb * 2 - F}
                  rx={Math.max(1, d.w * 0.07)}
                  fill="var(--color-cream)"
                  opacity={gloss}
                />
              ) : null}
              <circle cx={d.x - bulb * 0.35} cy={B + d.len - bulb * 1.15} r={bulb * 0.22} fill="var(--color-cream)" opacity={gloss} />
            </g>
          );
        })}
        <path d={BAND} fill={fill} />
        {/* A thin gloss line along the band. */}
        <path d={`M0 ${B * 0.42}Q${W * 0.25} ${B * 0.3} ${W * 0.5} ${B * 0.44}T${W} ${B * 0.38}`} fill="none" stroke="var(--color-cream)" strokeOpacity={gloss * 0.8} strokeWidth={2} />
      </svg>
    </div>
  );
}
