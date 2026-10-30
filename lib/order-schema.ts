/**
 * The order request schema, shared by the order form (client) and the order
 * API (server) so the two can never disagree. The server re-validates every
 * request with this schema and prices it from the flavour registry — never
 * from client-supplied tiers or totals.
 */
import { z } from "zod";
import { getFlavorById } from "./flavors";
import { MIN_CUPS_PER_FLAVOR, maxFlavorsForPack, type PackQty } from "./pricing";

// "2026-02-30" matches YYYY-MM-DD but isn't a date; Postgres would reject it.
function isRealCalendarDate(value: string): boolean {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const CUP_SIZE_VALUES = ["2oz", "5oz"] as const;
export const PACK_QTY_VALUES = ["24", "48", "96"] as const;

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
    urgency: z.enum(["standard", "urgent"]),
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
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date")
      .refine(isRealCalendarDate, "Please select a valid date"),
    notes: z.string().max(2000, "Please keep notes under 2000 characters").optional(),
    deliveryAddress: z
      .string()
      .max(300, "Please keep the address under 300 characters")
      .optional(),
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
    if (data.fulfillment === "delivery" && !data.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Add a delivery address so we can quote the fee",
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
