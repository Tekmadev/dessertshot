import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderCTA from "@/components/sections/OrderCTA";
import Packages from "@/components/sections/Packages";
import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Order",
  description: `Place your ${BUSINESS.name} order. Pickup in ${BUSINESS.location.city} or delivery across the ${BUSINESS.location.regionShort}. Confirmation within the day.`,
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-32">
        <section className="relative py-20 md:py-28 px-6 md:px-10 hairline-bottom">
          <div className="mx-auto max-w-[1400px]">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6">
              Place an order
            </div>
            <h1
              className="font-display text-ink leading-[0.95] tracking-[-0.04em] max-w-[14ch]"
              style={{ fontSize: "clamp(56px, 9vw, 144px)" }}
            >
              Tell us the date.{" "}
              <em
                className="italic"
                style={{
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                }}
              >
                We do the rest.
              </em>
            </h1>
            <p className="mt-8 max-w-[52ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70">
              Confirmations arrive within the day. Cups are baked the morning
              of pickup. Custom flavour requests welcome.
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
