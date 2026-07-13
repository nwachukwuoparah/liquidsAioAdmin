import { describe, expect, it } from "vitest";
import { inventorySuspendReasonFormSchema } from "./inventory-suspend-reason.schema";

describe("inventorySuspendReasonFormSchema", () => {
    it("accepts a listed reason without a note", () => {
        const result = inventorySuspendReasonFormSchema.safeParse({
            reason: "prohibited_item",
            note: "",
        });

        expect(result.success).toBe(true);
    });

    it("rejects an empty reason", () => {
        const result = inventorySuspendReasonFormSchema.safeParse({ reason: "", note: "" });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toEqual(["reason"]);
        }
    });

    it("requires a note when the reason is Other", () => {
        const result = inventorySuspendReasonFormSchema.safeParse({ reason: "other", note: "  " });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toEqual(["note"]);
        }
    });

    it("accepts the Other reason when a note is provided", () => {
        const result = inventorySuspendReasonFormSchema.safeParse({
            reason: "other",
            note: "Repeated policy violations",
        });

        expect(result.success).toBe(true);
    });
});
