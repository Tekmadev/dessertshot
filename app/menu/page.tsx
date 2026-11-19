import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Packages from "@/components/sections/Packages";
import LoopVideo from "@/components/media/LoopVideo";
import MenuEntry from "@/components/menu/MenuEntry";
import { AllergenNotice } from "@/components/ui/AllergenNotice";
import { FLAVORS } from "@/lib/flavors";
import { TRAY_VIDEO } from "@/lib/media";
import { PACK_RULES_LINE } from "@/lib/packs";
import { copy } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { pageGraph } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata(ROUTES.menu);

const INLINE_LINK =
  "text-ink underline decoration-ember/50 underline-offset-[3px] transition-colors hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default function MenuPage() {
  return (
    <>
      <JsonLd data={pageGraph(ROUTES.menu.path)!} />
      <Navbar />
      <main className="relative pt-28 md:pt-32">
        <header className="px-6 md:px-10 pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1
                className="font-display text-ink leading-[0.95] tracking-[-0.04em] max-w-[14ch]"
                style={{ fontSize: "clamp(44px, 9vw, 136px)" }}
              >
                <span className="mb-6 block font-mono text-[11px] leading-[1.6] tracking-[0.2em] uppercase text-ink/70">
                  {copy.menuPage.kicker}
                  <span className="sr-only">:</span>
                </span>{" "}
                {copy.menuPage.headingPre}{" "}
                <em
                  className="italic"
                  style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
                >
                  {copy.menuPage.headingItalic}
                </em>
              </h1>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <p className="max-w-[48ch] text-[17px] md:text-[19px] leading-[1.55] text-ink/80">
                Pick a flavour, build a mixed box, or browse the lineup before you order. Every flavour
                lists its layers from the bottom up, and Classic and Premium mix freely in the same box.
              </p>
              <p className="max-w-[52ch] text-[15px] leading-[1.6] text-ink/80">
                Prices are per cup at each pack size. In a mixed box, each cup is priced at its own
                tier&apos;s rate and the total is rounded to the nearest dollar.
              </p>
              <p className="max-w-[52ch] text-[15px] leading-[1.6] text-ink/80">
                Planning an event? See{" "}
                <Link href="/events" className={INLINE_LINK}>
                  dessert cups by event
                </Link>
                , with{" "}
                <Link href="/dessert-cups-hamilton" className={INLINE_LINK}>
                  pickup in Hamilton
                </Link>{" "}
                or{" "}
                <Link href="/dessert-cups-gta" className={INLINE_LINK}>
                  Saturday delivery across the GTA
                </Link>
                .
              </p>
            </div>
          </div>

          <nav aria-label="Flavours on this page" className="mx-auto max-w-[1400px] mt-10 md:mt-14">
            <ul className="flex flex-wrap gap-2">
              {FLAVORS.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`#${f.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-4 text-[14px] text-ink transition-colors hover:border-ink/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span aria-hidden="true" className="block h-2 w-2 rounded-full" style={{ background: f.accent }} />
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="px-6 md:px-10">
          <LoopVideo
            video={TRAY_VIDEO}
            sizes="(min-width: 1400px) 1320px, 100vw"
            lazy
            className="mx-auto max-w-[1400px] aspect-[4/3] md:aspect-[21/9] rounded-card"
          />
        </div>

        <section aria-label="Flavours" className="px-6 md:px-10 pt-10 md:pt-16">
          <div className="mx-auto max-w-[1400px]">
            {FLAVORS.map((flavor, i) => (
              <MenuEntry key={flavor.id} flavor={flavor} index={i} />
            ))}
            <p className="hairline-top pt-6 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70 leading-[1.8]">
              {PACK_RULES_LINE}
            </p>
          </div>
        </section>

        <section aria-label="Allergens" className="px-6 md:px-10 py-14 md:py-20">
          <div className="mx-auto max-w-[1400px] rounded-card bg-bone-soft p-6 md:p-10 text-ink">
            <AllergenNotice />
          </div>
        </section>

        <Packages />
      </main>
      <Footer />
    </>
  );
}
