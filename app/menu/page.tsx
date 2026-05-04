import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Flavors from "@/components/sections/Flavors";
import Packages from "@/components/sections/Packages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Dessert Shot",
  description: "Browse our full menu of handcrafted layered dessert cups — Mango, Strawberry, Blueberry, Kinder Bueno, Ferrero Rocher, Biscoff, Dubai Chocolate and more.",
};

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page hero */}
        <section
          className="py-20 px-6 text-center"
          style={{ backgroundColor: "var(--color-ivory)" }}
        >
          <span
            className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: "var(--color-amber-500)", backgroundColor: "var(--color-amber-100)", fontFamily: "var(--font-body)" }}
          >
            The Full Menu
          </span>
          <h1
            className="font-heading text-5xl md:text-7xl mb-4"
            style={{ color: "var(--color-choco-600)" }}
          >
            Every flavour, every layer
          </h1>
          <p
            className="text-xl max-w-xl mx-auto"
            style={{ color: "var(--color-muted)" }}
          >
            Explore our complete collection of handcrafted dessert cups.
            Mix and match in any package.
          </p>
        </section>
        <Flavors />
        <Packages />
      </main>
      <Footer />
    </>
  );
}
