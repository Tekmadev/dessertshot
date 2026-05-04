"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Left side slides in from left
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1, x: 0, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
      // Right side slides in from right
      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1, x: 0, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
          delay: 0.15,
        }
      );
      // Stats counter
      const statEls = statsRef.current?.querySelectorAll(".stat-number");
      statEls?.forEach((el) => {
        const target = parseInt(el.getAttribute("data-target") || "0");
        gsap.fromTo(
          el,
          { textContent: "0" },
          {
            textContent: target,
            duration: 2,
            ease: "expo.out",
            snap: { textContent: 1 },
            scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual */}
          <div ref={leftRef} className="relative">
            {/* Main image placeholder */}
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/5]"
              style={{
                background: "linear-gradient(135deg, var(--color-amber-100) 0%, var(--color-ivory-deep) 100%)",
                border: "2px solid var(--color-border)",
                boxShadow: "var(--shadow-warm-lg)",
              }}
            >
              {/* Decorative content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🍮</div>
                  <p
                    className="font-accent text-2xl"
                    style={{ color: "var(--color-amber-500)" }}
                  >
                    Made with love
                  </p>
                </div>
              </div>
              {/* Floating tag */}
              <div
                className="absolute bottom-6 left-6 right-6 glass-warm rounded-2xl p-4"
              >
                <p
                  className="font-accent text-lg"
                  style={{ color: "var(--color-choco-600)" }}
                >
                  "Every cup is a little work of art."
                </p>
              </div>
            </div>

            {/* Floating accent card */}
            <div
              className="absolute -right-6 top-12 px-5 py-4 rounded-2xl shadow-warm-lg animate-float"
              style={{
                backgroundColor: "var(--color-amber-400)",
                color: "white",
                minWidth: "140px",
              }}
            >
              <div className="text-2xl font-bold font-heading">100%</div>
              <div className="text-xs mt-0.5 opacity-90">Handcrafted</div>
            </div>
          </div>

          {/* Right: Story text */}
          <div ref={rightRef} className="flex flex-col gap-6">
            <span
              className="inline-block text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{
                color: "var(--color-amber-500)",
                backgroundColor: "var(--color-amber-100)",
                fontFamily: "var(--font-body)",
              }}
            >
              Our Story
            </span>

            <h2
              className="font-heading text-4xl md:text-5xl leading-tight"
              style={{ color: "var(--color-choco-600)" }}
            >
              Born in a home kitchen,{" "}
              <span className="italic" style={{ color: "var(--color-amber-500)" }}>
                made for you
              </span>
            </h2>

            <div
              className="flex flex-col gap-4 text-base leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              <p>
                Dessert Shot started with a simple idea — what if dessert could
                be both stunning to look at and incredible to taste? Not just a
                treat, but an experience.
              </p>
              <p>
                Each cup starts with a hand-pressed biscuit base, followed by a
                signature cream cheese blend infused with the flavour of the day
                — whether that&apos;s fresh mango, Nutella, pistachio, or Lotus
                Biscoff. Then comes the concentrated flavour layer, and finally
                the topping that makes each cup unmistakably its own.
              </p>
              <p>
                Based in Hamilton, Ontario and delivering to the Greater Toronto
                Area — because good dessert should travel.
              </p>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 mt-4 pt-6"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {[
                { value: 7, suffix: "+", label: "Flavours" },
                { value: 500, suffix: "+", label: "Cups Served" },
                { value: 100, suffix: "%", label: "Made Fresh" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-heading text-3xl font-semibold"
                    style={{ color: "var(--color-amber-500)" }}
                  >
                    <span className="stat-number" data-target={stat.value}>
                      {stat.value}
                    </span>
                    {stat.suffix}
                  </div>
                  <div
                    className="text-xs mt-1 uppercase tracking-wide"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
