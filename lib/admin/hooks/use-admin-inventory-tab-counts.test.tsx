import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminInventoryTabCounts } from "./use-admin-inventory";

const fetchAdminInventoryLotsPageMock = vi.fn();

vi.mock("@/lib/inventory/services/admin-inventory.service", () => ({
    fetchAdminInventoryLotsPage: (...args: unknown[]) => fetchAdminInventoryLotsPageMock(...args),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe("useAdminInventoryTabCounts", () => {
    beforeEach(() => {
        fetchAdminInventoryLotsPageMock.mockReset();
        fetchAdminInventoryLotsPageMock.mockImplementation(async (params: Record<string, string>) => {
            if (params.review_status === "pending") {
                return { totalCount: 12, results: [], page: 1, limit: 1, totalPages: 12, hasNext: true, hasPrevious: false };
            }
            if (params.reported_lots === "true") {
                return { totalCount: 3, results: [], page: 1, limit: 1, totalPages: 3, hasNext: true, hasPrevious: false };
            }
            if (params.review_status === "suspended") {
                return { totalCount: 1, results: [], page: 1, limit: 1, totalPages: 1, hasNext: false, hasPrevious: false };
            }
            return { totalCount: 48, results: [], page: 1, limit: 1, totalPages: 48, hasNext: true, hasPrevious: false };
        });
    });

    it("loads each tab count from GET /lots totals", async () => {
        const { result } = renderHook(() => useAdminInventoryTabCounts(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.tabCounts).toEqual({
                allLots: 48,
                pendingApproval: 12,
                reported: 3,
                suspended: 1,
            });
        });

        expect(fetchAdminInventoryLotsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ page: "1", limit: "1" }),
        );
        expect(fetchAdminInventoryLotsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ review_status: "pending", limit: "1" }),
        );
        expect(fetchAdminInventoryLotsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ reported_lots: "true", limit: "1" }),
        );
        expect(fetchAdminInventoryLotsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ review_status: "suspended", limit: "1" }),
        );
    });
});
