import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddTeamMemberModal } from "./add-team-member-modal";

const mutateAsyncMock = vi.fn();

vi.mock("@/lib/team/hooks/use-admin-team-member", () => ({
    useAdminInviteTeamMember: (options?: { onSuccess?: () => void }) => ({
        mutateAsync: async (payload: unknown) => {
            await mutateAsyncMock(payload);
            options?.onSuccess?.();
        },
        isPending: false,
    }),
    useAdminTeamPermissions: () => ({
        data: {
            rolePermissions: [
                {
                    id: "role-admin-1",
                    name: "admin",
                    permissions: [
                        { id: "view-settings", resource: "settings", action: "view", scope: "*" },
                        {
                            id: "edit-settings-general",
                            resource: "settings",
                            action: "edit",
                            scope: "general",
                        },
                        {
                            id: "edit-settings-teams",
                            resource: "settings",
                            action: "edit",
                            scope: "teams",
                        },
                    ],
                },
            ],
            permissions: [
                { id: "view-settings", resource: "settings", action: "view", scope: "*" },
            ],
        },
        isLoading: false,
    }),
}));

function renderAddTeamMemberModal(
    props: Partial<ComponentProps<typeof AddTeamMemberModal>> = {},
) {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <AddTeamMemberModal onClose={vi.fn()} {...props} />
        </QueryClientProvider>,
    );
}

describe("AddTeamMemberModal", () => {
    beforeEach(() => {
        mutateAsyncMock.mockReset();
        mutateAsyncMock.mockResolvedValue({ status: "success", message: "Invitation sent." });
    });

    it("renders required-field asterisks by default", () => {
        renderAddTeamMemberModal();

        expect(screen.getAllByText("*")).toHaveLength(2);
    });

    it("hides required-field asterisks when disabled", () => {
        renderAddTeamMemberModal({ showRequiredIndicator: false });

        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("shows validation errors for invalid submissions", async () => {
        renderAddTeamMemberModal();

        fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));

        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(mutateAsyncMock).not.toHaveBeenCalled();
    });

    it("places the close button before the title on mobile", () => {
        renderAddTeamMemberModal();

        const closeButton = screen.getByRole("button", {
            name: "Close add team member modal",
        });
        const modalTitle = screen.getByRole("heading", { name: "Add team member" });

        expect(
            closeButton.compareDocumentPosition(modalTitle) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("renders every settings permission variant from catalog and roles", async () => {
        renderAddTeamMemberModal();

        fireEvent.click(screen.getByTestId("add-team-member-role"));
        fireEvent.click(screen.getByText("Admin"));

        expect(await screen.findByText("View settings")).toBeInTheDocument();
        expect(screen.getByText("Edit settings · general")).toBeInTheDocument();
        expect(screen.getByText("Edit settings · teams")).toBeInTheDocument();
    });

    it("submits a valid invite and closes the modal", async () => {
        const onClose = vi.fn();

        renderAddTeamMemberModal({ onClose });

        fireEvent.change(screen.getByLabelText(/Email address/i), {
            target: { value: "new.admin@liquidsaio.com" },
        });
        fireEvent.click(screen.getByTestId("add-team-member-role"));
        fireEvent.click(screen.getByText("Admin"));
        fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: "new.admin@liquidsaio.com",
                    roleId: "role-admin-1",
                }),
            );
        });

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
