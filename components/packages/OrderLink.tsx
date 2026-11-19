"use client";

import Link from "next/link";
import { orderHref, type OrderPrefill } from "@/lib/order-prefill";

/**
 * A real link to /order with these choices (it works without JavaScript and
 * opens in a new tab with Cmd/Ctrl-click). A plain click goes to `onOrder`
 * instead, which prefills the form when it's on this page and otherwise
 * navigates.
 */
export default function OrderLink({
  prefill,
  onOrder,
  className,
  children,
}: {
  prefill: OrderPrefill;
  onOrder: (prefill: OrderPrefill) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={orderHref(prefill)}
      className={className}
      onNavigate={(e) => {
        e.preventDefault();
        onOrder(prefill);
      }}
    >
      {children}
    </Link>
  );
}
