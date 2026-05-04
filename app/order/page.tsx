import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderCTA from "@/components/sections/OrderCTA";
import Packages from "@/components/sections/Packages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order | Dessert Shot",
  description: "Place your order for handcrafted layered dessert cups. Available for pickup in Hamilton or delivery across the GTA.",
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section
          className="py-16 px-6 text-center"
          style={{ backgroundColor: "var(--color-ivory)" }}
        >
          <h1
            className="font-heading text-5xl md:text-6xl mb-4"
            style={{ color: "var(--color-choco-600)" }}
          >
            Place your order
          </h1>
          <p
            className="text-lg max-w-lg mx-auto"
            style={{ color: "var(--color-muted)" }}
          >
            Fill out the form below and we&apos;ll confirm within 24 hours.
          </p>
        </section>
        <Packages />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
