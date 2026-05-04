import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Flavors from "@/components/sections/Flavors";
import HowItsMade from "@/components/sections/HowItsMade";
import Packages from "@/components/sections/Packages";
import Testimonials from "@/components/sections/Testimonials";
import OrderCTA from "@/components/sections/OrderCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Flavors />
        <HowItsMade />
        <Packages />
        <Testimonials />
        <OrderCTA />
      </main>
      <Footer />
    </>
  );
}
