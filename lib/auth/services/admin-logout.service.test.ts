import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_AUTH_LOGOUT_PATH } from "@/lib/auth/constants/auth-api.constant";
import { adminLogout } from "@/lib/auth/services/admin-logout.service";

const mockApiClientPost = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: (...args: unknown[]) => mockApiClientPost(...args),
    },
}));

describe("adminLogout", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts to the admin logout endpoint", async () => {
        mockApiClientPost.mockResolvedValueOnce({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: { status: "success", message: "Logged out." },
        });

        const logoutResult = await adminLogout();

        expect(mockApiClientPost).toHaveBeenCalledWith(ADMIN_AUTH_LOGOUT_PATH);
        expect(logoutResult).toEqual({
            status: "success",
            message: "Logged out.",
        });
    });
});
