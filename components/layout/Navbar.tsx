"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Wordmark } from "@/components/ui/Wordmark";
import { BUSINESS } from "@/lib/business";

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/packages", label: "Packages" },
  { href: "/events", label: "Events" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Open: focus the first link. Escape closes and hands focus back to the toggle.
  useEffect(() => {
    if (!mobileOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobileOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Tabbing out of the open menu (into the page it covers) closes it.
  const onMenuBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !menuRef.current?.contains(next) && next !== toggleRef.current) setMobileOpen(false);
  };

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
          <Link href="/" aria-label={`${BUSINESS.name}, home`} className="group flex items-center gap-2.5">
            {/* Decorative: the wordmark beside it names the link. */}
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              loading="eager"
              className="h-10 w-10 object-contain"
            />
            <Wordmark className="text-[22px]" />
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-9">
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
              href={BUSINESS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[14px] tracking-[-0.01em] transition-all duration-500 ease-cinema bg-ink text-bone-soft hover:scale-[1.02]"
              style={{ backgroundColor: "var(--color-ink)" }}
            >
              <InstagramIcon size={16} />
              <span className="font-mono text-[10px] opacity-80 tracking-[0.18em] uppercase">
                {BUSINESS.instagram.handle}
              </span>
              <span className="sr-only"> on Instagram (opens in a new tab)</span>
            </Link>

            <Link
              href={BUSINESS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-ink text-bone-soft"
              style={{ backgroundColor: "var(--color-ink)" }}
              aria-label="Instagram (opens in a new tab)"
            >
              <InstagramIcon size={16} />
            </Link>

            <button
              ref={toggleRef}
              type="button"
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full text-ink -mr-1"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Phones and tablets. Closed, it's inert: out of the tab order and hidden from screen readers. */}
      <nav
        ref={menuRef}
        id="mobile-menu"
        aria-label="Main"
        inert={!mobileOpen}
        onBlur={onMenuBlur}
        // Visible at once on open (so the first link can take focus), hidden only after the fade on close.
        className={`fixed inset-0 z-40 flex flex-col justify-center-safe items-start gap-6 overflow-y-auto overscroll-contain px-7 sm:px-10 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))] duration-500 lg:hidden ${
          mobileOpen
            ? "visible opacity-100 pointer-events-auto transition-opacity"
            : "invisible opacity-0 pointer-events-none transition-[opacity,visibility]"
        }`}
        style={{
          background: "color-mix(in srgb, var(--color-bone) 97%, transparent)",
          backdropFilter: "blur(20px)",
        }}
      >
        {NAV.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-display text-[2.5rem] leading-[1.05] sm:text-5xl tracking-[-0.03em] text-ink py-1.5 -my-1.5"
            style={{
              transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
              transitionProperty: "transform",
              transitionDuration: "600ms",
              transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              transitionDelay: mobileOpen ? `${100 + i * 60}ms` : "0ms",
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={BUSINESS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileOpen(false)}
          className="mt-4 inline-flex items-center gap-3 px-7 py-4 rounded-full text-[15px] text-bone-soft bg-berry"
        >
          <InstagramIcon size={18} />
          <span>{BUSINESS.instagram.handle}</span>
          <span className="sr-only"> on Instagram (opens in a new tab)</span>
        </Link>
      </nav>
    </>
  );
}
