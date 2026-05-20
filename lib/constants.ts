import { BUSINESS } from "./business";

export const EASE_CINEMA = [0.16, 1, 0.3, 1] as const;

export { BUSINESS } from "./business";

/**
 * @deprecated Import `BUSINESS` from "@/lib/business" instead.
 * Kept for backward compatibility with existing call sites.
 */
export const SITE = {
  name: BUSINESS.name,
  city: BUSINESS.location.cityFull,
  region: BUSINESS.location.region,
  email: BUSINESS.email,
  instagram: BUSINESS.instagram.url,
  instagramHandle: BUSINESS.instagram.handle,
};
