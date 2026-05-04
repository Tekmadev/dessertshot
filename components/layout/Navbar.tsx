"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#flavors", label: "Flavours" },
    { href: "#how-its-made", label: "How It's Made" },
    { href: "#packages", label: "Packages" },
    { href: "#about", label: "Our Story" },
    { href: "#contact", label: "Order" },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled
            ? "glass-warm shadow-warm py-3"
            : "bg-transparent py-5"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span
                className="font-accent text-2xl font-bold transition-all duration-300"
                style={{ color: scrolled ? "var(--color-choco-600)" : "var(--color-choco-600)" }}
              >
                Dessert Shot
              </span>
              <span
                className="absolute -bottom-0.5 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out-expo rounded-full"
                style={{ backgroundColor: "var(--color-amber-400)" }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium tracking-wide group transition-colors duration-200"
                style={{ color: "var(--color-ink-soft)", fontFamily: "var(--font-body)" }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full"
                  style={{ backgroundColor: "var(--color-amber-400)" }}
                />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/order"
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: "var(--color-amber-400)",
                color: "white",
              }}
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-choco-600)",
                    color: "white",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ color: "var(--color-choco-600)" }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`
          fixed inset-0 z-40 flex flex-col justify-center items-center gap-8
          transition-all duration-500 md:hidden
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        style={{ backgroundColor: "rgba(255, 248, 239, 0.97)", backdropFilter: "blur(20px)" }}
      >
        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-heading text-4xl font-semibold transition-all duration-200 hover:opacity-60"
            style={{
              color: "var(--color-choco-600)",
              transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms",
              transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/order"
          onClick={() => setMobileOpen(false)}
          className="mt-4 px-8 py-4 rounded-full font-semibold text-white text-lg transition-transform hover:scale-105"
          style={{ backgroundColor: "var(--color-amber-400)" }}
        >
          Order Now
        </Link>
      </div>
    </>
  );
}
