"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Hamilton, ON",
    rating: 5,
    text: "I ordered the dozen for my daughter's birthday and everyone was absolutely blown away. The mango cups disappeared in seconds! Will definitely be ordering again.",
    flavor: "Mango Dream",
    emoji: "🥭",
  },
  {
    name: "Priya K.",
    location: "Mississauga, ON",
    rating: 5,
    text: "The Dubai Chocolate cup is something else entirely. I've had desserts from fancy restaurants and this honestly competes. The pistachio cream is so silky.",
    flavor: "Dubai Chocolate",
    emoji: "💚",
  },
  {
    name: "Jessica T.",
    location: "Toronto, ON",
    rating: 5,
    text: "Ordered the Event Box for my bridal shower — 24 cups with a mix of flavours. My guests wouldn't stop talking about them. Presentation was stunning!",
    flavor: "Mixed Box",
    emoji: "🎊",
  },
  {
    name: "Amara O.",
    location: "Brampton, ON",
    rating: 5,
    text: "The Ferrero Royale is my weakness. The Nutella layer is genuinely thick and the Ferrero on top is the perfect touch. I've reordered three times now.",
    flavor: "Ferrero Royale",
    emoji: "🎁",
  },
  {
    name: "Rachel B.",
    location: "Burlington, ON",
    rating: 5,
    text: "Best dessert cups I've ever had. The layers are so well balanced — not too sweet, not too heavy. The Biscoff one is a masterpiece.",
    flavor: "Biscoff Bliss",
    emoji: "🍪",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );
    },
    { scope: sectionRef }
  );

  const prev = () => setActive((a) => (a === 0 ? TESTIMONIALS.length - 1 : a - 1));
  const next = () => setActive((a) => (a === TESTIMONIALS.length - 1 ? 0 : a + 1));
  const t = TESTIMONIALS[active];

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14">
          <span
            className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: "var(--color-amber-500)", backgroundColor: "var(--color-amber-100)", fontFamily: "var(--font-body)" }}
          >
            Love Notes
          </span>
          <h2 className="font-heading text-5xl md:text-6xl" style={{ color: "var(--color-choco-600)" }}>
            What our customers say
          </h2>
        </div>

        {/* Testimonial card */}
        <div
          className="relative rounded-3xl p-10 text-center"
          style={{
            backgroundColor: "var(--color-ivory-deep)",
            border: "1.5px solid var(--color-border)",
            boxShadow: "var(--shadow-warm-lg)",
          }}
        >
          {/* Quote mark */}
          <div
            className="font-heading text-9xl leading-none absolute top-4 left-8 select-none pointer-events-none opacity-10"
            style={{ color: "var(--color-amber-400)" }}
          >
            "
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={18} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
            ))}
          </div>

          {/* Text */}
          <blockquote
            className="font-heading text-2xl md:text-3xl leading-relaxed mb-8 relative z-10"
            style={{ color: "var(--color-choco-600)" }}
          >
            &ldquo;{t.text}&rdquo;
          </blockquote>

          {/* Flavor tag */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6"
            style={{
              backgroundColor: "var(--color-amber-100)",
              color: "var(--color-amber-600)",
              fontFamily: "var(--font-body)",
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.flavor}</span>
          </div>

          {/* Author */}
          <div>
            <p className="font-semibold" style={{ color: "var(--color-choco-600)", fontFamily: "var(--font-body)" }}>
              {t.name}
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              {t.location}
            </p>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: "var(--color-cream)",
                border: "1.5px solid var(--color-border)",
                color: "var(--color-choco-500)",
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? "24px" : "8px",
                    height: "8px",
                    backgroundColor:
                      i === active ? "var(--color-amber-400)" : "var(--color-border)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: "var(--color-cream)",
                border: "1.5px solid var(--color-border)",
                color: "var(--color-choco-500)",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/dessertshot.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-amber-500)", fontFamily: "var(--font-body)" }}
          >
            See more on Instagram @dessertshot.ca →
          </a>
        </div>
      </div>
    </section>
  );
}
