import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Flavor } from "@/lib/flavors";
import { productPhoto } from "@/lib/media";
import AllergenTags from "./AllergenTags";
import CrossSection from "./CrossSection";
import PriceTable from "./PriceTable";
import Reveal from "./Reveal";
import { accentTint, addToBoxHref, categoryAndTier, pad2 } from "./menu-data";

/**
 * One flavour on /menu: photo, layers, allergens, sizes and per-cup prices,
 * "Add to my box" and a link to its own page. Photos alternate sides on
 * desktop. Server-rendered; only the reveal is client-side.
 */
export default function MenuEntry({
  flavor,
  index,
}: {
  flavor: Flavor;
  index: number;
}) {
  const photo = productPhoto(flavor);
  const flip = index % 2 === 1;
  const titleId = `${flavor.slug}-title`;

  return (
    <article
      id={flavor.slug}
      aria-labelledby={titleId}
      className="scroll-mt-28 hairline-top py-14 md:py-20 grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:gap-14 lg:items-center"
    >
      <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-card"
          style={{ background: accentTint(flavor.accent, 20) }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1400px) 540px, (min-width: 1024px) 38vw, (min-width: 768px) 80vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute left-4 top-4 rounded-full bg-cream/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-ink tabular-nums"
          >
            {pad2(index + 1)}
          </span>
        </div>
      </div>

      <Reveal className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">
          {categoryAndTier(flavor)}
        </p>
        <h2
          id={titleId}
          className="mt-4 font-display text-ink leading-[0.98] tracking-[-0.035em]"
          style={{ fontSize: "clamp(38px, 5.4vw, 76px)" }}
        >
          {flavor.name}
        </h2>
        <p
          className="mt-3 font-display italic text-[24px] md:text-[28px] leading-[1.25]"
          style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
        >
          {flavor.tagline}
        </p>
        <p className="mt-5 max-w-[56ch] text-[16px] md:text-[17px] leading-[1.6] text-ink/80">{flavor.description}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <CrossSection flavor={flavor} />
          <PriceTable flavor={flavor} />
        </div>

        <AllergenTags flavor={flavor} className="mt-8" />

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={addToBoxHref(flavor)}
            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[15px] tracking-[-0.01em] text-bone-soft transition-colors duration-500 ease-cinema hover:bg-cacao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Plus size={16} aria-hidden="true" className="transition-transform duration-500 ease-cinema group-hover:rotate-90" />
            <span>
              Add<span className="sr-only"> {flavor.name}</span> to my box
            </span>
          </Link>
          <Link
            href={`/menu/${flavor.slug}`}
            className="group inline-flex min-h-11 items-center gap-1.5 text-[15px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[5px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            More on {flavor.name}
            <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-500 ease-cinema group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
