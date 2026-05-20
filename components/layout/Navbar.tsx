"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { BUSINESS } from "@/lib/business";

const NAV = [
  { href: "/#flavors", label: "Flavours" },
  { href: "/#builder", label: "How a cup is built" },
  { href: "/#packages", label: "Packages" },
  { href: "/menu", label: "Menu" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0)
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-cinema ${
          scrolled
            ? "py-3 glass-bone border-b border-ink/10"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-baseline gap-1 font-display text-[22px] tracking-[-0.025em] text-ink"
          >
            <span>Dessert</span>
            <span
              className="italic"
              style={{ fontVariationSettings: "'SOFT' 50, 'WONK' 1", color: "var(--color-ember)" }}
            >
              Shot
            </span>
            <span className="text-ember translate-y-[-0.2em]">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-[14px] tracking-[-0.01em] text-ink/75 hover:text-ink transition-colors"
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-1 h-px bg-ember origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-cinema"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/order"
              className="hidden md:inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[14px] tracking-[-0.01em] transition-all duration-500 ease-cinema bg-ink text-bone-soft hover:scale-[1.02]"
              style={{ backgroundColor: "var(--color-ink)" }}
            >
              Order
              <span className="font-mono text-[10px] opacity-70 tracking-[0.18em] uppercase">
                {cartCount > 0
                  ? `${cartCount} in box`
                  : BUSINESS.location.regionShort}
              </span>
            </Link>

            <Link
              href="/order"
              className="relative md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-ink text-bone-soft"
              style={{ backgroundColor: "var(--color-ink)" }}
              aria-label="Cart"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ember text-bone-soft text-[10px] font-mono flex items-center justify-center">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-ink"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 flex flex-col justify-center items-start gap-6 px-10 transition-all duration-500 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(244, 236, 219, 0.97)",
          backdropFilter: "blur(20px)",
        }}
      >
        {NAV.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-display text-5xl tracking-[-0.03em] text-ink"
            style={{
              transitionDelay: mobileOpen ? `${100 + i * 60}ms` : "0ms",
              transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
              transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/order"
          onClick={() => setMobileOpen(false)}
          className="mt-4 inline-flex items-center gap-4 px-7 py-4 rounded-full text-[15px] text-bone-soft"
          style={{ backgroundColor: "var(--color-ember)" }}
        >
          Place an Order
        </Link>
      </div>
    </>
  );
}
