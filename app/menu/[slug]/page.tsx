import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AllergenTags from "@/components/menu/AllergenTags";
import CrossSection from "@/components/menu/CrossSection";
import FlavorFaqs from "@/components/menu/FlavorFaqs";
import FlavorMedia from "@/components/menu/FlavorMedia";
import OtherFlavors from "@/components/menu/OtherFlavors";
import PriceTable from "@/components/menu/PriceTable";
import Reveal from "@/components/menu/Reveal";
import { flavorFaqs } from "@/components/menu/flavor-faqs";
import { addToBoxHref, categoryAndTier, tierLabel } from "@/components/menu/menu-data";
import { AllergenNotice } from "@/components/ui/AllergenNotice";
import { BUSINESS } from "@/lib/business";
import { FLAVORS, comesInSize, getFlavorBySlug, sizeNote } from "@/lib/flavors";
import { CUP_SIZES, PACK_RULES_LINE, PACK_SIZES } from "@/lib/packs";
import { eventsNaming } from "@/lib/page-photos";
import { flavorRoute } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { pageGraph } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

// One page per flavour in the registry (lib/flavors.ts); anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return FLAVORS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const flavor = getFlavorBySlug(slug);
  return flavor ? pageMetadata(flavorRoute(flavor)) : {};
}

const H2 = "font-display text-ink leading-[1.02] tracking-[-0.03em]";
const H2_SIZE = { fontSize: "clamp(32px, 4.2vw, 56px)" };
const KICKER = "font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70";
const TEXT_LINK =
  "inline-flex min-h-11 items-center gap-2 text-[15px] tracking-[-0.01em] text-ink underline decoration-ink/30 underline-offset-[5px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
/** Links inside the small mono fulfilment line. */
const MONO_LINK =
  "underline decoration-ink/30 underline-offset-[4px] transition-colors hover:text-ink hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default async function FlavorPage({ params }: Props) {
  const { slug } = await params;
  const flavor = getFlavorBySlug(slug);
  if (!flavor) notFound();

  const note = sizeNote(flavor);
  const sizes = CUP_SIZES.filter((s) => comesInSize(flavor, s.value));
  const faqs = flavorFaqs();
  const events = eventsNaming(flavor);

  return (
    <>
      {/* No FAQPage here: the questions are /faq's own, picked for this page. */}
      <JsonLd data={pageGraph(flavorRoute(flavor).path)!} />
      <Navbar />
      <main className="relative pt-28 md:pt-32">
        <nav aria-label="Breadcrumb" className="px-6 md:px-10 pt-6 md:pt-10">
          <ol className="mx-auto max-w-[1400px] flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-ink/70">
            <li>
              <Link href="/menu" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                Menu
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {flavor.name}
            </li>
          </ol>
        </nav>

        {/* Hero: name first on phones, photo left and text right on desktop. */}
        <header className="px-6 md:px-10 pt-4 pb-16 md:pb-24 hairline-bottom">
          <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-10">
            <div className="lg:col-start-7 lg:col-span-6 lg:row-start-1 lg:self-end lg:pt-10">
              <p className={KICKER}>{categoryAndTier(flavor)}</p>
              <h1
                className="mt-5 font-display text-ink leading-[0.94] tracking-[-0.04em]"
                style={{ fontSize: "clamp(48px, 8.4vw, 124px)" }}
              >
                {flavor.name}{" "}
                {/* Part of the h1 ("Dubai Chocolate dessert cups"), set small. */}
                <span className="mt-4 block font-mono text-[11px] leading-[1.6] tracking-[0.2em] uppercase text-ink/70">
                  dessert cups
                </span>
              </h1>
              <p
                className="mt-4 font-display italic text-[24px] md:text-[30px] leading-[1.2]"
                style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
              >
                {flavor.tagline}
              </p>
            </div>

            <FlavorMedia
              flavor={flavor}
              className="lg:col-start-1 lg:col-span-6 lg:row-start-1 lg:row-span-2"
            />

            <div className="lg:col-start-7 lg:col-span-6 lg:row-start-2 flex flex-col gap-7">
              <p className="max-w-[54ch] text-[17px] md:text-[19px] leading-[1.6] text-ink/80">{flavor.description}</p>
              {note ? <p className={KICKER}>{note}</p> : null}
              <AllergenTags flavor={flavor} />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={addToBoxHref(flavor)}
                  className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-ink px-7 py-4 text-[15px] tracking-[-0.01em] text-bone-soft transition-colors duration-500 ease-cinema hover:bg-cacao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <Plus size={16} aria-hidden="true" className="transition-transform duration-500 ease-cinema group-hover:rotate-90" />
                  <span>
                    Add<span className="sr-only"> {flavor.name}</span> to my box
                  </span>
                </Link>
                <Link href="#sizes" className={TEXT_LINK}>
                  Sizes and prices
                </Link>
              </div>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70 leading-[1.9]">
                Made the morning of pickup or delivery
                <br />
                <Link href="/dessert-cups-hamilton" className={MONO_LINK}>
                  {BUSINESS.fulfillment.pickup}
                </Link>{" "}
                <Link href="/dessert-cups-gta" className={MONO_LINK}>
                  {BUSINESS.fulfillment.delivery}
                </Link>
              </p>
            </div>
          </div>
        </header>

        {/* Cross-section */}
        <section aria-labelledby="layers-heading" className="px-6 md:px-10 py-16 md:py-24 hairline-bottom">
          <Reveal className="mx-auto max-w-[1400px] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className={KICKER}>Cross-section</p>
              <h2 id="layers-heading" className={`mt-5 ${H2}`} style={H2_SIZE}>
                Layer by layer.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[17px] leading-[1.6] text-ink/80">
                From the base of the cup to the top, the way {flavor.name} is built.
              </p>
              <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.6] text-ink/80">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/70">How it looks </span>
                <br />
                {flavor.visualSignature}
              </p>
            </div>
            <CrossSection flavor={flavor} size="full" className="lg:col-span-7" />
          </Reveal>
        </section>

        {/* Sizes and prices */}
        <section id="sizes" aria-labelledby="sizes-heading" className="scroll-mt-28 px-6 md:px-10 py-16 md:py-24 hairline-bottom">
          <Reveal className="mx-auto max-w-[1400px] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className={KICKER}>{tierLabel(flavor)} flavour</p>
              <h2 id="sizes-heading" className={`mt-5 ${H2}`} style={H2_SIZE}>
                Sizes and prices.
              </h2>
              <ul className="mt-6 flex flex-col gap-2 text-[17px] leading-[1.5] text-ink/80">
                {sizes.map((s) => (
                  <li key={s.value}>
                    <span className="text-ink">{s.label}</span>, {s.sub.replace(" · ", ", ")}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.6] text-ink/80">
                Classic and Premium flavours mix freely in the same box. In a mixed box, each cup is
                priced at its own tier&apos;s rate.
              </p>
              {/* The event guides whose copy names this flavour (lib/page-photos.ts). */}
              {events.length ? (
                <div className="mt-8">
                  <p className={KICKER}>In our event guides</p>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    {events.map((e) => (
                      <li key={e.slug}>
                        <Link href={`/events/${e.slug}`} className={TEXT_LINK}>
                          {e.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-7">
              <PriceTable flavor={flavor} />
              <div className="mt-8">
                <p className={KICKER}>Start a box with {flavor.name}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {PACK_SIZES.map((pack) => (
                    <li key={pack}>
                      <Link
                        href={addToBoxHref(flavor, pack)}
                        className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-5 text-[15px] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        {pack} cups<span className="sr-only"> with {flavor.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-8 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70 leading-[1.8]">
                {PACK_RULES_LINE}
              </p>
            </div>
          </Reveal>
        </section>

        {/* Allergens */}
        <section aria-labelledby="allergens-heading" className="px-6 md:px-10 py-16 md:py-24 hairline-bottom">
          <Reveal className="mx-auto max-w-[1400px] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className={KICKER}>Before you order</p>
              <h2 id="allergens-heading" className={`mt-5 ${H2}`} style={H2_SIZE}>
                Allergens.
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-8">
              <AllergenTags flavor={flavor} />
              <div className="rounded-card bg-bone-soft p-6 md:p-8 text-ink">
                <AllergenNotice />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Questions */}
        {faqs.length ? (
          <section aria-labelledby="faq-heading" className="px-6 md:px-10 py-16 md:py-24 hairline-bottom">
            <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <p className={KICKER}>Questions</p>
                <h2 id="faq-heading" className={`mt-5 ${H2}`} style={H2_SIZE}>
                  Good to know.
                </h2>
                <Link href="/faq" className={`mt-6 ${TEXT_LINK}`}>
                  All questions and answers
                </Link>
              </div>
              <FlavorFaqs faqs={faqs} className="lg:col-span-7" />
            </div>
          </section>
        ) : null}

        {/* The rest of the menu */}
        <section aria-labelledby="more-heading" className="px-6 md:px-10 py-16 md:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-12">
              <div>
                <p className={KICKER}>The rest of the lineup</p>
                <h2 id="more-heading" className={`mt-5 ${H2}`} style={H2_SIZE}>
                  More flavours.
                </h2>
              </div>
              <Link href="/menu" className={TEXT_LINK}>
                <ArrowLeft size={16} aria-hidden="true" />
                Back to the full menu
              </Link>
            </div>
            <OtherFlavors flavor={flavor} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
