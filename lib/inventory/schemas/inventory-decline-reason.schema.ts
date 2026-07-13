import { z } from "zod";

export const inventoryDeclineReasonSchema = z
    .string()
    .trim()
    .min(1, "Please add a reason for declining this listing.");

export type InventoryDeclineReasonFormValues = {
    rejectionReason: string;
};

export const inventoryDeclineReasonFormSchema = z.object({
    rejectionReason: inventoryDeclineReasonSchema,
});
