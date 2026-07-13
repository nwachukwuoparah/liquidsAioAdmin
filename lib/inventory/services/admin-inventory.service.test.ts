import { describe, expect, it, vi } from "vitest";
import { fetchAdminInventoryLotsPage } from "./admin-inventory.service";

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe("fetchAdminInventoryLotsPage", () => {
    it("calls GET /lots with query params and maps results", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    lots: [
                        {
                            id: "lot-1",
                            title: "Electronics lot",
                            category: "elt",
                            unitQuantity: 20,
                            price: 500,
                            reviewStatus: "pending",
                            creator: { firstName: "Jane", lastName: "Doe" },
                        },
                    ],
                    count: 1,
                },
            },
        });

        const page = await fetchAdminInventoryLotsPage({
            search: "electronics",
            review_status: "pending",
            page: "1",
            limit: "25",
        });

        expect(apiClient.get).toHaveBeenCalledWith("/lots", {
            search: "electronics",
            review_status: "pending",
            page: "1",
            limit: "25",
        });
        expect(page.results).toHaveLength(1);
        expect(page.results[0]?.seller).toBe("Jane Doe");
        expect(page.hasNext).toBe(false);
        expect(page.hasPrevious).toBe(false);
        expect(page.page).toBe(1);
        expect(page.limit).toBe(25);
        expect(page.totalCount).toBe(1);
        expect(page.totalPages).toBe(1);
    });

    it("derives hasNext from total count and page params", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    lots: [{ id: "lot-1", title: "Lot", reviewStatus: "pending" }],
                    count: 50,
                },
            },
        });

        const page = await fetchAdminInventoryLotsPage({
            page: "1",
            limit: "25",
        });

        expect(page.hasNext).toBe(true);
        expect(page.hasPrevious).toBe(false);
        expect(page.totalPages).toBe(2);
    });

    it("loads lot detail for a lot slug", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    lot: {
                        id: "lot-1",
                        title: "Electronics lot",
                        reviewStatus: "pending",
                        unitQuantity: 20,
                        pricePerUnit: 50,
                        creator: { firstName: "Jane", lastName: "Doe", email: "jane@example.com" },
                    },
                },
            },
        });

        const { fetchAdminInventoryLotDetail } = await import("./admin-inventory.service");
        const detail = await fetchAdminInventoryLotDetail("electronics-lot-1");

        expect(apiClient.get).toHaveBeenCalledWith("/lots/electronics-lot-1");
        expect(detail.title).toBe("Electronics lot");
        expect(detail.seller.name).toBe("Jane Doe");
    });

    it("posts approve to /lots/{lotId}/approve", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Listing approved.",
            },
        });

        const { postAdminLotReview } = await import("./admin-inventory.service");
        const response = await postAdminLotReview({ lotId: "lot-1", action: "approve" });

        expect(apiClient.post).toHaveBeenCalledWith("/lots/lot-1/approve", {});
        expect(response.message).toBe("Listing approved.");
    });

    it("posts reject to /lots/{lotId}/reject with the rejection reason", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Listing declined.",
            },
        });

        const { postAdminLotReview } = await import("./admin-inventory.service");
        const response = await postAdminLotReview({
            lotId: "lot-1",
            action: "reject",
            rejectionReason: "Missing product photos",
        });

        expect(apiClient.post).toHaveBeenCalledWith("/lots/lot-1/reject", {
            reason: "Missing product photos",
        });
        expect(response.message).toBe("Listing declined.");
    });

    it("posts suspend to /lots/{lotId}/suspend with a reason string", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Listing suspended.",
            },
        });

        const { postAdminLotReview } = await import("./admin-inventory.service");
        const response = await postAdminLotReview({
            lotId: "lot-1",
            action: "suspend",
            suspensionReason: "prohibited_item",
        });

        expect(apiClient.post).toHaveBeenCalledWith("/lots/lot-1/suspend", {
            reason: "Prohibited or restricted item",
        });
        expect(response.message).toBe("Listing suspended.");
    });

    it("posts suspend Other reason using the free-text note", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.post).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                message: "Listing suspended.",
            },
        });

        const { postAdminLotReview } = await import("./admin-inventory.service");
        await postAdminLotReview({
            lotId: "lot-1",
            action: "suspend",
            suspensionReason: "other",
            note: "Too many counterfeit reports",
        });

        expect(apiClient.post).toHaveBeenCalledWith("/lots/lot-1/suspend", {
            reason: "Too many counterfeit reports",
        });
    });
});
