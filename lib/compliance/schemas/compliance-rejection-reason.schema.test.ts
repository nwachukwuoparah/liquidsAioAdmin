import { describe, expect, it } from "vitest";
import { complianceRejectionReasonSchema } from "./compliance-rejection-reason.schema";

describe("complianceRejectionReasonSchema", () => {
    it("requires a non-empty rejection reason", () => {
        expect(complianceRejectionReasonSchema.safeParse("").success).toBe(false);
        expect(complianceRejectionReasonSchema.safeParse("   ").success).toBe(false);
        expect(complianceRejectionReasonSchema.safeParse("Document is blurry").success).toBe(true);
    });
});
