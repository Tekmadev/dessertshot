"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import LoopVideo from "@/components/media/LoopVideo";
import Reveal from "@/components/experience/story/Reveal";
import StepClip from "@/components/experience/story/StepClip";
import { TRAY_VIDEO } from "@/lib/media";
import { PROCESS_STEPS, clipFor } from "@/lib/process-clips";
import { PIN_QUERY } from "@/lib/pin";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * S5 · The morning of. A scroll-driven timeline through the six steps
 * (lib/process-clips.ts), over the tray video or, once generated, each step's
 * own clip.
 *
 * Motion: the stage sticks (CSS sticky, no GSAP pin-spacer) through a tall
 * track, shorter on phones, and one scrubbed GSAP timeline crossfades the
 * steps and fills the progress bars. Unpinned (reduced motion, a short window
 * or no script; lib/pin.ts): CSS alone turns the track into a plain list under
 * the tray poster, and no timeline is built.
 * Every step is in the DOM in both modes, so screen readers get all six.
 */
const LABELS = {
  kicker: "The morning of",
  headingPre: "Made the morning",
  headingItalic: "of your date.",
  body: "Every cup is made fresh the morning of your pickup or delivery, by hand, from the bottom layer up.",
  railLabel: "Steps",
} as const;

const N = PROCESS_STEPS.length;
const pad = (n: number) => String(n).padStart(2, "0");
const MEDIA_SIZES =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (min-height: 35rem) min(743px, calc(58.33vw - 73px)), (min-width: 1400px) 1320px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)";
// Progress bars start empty as an inline transform, not Tailwind's scale-*
// (the CSS `scale` property), which would multiply with GSAP's transform.
const EMPTY_X = { transform: "scaleX(0)" } as const;
const EMPTY_Y = { transform: "scaleY(0)" } as const;

export default function MorningOf() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        const scope = root.current;
        if (!scope || !track.current) return;
        const all = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, scope);
        const steps = all("[data-step]");
        const segments = all("[data-progress-seg]");

        // One unit of timeline per step; scroll progress p shows step floor(p * N).
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              const i = Math.min(N - 1, Math.floor(self.progress * N));
              setActive((prev) => (prev === i ? prev : i));
            },
          },
        });

        steps.forEach((el, i) => {
          if (i > 0) tl.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.3 }, i - 0.1);
          if (i < N - 1) tl.to(el, { opacity: 0, y: -36, duration: 0.25 }, i + 0.7);
        });
        segments.forEach((el, i) => {
          tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1 }, i);
        });
        tl.fromTo(all("[data-progress-rail]"), { scaleY: 0 }, { scaleY: 1, duration: N }, 0);
        // A slow push-in across the whole run (also sets the timeline's length to N).
        tl.fromTo(all("[data-media-zoom]"), { scale: 1.08 }, { scale: 1, duration: N }, 0);

        // ScrollTrigger only re-measures on window resize, so a height change
        // above the track (the lineup filter, a late image) would leave the
        // timeline at stale positions. Watch the page height instead.
        let frame = 0;
        let lastHeight = document.body.scrollHeight;
        const ro = new ResizeObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const h = document.body.scrollHeight;
            if (h !== lastHeight) {
              lastHeight = h;
              ScrollTrigger.refresh();
            }
          });
        });
        ro.observe(document.body);
        return () => {
          ro.disconnect();
          cancelAnimationFrame(frame);
        };
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="morning-of"
      aria-labelledby="morning-of-heading"
      className="relative bg-bone-soft hairline-top hairline-bottom"
    >
      <header className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 sm:pt-28 md:pt-36 pb-10 md:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-end">
          <div className="md:col-span-7">
            <Reveal y={16} className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">
              {LABELS.kicker}
            </Reveal>
            <Reveal>
              <h2
                id="morning-of-heading"
                className="font-display text-ink leading-[0.96] tracking-[-0.035em]"
                style={{ fontSize: "clamp(40px, 6.4vw, 104px)" }}
              >
                {LABELS.headingPre}{" "}
                <em
                  className="italic"
                  style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
                >
                  {LABELS.headingItalic}
                </em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="md:col-span-5">
            <p className="max-w-[44ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/75">{LABELS.body}</p>
          </Reveal>
        </div>
      </header>

      {/* The track is tall only when pinned; the stage sticks inside it. */}
      <div ref={track} className="relative pin:h-[300svh] pin:md:h-[420svh]">
        <div className="pin:sticky pin:top-0 pin:h-[100svh] pin:overflow-hidden">
          <div className="mx-auto h-full max-w-[1400px] px-6 md:px-10 flex flex-col gap-8 unpinned:pb-20 unpinned:md:pb-28 pin:gap-6 pin:pt-[76px] pin:pb-8 pin:md:pt-24 pin:lg:grid pin:lg:grid-cols-12 pin:lg:items-center pin:lg:gap-16 pin:lg:py-0">
            {/* Media: tray video for every step, a step's own clip over it when there is one. */}
            <div className="relative w-full shrink-0 overflow-hidden rounded-card bg-shell aspect-video pin:aspect-auto pin:h-[32svh] pin:md:h-[42svh] pin:lg:col-span-7 pin:lg:h-auto pin:lg:aspect-[16/11] pin:lg:max-h-[72svh]">
              <div data-media-zoom className="absolute inset-0 pin:will-change-transform">
                <div className="absolute inset-0">
                  <LoopVideo video={TRAY_VIDEO} sizes={MEDIA_SIZES} lazy className="h-full w-full" />
                </div>
                {PROCESS_STEPS.map((s, i) => {
                  const clip = clipFor(s.id);
                  return clip ? (
                    <StepClip
                      key={s.id}
                      clip={clip}
                      active={i === active}
                      sizes={MEDIA_SIZES}
                      className="absolute inset-0 motion-reduce:hidden"
                    />
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-6 pin:lg:col-span-5 pin:lg:gap-12">
              {/* Phones and tablets: one segment per step. */}
              <div aria-hidden="true" className="flex gap-1.5 unpinned:hidden lg:hidden">
                {PROCESS_STEPS.map((s) => (
                  <span key={s.id} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/15">
                    <span data-progress-seg className="absolute inset-0 origin-left bg-ember" style={EMPTY_X} />
                  </span>
                ))}
              </div>

              {/* Desktop: the whole run as a rail. Decorative: the steps below carry the same words. */}
              <div aria-hidden="true" className="relative hidden pl-6 pin:lg:block">
                <span className="absolute left-0 top-0 bottom-0 w-px bg-ink/15" />
                <span data-progress-rail className="absolute left-0 top-0 bottom-0 w-px origin-top bg-ember" style={EMPTY_Y} />
                <ol className="flex flex-col gap-3">
                  {PROCESS_STEPS.map((s, i) => (
                    <li
                      key={s.id}
                      className={`flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ease-cinema ${
                        i === active ? "text-ink" : "text-ink/70"
                      }`}
                    >
                      <span
                        className={`block h-1.5 w-1.5 rounded-full transition-transform duration-500 ease-cinema ${
                          i === active ? "scale-100 bg-ember" : "scale-0 bg-ember"
                        }`}
                      />
                      {pad(i + 1)} · {s.label}
                    </li>
                  ))}
                </ol>
              </div>

              {/* The steps: stacked in one grid cell and crossfaded while scrolling; a list otherwise. */}
              <ol aria-label={LABELS.railLabel} className="grid grid-cols-1 unpinned:md:grid-cols-2 unpinned:lg:grid-cols-3 unpinned:gap-x-10">
                {PROCESS_STEPS.map((s, i) => (
                  <li
                    key={s.id}
                    data-step
                    className={`pin:[grid-area:1/1] unpinned:border-t unpinned:border-ink/15 unpinned:py-7 ${
                      i > 0 ? "pin:opacity-0" : ""
                    }`}
                  >
                    <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
                      {pad(i + 1)} / {pad(N)}
                    </div>
                    <h3
                      className="mt-3 font-display text-ink leading-[1] tracking-[-0.035em]"
                      style={{ fontSize: "clamp(36px, 4.6vw, 72px)" }}
                    >
                      {s.label}
                      <span className="text-ember">.</span>
                    </h3>
                    <p className="mt-4 max-w-[40ch] text-[16px] md:text-[18px] leading-[1.55] text-ink/75">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
