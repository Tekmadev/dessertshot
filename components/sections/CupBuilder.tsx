"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { copy } from "@/lib/copy";
import { CupGlyph } from "@/components/ui/CupGlyph";

const PHASES = copy.builder.phases;

const LAYERS = [
  { label: "Biscuit", color: "#9a5252", height: 22 },
  { label: "Cream", color: "#fde0e6", height: 38 },
  { label: "Concentrate", color: "#d04864", height: 18 },
  { label: "Topping", color: "#a82a48", height: 18 },
];

export default function CupBuilder() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The cup itself fills as you scroll. We trim the start a touch so the
  // first phase has time to read before the biscuit appears.
  const cupProgress = useTransform(scrollYProgress, [0.05, 0.92], [0, 1]);

  return (
    <section
      ref={ref}
      id="builder"
      aria-label={copy.builder.sectionLabel}
      className="relative bg-bone"
      style={{ height: "360svh" }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="relative h-full mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-10">
          {/* Section label rail */}
          <div className="absolute left-6 md:left-10 top-10 flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
              {copy.builder.sectionLabel}
            </span>
            <span className="block w-10 h-px bg-ink/25" />
          </div>

          {/* Side text */}
          <div className="relative col-span-1 lg:col-span-6 z-10 order-2 lg:order-1">
            <div className="relative h-[46svh] lg:h-[60vh] flex items-center">
              <div className="relative w-full">
                {PHASES.map((p, i) => (
                  <PhraseLayer
                    key={i}
                    scrollYProgress={scrollYProgress}
                    index={i}
                    total={PHASES.length}
                    kicker={p.kicker}
                    title={p.title}
                    body={p.body}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cup scene */}
          <div className="relative col-span-1 lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-[min(60vw,300px)] lg:w-[min(78vw,460px)]">
              {/* Soft bed */}
              <div
                aria-hidden="true"
                className="absolute -inset-16 rounded-full opacity-50"
                style={{
                  background:
                    "radial-gradient(circle at 50% 60%, rgba(208,72,100,0.20) 0%, rgba(208,72,100,0) 65%)",
                  filter: "blur(40px)",
                }}
              />

              {/* Floor line */}
              <div
                aria-hidden="true"
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full md:w-[120%] h-px bg-ink/15"
              />

              <CupGlyph
                size={460}
                progress={cupProgress}
                showLabels
                layers={LAYERS}
              />

              {/* Layer ticks on the side */}
              <LayerTicks scrollYProgress={scrollYProgress} total={PHASES.length} />
            </div>
          </div>
        </div>

        <ProgressRail scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}

function PhraseLayer({
  scrollYProgress,
  index,
  total,
  kicker,
  title,
  body,
}: {
  scrollYProgress: MotionValue<number>;
  index: number;
  total: number;
  kicker: string;
  title: string;
  body: string;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const fadeBuffer = 0.04;

  const opacity = useTransform(scrollYProgress, (p) => {
    const sFadeStart = Math.max(0, start - 0.02);
    const sFull = start + fadeBuffer;
    const eFull = end - fadeBuffer;
    const eFadeEnd = Math.min(1, end + 0.02);
    if (p <= sFadeStart) return 0;
    if (p < sFull) {
      return (p - sFadeStart) / Math.max(0.0001, sFull - sFadeStart);
    }
    if (p <= eFull) return 1;
    if (p < eFadeEnd) {
      return 1 - (p - eFull) / Math.max(0.0001, eFadeEnd - eFull);
    }
    return 0;
  });

  const y = useTransform(scrollYProgress, (p) => {
    if (p <= start) return 28;
    if (p >= end) return -28;
    return 28 - ((p - start) / (end - start)) * 56;
  });

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember mb-3 md:mb-5">
        {kicker}
      </div>
      <h3
        className="font-display tracking-[-0.03em] text-ink leading-[1.0]"
        style={{ fontSize: "clamp(28px, 4.6vw, 64px)" }}
      >
        {title}
      </h3>
      <p className="mt-4 md:mt-6 max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] tracking-[-0.005em] text-ink/70">
        {body}
      </p>
    </motion.div>
  );
}

function LayerTicks({
  scrollYProgress,
  total,
}: {
  scrollYProgress: MotionValue<number>;
  total: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-12 top-[12%] bottom-[14%] hidden md:flex flex-col justify-around"
    >
      {Array.from({ length: total }).map((_, i) => (
        <Tick
          key={i}
          index={i}
          total={total}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function Tick({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Ticks render top to bottom; cup builds bottom up. Bottom tick = biscuit
  // (first to fill).
  const layerIndex = total - 1 - index;
  const start = layerIndex / total;

  const width = useTransform(scrollYProgress, (p) => (p >= start ? 28 : 12));
  const opacity = useTransform(scrollYProgress, (p) =>
    p >= start ? 1 : 0.3
  );

  return (
    <div className="flex items-center gap-3">
      <motion.span
        className="block h-px bg-ember"
        style={{ width, opacity }}
      />
      <motion.span
        style={{ opacity }}
        className="font-mono text-[9px] tracking-[0.22em] uppercase text-ember"
      >
        0{layerIndex + 1}
      </motion.span>
    </div>
  );
}

function ProgressRail({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 h-[40vh] w-px bg-ink/15"
    >
      <motion.div style={{ height }} className="block w-px bg-ink" />
    </div>
  );
}
