import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import CupBuilder from "@/components/sections/CupBuilder";
import Numbers from "@/components/sections/Numbers";
import Flavors from "@/components/sections/Flavors";
import HowItsMade from "@/components/sections/HowItsMade";
import Packages from "@/components/sections/Packages";
import OrderCTA from "@/components/sections/OrderCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <Story />
        <CupBuilder />
        <Numbers />
        <Flavors />
        <HowItsMade />
        <Packages />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
