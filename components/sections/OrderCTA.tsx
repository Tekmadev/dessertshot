"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";
import { copy } from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { BUSINESS, mailtoLink } from "@/lib/business";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().optional(),
  packageSize: z.enum(["1", "6", "12", "24"]),
  flavors: z.string().min(3, "Please describe your flavour preferences"),
  date: z.string().min(1, "Please select a desired date"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function OrderCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const apiPromise = fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch((e) => {
        console.error("Order API error:", e);
        return null;
      });

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      const toEmail =
        process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? BUSINESS.email;

      const packageLabels: Record<string, string> = {
        "1": "Single cup",
        "6": "6 cups",
        "12": "12 cups",
        "24": "24 cups",
      };

      const emailPromise =
        serviceId && templateId && publicKey
          ? emailjs
              .send(
                serviceId,
                templateId,
                {
                  to_email: toEmail,
                  from_name: data.name,
                  from_email: data.email,
                  phone: data.phone || "—",
                  package_size: packageLabels[data.packageSize] ?? data.packageSize,
                  flavors: data.flavors,
                  desired_date: data.date,
                  notes: data.notes || "—",
                  reply_to: data.email,
                },
                { publicKey }
              )
              .catch((e) => {
                console.error("EmailJS error:", e);
                return null;
              })
          : Promise.resolve(null);

      await Promise.all([apiPromise, emailPromise]);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      aria-label="Place an order"
      className="relative py-32 md:py-44 bg-bone hairline-top"
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
                className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/50 mb-6"
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
                className="group flex items-center justify-between gap-4 hairline-top hairline-bottom py-5"
              >
                <div className="flex items-center gap-4">
                  <InstagramIcon className="w-5 h-5 text-ink" />
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
                      Instagram
                    </div>
                    <div className="font-display text-[20px] tracking-[-0.02em] text-ink">
                      {BUSINESS.instagram.handle}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/45 group-hover:text-ember transition-colors">
                  Open
                </span>
              </a>
              <a
                href={mailtoLink}
                className="group flex items-center justify-between gap-4 hairline-bottom py-5"
              >
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
                    Email
                  </div>
                  <div className="font-display text-[20px] tracking-[-0.02em] text-ink">
                    {BUSINESS.email}
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/45 group-hover:text-ember transition-colors">
                  Send
                </span>
              </a>
            </div>

            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink/55 leading-[1.7]">
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
            {submitted ? (
              <div
                className="bg-bone-soft p-12 md:p-16 flex flex-col gap-5 hairline-top hairline-bottom"
                style={{ backgroundColor: "var(--color-bone-soft)" }}
              >
                <CheckCircle
                  size={36}
                  strokeWidth={1.5}
                  style={{ color: "var(--color-ember)" }}
                />
                <h3 className="font-display text-[40px] md:text-[56px] tracking-[-0.03em] leading-[0.98] text-ink">
                  Got it.
                </h3>
                <p className="text-[17px] leading-[1.55] text-ink/70 max-w-[44ch]">
                  We will confirm your order within the day. Check your email,
                  the reply will come from {BUSINESS.email}.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-bone-soft p-8 md:p-12 flex flex-col gap-7 hairline-top hairline-bottom"
                style={{ backgroundColor: "var(--color-bone-soft)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Name" error={errors.name?.message}>
                    <input
                      {...register("name")}
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <input
                      {...register("email")}
                      type="email"
                      className="form-input"
                      placeholder="you@email.com"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Phone (optional)" error={undefined}>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="form-input"
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </Field>
                  <Field label="Box size" error={undefined}>
                    <select {...register("packageSize")} className="form-input">
                      <option value="6">6 cups . $39</option>
                      <option value="12">12 cups . $72</option>
                      <option value="24">24 cups . $132</option>
                      <option value="1">Single cup . $7.50</option>
                    </select>
                  </Field>
                </div>

                <Field label="Flavours" error={errors.flavors?.message}>
                  <input
                    {...register("flavors")}
                    className="form-input"
                    placeholder="4 Mango, 4 Ferrero, 4 Dubai Chocolate"
                  />
                </Field>

                <Field label="Pickup date" error={errors.date?.message}>
                  <input
                    {...register("date")}
                    type="date"
                    className="form-input"
                  />
                </Field>

                <Field label="Notes (optional)" error={undefined}>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="form-input"
                    placeholder="Allergies, event details, anything we should know"
                    style={{ resize: "vertical" }}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] text-bone-soft transition-all duration-500 ease-cinema disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-ember)" }}
                >
                  <span>{loading ? "Sending" : "Send order request"}</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                    {loading ? "..." : "Reply by tomorrow"}
                  </span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--color-ink-15);
          color: var(--color-ink);
          font-family: var(--font-sans);
          font-size: 16px;
          letter-spacing: -0.005em;
          outline: none;
          transition: border-color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-input:focus {
          border-bottom-color: var(--color-ember);
        }
        .form-input::placeholder {
          color: var(--color-ink-40);
        }
        select.form-input {
          appearance: none;
          background: transparent;
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember">
          {error}
        </span>
      ) : null}
    </label>
  );
}
