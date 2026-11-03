import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAdminInventoryOverview } from "@/lib/admin/services/admin-dashboard.service";

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe("fetchAdminInventoryOverview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("unwraps overview metrics from the admin API response", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                status: "success",
                data: {
                    range: {
                        start: "2026-07-01T00:00:00.000Z",
                        end: "2026-07-31T23:59:59.999Z",
                    },
                    previousRange: {
                        start: "2026-06-01T00:00:00.000Z",
                        end: "2026-06-30T23:59:59.999Z",
                    },
                    stats: {
                        allListings: { count: 100, delta: 5 },
                        activeListings: { count: 80, delta: 4 },
                        declinedListings: { count: 12, delta: 1 },
                        suspendedListings: { count: 8, delta: 0 },
                    },
                },
            },
        });

        const overview = await fetchAdminInventoryOverview({
            start: "2026-07-01T00:00:00.000Z",
            end: "2026-07-31T23:59:59.999Z",
        });

        expect(overview.allListings.count).toBe(100);
        expect(overview.activeListings.delta).toBe(4);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/lots/overview",
            expect.objectContaining({
                start: "2026-07-01T00:00:00.000Z",
                end: "2026-07-31T23:59:59.999Z",
            }),
        );
    });

    it("falls back to legacy /lots/admin-overview if /lots/overview returns 404", async () => {
        const { apiClient } = await import("@/lib/api/api-client");
        const { ApiError } = await import("@/lib/api/api-error");

        vi.mocked(apiClient.get)
            .mockRejectedValueOnce(new ApiError("Not Found", 404))
            .mockResolvedValueOnce({
                setupToken: null,
                token: null,
                refreshTokenExpiry: null,
                body: {
                    status: "success",
                    data: {
                        stats: {
                            allListings: { count: 50, delta: 2 },
                            activeListings: { count: 40, delta: 1 },
                            declinedListings: { count: 5, delta: 0 },
                            suspendedListings: { count: 5, delta: 1 },
                        },
                    },
                },
            });

        const overview = await fetchAdminInventoryOverview({
            start: "2026-07-01T00:00:00.000Z",
            end: "2026-07-31T23:59:59.999Z",
        });

        expect(overview.allListings.count).toBe(50);
        expect(apiClient.get).toHaveBeenNthCalledWith(
            1,
            "/lots/overview",
            expect.any(Object),
        );
        expect(apiClient.get).toHaveBeenNthCalledWith(
            2,
            "/lots/admin-overview",
            expect.any(Object),
        );
    });
});
