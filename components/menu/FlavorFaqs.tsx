import Prose from "@/components/content/Prose";
import type { Faq } from "./flavor-faqs";

/** A few FAQ entries (from the reviewed FAQ draft) as open/close disclosures. */
export default function FlavorFaqs({ faqs, className = "" }: { faqs: readonly Faq[]; className?: string }) {
  if (faqs.length === 0) return null;
  return (
    <div className={`flex flex-col ${className}`}>
      {faqs.map((f) => (
        <details key={f.q} className="group hairline-top last:border-b last:border-ink/15">
          <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-5 text-[17px] md:text-[18px] leading-[1.4] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
            <span>{f.q}</span>
            <span
              aria-hidden="true"
              className="mt-0.5 font-mono text-[18px] leading-none text-ember transition-transform duration-500 ease-cinema group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <Prose body={f.a} className="pb-6 text-[16px] md:text-[17px]" />
        </details>
      ))}
    </div>
  );
}
