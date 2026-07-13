import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import {
    useAdminComplianceClaim,
    useAdminComplianceUnclaim,
} from "@/lib/admin/hooks/use-admin-compliance";
import type { AdminComplianceDetailRecord } from "@/lib/compliance/types/admin-compliance-detail.types";

const { postClaimMock, postUnclaimMock } = vi.hoisted(() => ({
    postClaimMock: vi.fn(),
    postUnclaimMock: vi.fn(),
}));

vi.mock("@/lib/compliance/services/admin-compliance.service", () => ({
    fetchAdminComplianceReviewsPage: vi.fn(),
    fetchAdminComplianceDetail: vi.fn(),
    postAdminComplianceActionRequest: vi.fn(),
    postAdminComplianceAssignee: vi.fn(),
    postAdminComplianceClaim: postClaimMock,
    postAdminComplianceUnclaim: postUnclaimMock,
}));

vi.mock("@/lib/admin/services/admin-dashboard.service", () => ({
    fetchAdminComplianceOverview: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

const sampleDetail: AdminComplianceDetailRecord = {
    id: "user-1",
    email: "buyer@example.com",
    accountType: "buyer",
    complianceReviewStatus: "pending",
    submittedAt: "2026-05-29T00:00:00.000Z",
    complianceUpdatedAt: "",
    documentsApprovedCount: 0,
    documentsTotalCount: 2,
    assignedTo: "",
    assigneeOptions: [],
    verificationType: "kyc",
    verificationId: "kyc-1",
    documents: [],
};

describe("useAdminComplianceClaim", () => {
    beforeEach(() => {
        postClaimMock.mockReset();
        postUnclaimMock.mockReset();
    });

    it("patches the detail cache with the claimer name when the server still returns unassigned", async () => {
        postClaimMock.mockResolvedValue({ message: "Compliance case claimed." });

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        queryClient.setQueryData(["admin-compliance-detail", "user-1"], sampleDetail);
        vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

        const { result } = renderHook(() => useAdminComplianceClaim("user-1"), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync("Jude Nnamdi");
        });

        await waitFor(() => {
            expect(queryClient.getQueryData<AdminComplianceDetailRecord>(["admin-compliance-detail", "user-1"])?.assignedTo).toBe(
                "Jude Nnamdi",
            );
        });
    });
});

describe("useAdminComplianceUnclaim", () => {
    it("clears the assigned reviewer in the detail cache after unclaim", async () => {
        postUnclaimMock.mockResolvedValue({ message: "Compliance case released." });

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        queryClient.setQueryData(["admin-compliance-detail", "user-1"], {
            ...sampleDetail,
            assignedTo: "Jude Nnamdi",
        });
        vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

        const { result } = renderHook(() => useAdminComplianceUnclaim("user-1"), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync();
        });

        await waitFor(() => {
            expect(queryClient.getQueryData<AdminComplianceDetailRecord>(["admin-compliance-detail", "user-1"])?.assignedTo).toBe(
                "",
            );
        });
    });
});
