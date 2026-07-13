import { describe, expect, it } from "vitest";
import { mapAdminComplianceDetailApiRecord } from "./map-admin-compliance-detail-api-record";

describe("mapAdminComplianceDetailApiRecord", () => {
    it("maps a flat user payload with documents", () => {
        const detail = mapAdminComplianceDetailApiRecord({
            id: "user-1",
            email: "verify1@dummyinbox.com",
            firstName: "Nwachukwu",
            lastName: "Oparah",
            accountType: "buyer",
            complianceReviewStatus: "pending",
            complianceUpdatedAt: "2026-07-01T12:00:00.000Z",
            documents: [
                {
                    id: "doc-1",
                    title: "Government ID",
                    category: "Identification",
                    submittedAt: "2026-07-01T12:00:00.000Z",
                    status: "pending",
                    fileUrl: "https://example.com/id.pdf",
                },
            ],
            assigneeOptions: ["Sarah Chen"],
        });

        expect(detail.id).toBe("user-1");
        expect(detail.email).toBe("verify1@dummyinbox.com");
        expect(detail.complianceReviewStatus).toBe("pending");
        expect(detail.documents).toHaveLength(1);
        expect(detail.documentsTotalCount).toBe(1);
        expect(detail.assignedTo).toBe("");
        expect(detail.assigneeOptions).toEqual(["Sarah Chen"]);
    });

    it("maps nested user payloads from the compliance detail API", () => {
        const detail = mapAdminComplianceDetailApiRecord({
            user: {
                id: "user-2",
                email: "seller@example.com",
                firstName: "Jane",
                lastName: "Doe",
                account_type: "seller",
                compliance_review_status: "in_review",
                assignedReviewer: {
                    firstName: "Sarah",
                    lastName: "Chen",
                },
            },
            documents: [
                {
                    id: "doc-2",
                    documentName: "Business license",
                    documentType: "License",
                    reviewStatus: "approved",
                },
            ],
            availableAssignees: ["Sarah Chen", "Jenny Wilson"],
        });

        expect(detail.id).toBe("user-2");
        expect(detail.accountType).toBe("seller");
        expect(detail.complianceReviewStatus).toBe("in_review");
        expect(detail.assignedTo).toBe("Sarah Chen");
        expect(detail.documents[0]?.status).toBe("approved");
        expect(detail.documentsApprovedCount).toBe(1);
    });

    it("resolves nested admin profiles from complianceReviewAssignment", () => {
        const detail = mapAdminComplianceDetailApiRecord({
            complianceData: {
                id: "user-3",
                email: "buyer@example.com",
                firstName: "Alex",
                lastName: "Buyer",
                complianceReviewStatus: "in_review",
                complianceReviewAssignment: {
                    admin: {
                        firstName: "Jude",
                        lastName: "Nnamdi",
                        email: "jude@liquidsaio.com",
                    },
                },
                kyc: {
                    id: "kyc-1",
                    kycDocuments: [],
                },
            },
        });

        expect(detail.assignedTo).toBe("Jude Nnamdi");
    });

    it("maps the production complianceData + kycDocuments payload", () => {
        const detail = mapAdminComplianceDetailApiRecord({
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
        });

        expect(detail.id).toBe("019e7442-961a-71bf-b77a-d7f766a3aac7");
        expect(detail.email).toBe("verify1@dummyinbox.com");
        expect(detail.complianceReviewStatus).toBe("pending");
        expect(detail.submittedAt).toBe("2024-05-29T15:08:25.362Z");
        expect(detail.documents).toHaveLength(1);
        expect(detail.documents[0]?.title).toBe("bg_section2 copy 5");
        expect(detail.documents[0]?.category).toBe("Government ID");
        expect(detail.documents[0]?.fileUrl).toBe("compliance/uePU4MjtZZQX/gov-id-5uPtKQ");
        expect(detail.verificationType).toBe("kyc");
        expect(detail.verificationId).toBe("019e7447-8794-74a6-bdc2-1fa4c46b9b41");
    });

    it("throws when the payload is missing a user id", () => {
        expect(() => mapAdminComplianceDetailApiRecord({ email: "missing-id@example.com" })).toThrow(
            "Compliance detail response is missing user id.",
        );
    });
});
