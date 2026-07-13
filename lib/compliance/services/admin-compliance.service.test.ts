import { describe, expect, it, vi } from "vitest";
import { fetchAdminComplianceReviewsPage } from "./admin-compliance.service";

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe("fetchAdminComplianceReviewsPage", () => {
    it("maps paginated compliance API responses into table rows", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    results: [
                        {
                            id: "user-1",
                            email: "buyer@example.com",
                            firstName: "Jane",
                            lastName: "Doe",
                            accountType: "buyer",
                            complianceReviewStatus: "pending",
                            complianceUpdatedAt: "2026-07-01T12:00:00.000Z",
                        },
                    ],
                    hasNext: true,
                    nextCursor: {
                        cursor_id: "user-1",
                        cursor_sort_at: "2026-07-01T12:00:00.000Z",
                    },
                },
            },
        });

        const page = await fetchAdminComplianceReviewsPage({ compliance_review_status: "pending" });

        expect(page.results).toHaveLength(1);
        expect(page.results[0]?.name).toBe("Jane Doe");
        expect(page.hasNext).toBe(true);
        expect(page.nextCursor?.cursor_id).toBe("user-1");
    });
});

describe("fetchAdminComplianceDetail", () => {
    it("loads compliance detail for a user id", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    complianceData: {
                        id: "019e7442-961a-71bf-b77a-d7f766a3aac7",
                        email: "verify1@dummyinbox.com",
                        firstName: "Nwachukwu",
                        lastName: "Oparah",
                        complianceReviewStatus: "pending",
                        kyc: {
                            id: "019e7447-8794-74a6-bdc2-1fa4c46b9b41",
                            createdAt: "2024-05-29T15:08:25.362Z",
                            kycDocuments: [
                                {
                                    id: "019e7447-879c-71be-aa00-08c3a3792742",
                                    type: "gov_id",
                                    originalFilename: "bg_section2 copy 5",
                                    status: "pending",
                                    createdAt: "2024-05-29T15:08:25.362Z",
                                },
                            ],
                        },
                    },
                },
            },
        });

        const { fetchAdminComplianceDetail } = await import("./admin-compliance.service");
        const detail = await fetchAdminComplianceDetail("019e7442-961a-71bf-b77a-d7f766a3aac7");

        expect(apiClient.get).toHaveBeenCalledWith("/compliance/019e7442-961a-71bf-b77a-d7f766a3aac7");
        expect(detail.email).toBe("verify1@dummyinbox.com");
        expect(detail.firstName).toBe("Nwachukwu");
    });
});

describe("postAdminComplianceReviewAccept", () => {
    it("posts kycDocumentId to the accept endpoint", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Document approved.",
            },
        });

        const { postAdminComplianceReviewAccept } = await import("./admin-compliance.service");
        const response = await postAdminComplianceReviewAccept({
            userId: "user-1",
            payload: { type: "kyc", action: "approve", kycDocumentId: "doc-1" },
        });

        expect(apiClient.post).toHaveBeenCalledWith("/compliance/review", {
            type: "kyc",
            action: "approve",
            kycDocumentId: "doc-1",
        });
        expect(response.message).toBe("Document approved.");
    });
});

describe("postAdminComplianceReviewReject", () => {
    it("posts kycId and rejectionReason to the reject endpoint", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Review rejected.",
            },
        });

        const { postAdminComplianceReviewReject } = await import("./admin-compliance.service");
        const response = await postAdminComplianceReviewReject({
            userId: "user-1",
            payload: {
                type: "kyc",
                action: "reject",
                kycId: "kyc-1",
                rejectionReason: "Missing documents",
            },
        });

        expect(apiClient.post).toHaveBeenCalledWith("/compliance/review", {
            type: "kyc",
            action: "reject",
            kycId: "kyc-1",
            rejectionReason: "Missing documents",
        });
        expect(response.message).toBe("Review rejected.");
    });
});

describe("postAdminComplianceClaim", () => {
    it("posts to the claim endpoint for a compliance user id", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Case claimed.",
            },
        });

        const { postAdminComplianceClaim } = await import("./admin-compliance.service");
        const response = await postAdminComplianceClaim("user-1");

        expect(apiClient.post).toHaveBeenCalledWith("/compliance/user-1/claim");
        expect(response.message).toBe("Case claimed.");
    });
});

describe("postAdminComplianceUnclaim", () => {
    it("posts to the unclaim endpoint for a compliance user id", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Case released.",
            },
        });

        const { postAdminComplianceUnclaim } = await import("./admin-compliance.service");
        const response = await postAdminComplianceUnclaim("user-1");

        expect(apiClient.post).toHaveBeenCalledWith("/compliance/user-1/unclaim");
        expect(response.message).toBe("Case released.");
    });
});
