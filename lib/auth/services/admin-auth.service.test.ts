import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";
import { adminSignup, adminGetAuthenticatorAppSetup, adminVerifyAuthenticatorAppSetup, adminVerify2FaCode } from "./admin-auth.service";

const mockApiClientGet = vi.fn();
const mockApiClientPost = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: (...args: unknown[]) => mockApiClientGet(...args),
        post: (...args: unknown[]) => mockApiClientPost(...args),
    },
}));

describe("adminSignup", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
        clearAllCookiesForTests();
    });

    it("returns setup and access tokens on success", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: "signup-setup-token",
            token: "signup-access-token",
            body: { status: "success", message: "Account created.", data: { email: "admin@liquidsaio.com" } },
        });

        const signupResult = await adminSignup({
            inviteToken: "invite-token",
            inviteEmail: "admin@liquidsaio.com",
            requestBody: {
                firstName: "Samuel",
                lastName: "Nathaniel",
                password: "password123",
                phoneNumber: "+12025550123",
                phoneNumberCountryCode: "US",
            },
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(
            "/v1/auth/admin/signup",
            {
                firstName: "Samuel",
                lastName: "Nathaniel",
                password: "password123",
                phoneNumber: "+12025550123",
                phoneNumberCountryCode: "US",
            },
            {
                token: "invite-token",
            },
        );
        expect(signupResult.setupToken).toBe("signup-setup-token");
        expect(signupResult.accessToken).toBe("signup-access-token");
        expect(signupResult.email).toBe("admin@liquidsaio.com");
        expect(signupResult.data).toEqual({ email: "admin@liquidsaio.com" });
    });
});

describe("adminGetAuthenticatorAppSetup", () => {
    beforeEach(() => {
        mockApiClientGet.mockReset();
    });

    it("returns QR code and manual entry details using the setup token header", async () => {
        mockApiClientGet.mockResolvedValue({
            setupToken: null,
            token: null,
            body: {
                status: "success",
                data: {
                    qrcode: "https://example.com/qr.png",
                    setupKey: "ABCD-1234",
                },
            },
        });

        const setupData = await adminGetAuthenticatorAppSetup("setup-token");

        expect(mockApiClientGet).toHaveBeenCalledWith(
            "/v1/auth/admin/authenticator-app/setup",
            undefined,
            {
                token: "setup-token",
            },
        );
        expect(setupData).toEqual({
            qrCodeImageUrl: "https://example.com/qr.png",
            manualEntryCode: "ABCD-1234",
        });
    });
});

describe("adminVerifyAuthenticatorAppSetup", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("verifies setup with setup token header and OTP code body", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: "verified-access-token",
            body: { status: "success", message: "Two-factor authentication enabled." },
        });

        const verifyResult = await adminVerifyAuthenticatorAppSetup({
            setupToken: "setup-token",
            code: "123456",
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(
            "/v1/auth/admin/authenticator-app/verify",
            { code: "123456" },
            {
                token: "setup-token",
            },
        );
        expect(verifyResult.token).toBe("verified-access-token");
        expect(verifyResult.body.message).toBe("Two-factor authentication enabled.");
    });
});

describe("adminVerify2FaCode", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("verifies 2FA with OTP code using the stored access token cookie", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: "signed-in-access-token",
            body: { status: "success", message: "Authentication verified." },
        });

        const verifyResult = await adminVerify2FaCode("123456");

        expect(mockApiClientPost).toHaveBeenCalledWith("/v1/auth/admin/verify-2fa-code", {
            code: "123456",
        });
        expect(verifyResult.token).toBe("signed-in-access-token");
        expect(verifyResult.body.message).toBe("Authentication verified.");
    });
});
