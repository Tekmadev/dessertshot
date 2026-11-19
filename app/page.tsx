import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import CupBuilder from "@/components/sections/CupBuilder";
import Flavors from "@/components/sections/Flavors";
import PourDivider from "@/components/sections/PourDivider";
import MorningOf from "@/components/sections/MorningOf";
import Packages from "@/components/sections/Packages";
import EventsGrid from "@/components/sections/EventsGrid";
import Instagram from "@/components/sections/Instagram";
import HomeFaq from "@/components/sections/HomeFaq";
import OrderSteps from "@/components/sections/OrderSteps";
import OrderCTA from "@/components/sections/OrderCTA";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(ROUTES.home);

// The scroll experience (brief §5): S1 hero, S2 the build, S3 the lineup,
// S4 pour dividers, S5 the morning of, S6 packages, S7 events,
// S8 Instagram (hidden while empty), S9 FAQ, then how ordering works (the
// 50% deposit confirms an order) and the order form.
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <CupBuilder />
        <Flavors />
        <PourDivider variant="ganache" />
        <MorningOf />
        <PourDivider variant="caramel" flip />
        <Packages />
        <EventsGrid />
        <Instagram />
        <PourDivider variant="pistachio" />
        <HomeFaq />
        <OrderSteps />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
