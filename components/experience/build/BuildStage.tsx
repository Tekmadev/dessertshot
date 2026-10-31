"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import LoopVideo from "@/components/media/LoopVideo";
import { copy } from "@/lib/copy";
import { HERO_FLAVOR } from "@/lib/flavors";
import { productPhoto } from "@/lib/media";
import { PIN_QUERY } from "@/lib/pin";
import {
  LABEL_METRICS,
  PHASE_CLIPS,
  buildPlan,
  kickerParts,
  labelHeight,
  lineAt,
  photoBuildFor,
  spreadLabels,
  type LabelMetrics,
} from "./plan";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FLAVOR = HERO_FLAVOR;
const PHOTO = productPhoto(FLAVOR);
const BUILD = photoBuildFor(FLAVOR);
const PLAN = BUILD ? buildPlan(BUILD) : null;
const CALLOUTS = BUILD?.callouts ?? [];
const PHASES = copy.builder.phases;

function labelPositions(m: LabelMetrics): number[] {
  const items = CALLOUTS.map((c) => ({ anchor: c.y, size: labelHeight(FLAVOR.layers[c.layer], m) }));
  return spreadLabels(items, { min: 2, max: 98, gap: (m.gap / m.frame) * 100 });
}
const LABEL_Y_PHONE = labelPositions(LABEL_METRICS.phone);
const LABEL_Y_DESKTOP = labelPositions(LABEL_METRICS.desktop);

/** Share of the scroll a phase's text takes to fade in or out. */
const FADE = 0.035;
const PHOTO_SIZES = "(min-width: 1024px) min(35rem, calc(58vw - 243px)), min(28.8rem, calc(100vw - 136px))";

function cssVars(vars: Record<`--${string}`, string>): CSSProperties {
  return vars as CSSProperties;
}

/**
 * The pinned part of "How a cup is built": the hero cup's still is uncovered
 * from the bottom up as you scroll, with a callout landing on each layer as it
 * appears and the four phases of copy.builder in step beside it.
 *
 * Layout is CSS-first: unpinned (reduced motion, a short window, or no
 * script; see lib/pin.ts) there's no pin and no mask, just the whole photo,
 * every callout and the four phases as a list. GSAP only adds the scrubbed
 * timeline, under the same query. The mask is two counter-moving transforms, so the reveal stays on
 * the compositor.
 */
export default function BuildStage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const plan = PLAN;
      if (!root || !plan) return;
      const all = (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-build="${name}"]`));
      const [mask] = all("mask");
      const [photo] = all("photo");
      const [edge] = all("edge");
      const [bar] = all("bar");
      const phases = all("phase");
      const steps = all("step");
      const callouts = all("callout");
      if (!mask || !photo) return;

      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        const setLine = (line: number) => {
          mask.style.transform = `translate3d(0, ${line}%, 0)`;
          photo.style.transform = `translate3d(0, ${-line}%, 0)`;
        };
        setLine(plan.start);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.4 },
        });

        // The wipe follows the tested plan exactly (lineAt), driven by one clock.
        const clock = { t: 0 };
        tl.to(clock, { t: 1, duration: 1, onUpdate: () => setLine(lineAt(plan, clock.t)) }, 0);

        if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        if (edge) {
          gsap.set(edge, { opacity: 1 });
          const last = plan.segments[plan.segments.length - 1];
          tl.to(edge, { opacity: 0, duration: FADE }, last.t1 - FADE);
        }

        callouts.forEach((el, i) => {
          const at = plan.calloutTimes[i] ?? 0;
          const run = el.querySelector<HTMLElement>('[data-build="run"]');
          const label = el.querySelector<HTMLElement>('[data-build="label"]');
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.02 }, at);
          if (run) tl.fromTo(run, { scaleX: 0 }, { scaleX: 1, duration: 0.03, ease: "power2.out" }, at);
          if (label) tl.fromTo(label, { x: -10 }, { x: 0, duration: 0.03, ease: "power2.out" }, at + 0.01);
        });

        phases.forEach((el, i) => {
          const w = plan.phases[i];
          if (!w) return;
          if (i > 0) tl.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: FADE, ease: "power2.out" }, w.start);
          if (i < phases.length - 1) tl.to(el, { opacity: 0, y: -20, duration: FADE, ease: "power2.in" }, w.end - FADE);
        });

        gsap.set(steps.slice(1), { opacity: 0.7 });
        steps.forEach((el, i) => {
          const w = plan.phases[i];
          if (!w) return;
          if (i > 0) tl.to(el, { opacity: 1, duration: FADE }, w.start);
          if (i < steps.length - 1) tl.to(el, { opacity: 0.7, duration: FADE }, w.end - FADE);
        });

        return () => {
          mask.style.transform = "";
          photo.style.transform = "";
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative pin:h-[300svh] pin:lg:h-[400svh]">
      <div className="pin:sticky pin:top-0 pin:h-[100svh] pin:overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center gap-5 px-6 pb-4 pt-[4.5rem] md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-0 unpinned:gap-12 unpinned:pb-24 unpinned:pt-8 unpinned:lg:pb-36 unpinned:lg:pt-12">
          {/* The photo, its mask and the callouts */}
          <div className="@container lg:order-2 lg:col-span-7">
            <div className="flex justify-center lg:justify-start">
              <div className="relative aspect-[4/5] h-[min(48svh,calc(100svh_-_21rem),calc((100cqw_-_5.5rem)_*_1.25))] shrink-0 unpinned:h-[min(calc((100cqw_-_5.5rem)_*_1.25),36rem)] lg:h-[min(76svh,44rem,calc((100cqw_-_11rem)_*_1.25))] unpinned:lg:h-[min(76svh,44rem,calc((100cqw_-_11rem)_*_1.25))]">
                <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-cream shadow-[0_40px_80px_-48px_rgba(58,29,40,0.45)]">
                  {/* A faint ghost of the finished cup, so the frame is never empty. */}
                  <Image
                    src={PHOTO.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes={PHOTO_SIZES}
                    className="object-cover opacity-[0.12] grayscale"
                  />
                  <div data-build="mask" className="absolute inset-0 overflow-hidden pin:will-change-transform">
                    <span
                      data-build="edge"
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-10 h-[1.5px] bg-ember opacity-0 shadow-[0_0_14px_rgba(208,72,100,0.55)]"
                    />
                    <div data-build="photo" className="absolute inset-0 pin:will-change-transform">
                      <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes={PHOTO_SIZES} className="object-cover" />
                    </div>
                  </div>
                </div>

                <ul
                  aria-label={`The layers of a ${FLAVOR.name} cup, bottom to top`}
                  className="absolute inset-0 [--ex:76.5%] [--lx:79%] lg:[--ex:calc(100%_+_0.75rem)] lg:[--lx:calc(100%_+_1.5rem)]"
                >
                  {CALLOUTS.map((c, i) => (
                    <li
                      key={c.layer}
                      data-build="callout"
                      className="absolute inset-0 [--y:var(--ys)] lg:[--y:var(--yl)]"
                      style={cssVars({
                        "--ax": `${c.x}%`,
                        "--ay": `${c.y}%`,
                        "--ys": `${LABEL_Y_PHONE[i]}%`,
                        "--yl": `${LABEL_Y_DESKTOP[i]}%`,
                      })}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-[var(--ax)] top-[var(--ay)] z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember ring-2 ring-bone-soft"
                      />
                      <span
                        data-build="run"
                        aria-hidden="true"
                        className="absolute left-[var(--ax)] top-[var(--ay)] h-px w-[calc(var(--ex)_-_var(--ax))] origin-left bg-ink/60"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-[var(--ex)] w-px bg-ink/60"
                        style={{
                          top: "min(var(--ay), var(--y))",
                          height: "calc(max(var(--ay), var(--y)) - min(var(--ay), var(--y)))",
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-[var(--ex)] top-[var(--y)] h-px w-[calc(var(--lx)_-_var(--ex))] bg-ink/60"
                      />
                      <span className="absolute left-[var(--lx)] top-[var(--y)] w-[calc(21%_+_4.75rem)] -translate-y-1/2 lg:w-[9.5rem]">
                        <span
                          data-build="label"
                          className="block rounded-md bg-bone-soft/90 px-2 py-1 ring-1 ring-ink/10 lg:rounded-none lg:bg-transparent lg:p-0 lg:ring-0"
                        >
                          {/* The tag is read out everywhere but only shown beside the larger photo. */}
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70 max-lg:absolute max-lg:size-px max-lg:overflow-hidden max-lg:whitespace-nowrap max-lg:[clip:rect(0,0,0,0)] lg:mb-1 lg:block">
                            {c.tag}
                            <span className="sr-only">: </span>
                          </span>
                          <span className="block text-[12px] leading-[1.25] text-ink lg:font-display lg:text-[17px] lg:leading-[1.15] lg:tracking-[-0.01em]">
                            {FLAVOR.layers[c.layer]}
                          </span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Room for the labels beside the photo. */}
              <div aria-hidden="true" className="w-[5.5rem] shrink-0 lg:w-[11rem]" />
            </div>
          </div>

          {/* The four phases */}
          <div className="lg:order-1 lg:col-span-5">
            <div aria-hidden="true" className="mb-4 unpinned:hidden lg:mb-10">
              <div className="hidden justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink lg:flex">
                {PHASES.map((p) => {
                  const k = kickerParts(p.kicker);
                  return (
                    <span key={p.kicker} data-build="step">
                      {k.number} {k.name}
                    </span>
                  );
                })}
              </div>
              <div className="h-px bg-ink/15 lg:mt-3">
                <div data-build="bar" className="h-px origin-left bg-ember" />
              </div>
            </div>

            <ol className="grid gap-10 pin:gap-0 lg:gap-14">
              {PHASES.map((p, i) => {
                const clip = PHASE_CLIPS[i];
                return (
                  <li
                    key={p.kicker}
                    data-build="phase"
                    className={`pin:[grid-area:1/1] ${i > 0 ? "pin:opacity-0" : ""}`}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-berry">{p.kicker}</p>
                    <h3 className="mt-2 font-display text-[length:clamp(24px,6.6vw,30px)] leading-[1.04] tracking-[-0.03em] text-ink lg:mt-5 lg:text-[length:clamp(34px,3.4vw,52px)]">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-[46ch] text-[14px] leading-[1.45] text-ink/70 sm:text-[15px] lg:mt-6 lg:text-[18px] lg:leading-[1.55]">
                      {p.body}
                    </p>
                    {clip ? (
                      <LoopVideo
                        video={clip}
                        lazy
                        sizes="(min-width: 1024px) 12rem, 8rem"
                        className="mt-5 aspect-[4/5] w-32 rounded-xl lg:mt-8 lg:w-48"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
