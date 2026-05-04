"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type FlavorCategory = "fruity" | "chocolate" | "premium";

export type Flavor = {
  id: string;
  name: string;
  tagline: string;
  category: FlavorCategory;
  emoji: string;
  accentColor: string;
  glowColor: string;
  textColor: string;
  layers: {
    label: string;
    color: string;
    heightRem: number;
    description: string;
  }[];
  description: string;
  pricePerCup: number;
};

export const FLAVORS: Flavor[] = [
  // ── Fruity ──
  {
    id: "mango",
    name: "Mango Dream",
    tagline: "Sun-kissed & tropical",
    category: "fruity",
    emoji: "🥭",
    accentColor: "#F5A623",
    glowColor: "rgba(245, 166, 35, 0.3)",
    textColor: "#8B5E0A",
    description: "A tropical escape in every bite. Fresh mango coulis meets velvety mango cream cheese, resting on a golden biscuit crumble.",
    pricePerCup: 6.5,
    layers: [
      { label: "Biscuit Base", color: "#C49050", heightRem: 2, description: "Golden crumble" },
      { label: "Mango Cream Cheese", color: "#FBBF47", heightRem: 4, description: "Velvety & light" },
      { label: "Mango Coulis", color: "#F59E0B", heightRem: 1.5, description: "Concentrated mango" },
      { label: "Fresh Mango Topping", color: "#FCD34D", heightRem: 1.5, description: "Real mango pieces" },
    ],
  },
  {
    id: "strawberry",
    name: "Strawberry Fields",
    tagline: "Fresh & berry sweet",
    category: "fruity",
    emoji: "🍓",
    accentColor: "#E8344A",
    glowColor: "rgba(232, 52, 74, 0.25)",
    textColor: "#9B1A2A",
    description: "Fresh strawberry compote layered over rose-tinted cream cheese with a vanilla biscuit base. Pure summer in a cup.",
    pricePerCup: 6.5,
    layers: [
      { label: "Biscuit Base", color: "#C49050", heightRem: 2, description: "Vanilla crumble" },
      { label: "Strawberry Cream Cheese", color: "#FECDD3", heightRem: 4, description: "Rose & sweet" },
      { label: "Strawberry Compote", color: "#F43F5E", heightRem: 1.5, description: "Thick & jammy" },
      { label: "Fresh Strawberry", color: "#E11D48", heightRem: 1.5, description: "Real strawberry" },
    ],
  },
  {
    id: "blueberry",
    name: "Blueberry Haze",
    tagline: "Deep & lush",
    category: "fruity",
    emoji: "🫐",
    accentColor: "#4A3580",
    glowColor: "rgba(74, 53, 128, 0.25)",
    textColor: "#2D1F60",
    description: "Wild blueberry compote sits atop a cloud of blueberry cream cheese. Deep, complex, and beautiful in colour.",
    pricePerCup: 6.5,
    layers: [
      { label: "Biscuit Base", color: "#C49050", heightRem: 2, description: "Golden crumble" },
      { label: "Blueberry Cream Cheese", color: "#C4B5F4", heightRem: 4, description: "Purple & dreamy" },
      { label: "Blueberry Compote", color: "#6D28D9", heightRem: 1.5, description: "Wild blueberries" },
      { label: "Fresh Blueberries", color: "#4C1D95", heightRem: 1.5, description: "Plump & juicy" },
    ],
  },
  // ── Chocolate ──
  {
    id: "kinder",
    name: "Kinder Bueno",
    tagline: "Hazelnut & silky smooth",
    category: "chocolate",
    emoji: "🍫",
    accentColor: "#D4700A",
    glowColor: "rgba(212, 112, 10, 0.3)",
    textColor: "#7C3A00",
    description: "Kinder Bueno cream cheese swirled with hazelnut, topped with rich chocolate ganache and a Kinder piece. Childhood dreams, grown up.",
    pricePerCup: 7.5,
    layers: [
      { label: "Biscuit Base", color: "#C49050", heightRem: 2, description: "Hazelnut crumble" },
      { label: "Kinder Cream Cheese", color: "#FDE68A", heightRem: 4, description: "Hazelnut & vanilla" },
      { label: "Chocolate Ganache", color: "#78350F", heightRem: 1.5, description: "Dark & glossy" },
      { label: "Kinder Bueno Piece", color: "#92400E", heightRem: 1.5, description: "The real thing" },
    ],
  },
  {
    id: "ferrero",
    name: "Ferrero Royale",
    tagline: "Hazelnut & nutella luxury",
    category: "chocolate",
    emoji: "🎁",
    accentColor: "#8B5E0A",
    glowColor: "rgba(139, 94, 10, 0.3)",
    textColor: "#4A2F00",
    description: "Nutella-laced cream cheese on a cocoa biscuit base, finished with a thick Nutella layer and a real Ferrero Rocher on top. Pure indulgence.",
    pricePerCup: 8.0,
    layers: [
      { label: "Cocoa Biscuit Base", color: "#92400E", heightRem: 2, description: "Dark crumble" },
      { label: "Nutella Cream Cheese", color: "#D97706", heightRem: 4, description: "Velvety & rich" },
      { label: "Nutella Layer", color: "#78350F", heightRem: 1.5, description: "Pure Nutella" },
      { label: "Ferrero Rocher", color: "#451A03", heightRem: 1.5, description: "The crown jewel" },
    ],
  },
  // ── Premium ──
  {
    id: "biscoff",
    name: "Biscoff Bliss",
    tagline: "Caramel & spiced",
    category: "premium",
    emoji: "🍪",
    accentColor: "#C4860A",
    glowColor: "rgba(196, 134, 10, 0.3)",
    textColor: "#7A4E00",
    description: "Lotus Biscoff spread woven through cream cheese, on a Biscoff cookie crumble base. Warm spice, caramel depth, and a golden finish.",
    pricePerCup: 8.5,
    layers: [
      { label: "Biscoff Crumble", color: "#B45309", heightRem: 2, description: "Crushed Lotus" },
      { label: "Biscoff Cream Cheese", color: "#FCD34D", heightRem: 4, description: "Caramel spiced" },
      { label: "Biscoff Spread", color: "#D97706", heightRem: 1.5, description: "Pure Lotus spread" },
      { label: "Biscoff Cookie", color: "#92400E", heightRem: 1.5, description: "The signature" },
    ],
  },
  {
    id: "dubai",
    name: "Dubai Chocolate",
    tagline: "Pistachio & opulence",
    category: "premium",
    emoji: "💚",
    accentColor: "#5C7A4A",
    glowColor: "rgba(92, 122, 74, 0.3)",
    textColor: "#2D4A1A",
    description: "Inspired by the viral Dubai chocolate bar — pistachio cream cheese with kataifi pastry crunch, dark chocolate ganache, and a gold-dusted finish.",
    pricePerCup: 9.0,
    layers: [
      { label: "Kataifi Crumble", color: "#C49050", heightRem: 2, description: "Crispy & buttery" },
      { label: "Pistachio Cream Cheese", color: "#86EFAC", heightRem: 4, description: "Earthy & sweet" },
      { label: "Dark Chocolate Ganache", color: "#3D1C0A", heightRem: 1.5, description: "Rich & deep" },
      { label: "Gold Dust & Pistachio", color: "#D4A853", heightRem: 1.5, description: "24k gold touch" },
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Flavours" },
  { id: "fruity", label: "🍓 Fruity" },
  { id: "chocolate", label: "🍫 Chocolate" },
  { id: "premium", label: "✨ Premium" },
] as const;

function FlavorCard({ flavor, index }: { flavor: Flavor; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [hovered, setHovered] = useState(false);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      // Card entrance on scroll
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          delay: index * 0.07,
        }
      );

      // Layer-by-layer build animation on scroll
      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      const lbls = labelRefs.current.filter(Boolean) as HTMLSpanElement[];

      gsap.set(layers, { scaleY: 0, transformOrigin: "bottom center" });
      gsap.set(lbls, { opacity: 0, x: -10 });

      const layerTl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      layers.forEach((layer, i) => {
        layerTl.to(
          layer,
          { scaleY: 1, duration: 0.45, ease: "expo.out" },
          i * 0.12
        );
        if (lbls[i]) {
          layerTl.to(
            lbls[i],
            { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" },
            i * 0.12 + 0.2
          );
        }
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        border: `1.5px solid ${flavor.accentColor}22`,
        backgroundColor: "var(--color-cream)",
        boxShadow: hovered ? `0 20px 60px -10px ${flavor.glowColor}` : "var(--shadow-warm)",
        transition: "box-shadow 0.4s ease, transform 0.3s ease",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top color band */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${flavor.accentColor}, ${flavor.accentColor}88)` }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-3xl">{flavor.emoji}</span>
            <h3
              className="font-heading text-2xl mt-1"
              style={{ color: "var(--color-choco-600)" }}
            >
              {flavor.name}
            </h3>
            <p
              className="text-sm mt-0.5 font-accent"
              style={{ color: flavor.accentColor }}
            >
              {flavor.tagline}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${flavor.accentColor}15`,
              color: flavor.textColor,
            }}
          >
            ${flavor.pricePerCup.toFixed(2)} / cup
          </div>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--color-muted)" }}
        >
          {flavor.description}
        </p>

        {/* Layer animation visual */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-widest mb-3 font-semibold"
            style={{ color: "var(--color-muted)" }}
          >
            The Layers
          </p>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${flavor.accentColor}22`,
              backgroundColor: `${flavor.accentColor}08`,
              padding: "1rem",
            }}
          >
            {/* Cup container visual */}
            <div className="flex flex-col-reverse gap-0.5 w-full" style={{ maxWidth: "200px", margin: "0 auto" }}>
              {flavor.layers.map((layer, i) => (
                <div key={i} className="relative flex items-center gap-3">
                  {/* Layer bar */}
                  <div
                    ref={(el) => { layerRefs.current[i] = el; }}
                    className="flex-1 rounded-sm relative overflow-hidden"
                    style={{
                      height: `${layer.heightRem * 16}px`,
                      backgroundColor: layer.color,
                      opacity: 0.85,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
                      }}
                    />
                  </div>
                  {/* Label */}
                  <span
                    ref={(el) => { labelRefs.current[i] = el; }}
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: "var(--color-ink-soft)", minWidth: "100px" }}
                  >
                    {layer.label}
                    <span className="block text-xs opacity-60">{layer.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add to cart */}
        <button
          className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: hovered ? flavor.accentColor : `${flavor.accentColor}18`,
            color: hovered ? "white" : flavor.textColor,
            border: `1.5px solid ${flavor.accentColor}40`,
          }}
        >
          {hovered ? "Add to Order →" : "Select Flavour"}
        </button>
      </div>
    </div>
  );
}

export default function Flavors() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useGSAP(
    () => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const filtered =
    activeCategory === "all"
      ? FLAVORS
      : FLAVORS.filter((f) => f.category === activeCategory);

  return (
    <section
      ref={sectionRef}
      id="flavors"
      className="py-24 px-6"
      style={{ backgroundColor: "var(--color-ivory-deep)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-14">
          <span
            className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{
              color: "var(--color-amber-500)",
              backgroundColor: "var(--color-amber-100)",
              fontFamily: "var(--font-body)",
            }}
          >
            The Menu
          </span>
          <h2
            className="font-heading text-5xl md:text-6xl mb-4"
            style={{ color: "var(--color-choco-600)" }}
          >
            Our Signature Flavours
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-muted)" }}
          >
            Every cup is assembled by hand — three beautiful layers, one
            unforgettable experience.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor:
                  activeCategory === cat.id
                    ? "var(--color-amber-400)"
                    : "var(--color-cream)",
                color:
                  activeCategory === cat.id
                    ? "white"
                    : "var(--color-ink-soft)",
                border:
                  activeCategory === cat.id
                    ? "2px solid var(--color-amber-400)"
                    : "2px solid var(--color-border)",
                boxShadow:
                  activeCategory === cat.id ? "var(--shadow-glow-amber)" : "none",
                fontFamily: "var(--font-body)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Flavor grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((flavor, i) => (
            <FlavorCard key={flavor.id} flavor={flavor} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
