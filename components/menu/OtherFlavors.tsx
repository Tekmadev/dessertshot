import Image from "next/image";
import Link from "next/link";
import type { Flavor } from "@/lib/flavors";
import { productPhoto } from "@/lib/media";
import { accentTint, otherFlavors, tierLabel } from "./menu-data";

/** Every other flavour as a small photo link, in menu order. No ranking, no picks. */
export default function OtherFlavors({ flavor }: { flavor: Pick<Flavor, "id"> }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-7">
      {otherFlavors(flavor).map((f) => {
        const photo = productPhoto(f);
        return (
          <li key={f.id}>
            <Link
              href={`/menu/${f.slug}`}
              className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <span
                className="relative block aspect-[4/5] overflow-hidden rounded-card"
                style={{ background: accentTint(f.accent, 20) }}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 1400px) 180px, (min-width: 1024px) 13vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-[1.04]"
                />
              </span>
              <span className="mt-3 block font-display text-[18px] md:text-[20px] leading-[1.15] tracking-[-0.015em] text-ink group-hover:underline group-hover:decoration-ember group-hover:underline-offset-4">
                {f.name}
              </span>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.18em] uppercase text-ink/70">
                {tierLabel(f)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
