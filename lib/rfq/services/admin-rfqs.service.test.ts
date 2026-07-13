import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAdminRfqsPage, postAdminRfqResolve } from "@/lib/rfq/services/admin-rfqs.service";

const mockApiClientGet = vi.fn();
const mockApiClientPost = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: (...args: unknown[]) => mockApiClientGet(...args),
        post: (...args: unknown[]) => mockApiClientPost(...args),
    },
}));

describe("admin RFQs service", () => {
    beforeEach(() => {
        mockApiClientGet.mockReset();
        mockApiClientPost.mockReset();
    });

    it("calls the admin RFQ endpoint with pending status filter", async () => {
        mockApiClientGet.mockResolvedValueOnce({
            body: {
                status: "success",
                data: {
                    totalCount: 2,
                    results: [],
                    hasNext: false,
                    nextCursor: null,
                },
            },
        });

        const page = await fetchAdminRfqsPage({ status: "pending" });

        expect(mockApiClientGet).toHaveBeenCalledWith("/rfqs/admin", {
            status: "pending",
            limit: "25",
            order: "desc",
            cursor_id: undefined,
            cursor_sort_at: undefined,
            min_price: undefined,
            max_price: undefined,
        });
        expect(page.totalCount).toBe(2);
        expect(page.results).toEqual([]);
        expect(page.hasNext).toBe(false);
    });

    it("calls the admin RFQ endpoint with resolved status filter", async () => {
        mockApiClientGet.mockResolvedValueOnce({
            body: {
                status: "success",
                data: {
                    totalCount: 1,
                    results: [{ id: "rfq-1", status: "resolved" }],
                    hasNext: false,
                    nextCursor: null,
                },
            },
        });

        const page = await fetchAdminRfqsPage({ status: "resolved", limit: 10, order: "asc" });

        expect(mockApiClientGet).toHaveBeenCalledWith("/rfqs/admin", {
            status: "resolved",
            limit: "10",
            order: "asc",
            cursor_id: undefined,
            cursor_sort_at: undefined,
            min_price: undefined,
            max_price: undefined,
        });
        expect(page.results).toHaveLength(1);
    });

    it("posts resolve to /rfqs/{id}/resolve with an empty JSON body", async () => {
        mockApiClientPost.mockResolvedValueOnce({
            body: {
                status: "success",
                message: "Request marked as resolved.",
            },
        });

        const response = await postAdminRfqResolve("rfq-1");

        expect(mockApiClientPost).toHaveBeenCalledWith("/rfqs/rfq-1/resolve", {});
        expect(mockApiClientPost).toHaveBeenCalledTimes(1);
        expect(response.message).toBe("Request marked as resolved.");
    });
});
