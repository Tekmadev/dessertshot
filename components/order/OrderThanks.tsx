"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { BUSINESS, mailtoLink } from "@/lib/business";
import { copy } from "@/lib/copy";
import { LAST_ORDER_STORAGE_KEY, STORED_ORDER_MAX_AGE_MS, type StoredOrder } from "@/lib/order-api";
import { formatCad, fulfillmentLine, itemLine, timingLine } from "@/lib/order-summary";

// The order the form just sent, from this tab's sessionStorage. Read only in
// the browser (the server render has none), so this page prerenders the
// generic confirmation and fills in the details on hydration. Entries older
// than an hour are ignored.
const subscribe = () => () => {};
const readStored = () => {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
    const savedAt = raw ? (JSON.parse(raw) as Partial<StoredOrder>).savedAt : undefined;
    return typeof savedAt === "number" && Date.now() - savedAt < STORED_ORDER_MAX_AGE_MS ? raw : null;
  } catch {
    return null;
  }
};
const noStoredOnServer = () => null;

function parseStored(raw: string | null): StoredOrder | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredOrder;
    return value?.summary?.reference && Array.isArray(value.summary.items) ? value : null;
  } catch {
    return null;
  }
}

export default function OrderThanks() {
  const raw = useSyncExternalStore(subscribe, readStored, noStoredOnServer);
  const stored = useMemo(() => parseStored(raw), [raw]);
  const s = stored?.summary;

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-10">
      <div className="mx-auto max-w-[900px] flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <CheckCircle size={36} strokeWidth={1.5} style={{ color: "var(--color-ember)" }} aria-hidden="true" />
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50">Request received</div>
          <h1
            className="font-display text-ink leading-[0.95] tracking-[-0.04em]"
            style={{ fontSize: "clamp(46px, 10vw, 112px)" }}
          >
            Got it{s ? `, ${s.name.split(/\s+/)[0]}` : ""}.
          </h1>
          <p className="max-w-[52ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/70">
            {s ? (
              <>
                Your order request is with us. Your reference is{" "}
                <strong className="font-mono text-ink tracking-[0.04em]">{s.reference}</strong>.{" "}
              </>
            ) : (
              "If you've just sent an order request, it's with us. "
            )}
            {copy.order.confirmation} The reply comes from {BUSINESS.email}.
          </p>
        </div>

        {s ? (
          <div
            className="flex flex-col gap-6 p-6 sm:p-8 hairline-top hairline-bottom"
            style={{ backgroundColor: "var(--color-bone-soft)" }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-[28px] tracking-[-0.03em] text-ink leading-tight">
                {s.packQty} {s.cupSizeLabel}
              </h2>
              <div className="text-right">
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/45">
                  {copy.order.totalLabel}
                </div>
                <div className="font-display text-[32px] tracking-[-0.035em] text-ink tabular-nums">
                  {formatCad(s.estimatedTotal)}
                </div>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {s.items.map((i) => (
                <li key={i.id} className="text-[16px] text-ink/80 hairline-top pt-2">
                  {itemLine(i)}
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-3 text-[15px] leading-[1.55]">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45 pt-1">Date needed</dt>
              <dd className="text-ink/80">
                {s.dateLabel}
                <br />
                <span className={s.urgent ? "text-ember" : "text-ink/55"}>{timingLine(s)}</span>
              </dd>
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45 pt-1">
                {s.fulfillment === "pickup" ? "Pickup" : "Delivery"}
              </dt>
              <dd className="text-ink/80">
                {fulfillmentLine(s)}
                {s.deliveryNotSaturday ? (
                  <>
                    <br />
                    <span className="text-ink/60">{copy.order.notSaturday}</span>
                  </>
                ) : null}
              </dd>
              {s.eventLabel ? (
                <>
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45 pt-1">Event</dt>
                  <dd className="text-ink/80">{s.eventLabel}</dd>
                </>
              ) : null}
            </dl>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <h2 className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">What happens next</h2>
          <ol className="flex flex-col gap-3 text-[16px] leading-[1.6] text-ink/75 list-decimal pl-5">
            <li>
              {stored?.confirmationEmailSent
                ? `We've emailed this summary to ${s!.email}.`
                : s
                ? "Keep your reference handy: our confirmation email will repeat the details."
                : "Watch your inbox for our confirmation."}
            </li>
            <li>Your order is booked once we confirm it.</li>
            <li>
              {s?.fulfillment === "delivery"
                ? copy.order.deliveryFee
                : s?.fulfillment === "pickup"
                ? copy.order.pickup
                : copy.order.pickupOrDelivery}
            </li>
            <li>
              Something to change? Write to{" "}
              <a className="underline" href={mailtoLink}>
                {BUSINESS.email}
              </a>
              {s ? ` with your reference, ${s.reference}.` : "."}
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-6 font-mono text-[11px] tracking-[0.18em] uppercase">
          <Link href="/menu" className="underline underline-offset-4 text-ink hover:text-ember transition-colors">
            Browse the menu
          </Link>
          <Link href="/" className="underline underline-offset-4 text-ink hover:text-ember transition-colors">
            Back to home
          </Link>
          <a
            href={BUSINESS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 text-ink hover:text-ember transition-colors"
          >
            Instagram {BUSINESS.instagram.handle}
          </a>
        </div>
      </div>
    </section>
  );
}
