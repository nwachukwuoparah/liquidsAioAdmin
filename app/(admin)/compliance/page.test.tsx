import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import ComplianceBody from "./page";

const mockUseAdminComplianceReviews = vi.fn();

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceOverview: () => ({
        data: {
            overview: {
                pending: 42,
                approved: 18,
                rejected: 3,
            },
        },
        isLoading: false,
    }),
    useAdminComplianceReviews: (...args: any[]) => mockUseAdminComplianceReviews(...args),
    useAdminComplianceAuditLogs: () => ({
        data: { pages: [{ results: [], hasNext: false }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
    }),
}));

vi.mock("@/components/compliance-action-menu", () => ({
    default: () => null,
}));

vi.mock("@/components/compliance-filters", () => ({
    default: ({ searchQuery, onSearchChange, onFilterChange }: any) => (
        <div data-testid="compliance-filters">
            <input
                data-testid="mock-compliance-search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <button
                type="button"
                data-testid="filter-status-rejected"
                onClick={() => onFilterChange("compliance_review_status", "Rejected")}
            >
                Filter Rejected
            </button>
            <button
                type="button"
                data-testid="filter-status-all"
                onClick={() => onFilterChange("compliance_review_status", "All statuses")}
            >
                Filter All
            </button>
            <button
                type="button"
                data-testid="filter-status-in-review"
                onClick={() => onFilterChange("compliance_review_status", "In review")}
            >
                Filter In review
            </button>
            <button
                type="button"
                data-testid="filter-custom-date"
                onClick={() => onFilterChange("dateRange", "custom:2026-06-01:2026-06-18")}
            >
                Filter Custom Date
            </button>
        </div>
    ),
    COMPLIANCE_FILTER_BLUEPRINTS: [],
}));

vi.mock("@/components/compliance-audit-logs", () => ({
    default: () => <div data-testid="compliance-audit-logs">Audit trail panel</div>,
}));

describe("ComplianceBody", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        mockUseAdminComplianceReviews.mockReturnValue({
            data: { pages: [{ results: [], hasNext: false }] },
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: vi.fn(),
        });
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("shows overview counts on Pending, Approved, and Rejected tabs", () => {
        renderWithQueryClient(<ComplianceBody />);

        expect(screen.getAllByText("42").length).toBeGreaterThan(0);
        expect(screen.getAllByText("18").length).toBeGreaterThan(0);
        expect(screen.getAllByText("3").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Rejected").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Audit logs").length).toBeGreaterThan(0);
    });

    it("initializes with pending compliance status filter", () => {
        renderWithQueryClient(<ComplianceBody />);

        expect(mockUseAdminComplianceReviews).toHaveBeenCalledWith(
            expect.objectContaining({ compliance_review_status: "pending" }),
            true,
        );
    });

    it("switches query param when Approved tab is clicked", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getAllByText("Approved")[0]!);
        });

        expect(mockUseAdminComplianceReviews).toHaveBeenLastCalledWith(
            expect.objectContaining({ compliance_review_status: "approved" }),
            true,
        );
    });

    it("updates query param when review status dropdown filter changes to Rejected", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getByTestId("filter-status-rejected"));
        });

        expect(mockUseAdminComplianceReviews).toHaveBeenLastCalledWith(
            expect.objectContaining({ compliance_review_status: "rejected" }),
            true,
        );
    });

    it("omits compliance_review_status when All statuses is chosen in filter dropdown", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getByTestId("filter-status-all"));
        });

        const lastCallQuery = mockUseAdminComplianceReviews.mock.calls.at(-1)?.[0];
        expect(lastCallQuery?.compliance_review_status).toBeUndefined();
    });

    it("updates query param when review status dropdown filter changes to In review", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getByTestId("filter-status-in-review"));
        });

        expect(mockUseAdminComplianceReviews).toHaveBeenLastCalledWith(
            expect.objectContaining({ compliance_review_status: "in_review" }),
            true,
        );
    });

    it("passes start and end timestamps when custom date range is selected", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getByTestId("filter-custom-date"));
        });

        const lastCallQuery = mockUseAdminComplianceReviews.mock.calls.at(-1)?.[0];
        expect(lastCallQuery?.start).toBe(new Date(2026, 5, 1, 0, 0, 0, 0).toISOString());
        expect(lastCallQuery?.end).toBe(new Date(2026, 5, 18, 23, 59, 59, 999).toISOString());
    });

    it("debounces email search input and queries by email", () => {
        renderWithQueryClient(<ComplianceBody />);

        const searchInput = screen.getByTestId("mock-compliance-search");
        act(() => {
            fireEvent.change(searchInput, { target: { value: "Admin@Domain.com" } });
        });

        // Before 300ms, email should not be in the query
        expect(mockUseAdminComplianceReviews.mock.calls.at(-1)?.[0]?.email).toBeUndefined();

        // Advance debounce timer
        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(mockUseAdminComplianceReviews).toHaveBeenLastCalledWith(
            expect.objectContaining({ email: "admin@domain.com" }),
            true,
        );
    });

    it("renders the audit trail panel when Audit logs is selected", () => {
        renderWithQueryClient(<ComplianceBody />);

        act(() => {
            fireEvent.click(screen.getAllByText("Audit logs")[0]!);
        });

        expect(screen.getAllByTestId("compliance-audit-logs").length).toBeGreaterThan(0);
    });
});
