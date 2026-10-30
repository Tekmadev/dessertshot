import { ALLERGEN_NOTICE, allergenNoticeText, dietaryClaim } from "@/lib/claims";
import { treeNutFlavorNames } from "@/lib/flavors";

/**
 * Sitewide allergen and cross-contact notice (brief §2.4). All wording comes
 * from lib/claims.ts so the owner can sign it off in one place.
 */
export function AllergenNotice({ className = "" }: { className?: string }) {
  const dietary = dietaryClaim();
  return (
    <aside aria-label={ALLERGEN_NOTICE.title} className={className}>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60 mb-2">
        {ALLERGEN_NOTICE.title}
      </p>
      <p className="text-[14px] leading-[1.6] opacity-75 max-w-[60ch]">
        {dietary ? `${dietary}. ` : null}
        {allergenNoticeText(treeNutFlavorNames())}
      </p>
    </aside>
  );
}
