import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderThanks from "@/components/order/OrderThanks";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(ROUTES.orderThanks);

export default function OrderThanksPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-32">
        <OrderThanks />
      </main>
      <Footer />
    </>
  );
}
