import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderCTA from "@/components/sections/OrderCTA";
import Packages from "@/components/sections/Packages";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { pageGraph } from "@/lib/structured-data";
import { copy } from "@/lib/copy";

export const metadata: Metadata = pageMetadata(ROUTES.order);

export default function OrderPage() {
  return (
    <>
      <JsonLd data={pageGraph(ROUTES.order.path)!} />
      <Navbar />
      <main className="relative pt-32">
        <section className="relative py-20 md:py-28 px-6 md:px-10 hairline-bottom">
          <div className="mx-auto max-w-[1400px]">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">
              {copy.orderPage.kicker}
            </div>
            <h1
              className="font-display text-ink leading-[0.95] tracking-[-0.04em] max-w-[16ch] text-balance"
              style={{ fontSize: "clamp(42px, 8vw, 120px)" }}
            >
              {/* Its own words: the order section below keeps "Tell us the date" as its h2. */}
              {copy.orderPage.headingPre}{" "}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                {copy.orderPage.headingItalic}
              </em>
            </h1>
            <p className="mt-6 md:mt-8 max-w-[52ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70">
              Confirmations arrive within the day. Cups are made the morning
              of pickup or delivery. {copy.order.custom}
            </p>
          </div>
        </section>
        <Packages />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
