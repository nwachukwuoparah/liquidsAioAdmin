import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    useAdminInviteTeamMember,
    useAdminResendInvite,
    useAdminRestoreInvite,
    useAdminRevokeInvite,
} from "@/lib/team/hooks/use-admin-team-member";
import {
    getAdminInviteResendPath,
    getAdminRestorePath,
    getAdminRevokePath,
} from "@/lib/team/constants/admin-invite.constant";

const mockApiClientPost = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: (...args: unknown[]) => mockApiClientPost(...args),
        get: vi.fn(),
    },
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

describe("useAdminInviteTeamMember", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("refetches admin overview and team members after a successful invite", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
                queries: { retry: false },
            },
        });
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation sent." },
        });

        const { result } = renderHook(() => useAdminInviteTeamMember(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync({
                email: "new.admin@liquidsaio.com",
                roleId: "role-admin-1",
                message: "",
                permissions: [],
            });
        });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-teams-overview"] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-team-members"] });
        });
    });
});

describe("useAdminResendInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts the resend endpoint and refetches team data on success", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
                queries: { retry: false },
            },
        });
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation resent." },
        });

        const { result } = renderHook(() => useAdminResendInvite(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync(adminId);
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminInviteResendPath(adminId));
        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-teams-overview"] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-team-members"] });
        });
    });
});

describe("useAdminRevokeInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts the revoke endpoint and refetches team data on success", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
                queries: { retry: false },
            },
        });
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access revoked." },
        });

        const { result } = renderHook(() => useAdminRevokeInvite(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync({
                adminId,
                successMessage: "Access revoked successfully.",
            });
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminRevokePath(adminId));
        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-teams-overview"] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-team-members"] });
        });
    });
});

describe("useAdminRestoreInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts the restore endpoint and refetches team data on success", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
                queries: { retry: false },
            },
        });
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access restored." },
        });

        const { result } = renderHook(() => useAdminRestoreInvite(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync(adminId);
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminRestorePath(adminId));
        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-teams-overview"] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-team-members"] });
        });
    });
});
