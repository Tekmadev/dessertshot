"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller, type FieldErrors, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ALLERGENS, allergenNoticeText } from "@/lib/claims";
import { BUSINESS, mailtoLink } from "@/lib/business";
import { copy } from "@/lib/copy";
import { EVENT_TYPES, OTHER_EVENT_VALUE } from "@/lib/events";
import { CLASSIC_FLAVORS, PREMIUM_FLAVORS, treeNutFlavorNames, type Flavor } from "@/lib/flavors";
import {
  LAST_ORDER_STORAGE_KEY,
  toStoredOrder,
  type OrderApiFailure,
  type OrderApiResponse,
} from "@/lib/order-api";
import {
  ORDER_PREFILL_EVENT,
  fitItemsToPack,
  hasPrefill,
  parseOrderPrefill,
  prefilledItems,
  type OrderPrefill,
} from "@/lib/order-prefill";
import { orderSchema, type OrderFormValues, type OrderItem } from "@/lib/order-schema";
import { formatCad } from "@/lib/order-summary";
import { MAX_DAYS_AHEAD, addDays, isSaturday, orderTiming, torontoToday } from "@/lib/order-timing";
import { CUP_SIZES, PACK_SIZES } from "@/lib/packs";
import {
  MIN_CUPS_PER_FLAVOR,
  calcMixTotal,
  maxFlavorsForPack,
  perCupPrice,
  type PackQty,
} from "@/lib/pricing";

const FLAVOR_GROUPS = [
  { label: "Classic", tier: "classic" as const, list: CLASSIC_FLAVORS },
  { label: "Premium", tier: "premium" as const, list: PREMIUM_FLAVORS },
];

const ALLERGEN_NOTICE = allergenNoticeText(treeNutFlavorNames());

// The current minute, read only in the browser: the server render has no
// "today", so the date limits and the notice note appear after hydration.
const subscribeToMinutes = (onChange: () => void) => {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinuteOnServer = () => null;

function useMinuteClock(): Date | null {
  const minute = useSyncExternalStore(subscribeToMinutes, currentMinute, noMinuteOnServer);
  return minute === null ? null : new Date(minute * 60_000);
}

type SendState = "idle" | "sending" | "sent";

export default function OrderForm() {
  const router = useRouter();
  const [sendState, setSendState] = useState<SendState>("idle");
  const [failure, setFailure] = useState<OrderApiFailure["error"] | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<string | undefined>(undefined);
  // One id per filled-in form, kept for a retry after a lost response so the
  // server can tell it's the same order; changing the form drops it.
  const requestIdRef = useRef<string | null>(null);
  const sentValuesRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const flavoursRef = useRef<HTMLDivElement>(null);
  const toggleRefs = useRef(new Map<string, HTMLButtonElement>());
  const now = useMinuteClock();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    getFieldState,
    trigger,
    setError,
    subscribe,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      cupSize: "5oz",
      packQty: "24",
      items: [],
      fulfillment: "pickup",
      eventType: "",
      date: "",
    },
  });

  const [cupSize, packQty, watchedItems, fulfillment, date] = useWatch({
    control,
    name: ["cupSize", "packQty", "items", "fulfillment", "date"],
  });
  const items = watchedItems ?? [];

  const packSize = Number(packQty) as PackQty;
  const totalCups = items.reduce((sum, i) => sum + i.count, 0);
  const remaining = packSize - totalCups;
  const maxFlavors = maxFlavorsForPack(packSize);
  const atFlavorLimit = items.length >= maxFlavors;
  const price = calcMixTotal(cupSize, packSize, items);

  const today = now ? torontoToday(now) : undefined;
  const timing = now && /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? orderTiming(date, now) : null;
  const deliveryNotSaturday =
    fulfillment === "delivery" && Boolean(timing) && timing !== "past" && !isSaturday(date);

  const getItem = (id: string) => items.find((i) => i.id === id);

  // A smaller pack trims the box to fit rather than emptying it.
  const changePack = useCallback(
    (next: PackQty) => {
      setValue("packQty", String(next) as OrderFormValues["packQty"]);
      setValue("items", fitItemsToPack(getValues("items") ?? [], next));
      // Re-check an existing "must total N" message against the new pack.
      if (getFieldState("items").error) void trigger("items");
    },
    [getFieldState, getValues, setValue, trigger]
  );

  const applyPrefill = useCallback(
    (prefill: OrderPrefill) => {
      if (prefill.size) setValue("cupSize", prefill.size);
      if (prefill.pack) changePack(prefill.pack);
      if (prefill.flavours?.length) {
        const pack = prefill.pack ?? (Number(getValues("packQty")) as PackQty);
        setValue("items", prefilledItems(prefill.flavours, pack));
      }
      if (prefill.event) setValue("eventType", prefill.event);
    },
    [changePack, getValues, setValue]
  );

  // Deep links (/order?pack=48&flavour=dubai) and same-page pack buttons.
  useEffect(() => {
    sourceRef.current = `${window.location.pathname}${window.location.search}`.slice(0, 300);
    const prefill = parseOrderPrefill(window.location.search);
    if (hasPrefill(prefill)) {
      applyPrefill(prefill);
      formRef.current?.scrollIntoView({ block: "start" });
    }
    const onPrefill = (e: Event) => applyPrefill((e as CustomEvent<OrderPrefill>).detail);
    window.addEventListener(ORDER_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(ORDER_PREFILL_EVENT, onPrefill);
  }, [applyPrefill]);

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        // Fires on every set, even a re-click of the current choice, so
        // compare with what was sent rather than dropping the id outright.
        callback: ({ values }) => {
          if (requestIdRef.current && JSON.stringify(values) !== sentValuesRef.current) {
            requestIdRef.current = null;
          }
        },
      }),
    [subscribe]
  );

  const addFlavor = (f: Flavor) => {
    if (getItem(f.id) || atFlavorLimit || remaining < MIN_CUPS_PER_FLAVOR) return;
    const next: OrderItem = { id: f.id, name: f.name, tier: f.tier, count: MIN_CUPS_PER_FLAVOR };
    setValue("items", [...items, next], { shouldValidate: Boolean(errors.items) });
  };

  const removeFlavor = (id: string) => {
    setValue("items", items.filter((i) => i.id !== id), { shouldValidate: Boolean(errors.items) });
  };

  const stepCount = (id: string, delta: number) => {
    const it = getItem(id);
    if (!it) return;
    const next = it.count + delta;
    if (next < MIN_CUPS_PER_FLAVOR) {
      // The stepper is about to unmount; keep keyboard focus on this flavour.
      toggleRefs.current.get(id)?.focus();
      return removeFlavor(id);
    }
    if (delta > 0 && remaining < MIN_CUPS_PER_FLAVOR) return;
    setValue(
      "items",
      items.map((i) => (i.id === id ? { ...i, count: next } : i)),
      { shouldValidate: Boolean(errors.items) }
    );
  };

  const onSubmit = async (data: OrderFormValues) => {
    setSendState("sending");
    setFailure(null);
    requestIdRef.current ??= typeof crypto.randomUUID === "function" ? crypto.randomUUID() : null;
    sentValuesRef.current = JSON.stringify(getValues());
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          requestId: requestIdRef.current ?? undefined,
          source: sourceRef.current,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      const body = (await res.json().catch(() => null)) as OrderApiResponse | null;

      if (body?.ok) {
        try {
          sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(toStoredOrder(body, Date.now())));
        } catch {
          // Private browsing can block storage; the thanks page still confirms.
        }
        setSendState("sent");
        router.push("/order/thanks");
        return;
      }

      // A definite answer means nothing was kept, so a resend is a new order.
      // No answer (a dropped connection) keeps the id: the order may be saved.
      if (body) requestIdRef.current = null;
      if (body?.error === "invalid" && body.issues?.length) {
        for (const issue of body.issues) {
          setError((issue.path || "root") as Path<OrderFormValues>, { message: issue.message });
        }
      }
      setFailure(body?.error ?? "server");
    } catch {
      setFailure("server");
    }
    setSendState("idle");
  };

  // The flavour box isn't a focusable field, so point people at it when it's
  // the only thing wrong (other errors get focus from react-hook-form).
  const onInvalid = (errs: FieldErrors<OrderFormValues>) => {
    setFailure("invalid");
    if (errs.items && Object.keys(errs).length === 1) {
      flavoursRef.current?.scrollIntoView({ block: "start" });
      flavoursRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <form
      ref={formRef}
      id="order-form"
      onSubmit={(e) => handleSubmit(onSubmit, onInvalid)(e)}
      noValidate
      className="flex flex-col gap-8 scroll-mt-28"
    >
      {/* ── Cup size ── */}
      <FormSection label="Cup size">
        <Controller
          name="cupSize"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {CUP_SIZES.map((s) => (
                <ChoiceButton
                  key={s.value}
                  active={field.value === s.value}
                  onClick={() => field.onChange(s.value)}
                  label={s.label}
                  sub={s.sub}
                />
              ))}
            </div>
          )}
        />
      </FormSection>

      {/* ── Pack size ── */}
      <FormSection label="Pack size">
        <div className="flex gap-3">
          {PACK_SIZES.map((q) => {
            const active = packSize === q;
            return (
              <button
                key={q}
                type="button"
                aria-pressed={active}
                onClick={() => changePack(q)}
                className="flex-1 py-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-400 ease-cinema"
                style={{
                  backgroundColor: active ? "var(--color-ink)" : "var(--color-bone-soft)",
                  color: active ? "var(--color-bone-soft)" : "var(--color-ink)",
                }}
              >
                {q} cups
              </button>
            );
          })}
        </div>
      </FormSection>

      {/* ── Flavour mix (Classic + Premium together) ── */}
      <div ref={flavoursRef} tabIndex={-1} className="scroll-mt-28 outline-none">
      <FormSection label="Flavours" error={errors.items?.message}>
        <div className="flex flex-col gap-5">
          {/* Cup tracker */}
          <div
            className="flex items-center justify-between gap-4 p-4 hairline-top hairline-bottom"
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
              aria-live="polite"
              className="font-mono text-[10px] tracking-[0.16em] uppercase text-right"
              style={{ color: remaining === 0 ? "var(--color-ink)" : "var(--color-ember)" }}
            >
              {remaining === 0
                ? "Pack complete"
                : atFlavorLimit
                ? `${remaining} cups left · add them to your ${maxFlavors} flavours`
                : `${remaining} cup${remaining === 1 ? "" : "s"} left`}
            </span>
          </div>

          {FLAVOR_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
                {group.label} · {formatCad(Math.round(perCupPrice(cupSize, group.tier, packSize) * 100) / 100)}/cup
              </span>
              {group.list.map((f) => {
                const it = getItem(f.id);
                const selected = Boolean(it);
                const canAdd = !selected && !atFlavorLimit && remaining >= MIN_CUPS_PER_FLAVOR;
                const allergens = f.allergens.map((a) => ALLERGENS[a].short).join(" · ");
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
                      ref={(el) => {
                        if (el) toggleRefs.current.set(f.id, el);
                        else toggleRefs.current.delete(f.id);
                      }}
                      onClick={() => (selected ? removeFlavor(f.id) : addFlavor(f))}
                      disabled={!selected && !canAdd}
                      aria-pressed={selected}
                      aria-label={`${f.name} (${allergens})`}
                      className="flex-1 min-w-0 text-left flex flex-col gap-0.5 disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      <span className="font-display text-[18px] tracking-[-0.02em]">{f.name}</span>
                      <span
                        className="font-mono text-[9px] tracking-[0.18em] uppercase"
                        style={{ opacity: selected ? 0.7 : 0.55 }}
                      >
                        {allergens}
                      </span>
                    </button>
                    {selected ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => stepCount(f.id, -MIN_CUPS_PER_FLAVOR)}
                          aria-label={`Fewer ${f.name} cups`}
                          className="w-11 h-11 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-[15px] leading-none"
                          style={{ backgroundColor: "var(--color-bone-soft)", color: "var(--color-ink)" }}
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
                          style={{ backgroundColor: "var(--color-ember)", color: "var(--color-bone-soft)" }}
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
            Minimum {MIN_CUPS_PER_FLAVOR} cups per flavour · up to {maxFlavors} flavours in a {packSize} pack.
            Mix Classic &amp; Premium freely. Want more flavours? Add another pack: send a second
            request, or tell us in your notes.
          </p>
          <p className="text-[13px] leading-[1.6] text-ink/60">{ALLERGEN_NOTICE}</p>
        </div>
      </FormSection>
      </div>

      {/* ── The event ── */}
      <div className="hairline-top pt-8 flex flex-col gap-6">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">Your event</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Date needed" error={errors.date?.message}>
            <input
              {...register("date")}
              type="date"
              min={today}
              max={today ? addDays(today, MAX_DAYS_AHEAD) : undefined}
              className="form-input"
              aria-describedby="order-timing-note"
            />
          </Field>
          <Field label="Event type (optional)" error={errors.eventType?.message}>
            <select {...register("eventType")} className="form-input">
              <option value="">Choose one</option>
              {EVENT_TYPES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
              <option value={OTHER_EVENT_VALUE}>Something else</option>
            </select>
          </Field>
        </div>

        <p
          id="order-timing-note"
          aria-live="polite"
          className="font-mono text-[9px] tracking-[0.16em] uppercase leading-[1.7] -mt-2"
          style={{ color: timing === "urgent" ? "var(--color-ember)" : "var(--color-ink-40)" }}
        >
          {timing === "urgent"
            ? copy.order.urgent
            : timing === "standard"
            ? copy.order.standard
            : copy.order.noticeDefault}
        </p>

        {/* Fulfillment — pickup (free) vs delivery (fee quoted on reply) */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">Fulfillment</span>
          <Controller
            name="fulfillment"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                <ChoiceButton
                  active={field.value === "pickup"}
                  onClick={() => field.onChange("pickup")}
                  label="Pickup"
                  sub="Free · Hamilton"
                />
                <ChoiceButton
                  active={field.value === "delivery"}
                  onClick={() => field.onChange("delivery")}
                  label="Delivery"
                  sub="Saturdays · GTA"
                  accent
                />
              </div>
            )}
          />
          {/* Mounted before its text appears, so screen readers announce it. */}
          <p role="status" aria-live="polite" className="text-[14px] leading-[1.6] text-ink/75 empty:-mt-3">
            {deliveryNotSaturday ? copy.order.notSaturday : ""}
          </p>
          {fulfillment === "delivery" ? (
            <div className="flex flex-col gap-4">
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase leading-[1.7] text-ember">
                {copy.order.deliveryFee}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <Field label="Delivery address" error={errors.deliveryAddress?.message}>
                    <input
                      {...register("deliveryAddress")}
                      maxLength={300}
                      autoComplete="street-address"
                      className="form-input"
                      placeholder="Street and city"
                    />
                  </Field>
                </div>
                <Field label="Postal code" error={errors.deliveryPostalCode?.message}>
                  <input
                    {...register("deliveryPostalCode")}
                    maxLength={10}
                    autoComplete="postal-code"
                    autoCapitalize="characters"
                    className="form-input uppercase"
                    placeholder="L8P 4R5"
                  />
                </Field>
              </div>
            </div>
          ) : (
            <p className="font-mono text-[9px] tracking-[0.16em] uppercase leading-[1.7] text-ink/45">
              {copy.order.pickup}
            </p>
          )}
        </div>
      </div>

      {/* ── Contact ── */}
      <div className="hairline-top pt-8 flex flex-col gap-6">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/45">Your details</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register("name")}
              maxLength={120}
              autoComplete="name"
              className="form-input"
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              maxLength={254}
              autoComplete="email"
              className="form-input"
              placeholder="you@email.com"
            />
          </Field>
        </div>

        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            maxLength={40}
            autoComplete="tel"
            className="form-input"
            placeholder="(xxx) xxx-xxxx"
          />
        </Field>

        <Field label="Notes (optional)" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            maxLength={2000}
            className="form-input"
            placeholder="Allergies, event details, a custom label, anything we should know"
            style={{ resize: "vertical" }}
          />
        </Field>

        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
          <label>
            Leave this empty
            <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
      </div>

      {/* ── Total + submit ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 hairline-top pt-6">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
            {copy.order.totalLabel}
          </span>
          <span className="font-display text-[36px] tracking-[-0.035em] text-ink leading-tight tabular-nums">
            {formatCad(price)}
          </span>
          {timing === "urgent" || fulfillment === "delivery" ? (
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase mt-1 text-ember">
              {timing === "urgent" && fulfillment === "delivery"
                ? "+ rush & delivery fees, confirmed on reply"
                : timing === "urgent"
                ? "+ rush fee, confirmed on reply"
                : "+ delivery fee, quoted on reply"}
            </span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={sendState !== "idle"}
          className="w-full sm:flex-1 min-w-0 group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full text-[15px] tracking-[-0.01em] text-bone-soft transition-all duration-500 ease-cinema disabled:opacity-60"
          style={{ backgroundColor: "var(--color-ember)" }}
        >
          <span>{sendState === "idle" ? "Send order request" : "Sending…"}</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
            Confirmed within the day
          </span>
        </button>
      </div>

      {failure ? (
        <p role="alert" className="text-[14px] leading-[1.6] text-ember">
          {failure === "invalid" ? (
            "Some details need another look. Check the highlighted fields above."
          ) : failure === "rate-limited" ? (
            <>
              We&apos;ve had several requests from you in a short time. Please wait a little and try
              again, or email us at <a className="underline" href={mailtoLink}>{BUSINESS.email}</a>.
            </>
          ) : (
            <>
              We couldn&apos;t send your request just now. Please try again in a moment, or email your
              order to <a className="underline" href={mailtoLink}>{BUSINESS.email}</a>.
            </>
          )}
        </p>
      ) : null}

    </form>
  );
}

function ChoiceButton({
  active,
  onClick,
  label,
  sub,
  accent = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="flex flex-col items-start gap-1 p-4 text-left transition-all duration-400 ease-cinema hairline-top hairline-bottom"
      style={{
        backgroundColor: active
          ? accent
            ? "var(--color-ember)"
            : "var(--color-ink)"
          : "var(--color-bone-soft)",
        color: active ? "var(--color-bone-soft)" : "var(--color-ink)",
      }}
    >
      <span className="font-display text-[20px] tracking-[-0.025em] leading-tight">{label}</span>
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ opacity: active ? 0.7 : 0.45 }}>
        {sub}
      </span>
    </button>
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
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember">
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
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/55">{label}</span>
      {children}
      {error ? (
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember">{error}</span>
      ) : null}
    </label>
  );
}
