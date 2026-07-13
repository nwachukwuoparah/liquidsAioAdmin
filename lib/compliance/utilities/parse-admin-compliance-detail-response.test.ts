import { describe, expect, it } from "vitest";
import { parseAdminComplianceDetailResponse } from "./parse-admin-compliance-detail-response";

describe("parseAdminComplianceDetailResponse", () => {
    it("unwraps wrapped compliance detail payloads", () => {
        const detail = parseAdminComplianceDetailResponse({
            status: "success",
            data: {
                id: "review-1",
                email: "john@example.com",
                accountType: "seller",
                complianceReviewStatus: "in_review",
                submittedAt: "2025-10-08T10:00:00.000Z",
                complianceUpdatedAt: "2025-10-09T14:30:00.000Z",
                documentsApprovedCount: 1,
                documentsTotalCount: 3,
                assignedTo: "Sarah Chen",
                assigneeOptions: ["Sarah Chen"],
                documents: [],
            },
        });

        expect(detail.id).toBe("review-1");
        expect(detail.documentsTotalCount).toBe(3);
    });

    it("maps complianceData payloads from the production API", () => {
        const detail = parseAdminComplianceDetailResponse({
            status: "success",
            data: {
                complianceData: {
                    id: "019e7442-961a-71bf-b77a-d7f766a3aac7",
                    firstName: "Nwachukwu",
                    lastName: "Oparah",
                    email: "verify1@dummyinbox.com",
                    profilePicture: null,
                    complianceUpdatedAt: null,
                    complianceReviewStatus: "pending",
                    complianceReviewAssignment: null,
                    kyc: {
                        id: "019e7447-8794-74a6-bdc2-1fa4c46b9b41",
                        createdAt: "2024-05-29T15:08:25.362Z",
                        status: "pending",
                        kycDocuments: [
                            {
                                id: "019e7447-879c-71be-aa00-08c3a3792742",
                                type: "gov_id",
                                fileId: "compliance/uePU4MjtZZQX/gov-id-5uPtKQ",
                                originalFilename: "bg_section2 copy 5",
                                status: "pending",
                                createdAt: "2024-05-29T15:08:25.362Z",
                            },
                        ],
                    },
                },
            },
        });

        expect(detail.id).toBe("019e7442-961a-71bf-b77a-d7f766a3aac7");
        expect(detail.email).toBe("verify1@dummyinbox.com");
        expect(detail.documents).toHaveLength(1);
        expect(detail.documents[0]?.category).toBe("Government ID");
    });
});
