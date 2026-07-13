import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import { getAdminRevokePath } from "@/lib/team/constants/admin-invite.constant";
import { CancelInvitationModal } from "./cancel-invitation-modal";

const { postMock, closeModalMock } = vi.hoisted(() => ({
    postMock: vi.fn(),
    closeModalMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: postMock,
        get: vi.fn(),
    },
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: closeModalMock,
        showModal: vi.fn(),
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("CancelInvitationModal", () => {
    beforeEach(() => {
        postMock.mockReset();
        closeModalMock.mockReset();
    });

    it("calls the revoke endpoint when Cancel invitation is confirmed", async () => {
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation cancelled." },
        });

        renderWithQueryClient(<CancelInvitationModal adminId={adminId} />);

        expect(screen.getByText("Cancel Invitation")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Cancel invitation" }));

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminRevokePath(adminId));
            expect(closeModalMock).toHaveBeenCalled();
        });
    });
});
