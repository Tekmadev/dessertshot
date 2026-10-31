"use client";

import { motion } from "motion/react";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { BUSINESS, mailtoLink, telLink } from "@/lib/business";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import OrderForm from "@/components/order/OrderForm";

export default function OrderCTA() {
  return (
    <section
      id="contact"
      aria-label="Place an order"
      className="relative py-20 sm:py-28 md:py-44 bg-bone hairline-top"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left side */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.9, ease: EASE_CINEMA }}
                className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6"
              >
                {copy.cta.kicker}
              </motion.div>
              <motion.h2
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 1, ease: EASE_CINEMA }}
                className="font-display text-ink leading-[0.96] tracking-[-0.035em]"
                style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
              >
                {copy.cta.heading}
                <br />
                <em
                  className="italic"
                  style={{
                    color: "var(--color-ember)",
                    fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                  }}
                >
                  {copy.cta.headingItalic}
                </em>
              </motion.h2>
              <p className="mt-7 max-w-[44ch] text-[17px] leading-[1.55] text-ink/70">
                {copy.cta.body}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={BUSINESS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 hairline-top hairline-bottom py-5"
              >
                <div className="flex items-center gap-4">
                  <InstagramIcon className="w-5 h-5 text-ink" />
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">
                      Instagram
                    </div>
                    <div className="font-display text-[20px] tracking-[-0.02em] text-ink">
                      {BUSINESS.instagram.handle}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70 group-hover:text-berry transition-colors">
                  Open
                </span>
              </a>
              <a
                href={BUSINESS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 hairline-bottom py-5"
              >
                <div className="flex items-center gap-4">
                  <FacebookIcon className="w-5 h-5 text-ink" />
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">
                      Facebook
                    </div>
                    <div className="font-display text-[20px] tracking-[-0.02em] text-ink">
                      {BUSINESS.facebook.handle}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70 group-hover:text-berry transition-colors">
                  Open
                </span>
              </a>
              <a
                href={mailtoLink}
                className="group flex items-center justify-between gap-4 hairline-bottom py-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">
                    Email
                  </div>
                  <div className="font-display text-[20px] tracking-[-0.02em] text-ink truncate">
                    {BUSINESS.email}
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70 group-hover:text-berry transition-colors">
                  Send
                </span>
              </a>
              {telLink ? (
                <a href={telLink} className="group flex items-center justify-between gap-4 hairline-bottom py-5">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">
                      Call or text
                    </div>
                    <div className="font-display text-[20px] tracking-[-0.02em] text-ink">{BUSINESS.phone}</div>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70 group-hover:text-berry transition-colors">
                    Call
                  </span>
                </a>
              ) : null}
            </div>

            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70 leading-[1.7]">
              {BUSINESS.fulfillment.pickup}
              <br />
              {BUSINESS.fulfillment.delivery}
              <br />
              {BUSINESS.fulfillment.notice}
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE_CINEMA, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <OrderForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
