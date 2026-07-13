import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import { ADMIN_AUTH_LOGOUT_PATH } from "@/lib/auth/constants/auth-api.constant";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { LogoutConfirmationModal } from "./logout-confirmation-modal";

const { postMock, closeModalMock, replaceRouteMock } = vi.hoisted(() => ({
    postMock: vi.fn(),
    closeModalMock: vi.fn(),
    replaceRouteMock: vi.fn(),
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

vi.mock("@/lib/auth/utilities/replace-browser-history-route", () => ({
    replaceBrowserHistoryRoute: (...args: unknown[]) => replaceRouteMock(...args),
}));

describe("LogoutConfirmationModal", () => {
    beforeEach(() => {
        postMock.mockReset();
        closeModalMock.mockReset();
        replaceRouteMock.mockReset();
    });

    it("renders the logout confirmation copy", () => {
        renderWithQueryClient(<LogoutConfirmationModal />);

        expect(screen.getByText("Logging out?")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You'll be signed out of your account and will need to login again to continue.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Log Out" })).toBeInTheDocument();
    });

    it("posts logout and redirects to login when Log Out is confirmed", async () => {
        postMock.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Logged out." },
        });

        renderWithQueryClient(<LogoutConfirmationModal />);

        fireEvent.click(screen.getByRole("button", { name: "Log Out" }));

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(ADMIN_AUTH_LOGOUT_PATH);
            expect(replaceRouteMock).toHaveBeenCalledWith(AUTH_LOGIN_ROUTE);
        });
    });
});
