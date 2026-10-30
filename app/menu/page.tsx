import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Flavors from "@/components/sections/Flavors";
import Packages from "@/components/sections/Packages";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(ROUTES.menu);

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-32">
        <section className="relative py-20 md:py-28 px-6 md:px-10 hairline-bottom">
          <div className="mx-auto max-w-[1400px]">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6">
              The full menu
            </div>
            <h1
              className="font-display text-ink leading-[0.95] tracking-[-0.04em] max-w-[16ch]"
              style={{ fontSize: "clamp(44px, 9vw, 144px)" }}
            >
              Every flavour,{" "}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                every layer.
              </em>
            </h1>
            <p className="mt-8 max-w-[52ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70">
              Pick a flavour, build a mixed box, or browse the lineup before
              you order. Every flavour lists its layers from the bottom up,
              and Classic and Premium mix freely in the same box.
            </p>
          </div>
        </section>
        <Flavors />
        <Packages />
      </main>
      <Footer />
    </>
  );
}
