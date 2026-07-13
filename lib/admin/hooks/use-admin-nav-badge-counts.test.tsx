import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAdminNavBadgeCounts } from "./use-admin-nav-badge-counts";

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceOverview: () => ({
        data: { overview: { pending: 42, approved: 18, rejected: 3 } },
    }),
}));

vi.mock("@/lib/admin/hooks/use-admin-rfqs", () => ({
    useAdminRfqTabCounts: () => ({
        pending: 109,
        resolved: 4,
    }),
}));

vi.mock("@/lib/admin/hooks/use-admin-inventory", () => ({
    useAdminInventoryTabCounts: () => ({
        tabCounts: { allLots: 1247, pendingApproval: 154, reported: 32, suspended: 18 },
        isLoading: false,
        isError: false,
    }),
}));

describe("useAdminNavBadgeCounts", () => {
    it("maps live pending counts onto the three queue nav badges", () => {
        const { result } = renderHook(() => useAdminNavBadgeCounts());

        expect(result.current).toEqual({
            compliance: "42",
            rfqs: "99+",
            inventory: "99+",
        });
    });
});
