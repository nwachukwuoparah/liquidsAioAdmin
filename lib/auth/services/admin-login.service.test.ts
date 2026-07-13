import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_AUTH_LOGIN_PATH } from "@/lib/auth/constants/auth-api.constant";
import { adminLogin } from "@/lib/auth/services/admin-login.service";

const mockApiClientPost = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: (...args: unknown[]) => mockApiClientPost(...args),
    },
}));

describe("adminLogin", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("returns tokens from response headers on success", async () => {
        mockApiClientPost.mockResolvedValueOnce({
            setupToken: "setup-token",
            token: "access-token",
            refreshTokenExpiry: null,
            body: { status: "success", message: "Welcome back." },
        });

        const loginResult = await adminLogin({
            email: "admin@liquidsaio.com",
            password: "password123",
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(ADMIN_AUTH_LOGIN_PATH, {
            email: "admin@liquidsaio.com",
            password: "password123",
        });
        expect(loginResult.setupToken).toBe("setup-token");
        expect(loginResult.token).toBe("access-token");
        expect(loginResult.body).toEqual({
            status: "success",
            message: "Welcome back.",
        });
    });
});
