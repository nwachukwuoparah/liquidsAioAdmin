import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalProvider } from "@/context/modal-provider";
import {
    getAdminInviteResendPath,
    getAdminRestorePath,
    getAdminRevokePath,
} from "@/lib/team/constants/admin-invite.constant";
import { TeamsAndPermissions } from "./teams-permissions";

function renderTeamsPage(ui: ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <ModalProvider>{children}</ModalProvider>
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper });
}

const { getMock, postMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    postMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        post: postMock,
    },
}));

vi.mock("@/lib/team/hooks/use-open-add-team-member-modal", () => ({
    useOpenAddTeamMemberModal: () => vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const pendingAdminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const activeAdminId = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const revokedAdminId = "c3d4e5f6-a7b8-9012-cdef-123456789012";

function mockTeamsApis(status: "pending" | "active" | "revoked" = "pending") {
    const adminId =
        status === "pending"
            ? pendingAdminId
            : status === "active"
              ? activeAdminId
              : revokedAdminId;

    getMock.mockImplementation((path: string) => {
        if (path === "/admins/overview") {
            return Promise.resolve({
                body: {
                    status: "success",
                    data: {
                        activeMembers: status === "active" ? 1 : 0,
                        pendingInvites: status === "pending" ? 1 : 0,
                        revokedAdmins: status === "revoked" ? 1 : 0,
                    },
                },
            });
        }

        return Promise.resolve({
            body: {
                status: "success",
                data: {
                    results: 1,
                    hasNext: false,
                    nextCursor: null,
                    admins: [
                        {
                            id: adminId,
                            firstName: "Sarah",
                            lastName: "Chen",
                            email: "sarah@liquidsaio.com",
                            roles: [{ name: "admin" }],
                            status: status === "revoked" ? "active" : status,
                            revoked: status === "revoked",
                            lastActive: status === "active" ? "2026-07-01T12:00:00.000Z" : null,
                        },
                    ],
                },
            },
        });
    });
}

describe("TeamsAndPermissions invite actions", () => {
    beforeEach(() => {
        getMock.mockReset();
        postMock.mockReset();
    });

    it("calls the resend invite API and spins the icon while pending", async () => {
        mockTeamsApis("pending");
        let resolvePost: ((value: unknown) => void) | undefined;
        postMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolvePost = resolve;
                }),
        );

        renderTeamsPage(<TeamsAndPermissions />);

        const resendButtons = await screen.findAllByRole("button", { name: "Resend invite" });
        const resendButton = resendButtons[0];
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminInviteResendPath(pendingAdminId));
        });

        await waitFor(() => {
            for (const button of resendButtons) {
                const iconClass =
                    button.querySelector("svg")?.className.baseVal ||
                    button.querySelector("svg")?.getAttribute("class") ||
                    "";
                expect(iconClass).toContain("animate-spin");
                expect(button).toBeDisabled();
            }
        });

        resolvePost?.({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation resent." },
        });

        await waitFor(() => {
            for (const button of resendButtons) {
                expect(button).not.toBeDisabled();
            }
        });
    });

    it("opens Cancel Invitation modal from the red X and revokes on confirm", async () => {
        mockTeamsApis("pending");
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation cancelled." },
        });

        renderTeamsPage(<TeamsAndPermissions />);

        const cancelButtons = await screen.findAllByRole("button", { name: "Cancel invite" });
        fireEvent.click(cancelButtons[0]);

        const cancelDialog = await screen.findByRole("dialog");
        expect(within(cancelDialog).getByText("Cancel Invitation")).toBeInTheDocument();
        fireEvent.click(within(cancelDialog).getByRole("button", { name: "Cancel invitation" }));

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminRevokePath(pendingAdminId));
        });
    });

    it("opens Revoke access modal from the delete icon and revokes on confirm", async () => {
        mockTeamsApis("active");
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access revoked." },
        });

        renderTeamsPage(<TeamsAndPermissions />);

        const revokeIconButtons = await screen.findAllByRole("button", { name: "Revoke access" });
        fireEvent.click(revokeIconButtons[0]);

        const revokeDialog = await screen.findByRole("dialog");
        expect(within(revokeDialog).getByText(/Are you sure you want to revoke/i)).toBeInTheDocument();
        expect(
            within(revokeDialog).getByPlaceholderText(
                "e.g. No longer part of the operations team.",
            ),
        ).toBeInTheDocument();

        fireEvent.click(within(revokeDialog).getByRole("button", { name: "Revoke access" }));

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminRevokePath(activeAdminId));
        });
    });

    it("shows Revoked status and Restore button when revoked is true", async () => {
        mockTeamsApis("revoked");
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access restored." },
        });

        renderTeamsPage(<TeamsAndPermissions />);

        expect(await screen.findAllByText("Revoked")).not.toHaveLength(0);
        expect(screen.queryByRole("button", { name: "Resend invite" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Cancel invite" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Revoke access" })).not.toBeInTheDocument();

        const restoreButtons = await screen.findAllByRole("button", { name: "Restore access" });
        fireEvent.click(restoreButtons[0]);

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminRestorePath(revokedAdminId));
        });
    });
});
