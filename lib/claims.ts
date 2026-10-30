/**
 * Dietary claims and allergen wording — the ONE place this language lives
 * (brief §2.4). The final wording comes from the owner; until she signs it
 * off, every entry here is flagged `needsOwnerReview`.
 *
 * Rules: say "gluten-free and eggless" only as the owner states it. Never
 * "certified", "celiac-safe" or any medical claim.
 */

export type AllergenId = "dairy" | "tree-nuts";

export const ALLERGENS: Record<AllergenId, { label: string; short: string }> = {
  dairy: { label: "Contains dairy", short: "Dairy" },
  "tree-nuts": { label: "Contains tree nuts", short: "Tree nuts" },
};

/**
 * The owner-stated dietary claim. Flip `enabled` to false to remove it from
 * every page, the metadata and the order emails at once.
 */
export const DIETARY_CLAIM = {
  enabled: true,
  text: "Gluten-free and eggless",
  needsOwnerReview: true,
  reviewNotes:
    "Standard graham crumb, Biscoff cookies and kunafa contain wheat. Owner to confirm the exact statement and that it holds for every flavour, including Tiramisu (brief §10.3).",
} as const;

/** The dietary claim if enabled, otherwise null. */
export function dietaryClaim(): string | null {
  return DIETARY_CLAIM.enabled ? DIETARY_CLAIM.text : null;
}

export const ALLERGEN_NOTICE = {
  title: "Allergens and cross-contact",
  needsOwnerReview: true,
} as const;

/**
 * Short sitewide notice. Flavours containing tree nuts are passed in from the
 * flavour registry so the list can never drift from the menu.
 */
export function allergenNoticeText(treeNutFlavorNames: readonly string[]): string {
  const nuts =
    treeNutFlavorNames.length > 0
      ? ` ${listFormat(treeNutFlavorNames)} contain tree nuts, and every cup is made in the same kitchen, so cross-contact with nuts is possible.`
      : "";
  return `Every cup contains dairy.${nuts} If you have a severe allergy, message us before you order.`;
}

function listFormat(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
