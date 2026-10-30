import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import CupBuilder from "@/components/sections/CupBuilder";
import Flavors from "@/components/sections/Flavors";
import HowItsMade from "@/components/sections/HowItsMade";
import Packages from "@/components/sections/Packages";
import OrderCTA from "@/components/sections/OrderCTA";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(ROUTES.home);

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <Story />
        <CupBuilder />
        <Flavors />
        <HowItsMade />
        <Packages />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
