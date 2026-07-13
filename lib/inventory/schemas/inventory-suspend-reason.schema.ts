import { INVENTORY_SUSPEND_REASON_OTHER } from "@/lib/inventory/constants/admin-inventory-review.constant";
import { z } from "zod";

export type InventorySuspendReasonFormValues = {
    reason: string;
    note: string;
};

export const inventorySuspendReasonFormSchema = z
    .object({
        reason: z.string().min(1, "Please select a reason for the suspension."),
        note: z.string().trim().optional().default(""),
    })
    .refine(
        (values) =>
            values.reason !== INVENTORY_SUSPEND_REASON_OTHER || (values.note?.trim().length ?? 0) > 0,
        {
            message: "Please add a note describing the reason.",
            path: ["note"],
        },
    );
