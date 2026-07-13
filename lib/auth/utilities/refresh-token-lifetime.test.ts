import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import {
    hasRefreshTokenExpiry,
    isRefreshTokenExpired,
    normalizeRefreshTokenExpiryDate,
    shouldForceLogout,
} from "@/lib/auth/utilities/refresh-token-lifetime";
import {
    clearRefreshTokenExpiry,
    setRefreshTokenExpiry,
} from "@/lib/auth/utilities/refresh-token-expiry-storage";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("refresh-token-lifetime", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        clearRefreshTokenExpiry();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-24T14:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("normalizes URL-encoded refresh expiry values", () => {
        expect(normalizeRefreshTokenExpiryDate("2026-07-09T14%3A24%3A38.435Z")).toBe(
            "2026-07-09T14:24:38.435Z",
        );
    });

    it("detects when refresh token expiry is in the past", () => {
        setRefreshTokenExpiry("2026-06-24T13:59:59.000Z");

        expect(hasRefreshTokenExpiry()).toBe(true);
        expect(isRefreshTokenExpired()).toBe(true);
    });

    it("does not force logout while access JWT is still valid", () => {
        setRefreshTokenExpiry("2026-06-24T13:59:59.000Z");
        setAccessToken(
            buildTestJwt({
                exp: Math.floor(Date.now() / 1000) + 900,
            }),
        );

        expect(shouldForceLogout()).toBe(false);
    });

    it("forces logout when access JWT is expired and refresh expiry is past", () => {
        setRefreshTokenExpiry("2026-06-24T13:59:59.000Z");
        setAccessToken(
            buildTestJwt({
                exp: Math.floor(Date.now() / 1000) - 60,
            }),
        );

        expect(shouldForceLogout()).toBe(true);
    });

    it("does not force logout when refresh expiry is unknown", () => {
        setAccessToken(
            buildTestJwt({
                exp: Math.floor(Date.now() / 1000) - 60,
            }),
        );

        expect(shouldForceLogout()).toBe(false);
    });
});
