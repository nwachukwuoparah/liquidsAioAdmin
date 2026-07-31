import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import ComplianceBody from "./page";

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
    useAdminComplianceReviews: () => ({
        data: { pages: [{ results: [], hasNext: false }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
    }),
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
    default: () => null,
    COMPLIANCE_FILTER_BLUEPRINTS: [],
}));

vi.mock("@/components/compliance-audit-logs", () => ({
    default: () => <div data-testid="compliance-audit-logs">Audit trail panel</div>,
}));

describe("ComplianceBody tabs", () => {
    beforeEach(() => {
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

    it("renders the audit trail panel when Audit logs is selected", () => {
        renderWithQueryClient(<ComplianceBody />);

        fireEvent.click(screen.getAllByText("Audit logs")[0]!);

        expect(screen.getAllByTestId("compliance-audit-logs").length).toBeGreaterThan(0);
    });
});
