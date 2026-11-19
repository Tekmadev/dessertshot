"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { ArrowUpRight, Layers, Plus, X } from "lucide-react";
import { sizeNote, type Flavor } from "@/lib/flavors";
import { productPhoto } from "@/lib/media";
import AllergenTags from "./AllergenTags";
import CrossSection from "./CrossSection";
import { accentTint, addToBoxHref, pad2, tierLabel } from "./menu-data";

/**
 * One flavour in the homepage lineup: photo, name, tier, tagline, size note,
 * allergens, a cross-section toggle (layers bottom → top) and "Add to my box".
 * Tinted to the flavour's accent; text stays ink on a near-cream tint (AA).
 * Phones: a swipe card. Desktop: a wide card in the sticky stack.
 */
export default function LineupCard({
  flavor,
  index,
  total,
}: {
  flavor: Flavor;
  index: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingId = useId();
  const photo = productPhoto(flavor);
  const note = sizeNote(flavor);
  const premium = flavor.tier === "premium";

  return (
    <article
      aria-labelledby={headingId}
      className="relative flex h-full flex-col overflow-hidden rounded-card border border-ink/10 lg:grid lg:grid-cols-12 lg:shadow-[0_-18px_40px_-28px_rgba(58,29,40,0.45)]"
      style={{ background: accentTint(flavor.accent, 9) }}
    >
      {/* Photo, flipping to the cross-section */}
      <div
        className="relative aspect-[4/5] shrink-0 lg:col-span-5 lg:aspect-auto lg:h-full"
        style={{ background: accentTint(flavor.accent, 20) }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1400px) 560px, (min-width: 1024px) 40vw, (min-width: 768px) 46vw, min(84vw, 24rem)"
          className={`object-cover transition-[opacity,transform] duration-700 ease-cinema ${
            open ? "scale-[1.03] opacity-0" : "scale-100 opacity-100"
          }`}
        />

        {/* The toggle comes before the panel it opens, so Tab reaches the layers right after it. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={`absolute bottom-3 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-500 ease-cinema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:bottom-5 lg:right-5 ${
            open ? "bg-ink text-bone-soft" : "bg-cream/95 text-ink hover:bg-cream"
          }`}
        >
          {open ? <X size={14} aria-hidden="true" /> : <Layers size={14} aria-hidden="true" />}
          <span>
            Layers<span className="sr-only"> of {flavor.name}</span>
          </span>
        </button>

        <div
          id={panelId}
          className={`absolute inset-0 flex flex-col overflow-y-auto overscroll-contain p-4 pb-14 sm:p-5 sm:pb-16 lg:p-8 lg:pb-20 transition-[opacity,transform,visibility] duration-500 ease-cinema ${
            open ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
          }`}
          style={{ background: accentTint(flavor.accent, 14) }}
        >
          {/* mt-auto, not justify-end: a long list must stay scrollable from its top. */}
          <CrossSection flavor={flavor} className="mt-auto" />
        </div>

        <span
          aria-hidden="true"
          className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-ink tabular-nums lg:left-5 lg:top-5"
        >
          {pad2(index + 1)} / {pad2(total)}
        </span>

      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6 lg:col-span-7 lg:gap-5 lg:p-10 xl:p-12">
        <div className="flex min-h-7 items-center justify-between gap-4">
          {/* Dubai's category is "Premium", same as its tier badge: say it once. */}
          {flavor.category !== tierLabel(flavor) ? (
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/70">{flavor.category}</p>
          ) : (
            <span />
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${
              premium ? "bg-ink text-bone-soft" : "border border-ink/30 text-ink"
            }`}
          >
            {premium ? <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-ember-soft" /> : null}
            {tierLabel(flavor)}
          </span>
        </div>

        <div>
          <h3
            id={headingId}
            className="font-display text-ink leading-[0.98] tracking-[-0.035em]"
            style={{ fontSize: "clamp(30px, 4.4vw, 64px)" }}
          >
            {flavor.name}
          </h3>
          <p className="mt-2 text-[16px] italic leading-[1.4] text-ink/80 lg:text-[19px]">{flavor.tagline}</p>
          {note ? (
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70">{note}</p>
          ) : null}
        </div>

        <AllergenTags flavor={flavor} />

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
          <Link
            href={addToBoxHref(flavor)}
            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-ink px-5 py-3 text-[15px] tracking-[-0.01em] text-bone-soft transition-colors duration-500 ease-cinema hover:bg-cacao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Plus
              size={16}
              aria-hidden="true"
              className="transition-transform duration-500 ease-cinema group-hover:rotate-90"
            />
            <span>
              Add<span className="sr-only"> {flavor.name}</span> to my box
            </span>
          </Link>
          <Link
            href={`/menu/${flavor.slug}`}
            className="group inline-flex min-h-11 items-center gap-1.5 text-[15px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[5px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Details<span className="sr-only"> on {flavor.name}</span>
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-500 ease-cinema group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
