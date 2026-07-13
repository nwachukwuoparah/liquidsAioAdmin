import { describe, expect, it } from "vitest";
import { ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA } from "@/lib/auth/constants/two-factor.constant";
import {
    hasFullyAuthenticatedSession,
    shouldRedirectToTwoFactorSetup,
    shouldRedirectUnauthenticatedUserToLogin,
} from "@/lib/auth/utilities/auth-middleware";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants/auth-api.constant";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

function createRequestCookies(accessToken: string | null) {
    return {
        get: (cookieName: string) =>
            cookieName === ACCESS_TOKEN_STORAGE_KEY && accessToken
                ? { value: accessToken }
                : undefined,
    };
}

describe("hasFullyAuthenticatedSession", () => {
    it("returns true when the access token is not pending 2FA setup", () => {
        const accessToken = buildTestJwt({ status: "active" });

        expect(hasFullyAuthenticatedSession(createRequestCookies(accessToken))).toBe(true);
    });

    it("returns false when the access token is pending 2FA setup", () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
        });

        expect(hasFullyAuthenticatedSession(createRequestCookies(accessToken))).toBe(false);
    });

    it("returns false when no access token cookie is present", () => {
        expect(hasFullyAuthenticatedSession(createRequestCookies(null))).toBe(false);
    });
});

describe("middleware redirects", () => {
    it("redirects users with a pending 2FA token away from the dashboard", () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
        });

        expect(
            shouldRedirectToTwoFactorSetup("/overview", createRequestCookies(accessToken)),
        ).toBe(true);
    });

    it("does not redirect users with a completed 2FA token away from the dashboard", () => {
        const accessToken = buildTestJwt({ status: "active" });

        expect(
            shouldRedirectToTwoFactorSetup("/overview", createRequestCookies(accessToken)),
        ).toBe(false);
    });

    it("blocks guests from protected admin routes", () => {
        expect(shouldRedirectUnauthenticatedUserToLogin("/overview", false)).toBe(true);
    });
});
