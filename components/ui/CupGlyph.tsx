"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

type Layer = {
  label: string;
  color: string;
  height: number;
};

type Props = {
  layers?: Layer[];
  progress?: MotionValue<number>;
  size?: number;
  showLabels?: boolean;
};

const DEFAULT_LAYERS: Layer[] = [
  { label: "Biscuit", color: "var(--color-biscoff)", height: 18 },
  { label: "Cream", color: "#f3e0c0", height: 32 },
  { label: "Concentrate", color: "var(--color-mango)", height: 18 },
  { label: "Topping", color: "var(--color-ember)", height: 22 },
];

/**
 * Stylized dessert cup in pure SVG. With a `progress` motion value (0..1),
 * each layer fills upward in sequence as you scroll. Without it, the cup
 * renders fully filled.
 */
export function CupGlyph({
  layers = DEFAULT_LAYERS,
  progress,
  size = 320,
  showLabels = false,
}: Props) {
  // Always have a real MotionValue, falling back to 1 (fully filled).
  const fallback = useMotionValue(1);
  const p = progress ?? fallback;
  const heightTotal = layers.reduce((sum, l) => sum + l.height, 0);
  const cupHeight = 190;
  const startY = 30;

  const layerBands = layers.reduce<
    Array<Layer & { bandTop: number; bandHeight: number; index: number }>
  >((acc, layer, i) => {
    const ratio = layer.height / heightTotal;
    const bandHeight = ratio * cupHeight;
    const used = acc.reduce((s, b) => s + b.bandHeight, 0);
    const bandTop = startY + cupHeight - used - bandHeight;
    acc.push({ ...layer, bandTop, bandHeight, index: i });
    return acc;
  }, []);

  return (
    <div
      className="relative"
      style={{ width: size, height: size * 1.25 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 w-full h-full overflow-visible"
      >
        <defs>
          <clipPath id="cupClip">
            <path d="M 30 30 L 170 30 L 152 220 L 48 220 Z" />
          </clipPath>
          <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
            <stop offset="0.4" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="0.6" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <g clipPath="url(#cupClip)">
          {layerBands.map((band) => (
            <LayerRect
              key={band.index}
              total={layers.length}
              progress={p}
              bandTop={band.bandTop}
              bandHeight={band.bandHeight}
              color={band.color}
              index={band.index}
            />
          ))}

          <rect x="0" y="0" width="200" height="250" fill="url(#shine)" />
          <rect x="0" y="28" width="200" height="6" fill="url(#rim)" />
        </g>

        <path
          d="M 30 30 L 170 30 L 152 220 L 48 220 Z"
          fill="none"
          stroke="rgba(58,29,40,0.22)"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <ellipse
          cx="100"
          cy="30"
          rx="70"
          ry="6"
          fill="none"
          stroke="rgba(58,29,40,0.32)"
          strokeWidth="1.3"
        />
        <ellipse cx="100" cy="30" rx="70" ry="6" fill="rgba(58,29,40,0.04)" />
      </svg>

      {showLabels ? (
        <ul className="absolute -right-1 top-[10%] bottom-[12%] flex flex-col justify-around text-right pr-2">
          {layers
            .slice()
            .reverse()
            .map((l, i) => (
              <li
                key={i}
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50"
              >
                {l.label}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

function LayerRect({
  index,
  total,
  bandTop,
  bandHeight,
  color,
  progress,
}: {
  index: number;
  total: number;
  bandTop: number;
  bandHeight: number;
  color: string;
  progress: MotionValue<number>;
}) {
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;

  const height = useTransform(progress, (v) => {
    if (v <= start) return 0;
    if (v >= end) return bandHeight;
    const t = (v - start) / (end - start);
    return bandHeight * t;
  });

  const y = useTransform(progress, (v) => {
    if (v <= start) return bandTop + bandHeight;
    if (v >= end) return bandTop;
    const t = (v - start) / (end - start);
    return bandTop + bandHeight * (1 - t);
  });

  return (
    <motion.rect x="20" width="160" y={y} height={height} fill={color} />
  );
}
