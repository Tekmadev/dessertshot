import Image from "next/image";
import Link from "next/link";
import type { PagePhoto } from "@/lib/page-photos";

/**
 * A strip of the page's photos (lib/page-photos.ts) under a draft page's
 * header: the flavours the copy names, each linking to its page, or the
 * tray when it names none.
 */
export default function PagePhotos({ photos }: { photos: PagePhoto[] }) {
  if (!photos.length) return null;
  if (photos.length === 1 && !photos[0].flavor) {
    const p = photos[0];
    return (
      <div className="relative mt-12 aspect-video overflow-hidden rounded-card bg-shell md:mt-16">
        <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1100px) 1052px, calc(100vw - 48px)" className="object-cover" />
      </div>
    );
  }
  return (
    <ul className="mt-12 grid grid-cols-3 gap-3 md:mt-16 md:gap-6">
      {photos.map((p) => (
        <li key={p.src}>
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-shell">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1100px) 336px, calc((100vw - 72px) / 3)" className="object-cover" />
            </div>
            {p.flavor ? (
              <figcaption className="mt-3">
                <Link
                  href={`/menu/${p.flavor.slug}`}
                  className="inline-flex min-h-11 items-center text-[14px] text-ink underline decoration-ember/50 underline-offset-[3px] hover:decoration-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:text-[16px]"
                >
                  {p.flavor.name} dessert cups
                </Link>
              </figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
