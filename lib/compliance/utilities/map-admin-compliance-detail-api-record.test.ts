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

    it("maps payload with both KYB (2 documents) and KYC (1 document) giving 3 total documents", () => {
        const detail = mapAdminComplianceDetailApiRecord({
            complianceData: {
                id: "01a059f1-df63-7251-800b-4108a887fc2a",
                firstName: "Nwachukwu",
                lastName: "Oparah",
                email: "seller@dummyinbox.com",
                profilePicture: null,
                complianceUpdatedAt: "2026-09-01T16:06:43.537Z",
                complianceReviewStatus: "rejected",
                complianceReviewAssignment: {
                    id: "01a05cde-24d0-710e-b1da-10933e594efb",
                    userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                    assignedAdminId: "01a05922-ec33-769c-b2ad-4bdd6cb387ee",
                    status: "claimed",
                    assignedAdmin: {
                        id: "01a05922-ec33-769c-b2ad-4bdd6cb387ee",
                        firstName: "Nwachukwu",
                        lastName: "Oparah",
                        email: "nwachukwuoparah@gmail.com",
                        profilePicture: null,
                    },
                },
            },
            kyb: {
                id: "01a05a1d-e989-75b4-8d69-4e86388a7595",
                userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                businessName: "Crud seller",
                status: "rejected",
                kybDocuments: [
                    {
                        id: "01a05a1d-e990-717a-b034-479489ccf27e",
                        type: "ein_document",
                        fileId: "compliance/Y_OHD-qvWL1K/ein-document-irSJ7g",
                        originalFilename: "ein.jpg",
                        status: "rejected",
                    },
                    {
                        id: "01a05a1d-e990-717a-b034-49a9b177782c",
                        type: "state_business_license",
                        fileId: "compliance/Y_OHD-qvWL1K/state-business-license-BRKvhg",
                        originalFilename: "license.jpg",
                        status: "rejected",
                    },
                ],
            },
            kyc: {
                id: "01a059f8-899b-700d-b6aa-f42440c42b42",
                userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                firstName: "Nwachukwu",
                lastName: "Oparah",
                status: "pending",
                kycDocuments: [
                    {
                        id: "01a059f8-8a12-74cc-b9c6-5dc13bb64b77",
                        type: "gov_id",
                        fileId: "compliance/Y_OHD-qvWL1K/gov-id-MMEsxw",
                        originalFilename: "gov-id.jpg",
                        status: "pending",
                    },
                ],
            },
        });

        expect(detail.id).toBe("01a059f1-df63-7251-800b-4108a887fc2a");
        expect(detail.accountType).toBe("seller");
        expect(detail.assignedTo).toBe("Nwachukwu Oparah");
        expect(detail.documents).toHaveLength(3);
        expect(detail.documentsTotalCount).toBe(3);

        expect(detail.documents[0]?.title).toBe("ein.jpg");
        expect(detail.documents[0]?.category).toBe("EIN Confirmation");
        expect(detail.documents[0]?.status).toBe("rejected");
        expect(detail.documents[0]?.verificationType).toBe("kyb");

        expect(detail.documents[1]?.title).toBe("license.jpg");
        expect(detail.documents[1]?.category).toBe("State Business License");
        expect(detail.documents[1]?.status).toBe("rejected");
        expect(detail.documents[1]?.verificationType).toBe("kyb");

        expect(detail.documents[2]?.title).toBe("gov-id.jpg");
        expect(detail.documents[2]?.category).toBe("Government ID");
        expect(detail.documents[2]?.status).toBe("pending");
        expect(detail.documents[2]?.verificationType).toBe("kyc");
    });

    it("throws when the payload is missing a user id", () => {
        expect(() => mapAdminComplianceDetailApiRecord({ email: "missing-id@example.com" })).toThrow(
            "Compliance detail response is missing user id.",
        );
    });
});
