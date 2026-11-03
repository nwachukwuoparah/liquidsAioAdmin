import { describe, expect, it } from "vitest";
import { parseAdminComplianceDetailResponse } from "./parse-admin-compliance-detail-response";

describe("parseAdminComplianceDetailResponse", () => {
    it("returns raw server data structure as is", () => {
        const detail = parseAdminComplianceDetailResponse({
            status: "success",
            data: {
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
                        createdAt: "2026-09-01T12:07:37.414Z",
                        updatedAt: "2026-09-03T06:20:24.782Z",
                        assignedAdmin: {
                            id: "01a05922-ec33-769c-b2ad-4bdd6cb387ee",
                            firstName: "Nwachukwu",
                            lastName: "Oparah",
                            email: "nwachukwuoparah@gmail.com",
                        },
                    },
                },
                kyb: {
                    id: "01a05a1d-e989-75b4-8d69-4e86388a7595",
                    userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                    businessName: "Crud seller",
                    status: "rejected",
                    createdAt: "2026-08-31T23:18:24.904Z",
                    updatedAt: "2026-08-31T23:18:24.904Z",
                    kybDocuments: [
                        {
                            id: "01a05a1d-e990-717a-b034-479489ccf27e",
                            kybId: "01a05a1d-e989-75b4-8d69-4e86388a7595",
                            type: "ein_document",
                            fileId: "compliance/Y_OHD-qvWL1K/ein-document-irSJ7g",
                            status: "rejected",
                            createdAt: "2026-08-31T23:18:24.904Z",
                        },
                    ],
                },
                kyc: {
                    id: "01a059f8-899b-700d-b6aa-f42440c42b42",
                    userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                    firstName: "Nwachukwu",
                    lastName: "Oparah",
                    status: "pending",
                    createdAt: "2026-08-31T22:37:35.513Z",
                    updatedAt: "2026-08-31T22:37:35.513Z",
                    kycDocuments: [
                        {
                            id: "01a059f8-8a12-74cc-b9c6-5dc13bb64b77",
                            userId: "01a059f1-df63-7251-800b-4108a887fc2a",
                            kycId: "01a059f8-899b-700d-b6aa-f42440c42b42",
                            type: "gov_id",
                            fileId: "compliance/Y_OHD-qvWL1K/gov-id-MMEsxw",
                            status: "pending",
                            createdAt: "2026-08-31T22:37:35.513Z",
                        },
                    ],
                },
            },
        });

        expect(detail.complianceData.id).toBe("01a059f1-df63-7251-800b-4108a887fc2a");
        expect(detail.complianceData.email).toBe("seller@dummyinbox.com");
        expect(detail.complianceData.complianceReviewAssignment?.status).toBe("claimed");
        expect(detail.kyb?.kybDocuments).toHaveLength(1);
        expect(detail.kyc?.kycDocuments).toHaveLength(1);
    });

    it("throws when response reports failed status", () => {
        expect(() =>
            parseAdminComplianceDetailResponse({
                status: "failed",
                message: "User not found",
            }),
        ).toThrow("User not found");
    });
});
