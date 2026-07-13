import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import BuyerRFQsBody from "./page";

vi.mock("@/lib/admin/hooks", () => ({
    useAdminRfqs: () => ({
        data: { rfqs: [], totalCount: 0, hasNext: false },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
    useAdminRfqTabCounts: () => ({
        pending: 109,
        resolved: 4,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
}));

vi.mock("@/components/rfq-action-menu", () => ({
    default: () => null,
}));

describe("BuyerRFQsBody tabs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows live pending and resolved counts on every tab", () => {
        renderWithQueryClient(<BuyerRFQsBody />);

        expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Resolved").length).toBeGreaterThan(0);
        expect(screen.getAllByText("99+").length).toBeGreaterThan(0);
        expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    });
});
