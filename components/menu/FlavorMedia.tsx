import Image from "next/image";
import LoopVideo from "@/components/media/LoopVideo";
import type { Flavor } from "@/lib/flavors";
import { productPhoto, type VideoAsset } from "@/lib/media";
import { accentTint } from "./menu-data";

const SIZES = "(min-width: 1400px) 680px, (min-width: 1024px) 48vw, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)";

/**
 * The flavour page's hero visual: the product still, preloaded as the LCP.
 * When a process clip for this flavour exists, pass it as `video` and it
 * plays over its own poster (LoopVideo: poster first, motion only when
 * welcome) without changing the layout.
 */
export default function FlavorMedia({
  flavor,
  video,
  className = "",
}: {
  flavor: Pick<Flavor, "slug" | "name" | "visualSignature" | "accent">;
  video?: VideoAsset;
  className?: string;
}) {
  const photo = productPhoto(flavor);
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-card ${className}`}
      style={{ background: accentTint(flavor.accent, 20) }}
    >
      {video ? (
        <LoopVideo video={video} sizes={SIZES} priority className="absolute inset-0" />
      ) : (
        <Image src={photo.src} alt={photo.alt} fill preload fetchPriority="high" sizes={SIZES} className="object-cover" />
      )}
    </div>
  );
}
