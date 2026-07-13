import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import { getAdminRevokePath } from "@/lib/team/constants/admin-invite.constant";
import { RevokeTeamAccessModal } from "./revoke-team-access-modal";

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

const adminId = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

describe("RevokeTeamAccessModal", () => {
    beforeEach(() => {
        postMock.mockReset();
        closeModalMock.mockReset();
    });

    it("calls the revoke endpoint when Revoke access is confirmed", async () => {
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access revoked." },
        });

        renderWithQueryClient(
            <RevokeTeamAccessModal adminId={adminId} memberName="Sarah Chen" />,
        );

        expect(
            screen.getByPlaceholderText("e.g. No longer part of the operations team."),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Revoke access" }));

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(getAdminRevokePath(adminId));
            expect(closeModalMock).toHaveBeenCalled();
        });
    });
});
