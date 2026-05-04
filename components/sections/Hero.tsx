"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// The 5 signature cups — each has a color identity
const SIGNATURE_CUPS = [
  {
    id: "mango",
    label: "Mango Dream",
    tagline: "Tropical & Bright",
    color: "#F5A623",
    glowColor: "rgba(245, 166, 35, 0.4)",
    videoSrc: "/videos/mango-cup.mp4",
    posterSrc: "/images/placeholder-mango.jpg",
    delay: 0,
  },
  {
    id: "ferrero",
    label: "Ferrero Royale",
    tagline: "Rich & Indulgent",
    color: "#8B5E0A",
    glowColor: "rgba(139, 94, 10, 0.4)",
    videoSrc: "/videos/ferrero-cup.mp4",
    posterSrc: "/images/placeholder-ferrero.jpg",
    delay: 0.1,
  },
  {
    id: "kinder",
    label: "Kinder Bueno",
    tagline: "Smooth & Creamy",
    color: "#D4700A",
    glowColor: "rgba(212, 112, 10, 0.4)",
    videoSrc: "/videos/kinder-cup.mp4",
    posterSrc: "/images/placeholder-kinder.jpg",
    delay: 0.2,
  },
  {
    id: "biscoff",
    label: "Biscoff Bliss",
    tagline: "Caramel & Spiced",
    color: "#C4860A",
    glowColor: "rgba(196, 134, 10, 0.4)",
    videoSrc: "/videos/biscoff-cup.mp4",
    posterSrc: "/images/placeholder-biscoff.jpg",
    delay: 0.3,
  },
  {
    id: "dubai",
    label: "Dubai Chocolate",
    tagline: "Pistachio & Luxury",
    color: "#5C7A4A",
    glowColor: "rgba(92, 122, 74, 0.4)",
    videoSrc: "/videos/dubai-cup.mp4",
    posterSrc: "/images/placeholder-dubai.jpg",
    delay: 0.4,
  },
];

// Floating particle component
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={style}
    />
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const cupsRowRef = useRef<HTMLDivElement>(null);
  const cupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cups = cupRefs.current.filter(Boolean) as HTMLDivElement[];
      const labels = labelRefs.current.filter(Boolean) as HTMLDivElement[];

      // ── Initial states ──
      gsap.set(cups, { y: 120, opacity: 0, scale: 0.85, rotateY: -15 });
      gsap.set(labels, { opacity: 0, y: 20 });
      gsap.set(headlineRef.current, { opacity: 0, y: 40 });
      gsap.set(subheadRef.current, { opacity: 0, y: 30 });
      gsap.set(taglineRef.current, { opacity: 0, scale: 0.9 });

      // ── Entrance timeline (plays on load) ──
      const entranceTl = gsap.timeline({ delay: 0.3 });

      // Logo / tagline shimmer in
      entranceTl.to(taglineRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "expo.out",
      });

      // Headline word by word
      entranceTl.to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "expo.out",
        },
        "-=0.6"
      );

      // Subhead
      entranceTl.to(
        subheadRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "expo.out",
        },
        "-=0.6"
      );

      // Cups staggered rise
      entranceTl.to(
        cups,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.12,
        },
        "-=0.4"
      );

      // Labels appear after cups
      entranceTl.to(
        labels,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.08,
        },
        "-=0.4"
      );

      // ── Scroll-driven: cups float up as we scroll down ──
      cups.forEach((cup, i) => {
        gsap.to(cup, {
          y: -60 - i * 15,
          scale: 1.04,
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom 20%",
            scrub: 1.5,
          },
        });
      });

      // ── Scroll-driven: headline parallax ──
      gsap.to(headlineRef.current, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "40% top",
          scrub: 1,
        },
      });

      gsap.to(subheadRef.current, {
        y: -50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "30% top",
          scrub: 1,
        },
      });

      // ── Cup hover interactive float (mouse parallax) ──
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const mx = (e.clientX / innerWidth - 0.5) * 2;
        const my = (e.clientY / innerHeight - 0.5) * 2;

        cups.forEach((cup, i) => {
          const factor = (i - 2) * 0.5;
          gsap.to(cup, {
            x: mx * 12 * (1 + Math.abs(factor) * 0.3),
            rotateY: mx * 4,
            rotateX: -my * 3,
            duration: 1.2,
            ease: "power2.out",
          });
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: containerRef }
  );

  // Scroll indicator fade out
  useEffect(() => {
    const handler = () => {
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity =
          Math.max(0, 1 - window.scrollY / 200).toString();
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Generate decorative particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 10 + 4,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${4 + Math.random() * 4}s`,
    color: [
      "var(--color-amber-300)",
      "var(--color-gold)",
      "var(--color-biscoff-light)",
      "var(--color-amber-200)",
    ][Math.floor(Math.random() * 4)],
    opacity: 0.3 + Math.random() * 0.4,
  }));

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      {/* ── Radial background glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 40%,
              rgba(245, 166, 35, 0.08) 0%,
              transparent 70%
            ),
            radial-gradient(ellipse 50% 40% at 20% 80%,
              rgba(212, 112, 10, 0.06) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 40% 40% at 80% 20%,
              rgba(196, 134, 10, 0.05) 0%,
              transparent 60%
            )
          `,
        }}
      />

      {/* ── Floating particles ── */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            backgroundColor: p.color,
            opacity: p.opacity,
            borderRadius: "50%",
            animation: `float-slow ${p.duration} ${p.delay} ease-in-out infinite alternate`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* ── Main content ── */}
      <div
        ref={pinRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center gap-6"
      >
        {/* Tagline pill */}
        <div
          ref={taglineRef}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium shimmer"
          style={{
            backgroundColor: "var(--color-amber-100)",
            color: "var(--color-choco-500)",
            border: "1px solid var(--color-amber-200)",
          }}
        >
          <span style={{ color: "var(--color-amber-500)" }}>✦</span>
          Handcrafted in Hamilton, Ontario
          <span style={{ color: "var(--color-amber-500)" }}>✦</span>
        </div>

        {/* Main headline */}
        <h1
          ref={headlineRef}
          className="font-heading text-center font-semibold leading-none"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            color: "var(--color-choco-600)",
            maxWidth: "900px",
          }}
        >
          Every cup tells a{" "}
          <span
            className="italic"
            style={{
              color: "var(--color-amber-500)",
              backgroundImage: "linear-gradient(135deg, var(--color-amber-400), var(--color-gold))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            delicious
          </span>{" "}
          story
        </h1>

        {/* Subhead */}
        <p
          ref={subheadRef}
          className="text-center max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
        >
          Layered dessert cups crafted with real ingredients — biscuit base,
          velvety cream, and a finishing touch that makes every bite unforgettable.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="#packages"
            className="px-8 py-4 rounded-full font-semibold text-white text-base transition-all duration-300 hover:scale-105 hover:shadow-glow-amber"
            style={{
              backgroundColor: "var(--color-amber-400)",
              fontFamily: "var(--font-body)",
            }}
          >
            See Packages
          </Link>
          <Link
            href="#flavors"
            className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-choco-500)",
              border: "2px solid var(--color-border)",
              fontFamily: "var(--font-body)",
            }}
          >
            Explore Flavours
          </Link>
        </div>

        {/* ── THE 5 CUPS ROW ── */}
        <div
          ref={cupsRowRef}
          className="relative w-full flex items-end justify-center gap-4 mt-8"
          style={{ minHeight: "360px", perspective: "1200px" }}
        >
          {SIGNATURE_CUPS.map((cup, i) => {
            // Middle cup is tallest, outer cups are shorter
            const heightMultipliers = [0.78, 0.88, 1, 0.88, 0.78];
            const baseH = 320;
            const h = baseH * heightMultipliers[i];
            const zTranslate = i === 2 ? 0 : Math.abs(i - 2) * -20;

            return (
              <div
                key={cup.id}
                ref={(el) => { cupRefs.current[i] = el; }}
                className="relative flex flex-col items-center group cursor-pointer"
                style={{
                  width: "clamp(120px, 15vw, 180px)",
                  transform: `translateZ(${zTranslate}px)`,
                }}
              >
                {/* Glow under cup */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-xl transition-all duration-500 group-hover:scale-125"
                  style={{
                    width: "80%",
                    height: "40px",
                    backgroundColor: cup.glowColor,
                    bottom: "-10px",
                  }}
                />

                {/* Cup video / placeholder */}
                <div
                  className="relative w-full rounded-xl overflow-hidden shadow-warm-lg transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-3"
                  style={{
                    height: `${h}px`,
                    border: `2px solid ${cup.color}22`,
                    background: `linear-gradient(to bottom, ${cup.color}18, ${cup.color}08)`,
                  }}
                >
                  {/* Video (will play once AI-generated videos are added) */}
                  <video
                    src={cup.videoSrc}
                    poster={cup.posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                    onCanPlay={(e) => {
                      (e.target as HTMLVideoElement).style.opacity = "1";
                    }}
                  />

                  {/* Placeholder visual while video loads */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                    style={{ background: `linear-gradient(to bottom, ${cup.color}15, ${cup.color}30)` }}
                  >
                    {/* Decorative cup layers illustration */}
                    <div className="w-full px-4 flex flex-col gap-0.5 absolute bottom-8">
                      <div className="h-2 rounded-full opacity-60" style={{ background: cup.color }} />
                      <div className="h-8 rounded-sm opacity-30" style={{ background: cup.color }} />
                      <div className="h-12 rounded-sm opacity-50" style={{ background: "var(--color-ivory-deep)" }} />
                      <div className="h-6 rounded-sm opacity-40" style={{ background: "var(--color-choco-200)" }} />
                      <div className="h-3 rounded-b-lg opacity-60" style={{ background: "var(--color-choco-300)" }} />
                    </div>
                    {/* Icon */}
                    <span className="text-5xl z-10" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>
                      🍮
                    </span>
                  </div>

                  {/* Shine overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                    }}
                  />
                </div>

                {/* Cup label */}
                <div
                  ref={(el) => { labelRefs.current[i] = el; }}
                  className="mt-3 text-center"
                >
                  <div
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: cup.color, fontFamily: "var(--font-body)" }}
                  >
                    {cup.label}
                  </div>
                  <div
                    className="text-xs mt-0.5 opacity-60"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
                  >
                    {cup.tagline}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="flex flex-col items-center gap-2 mt-6 transition-opacity duration-300"
          style={{ color: "var(--color-muted)" }}
        >
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
            Scroll to discover
          </span>
          <div
            className="w-px h-10 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--color-amber-400)" }}
          />
        </div>
      </div>

      {/* Soft bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-ivory))",
        }}
      />
    </section>
  );
}
