import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Next adds noindex to 404 responses; this also replaces the layout's "index, follow".
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page isn't on the menu. See the flavours, the packs, or send an order request.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/menu", label: "See the flavours" },
  { href: "/packages", label: "Packs and prices" },
  { href: "/order", label: "Send an order request" },
  { href: "/", label: "Back to the homepage" },
];

/** Branded 404 for unknown URLs and unknown flavour or event slugs. */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative px-6 pb-24 pt-40 md:px-10 md:pt-48">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">404 · Page not found</p>
          <h1
            className="max-w-[16ch] font-display leading-[0.98] tracking-[-0.035em] text-ink text-balance"
            style={{ fontSize: "clamp(40px, 6.4vw, 84px)" }}
          >
            This page isn&apos;t on the{" "}
            <em className="italic" style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
              menu.
            </em>
          </h1>
          <p className="mt-8 max-w-[52ch] text-[18px] leading-[1.6] text-ink/80">
            The link may be old, or the page has moved. Everything we make is a click away:
          </p>
          <ul className="mt-10 flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href} className="hairline-top last:border-b last:border-ink/15">
                <Link
                  href={l.href}
                  className="flex min-h-14 items-center justify-between gap-6 py-4 text-[18px] text-ink transition-colors hover:text-berry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {l.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
