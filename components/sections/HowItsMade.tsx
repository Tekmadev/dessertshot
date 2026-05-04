"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    emoji: "🍪",
    title: "The Base",
    description:
      "We hand-press a layer of golden biscuit crumble — buttery, perfectly textured, the foundation of every great cup.",
    color: "#C49050",
    bgColor: "rgba(196, 144, 80, 0.1)",
  },
  {
    number: "02",
    emoji: "🍦",
    title: "The Cream",
    description:
      "Our signature cream cheese blend is mixed fresh with your chosen flavour — fruit, chocolate, pistachio, or spice.",
    color: "#F5A623",
    bgColor: "rgba(245, 166, 35, 0.1)",
  },
  {
    number: "03",
    emoji: "✨",
    title: "The Flavour Layer",
    description:
      "A concentrated layer of the star ingredient — real mango coulis, dark ganache, Nutella, or Biscoff spread — poured right on top.",
    color: "#D4700A",
    bgColor: "rgba(212, 112, 10, 0.1)",
  },
  {
    number: "04",
    emoji: "🎀",
    title: "The Finishing Touch",
    description:
      "Each cup is crowned with its signature topping — fresh fruit, a Ferrero Rocher, gold dust, or a Biscoff cookie.",
    color: "#8B4513",
    bgColor: "rgba(139, 69, 19, 0.1)",
  },
];

export default function HowItsMade() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Heading
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );

      // Progress line draw
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1, duration: 2, ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1,
          },
        }
      );

      // Steps stagger in
      stepsRef.current.forEach((step, i) => {
        if (!step) return;
        gsap.fromTo(
          step,
          {
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
            scale: 0.95,
          },
          {
            opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out",
            scrollTrigger: { trigger: step, start: "top 85%" },
            delay: i * 0.05,
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="how-its-made"
      className="py-24 px-6"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <span
            className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: "var(--color-amber-500)", backgroundColor: "var(--color-amber-100)", fontFamily: "var(--font-body)" }}
          >
            The Craft
          </span>
          <h2 className="font-heading text-5xl md:text-6xl mb-4" style={{ color: "var(--color-choco-600)" }}>
            Built layer by layer
          </h2>
          <p className="text-lg" style={{ color: "var(--color-muted)" }}>
            Every cup follows the same sacred ritual — four layers, assembled
            in order, each one essential.
          </p>
        </div>

        {/* Steps with connector line */}
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-8 top-8 bottom-8 w-px"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <div
              ref={lineRef}
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, var(--color-amber-400), var(--color-choco-400))` }}
            />
          </div>

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => { stepsRef.current[i] = el; }}
                className="relative flex items-start gap-8"
              >
                {/* Step circle */}
                <div
                  className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-warm"
                  style={{ backgroundColor: step.bgColor, border: `2px solid ${step.color}40` }}
                >
                  {step.emoji}
                </div>

                {/* Content card */}
                <div
                  className="flex-1 rounded-2xl p-6"
                  style={{
                    backgroundColor: step.bgColor,
                    border: `1.5px solid ${step.color}22`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: step.color, fontFamily: "var(--font-body)" }}
                    >
                      Step {step.number}
                    </span>
                  </div>
                  <h3
                    className="font-heading text-2xl mb-2"
                    style={{ color: "var(--color-choco-600)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
