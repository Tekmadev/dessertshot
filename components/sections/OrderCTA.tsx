"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";
import {
  copy,
  CLASSIC_FLAVORS,
  PREMIUM_FLAVORS,
  MIN_CUPS_PER_FLAVOR,
  maxFlavorsForPack,
  perCupPrice,
  calcMixTotal,
  type PackQty,
} from "@/lib/copy";
import { EASE_CINEMA } from "@/lib/constants";
import { BUSINESS, mailtoLink } from "@/lib/business";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

const flavorItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(["classic", "premium"]),
  count: z.number().int(),
});

const schema = z
  .object({
    cupSize: z.enum(["2oz", "5oz"]),
    packQty: z.enum(["24", "48", "96"]),
    items: z.array(flavorItemSchema).min(1, "Select at least one flavour"),
    urgency: z.enum(["standard", "urgent"]),
    fulfillment: z.enum(["pickup", "delivery"]),
    name: z.string().min(2, "Please enter your full name"),
    email: z.email("Please enter a valid email"),
    phone: z.string().optional(),
    date: z.string().min(1, "Please select a desired date"),
    notes: z.string().optional(),
    deliveryAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const packSize = parseInt(data.packQty, 10);
    const totalCups = data.items.reduce((sum, i) => sum + i.count, 0);
    if (data.items.some((i) => i.count < MIN_CUPS_PER_FLAVOR || i.count % MIN_CUPS_PER_FLAVOR !== 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: `Each flavour needs at least ${MIN_CUPS_PER_FLAVOR} cups, in multiples of ${MIN_CUPS_PER_FLAVOR}`,
      });
    }
    if (data.items.length > packSize / MIN_CUPS_PER_FLAVOR) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: `A ${packSize} pack holds at most ${packSize / MIN_CUPS_PER_FLAVOR} flavours`,
      });
    }
    if (totalCups !== packSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: `Cup counts must total ${packSize} (currently ${totalCups})`,
      });
    }
    if (data.fulfillment === "delivery" && !data.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Add a delivery address so we can quote the fee",
      });
    }
  });

type FormData = z.infer<typeof schema>;
type FlavorItem = z.infer<typeof flavorItemSchema>;

const CUP_SIZES: { value: "2oz" | "5oz"; label: string; sub: string }[] = [
  { value: "2oz", label: "Mini Shots", sub: "2 oz · tasting size" },
  { value: "5oz", label: "Dessert Cups", sub: "5 oz · full serving" },
];

const PACK_QTYS: { value: "24" | "48" | "96"; label: string }[] = [
  { value: "24", label: "24 cups" },
  { value: "48", label: "48 cups" },
  { value: "96", label: "96 cups" },
];

export default function OrderCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cupSize: "5oz",
      packQty: "24",
      items: [],
      urgency: "standard",
      fulfillment: "pickup",
    },
  });

  const cupSize = watch("cupSize");
  const packQty = watch("packQty");
  const items = watch("items") ?? [];
  const urgency = watch("urgency");
  const fulfillment = watch("fulfillment");

  const packSize = parseInt(packQty, 10) as PackQty;
  const totalCups = items.reduce((sum, i) => sum + i.count, 0);
  const remaining = packSize - totalCups;
  const maxFlavors = maxFlavorsForPack(packSize);
  const price = calcMixTotal(cupSize, packSize, items);

  const getItem = (id: string) => items.find((i) => i.id === id);

  const addFlavor = (f: { id: string; name: string; tier: "classic" | "premium" }) => {
    if (getItem(f.id)) return;
    if (items.length >= maxFlavors) return; // pack already at its flavour limit
    if (remaining < MIN_CUPS_PER_FLAVOR) return; // not enough cups left for another flavour
    const next: FlavorItem = { id: f.id, name: f.name, tier: f.tier, count: MIN_CUPS_PER_FLAVOR };
    setValue("items", [...items, next], { shouldValidate: true });
  };

  const removeFlavor = (id: string) => {
    setValue("items", items.filter((i) => i.id !== id), { shouldValidate: true });
  };

  const stepCount = (id: string, delta: number) => {
    const it = getItem(id);
    if (!it) return;
    const next = it.count + delta;
    if (next < MIN_CUPS_PER_FLAVOR) {
      removeFlavor(id);
      return;
    }
    if (delta > 0 && remaining < MIN_CUPS_PER_FLAVOR) return; // no cups left to add
    setValue(
      "items",
      items.map((i) => (i.id === id ? { ...i, count: next } : i)),
      { shouldValidate: true }
    );
  };

  // Reset the mix when the pack size changes so counts can't exceed the new pack.
  const handlePackChange = (q: "24" | "48" | "96") => {
    setValue("packQty", q, { shouldValidate: true });
    setValue("items", [], { shouldValidate: false });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage(null);

    const hasClassic = data.items.some((i) => i.tier === "classic");
    const hasPremium = data.items.some((i) => i.tier === "premium");
    const tierLabel = hasClassic && hasPremium ? "Mixed" : hasPremium ? "Premium" : "Classic";
    const flavorSummary = data.items.map((i) => `${i.name} ×${i.count}`).join(", ");
    const packLine = `${data.packQty} cups · $${price}`;
    const fulfillmentLine =
      data.fulfillment === "delivery"
        ? `🚐 Delivery across the GTA (delivery fee applies) — ${data.deliveryAddress?.trim() || "address to confirm"}`
        : "Pickup in Hamilton (free)";

    const dbPromise = (async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          console.error("Order API error:", res.status, body);
          return { ok: false as const };
        }
        const json = (await res.json().catch(() => null)) as { orderId?: string } | null;
        return { ok: true as const, orderId: json?.orderId };
      } catch (e) {
        console.error("Order API exception:", e);
        return { ok: false as const };
      }
    })();

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const toEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? BUSINESS.email;

    const emailConfigured = Boolean(serviceId && templateId && publicKey);

    const emailPromise = emailConfigured
      ? emailjs
          .send(
            serviceId!,
            templateId!,
            {
              to_email: toEmail,
              from_name: data.name,
              from_email: data.email,
              phone: data.phone || "—",
              cup_size: `${data.cupSize} ${data.cupSize === "2oz" ? "Mini Shots" : "Dessert Cups"}`,
              tier: tierLabel,
              package_size: packLine,
              urgency:
                data.urgency === "urgent"
                  ? "⚡ URGENT — needs it in under 48 hours (rush fee applies)"
                  : "Standard — 48 hours+ notice",
              fulfillment: fulfillmentLine,
              flavors: flavorSummary,
              desired_date: data.date,
              notes: data.notes || "—",
              reply_to: data.email,
            },
            { publicKey: publicKey! }
          )
          .then(() => ({ ok: true as const }))
          .catch((e) => {
            console.error("EmailJS error:", e);
            return { ok: false as const };
          })
      : Promise.resolve({ ok: false as const, skipped: true });

    const [dbResult, emailResult] = await Promise.all([dbPromise, emailPromise]);

    if (dbResult.ok) {
      setSubmitted(true);
      if (emailConfigured && !emailResult.ok) {
        console.warn("Order saved but notification email failed.");
      }
    } else if (emailResult.ok) {
      setSubmitted(true);
      console.warn("Email sent but database write failed. Check Supabase logs.");
    } else {
      setErrorMessage(
        "Something went wrong sending your order. Please try again, or reach us directly at " +
          BUSINESS.email +
          "."
      );
    }
    setLoading(false);
  };

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
                target="_blank"
                rel="noopener noreferrer"
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
                href={BUSINESS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 hairline-bottom py-5"
              >
                <div className="flex items-center gap-4">
                  <FacebookIcon className="w-5 h-5 text-ink" />
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
                      Facebook
                    </div>
                    <div className="font-display text-[20px] tracking-[-0.02em] text-ink">
                      {BUSINESS.facebook.handle}
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
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/45">
                    Email
                  </div>
                  <div className="font-display text-[20px] tracking-[-0.02em] text-ink truncate">
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
                className="p-12 md:p-16 flex flex-col gap-5 hairline-top hairline-bottom"
                style={{ backgroundColor: "var(--color-bone-soft)" }}
              >
                <CheckCircle size={36} strokeWidth={1.5} style={{ color: "var(--color-ember)" }} />
                <h3 className="font-display text-[40px] md:text-[56px] tracking-[-0.03em] leading-[0.98] text-ink">
                  Got it.
                </h3>
                <p className="text-[17px] leading-[1.55] text-ink/70 max-w-[44ch]">
                  We will confirm your order within the day. Check your email — the reply will come
                  from {BUSINESS.email}.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8"
              >
                {/* ── Step 1: Cup size ── */}
                <FormSection label="Cup size">
                  <Controller
                    name="cupSize"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-3">
                        {CUP_SIZES.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => field.onChange(s.value)}
                            className="flex flex-col items-start gap-1 p-4 text-left transition-all duration-400 ease-cinema hairline-top hairline-bottom"
                            style={{
                              backgroundColor:
                                field.value === s.value
                                  ? "var(--color-ink)"
                                  : "var(--color-bone-soft)",
                              color:
                                field.value === s.value
                                  ? "var(--color-bone-soft)"
                                  : "var(--color-ink)",
                            }}
                          >
                            <span className="font-display text-[22px] tracking-[-0.025em] leading-tight">
                              {s.label}
                            </span>
                            <span
                              className="font-mono text-[9px] tracking-[0.2em] uppercase"
                              style={{
                                opacity: field.value === s.value ? 0.6 : 0.45,
                              }}
                            >
                              {s.sub}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </FormSection>

                {/* ── Step 2: Quantity ── */}
                <FormSection label="Pack size">
                  <Controller
                    name="packQty"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {PACK_QTYS.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => handlePackChange(q.value)}
                            className="flex-1 py-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-400 ease-cinema"
                            style={{
                              backgroundColor:
                                field.value === q.value
                                  ? "var(--color-ink)"
                                  : "var(--color-bone-soft)",
                              color:
                                field.value === q.value
                                  ? "var(--color-bone-soft)"
                                  : "var(--color-ink)",
                            }}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </FormSection>

                {/* ── Step 3: Flavour mix (Classic + Premium together) ── */}
                <FormSection label="Flavours" error={errors.items?.message}>
                  <div className="flex flex-col gap-5">
                    {/* Cup tracker */}
                    <div
                      className="flex items-center justify-between p-4 hairline-top hairline-bottom"
                      style={{ backgroundColor: "var(--color-bone-soft)" }}
                    >
                      <div className="flex flex-col">
                        <span className="font-display text-[26px] tracking-[-0.03em] leading-none text-ink">
                          {totalCups}
                          <span className="text-ink/40"> / {packSize}</span>
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/45 mt-1">
                          cups selected
                        </span>
                      </div>
                      <span
                        className="font-mono text-[10px] tracking-[0.16em] uppercase"
                        style={{
                          color: remaining === 0 ? "var(--color-ink)" : "var(--color-ember)",
                        }}
                      >
                        {remaining === 0
                          ? "Pack complete"
                          : remaining > 0
                          ? `${remaining} cup${remaining === 1 ? "" : "s"} left`
                          : `${-remaining} cup${remaining === -1 ? "" : "s"} over`}
                      </span>
                    </div>

                    {/* Flavour groups */}
                    {(
                      [
                        { label: "Classic", tier: "classic" as const, list: CLASSIC_FLAVORS },
                        { label: "Premium", tier: "premium" as const, list: PREMIUM_FLAVORS },
                      ]
                    ).map((group) => (
                      <div key={group.label} className="flex flex-col gap-2">
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
                          {group.label} · $
                          {perCupPrice(cupSize, group.tier, packSize).toFixed(2)}/cup
                        </span>
                        {group.list.map((f) => {
                          const it = getItem(f.id);
                          const selected = Boolean(it);
                          const canAdd =
                            !selected &&
                            items.length < maxFlavors &&
                            remaining >= MIN_CUPS_PER_FLAVOR;
                          return (
                            <div
                              key={f.id}
                              className="flex items-center justify-between gap-3 p-3 transition-all duration-400 ease-cinema hairline-top"
                              style={{
                                backgroundColor: selected ? "var(--color-ink)" : "transparent",
                                color: selected ? "var(--color-bone-soft)" : "var(--color-ink)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => (selected ? removeFlavor(f.id) : addFlavor(f))}
                                disabled={!selected && !canAdd}
                                className="flex-1 min-w-0 text-left disabled:opacity-35 disabled:cursor-not-allowed"
                              >
                                <span className="font-display text-[18px] tracking-[-0.02em]">
                                  {f.name}
                                </span>
                              </button>
                              {selected ? (
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <button
                                    type="button"
                                    onClick={() => stepCount(f.id, -MIN_CUPS_PER_FLAVOR)}
                                    aria-label={`Fewer ${f.name} cups`}
                                    className="w-11 h-11 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-[15px] leading-none"
                                    style={{
                                      backgroundColor: "var(--color-bone-soft)",
                                      color: "var(--color-ink)",
                                    }}
                                  >
                                    −
                                  </button>
                                  <span className="font-mono text-[13px] tracking-[0.05em] w-8 text-center tabular-nums">
                                    {it!.count}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => stepCount(f.id, MIN_CUPS_PER_FLAVOR)}
                                    disabled={remaining < MIN_CUPS_PER_FLAVOR}
                                    aria-label={`More ${f.name} cups`}
                                    className="w-11 h-11 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-[15px] leading-none disabled:opacity-35"
                                    style={{
                                      backgroundColor: "var(--color-ember)",
                                      color: "var(--color-bone-soft)",
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-45">
                                  {canAdd ? "Add" : "Full"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink/40 leading-[1.7]">
                      Minimum {MIN_CUPS_PER_FLAVOR} cups per flavour · up to {maxFlavors} flavour
                      {maxFlavors === 1 ? "" : "s"} in a {packSize} pack. Mix Classic &amp;
                      Premium freely — need more flavours? Add another pack.
                    </p>
                  </div>
                </FormSection>

                {/* ── Contact ── */}
                <div className="hairline-top pt-8 flex flex-col gap-6">
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">
                    Your details
                  </div>

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
                    <Field label="Date needed" error={errors.date?.message}>
                      <input
                        {...register("date")}
                        type="date"
                        className="form-input"
                      />
                    </Field>
                  </div>

                  {/* Timing — standard vs urgent (rush fee quoted on reply) */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">
                      Timing
                    </span>
                    <Controller
                      name="urgency"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "standard" as const, label: "Standard", sub: "48 hours+ notice" },
                            { value: "urgent" as const, label: "Urgent", sub: "Under 48 hours" },
                          ].map((o) => {
                            const active = field.value === o.value;
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() => field.onChange(o.value)}
                                className="flex flex-col items-start gap-1 p-4 text-left transition-all duration-400 ease-cinema hairline-top hairline-bottom"
                                style={{
                                  backgroundColor: active
                                    ? o.value === "urgent"
                                      ? "var(--color-ember)"
                                      : "var(--color-ink)"
                                    : "var(--color-bone-soft)",
                                  color: active
                                    ? "var(--color-bone-soft)"
                                    : "var(--color-ink)",
                                }}
                              >
                                <span className="font-display text-[20px] tracking-[-0.025em] leading-tight">
                                  {o.label}
                                </span>
                                <span
                                  className="font-mono text-[9px] tracking-[0.2em] uppercase"
                                  style={{ opacity: active ? 0.7 : 0.45 }}
                                >
                                  {o.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    {urgency === "urgent" ? (
                      <p
                        className="font-mono text-[9px] tracking-[0.16em] uppercase leading-[1.7]"
                        style={{ color: "var(--color-ember)" }}
                      >
                        Under 48 hours — a rush fee applies. We&apos;ll confirm it when we reply.
                      </p>
                    ) : null}
                  </div>

                  {/* Fulfillment — pickup (free) vs delivery (fee quoted on reply) */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">
                      Fulfillment
                    </span>
                    <Controller
                      name="fulfillment"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "pickup" as const, label: "Pickup", sub: "Free · Hamilton" },
                            { value: "delivery" as const, label: "Delivery", sub: "+ fee · GTA" },
                          ].map((o) => {
                            const active = field.value === o.value;
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() => field.onChange(o.value)}
                                className="flex flex-col items-start gap-1 p-4 text-left transition-all duration-400 ease-cinema hairline-top hairline-bottom"
                                style={{
                                  backgroundColor: active
                                    ? o.value === "delivery"
                                      ? "var(--color-ember)"
                                      : "var(--color-ink)"
                                    : "var(--color-bone-soft)",
                                  color: active
                                    ? "var(--color-bone-soft)"
                                    : "var(--color-ink)",
                                }}
                              >
                                <span className="font-display text-[20px] tracking-[-0.025em] leading-tight">
                                  {o.label}
                                </span>
                                <span
                                  className="font-mono text-[9px] tracking-[0.2em] uppercase"
                                  style={{ opacity: active ? 0.7 : 0.45 }}
                                >
                                  {o.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    {fulfillment === "delivery" ? (
                      <div className="flex flex-col gap-4">
                        <p
                          className="font-mono text-[9px] tracking-[0.16em] uppercase leading-[1.7]"
                          style={{ color: "var(--color-ember)" }}
                        >
                          Delivery across the GTA — a delivery fee applies. We&apos;ll confirm it when we reply.
                        </p>
                        <Field
                          label="Delivery address"
                          error={errors.deliveryAddress?.message}
                        >
                          <input
                            {...register("deliveryAddress")}
                            className="form-input"
                            placeholder="Street, city, postal code"
                          />
                        </Field>
                      </div>
                    ) : null}
                  </div>

                  <Field label="Notes (optional)" error={undefined}>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      className="form-input"
                      placeholder="Flavour ratios, allergies, event details, anything we should know"
                      style={{ resize: "vertical" }}
                    />
                  </Field>
                </div>

                {/* Price + Submit */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 hairline-top pt-6">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
                      Total
                    </span>
                    <span className="font-display text-[36px] tracking-[-0.035em] text-ink leading-tight">
                      ${price}
                    </span>
                    {urgency === "urgent" || fulfillment === "delivery" ? (
                      <span
                        className="font-mono text-[9px] tracking-[0.16em] uppercase mt-1"
                        style={{ color: "var(--color-ember)" }}
                      >
                        {urgency === "urgent" && fulfillment === "delivery"
                          ? "+ rush & delivery fees on reply"
                          : urgency === "urgent"
                          ? "+ rush fee on reply"
                          : "+ delivery fee on reply"}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 min-w-0 group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] text-bone-soft transition-all duration-500 ease-cinema disabled:opacity-60"
                    style={{ backgroundColor: "var(--color-ember)" }}
                  >
                    <span>{loading ? "Sending…" : "Send order request"}</span>
                    <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                      {loading ? "…" : "Reply by tomorrow"}
                    </span>
                  </button>
                </div>

                {errorMessage ? (
                  <p
                    role="alert"
                    className="font-mono text-[11px] tracking-[0.05em] leading-[1.6] text-ember"
                  >
                    {errorMessage}
                  </p>
                ) : null}
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

function FormSection({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember">
          {error}
        </span>
      ) : null}
    </div>
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
