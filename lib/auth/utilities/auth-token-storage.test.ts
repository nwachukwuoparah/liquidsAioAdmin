import { beforeEach, describe, expect, it } from "vitest";
import {
    ACCESS_TOKEN_HEADER,
    ACCESS_TOKEN_STORAGE_KEY,
    LEGACY_ACCESS_TOKEN_STORAGE_KEYS,
} from "@/lib/auth/constants/auth-api.constant";
import {
    cacheAccessTokenFromHeaders,
    clearAuthSession,
    getAccessToken,
    hasAuthSession,
    setAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import { clearAllCookiesForTests, getCookieValue, setCookieValue } from "@/lib/helpers/cookie-storage";

describe("auth-token-storage", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
    });

    it("stores and reads the access token cookie", () => {
        setAccessToken("access-token");

        expect(getAccessToken()).toBe("access-token");
        expect(getCookieValue(ACCESS_TOKEN_STORAGE_KEY)).toBe("access-token");
    });

    it("reads legacy access token cookies during migration", () => {
        setCookieValue("laioat", "legacy-access-token", {
            maxAgeSeconds: 3600,
        });

        expect(getAccessToken()).toBe("legacy-access-token");
    });

    it("clears ephemeral sign-up cookies when persisting an access token", () => {
        setCookieValue("x_lai_last_path", "/sign-up?token=abc", { maxAgeSeconds: 3600 });
        setCookieValue("x_laiort", "legacy-token", { maxAgeSeconds: 3600 });

        setAccessToken("access-token");

        expect(getCookieValue("x_lai_last_path")).toBeNull();
        expect(getCookieValue("x_laiort")).toBeNull();
        expect(getCookieValue(ACCESS_TOKEN_STORAGE_KEY)).toBe("access-token");
    });

    it("clears ephemeral sign-up cookies on logout", () => {
        setCookieValue("x_lai_last_path", "/sign-up?token=abc", { maxAgeSeconds: 3600 });

        clearAuthSession();

        expect(getCookieValue("x_lai_last_path")).toBeNull();
    });

    it("caches laioat from response headers", () => {
        cacheAccessTokenFromHeaders(
            new Headers({
                [ACCESS_TOKEN_HEADER]: "header-access-token",
            }),
        );

        expect(getAccessToken()).toBe("header-access-token");
    });

    it("clears the auth session", () => {
        setAccessToken("access-token");

        clearAuthSession();

        expect(getAccessToken()).toBeNull();
        expect(getCookieValue(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
        for (const legacyStorageKey of LEGACY_ACCESS_TOKEN_STORAGE_KEYS) {
            expect(getCookieValue(legacyStorageKey)).toBeNull();
        }
    });

    it("detects an active auth session", () => {
        expect(hasAuthSession()).toBe(false);

        setAccessToken("access-token");
        expect(hasAuthSession()).toBe(true);
    });
});
