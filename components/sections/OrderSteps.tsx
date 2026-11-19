import { copy } from "@/lib/copy";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "How ordering works", just before the order form on / and /order: the four
 * steps from request to cups, with the 50% deposit marked as the step that
 * confirms an order. No payment method: that's still open with the owner
 * (CONTENT-REVIEW.md), so the copy says it comes with our reply.
 */
export default function OrderSteps() {
  const s = copy.orderSteps;
  return (
    <section aria-labelledby="order-steps-heading" className="relative bg-bone-soft py-20 hairline-top sm:py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end md:gap-16">
          <div className="md:col-span-7">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">{s.kicker}</p>
            <h2
              id="order-steps-heading"
              className="font-display leading-[0.98] tracking-[-0.035em] text-ink"
              style={{ fontSize: "clamp(36px, 5vw, 76px)" }}
            >
              {s.heading}{" "}
              <em className="italic" style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}>
                {s.headingItalic}
              </em>
            </h2>
          </div>
          <p className="max-w-[44ch] text-[17px] leading-[1.55] text-ink/80 md:col-span-5 md:text-[19px]">{s.body}</p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-6">
          {s.steps.map((step, i) => (
            <li
              key={step.title}
              className={`relative flex flex-col gap-3 rounded-card p-6 md:p-7 ${
                step.required ? "bg-bone ring-2 ring-berry" : "bg-bone ring-1 ring-ink/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">{pad(i + 1)}</span>
                {step.required ? (
                  <span className="rounded-full bg-berry px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-soft">
                    Required
                  </span>
                ) : null}
              </div>
              <h3 className="font-display text-[24px] leading-[1.1] tracking-[-0.02em] text-ink md:text-[26px]">{step.title}</h3>
              <p className="text-[15px] leading-[1.55] text-ink/80">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
