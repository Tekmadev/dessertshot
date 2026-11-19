/**
 * The order request schema, shared by the order form (client) and the order
 * API (server) so the two can never disagree. The server re-validates every
 * request with this schema and prices it from the flavour registry — never
 * from client-supplied tiers or totals. Urgency is not an input: both sides
 * derive it from the date (lib/order-timing.ts).
 */
import { z } from "zod";
import { EVENT_VALUES } from "./events";
import { comesInSize, getFlavorById, sizeNote } from "./flavors";
import { isRealCalendarDate, orderTiming } from "./order-timing";
import { MIN_CUPS_PER_FLAVOR, maxFlavorsForPack, type PackQty } from "./pricing";

export const CUP_SIZE_VALUES = ["2oz", "5oz"] as const;
export const PACK_QTY_VALUES = ["24", "48", "96"] as const;

// Canada Post: no D, F, I, O, Q or U anywhere, and no W or Z in first place.
const POSTAL_CODE_RE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;

/** "l8p4r5", "L8P-4R5" → "L8P 4R5"; null if it isn't a Canadian postal code. */
export function normalizePostalCode(value: string): string | null {
  const compact = value.toUpperCase().replace(/[\s-]/g, "");
  return POSTAL_CODE_RE.test(compact) ? `${compact.slice(0, 3)} ${compact.slice(3)}` : null;
}

export const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tier: z.enum(["classic", "premium"]),
  count: z.number().int(),
});

export const orderSchema = z
  .object({
    cupSize: z.enum(CUP_SIZE_VALUES),
    packQty: z.enum(PACK_QTY_VALUES),
    items: z.array(orderItemSchema).min(1, "Select at least one flavour"),
    fulfillment: z.enum(["pickup", "delivery"]),
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name")
      .max(120, "Please keep your name under 120 characters"),
    email: z.email("Please enter a valid email").max(254, "Please enter a shorter email"),
    phone: z.string().max(40, "Phone number is too long").optional(),
    date: z
      .string()
      .min(1, "Please select a desired date")
      .refine(isRealCalendarDate, "Please select a valid date"),
    eventType: z
      .string()
      .optional()
      .refine((v) => !v || EVENT_VALUES.includes(v), "Please choose an event type from the list"),
    notes: z.string().max(2000, "Please keep notes under 2000 characters").optional(),
    deliveryAddress: z
      .string()
      .max(300, "Please keep the address under 300 characters")
      .optional(),
    deliveryPostalCode: z.string().max(10, "Please enter a postal code like L8P 4R5").optional(),
    // Where the request came from (path + deep-link query), for the owner's records.
    source: z.string().max(300).startsWith("/").optional(),
    // One id per filled-in form, kept across retries, so a retry after a
    // dropped connection isn't saved or emailed twice.
    requestId: z.uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const packSize = Number(data.packQty) as PackQty;
    const totalCups = data.items.reduce((sum, i) => sum + i.count, 0);

    // Every item must be a real flavour at its real tier — the price depends on it.
    const seen = new Set<string>();
    for (const item of data.items) {
      const flavor = getFlavorById(item.id);
      if (!flavor || flavor.tier !== item.tier || flavor.name !== item.name) {
        ctx.addIssue({ code: "custom", path: ["items"], message: "Unknown flavour in your box" });
        break;
      }
      if (seen.has(item.id)) {
        ctx.addIssue({ code: "custom", path: ["items"], message: `${flavor.name} is listed twice` });
        break;
      }
      if (!comesInSize(flavor, data.cupSize)) {
        ctx.addIssue({ code: "custom", path: ["items"], message: `${flavor.name} comes in ${sizeNote(flavor)}` });
        break;
      }
      seen.add(item.id);
    }

    if (data.items.some((i) => i.count < MIN_CUPS_PER_FLAVOR || i.count % MIN_CUPS_PER_FLAVOR !== 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: `Each flavour needs at least ${MIN_CUPS_PER_FLAVOR} cups, in multiples of ${MIN_CUPS_PER_FLAVOR}`,
      });
    }
    if (data.items.length > maxFlavorsForPack(packSize)) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: `A ${packSize} pack holds at most ${maxFlavorsForPack(packSize)} flavours`,
      });
    }
    if (totalCups !== packSize) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: `Cup counts must total ${packSize} (currently ${totalCups})`,
      });
    }

    if (isRealCalendarDate(data.date)) {
      const timing = orderTiming(data.date, new Date(), packSize);
      if (timing === "past") {
        ctx.addIssue({ code: "custom", path: ["date"], message: "Please choose today or a later date" });
      } else if (timing === "too-soon") {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "A 96 needs at least 7 days' notice. Choose a later date or a smaller pack",
        });
      } else if (timing === "too-far") {
        ctx.addIssue({ code: "custom", path: ["date"], message: "Please choose a date within the next two years" });
      }
    }

    if (data.fulfillment === "delivery") {
      if (!data.deliveryAddress?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress"],
          message: "Add a delivery address so we can quote the fee",
        });
      }
      if (!normalizePostalCode(data.deliveryPostalCode ?? "")) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryPostalCode"],
          message: "Please enter a postal code like L8P 4R5",
        });
      }
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
