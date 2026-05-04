"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

gsap.registerPlugin(ScrollTrigger);

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  packageSize: z.enum(["1", "6", "12", "24"]),
  flavors: z.string().min(3, "Please describe your flavour preferences"),
  date: z.string().min(1, "Please select a desired date"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function OrderCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useGSAP(
    () => {
      gsap.fromTo(leftRef.current, { opacity: 0, x: -50 }, {
        opacity: 1, x: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.fromTo(formRef.current, { opacity: 0, x: 50 }, {
        opacity: 1, x: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        delay: 0.15,
      });
    },
    { scope: sectionRef }
  );

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1.5px solid var(--color-border)",
    backgroundColor: "var(--color-cream)",
    color: "var(--color-ink)",
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: "0.4rem",
    color: "var(--color-ink-soft)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontFamily: "var(--font-body)",
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 px-6"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div ref={leftRef} className="flex flex-col gap-8">
            <div>
              <span
                className="inline-block text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
                style={{ color: "var(--color-amber-500)", backgroundColor: "var(--color-amber-100)", fontFamily: "var(--font-body)" }}
              >
                Place Your Order
              </span>
              <h2
                className="font-heading text-4xl md:text-5xl mb-4"
                style={{ color: "var(--color-choco-600)" }}
              >
                Let&apos;s make something{" "}
                <span className="italic" style={{ color: "var(--color-amber-500)" }}>
                  sweet
                </span>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Fill out the form with your order details and we&apos;ll be in
                touch within 24 hours to confirm your order and arrange pickup
                or delivery.
              </p>
            </div>

            {/* Contact options */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <InstagramIcon size={20} />,
                  label: "Instagram DM",
                  value: "@dessertshot.ca",
                  href: "https://instagram.com/dessertshot.ca",
                  color: "var(--color-strawberry)",
                },
                {
                  icon: <Send size={20} />,
                  label: "Email",
                  value: "hello@dessertshot.ca",
                  href: "mailto:hello@dessertshot.ca",
                  color: "var(--color-amber-500)",
                },
              ].map((opt) => (
                <a
                  key={opt.label}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-1"
                  style={{
                    backgroundColor: "var(--color-cream)",
                    border: "1.5px solid var(--color-border)",
                    boxShadow: "var(--shadow-warm)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${opt.color}18`, color: opt.color }}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                      {opt.label}
                    </div>
                    <div className="font-medium" style={{ color: "var(--color-choco-600)", fontFamily: "var(--font-body)" }}>
                      {opt.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Delivery note */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--color-amber-50)", border: "1.5px solid var(--color-amber-200)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-choco-500)", fontFamily: "var(--font-body)" }}>
                🚗 <strong>Delivery available</strong> across Hamilton and the Greater Toronto Area.
                <br />
                📦 <strong>Pickup</strong> available in Hamilton, Ontario.
                <br />
                ⏱️ Please allow <strong>48 hours notice</strong> for all orders.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div ref={formRef}>
            {submitted ? (
              <div
                className="rounded-3xl p-12 text-center flex flex-col items-center gap-4"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "1.5px solid var(--color-border)",
                  boxShadow: "var(--shadow-warm-lg)",
                }}
              >
                <CheckCircle size={56} style={{ color: "var(--color-pistachio)" }} />
                <h3 className="font-heading text-3xl" style={{ color: "var(--color-choco-600)" }}>
                  Order request sent!
                </h3>
                <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                  We&apos;ll reach out within 24 hours to confirm your order. Thank you! 🍮
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-3xl p-8 flex flex-col gap-5"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "1.5px solid var(--color-border)",
                  boxShadow: "var(--shadow-warm-lg)",
                }}
              >
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input {...register("name")} style={inputStyle} placeholder="Your name" />
                    {errors.name && <p className="text-xs mt-1" style={{ color: "var(--color-strawberry)" }}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input {...register("email")} type="email" style={inputStyle} placeholder="your@email.com" />
                    {errors.email && <p className="text-xs mt-1" style={{ color: "var(--color-strawberry)" }}>{errors.email.message}</p>}
                  </div>
                </div>

                {/* Phone + Package */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Phone (optional)</label>
                    <input {...register("phone")} type="tel" style={inputStyle} placeholder="(xxx) xxx-xxxx" />
                  </div>
                  <div>
                    <label style={labelStyle}>Package Size *</label>
                    <select {...register("packageSize")} style={inputStyle}>
                      <option value="1">1 Cup — $7.50</option>
                      <option value="6">6 Cups — $42.00</option>
                      <option value="12">12 Cups — $78.00</option>
                      <option value="24">24 Cups — $144.00</option>
                    </select>
                  </div>
                </div>

                {/* Flavors */}
                <div>
                  <label style={labelStyle}>Flavour Preferences *</label>
                  <input
                    {...register("flavors")}
                    style={inputStyle}
                    placeholder="e.g. 4x Mango, 4x Ferrero, 4x Dubai Chocolate"
                  />
                  {errors.flavors && <p className="text-xs mt-1" style={{ color: "var(--color-strawberry)" }}>{errors.flavors.message}</p>}
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Desired Date *</label>
                  <input {...register("date")} type="date" style={inputStyle} />
                  {errors.date && <p className="text-xs mt-1" style={{ color: "var(--color-strawberry)" }}>{errors.date.message}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Additional Notes</label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Allergies, event details, custom requests..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--color-amber-400)",
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "Sending..." : "Send Order Request →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
