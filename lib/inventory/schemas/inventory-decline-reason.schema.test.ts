import { describe, expect, it } from "vitest";
import { inventoryDeclineReasonFormSchema } from "./inventory-decline-reason.schema";

describe("inventoryDeclineReasonFormSchema", () => {
    it("requires a decline reason", () => {
        expect(inventoryDeclineReasonFormSchema.safeParse({ rejectionReason: "" }).success).toBe(false);
        expect(
            inventoryDeclineReasonFormSchema.safeParse({ rejectionReason: "Missing product photos" }).success,
        ).toBe(true);
    });
});
