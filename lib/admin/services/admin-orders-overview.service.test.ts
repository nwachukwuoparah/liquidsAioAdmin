import { describe, expect, it, vi } from "vitest";
import {
    fetchAdminOrdersOverview,
    fetchAdminOrderOverview,
} from "@/lib/admin/services/admin-dashboard.service";

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe("fetchAdminOrdersOverview", () => {
    it("returns raw server response without formatting", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        const serverPayload = {
            status: "success",
            data: {
                totalOrders: { count: 0, deltaPercentage: null },
                activeOrders: { count: 0, deltaPercentage: null },
                completedOrders: { count: 0, deltaPercentage: null },
                disputedOrders: { count: 0, deltaPercentage: null },
                allRefundsIssued: { count: 0, deltaPercentage: null },
                currentlyInEscrow: { total: 0, deltaPercentage: null },
                avgOrderValue: { total: 0, deltaPercentage: null },
                platformFees: { total: 0, deltaPercentage: null },
            },
        };

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: serverPayload,
        });

        const overview = await fetchAdminOrdersOverview({
            start: "2026-11-01T00:00:00.000Z",
            end: "2026-11-30T23:59:59.999Z",
        });

        // The response body must be returned directly as-is without formatting
        expect(overview).toEqual(serverPayload);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admins/overview",
            {
                start: "2026-11-01T00:00:00.000Z",
                end: "2026-11-30T23:59:59.999Z",
            },
        );
    });

    it("omits start and end query params when range is not specified", async () => {
        const { apiClient } = await import("@/lib/api/api-client");

        const serverPayload = {
            totalOrders: { count: 120, deltaPercentage: 5 },
        };

        vi.mocked(apiClient.get).mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: serverPayload,
        });

        const overview = await fetchAdminOrdersOverview();

        expect(overview).toBe(serverPayload);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admins/overview",
            undefined,
        );
    });

    it("exports fetchAdminOrderOverview as an alias to fetchAdminOrdersOverview", () => {
        expect(fetchAdminOrderOverview).toBe(fetchAdminOrdersOverview);
    });
});
