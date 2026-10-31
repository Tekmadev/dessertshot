import "server-only";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/experience/story/Reveal";
import { gridImages } from "@/components/experience/story/story-content";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { BUSINESS } from "@/lib/business";

/**
 * S8 · Instagram. Whatever images sit in public/testimonials/ (read when the
 * page is built), as a grid that opens the Instagram profile. Nothing there,
 * no section: today it renders nothing. No quotes, ratings or counts are
 * written here; the pictures speak for themselves.
 *
 * Alt text comes from the filename, so name files for what they show
 * ("dubai-cups-bridal-shower.jpg"); camera names get a plain fallback.
 */
const FOLDER = "testimonials";
const MAX_TILES = 8;

const LABELS = {
  headingPre: "Seen on",
  headingItalic: "Instagram.",
  follow: "Follow",
  newTab: "(opens Instagram in a new tab)",
} as const;

function listFolder(): string[] {
  try {
    return readdirSync(join(process.cwd(), "public", FOLDER));
  } catch {
    return [];
  }
}

export default function Instagram() {
  const { handle, url } = BUSINESS.instagram;
  const images = gridImages(listFolder(), `/${FOLDER}`, handle, MAX_TILES);
  if (!images.length) return null;

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-heading"
      className="relative py-20 sm:py-28 md:py-40 bg-bone-soft hairline-top hairline-bottom"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-10 md:mb-16">
          <div>
            <Reveal y={16} className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 mb-6">
              {handle}
            </Reveal>
            <Reveal>
              <h2
                id="instagram-heading"
                className="font-display text-ink leading-[0.96] tracking-[-0.035em]"
                style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
              >
                {LABELS.headingPre}{" "}
                <em
                  className="italic"
                  style={{ color: "var(--color-ember)", fontVariationSettings: "'SOFT' 50, 'WONK' 1" }}
                >
                  {LABELS.headingItalic}
                </em>
              </h2>
            </Reveal>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 self-start md:self-auto items-center gap-3 rounded-full border border-ink/25 px-5 py-3 text-[15px] tracking-[-0.01em] text-ink transition-colors duration-500 ease-cinema hover:border-ink hover:bg-ink hover:text-bone-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <InstagramIcon size={18} />
            <span>
              {LABELS.follow} {handle}
            </span>
            <span className="sr-only">{LABELS.newTab}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <Reveal y={30}>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {images.map((img) => (
              <li key={img.src}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-card bg-shell focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1400px) 25vw, 340px"
                    className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-[1.03]"
                  />
                  <span className="sr-only">{LABELS.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
