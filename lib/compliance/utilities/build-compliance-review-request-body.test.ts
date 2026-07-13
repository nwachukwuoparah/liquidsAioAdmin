import { describe, expect, it } from "vitest";
import {
    buildComplianceDocumentReviewRequestBody,
    buildComplianceReviewRequestBody,
} from "./build-compliance-review-request-body";

describe("buildComplianceDocumentReviewRequestBody", () => {
    it("uses kycDocumentId for buyer document approvals", () => {
        expect(
            buildComplianceDocumentReviewRequestBody("kyc", "doc-1", "approve"),
        ).toEqual({ type: "kyc", action: "approve", kycDocumentId: "doc-1" });
    });

    it("uses kybDocumentId for seller document rejections", () => {
        expect(
            buildComplianceDocumentReviewRequestBody("kyb", "doc-2", "reject", "Invalid file"),
        ).toEqual({
            type: "kyb",
            action: "reject",
            kybDocumentId: "doc-2",
            rejectionReason: "Invalid file",
        });
    });
});

describe("buildComplianceReviewRequestBody", () => {
    it("uses kycId for buyer review approvals", () => {
        expect(
            buildComplianceReviewRequestBody("kyc", "kyc-1", "approve"),
        ).toEqual({ type: "kyc", action: "approve", kycId: "kyc-1" });
    });

    it("uses kybId for seller review rejections", () => {
        expect(
            buildComplianceReviewRequestBody("kyb", "kyb-1", "reject", "Missing documents"),
        ).toEqual({
            type: "kyb",
            action: "reject",
            kybId: "kyb-1",
            rejectionReason: "Missing documents",
        });
    });
});
