"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

gsap.registerPlugin(ScrollTrigger);

type PackageSize = 1 | 6 | 12 | 24;

type Package = {
  size: PackageSize;
  label: string;
  pricePerCup: number;
  totalPrice: number;
  tag?: string;
  tagColor?: string;
  featured?: boolean;
  perks: string[];
  emoji: string;
  description: string;
};

const PACKAGES: Package[] = [
  {
    size: 1,
    label: "Single Cup",
    emoji: "🍮",
    pricePerCup: 7.50,
    totalPrice: 7.50,
    description: "Try your favourite flavour, one perfect cup at a time.",
    perks: [
      "Choose any flavour",
      "Freshly assembled",
      "Perfect for tasting",
    ],
  },
  {
    size: 6,
    label: "Half Dozen",
    emoji: "🎁",
    pricePerCup: 7.00,
    totalPrice: 42.00,
    tag: "Fan Favourite",
    tagColor: "var(--color-strawberry)",
    description: "Great for sharing with family or a small gathering.",
    perks: [
      "Mix & match flavours",
      "Freshly assembled",
      "Gift-ready packaging",
      "Save $3 vs single",
    ],
  },
  {
    size: 12,
    label: "Full Dozen",
    emoji: "✨",
    pricePerCup: 6.50,
    totalPrice: 78.00,
    tag: "Best Value",
    tagColor: "var(--color-amber-500)",
    featured: true,
    description: "The party starter. Every occasion deserves a full dozen.",
    perks: [
      "Mix & match flavours",
      "Priority preparation",
      "Gift-ready packaging",
      "Free flavour recommendation",
      "Save $12 vs single",
    ],
  },
  {
    size: 24,
    label: "The Event Box",
    emoji: "🎊",
    pricePerCup: 6.00,
    totalPrice: 144.00,
    tag: "Events & Parties",
    tagColor: "var(--color-blueberry)",
    description: "For weddings, baby showers, birthdays & corporate events.",
    perks: [
      "Full flavour customization",
      "Custom label option",
      "Priority booking",
      "Event delivery available",
      "Presentation tray included",
      "Save $36 vs single",
    ],
  },
];

export default function Packages() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const [addedIndex, setAddedIndex] = useState<number | null>(null);

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

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, rotateX: 5 },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 0.9, ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
            delay: i * 0.1,
          }
        );
      });
    },
    { scope: sectionRef }
  );

  const handleAddToCart = (pkg: Package, index: number) => {
    addItem({
      id: `package-${pkg.size}`,
      name: `Dessert Shot Package`,
      flavor: "Mixed",
      packageSize: pkg.size,
      price: pkg.totalPrice,
      quantity: 1,
    });
    setAddedIndex(index);
    setTimeout(() => setAddedIndex(null), 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="packages"
      className="py-24 px-6"
      style={{ backgroundColor: "var(--color-ivory-deep)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14">
          <span
            className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: "var(--color-amber-500)", backgroundColor: "var(--color-amber-100)", fontFamily: "var(--font-body)" }}
          >
            Packages & Pricing
          </span>
          <h2 className="font-heading text-5xl md:text-6xl mb-4" style={{ color: "var(--color-choco-600)" }}>
            Choose your package
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: "var(--color-muted)" }}>
            From a single indulgent cup to a full event box — every package
            includes freshly made cups assembled just for you.
          </p>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg, i) => (
            <div
              key={pkg.size}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                backgroundColor: pkg.featured ? "var(--color-choco-600)" : "var(--color-cream)",
                border: pkg.featured
                  ? "2px solid var(--color-amber-400)"
                  : "1.5px solid var(--color-border)",
                boxShadow: pkg.featured ? "var(--shadow-glow-amber)" : "var(--shadow-warm)",
              }}
            >
              {/* Featured star */}
              {pkg.featured && (
                <div className="absolute top-4 right-4">
                  <Star size={16} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                </div>
              )}

              {/* Tag */}
              {pkg.tag && (
                <div
                  className="px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: pkg.tagColor }}
                >
                  {pkg.tag}
                </div>
              )}

              <div className="p-6 flex flex-col gap-4 h-full">
                {/* Header */}
                <div>
                  <div className="text-4xl mb-2">{pkg.emoji}</div>
                  <h3
                    className="font-heading text-2xl"
                    style={{ color: pkg.featured ? "var(--color-amber-300)" : "var(--color-choco-600)" }}
                  >
                    {pkg.label}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: pkg.featured ? "var(--color-choco-200)" : "var(--color-muted)" }}
                  >
                    {pkg.description}
                  </p>
                </div>

                {/* Pricing */}
                <div>
                  <div
                    className="font-heading text-4xl font-semibold"
                    style={{ color: pkg.featured ? "white" : "var(--color-choco-600)" }}
                  >
                    ${pkg.totalPrice.toFixed(2)}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: pkg.featured ? "var(--color-amber-300)" : "var(--color-amber-500)" }}
                  >
                    ${pkg.pricePerCup.toFixed(2)} per cup
                    {pkg.size > 1 && (
                      <span style={{ color: pkg.featured ? "var(--color-choco-200)" : "var(--color-muted)" }}>
                        {" "}· {pkg.size} cups
                      </span>
                    )}
                  </div>
                </div>

                {/* Perks */}
                <ul className="flex flex-col gap-2 flex-1">
                  {pkg.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: pkg.featured ? "var(--color-amber-400)" : "var(--color-amber-500)" }}
                      />
                      <span style={{ color: pkg.featured ? "var(--color-choco-100)" : "var(--color-muted)" }}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleAddToCart(pkg, i)}
                  className="w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.03] mt-2"
                  style={{
                    backgroundColor:
                      addedIndex === i
                        ? "var(--color-pistachio)"
                        : pkg.featured
                        ? "var(--color-amber-400)"
                        : "var(--color-choco-600)",
                    color: "white",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {addedIndex === i ? "✓ Added to Order!" : `Order ${pkg.size === 1 ? "Now" : pkg.label}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center mt-8 text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
          Prices are per order. Mix and match flavours in any package.{" "}
          <a href="#contact" style={{ color: "var(--color-amber-500)" }}>
            Contact us
          </a>{" "}
          for custom event orders.
        </p>
      </div>
    </section>
  );
}
