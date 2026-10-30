/**
 * Event types — one list for the /events/[type] pages, the order form's
 * optional "Event type" field, and the `orders.event_type` CHECK in
 * supabase/migrations/004_order_details.sql (a test keeps them in sync).
 */

export type EventType = {
  /** URL segment under /events. */
  slug: string;
  /** Value stored on the order (`orders.event_type`). Never rename. */
  value: string;
  label: string;
};

export const EVENT_TYPES: readonly EventType[] = [
  { slug: "weddings", value: "wedding", label: "Weddings" },
  { slug: "baby-showers", value: "baby-shower", label: "Baby showers" },
  { slug: "bridal-showers", value: "bridal-shower", label: "Bridal showers" },
  { slug: "birthdays", value: "birthday", label: "Birthdays" },
  { slug: "graduations", value: "graduation", label: "Graduations" },
  { slug: "corporate", value: "corporate", label: "Corporate dessert boxes" },
  { slug: "celebrations", value: "cultural", label: "Cultural and religious celebrations" },
];

/** The order form also offers "Something else", which has no page. */
export const OTHER_EVENT_VALUE = "other";

export const EVENT_VALUES = [...EVENT_TYPES.map((e) => e.value), OTHER_EVENT_VALUE];

export function getEventBySlug(slug: string): EventType | undefined {
  return EVENT_TYPES.find((e) => e.slug === slug);
}

export function getEventByValue(value: string): EventType | undefined {
  return EVENT_TYPES.find((e) => e.value === value);
}
