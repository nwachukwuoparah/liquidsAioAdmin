import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY,
    REFRESH_TOKEN_EXPIRY_COOKIE_KEY,
    REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY,
    REFRESH_TOKEN_EXPIRY_MISSING_MARKER,
    REFRESH_TOKEN_EXPIRY_STORAGE_KEY,
} from "@/lib/auth/constants/auth-api.constant";
import {
    clearRefreshTokenExpiry,
    flushPendingRefreshTokenExpiryLog,
    getRefreshTokenExpiry,
    logAndPersistRefreshTokenExpiry,
    setRefreshTokenExpiry,
} from "@/lib/auth/utilities/refresh-token-expiry-storage";
import { clearAllCookiesForTests, getCookieValue } from "@/lib/helpers/cookie-storage";
import { deleteLocalStorageValue, getLocalStorageValue } from "@/lib/helpers/local-storage";
import {
    deleteSessionStorageValue,
    getSessionStorageValue,
} from "@/lib/helpers/session-storage";

describe("refresh-token-expiry-storage", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        deleteLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY);
        deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY);
        deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY);
    });

    it("persists refresh expiry to localStorage and cookie", () => {
        setRefreshTokenExpiry("2026-12-31T23:59:59.000Z");

        expect(getRefreshTokenExpiry()).toBe("2026-12-31T23:59:59.000Z");
        expect(getLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY)).toBe(
            "2026-12-31T23:59:59.000Z",
        );
        expect(getCookieValue(REFRESH_TOKEN_EXPIRY_COOKIE_KEY)).toBe("2026-12-31T23:59:59.000Z");
    });

    it("queues refresh expiry capture and persists it when the header value is present", () => {
        logAndPersistRefreshTokenExpiry("2026-12-31T23:59:59.000Z");

        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY)).toBe("true");
        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY)).toBe(
            "2026-12-31T23:59:59.000Z",
        );
        expect(getRefreshTokenExpiry()).toBe("2026-12-31T23:59:59.000Z");
    });

    it("queues a missing marker when refresh expiry header is absent", () => {
        logAndPersistRefreshTokenExpiry(null);

        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY)).toBe("true");
        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY)).toBe(
            REFRESH_TOKEN_EXPIRY_MISSING_MARKER,
        );
        expect(getRefreshTokenExpiry()).toBeNull();
    });

    it("logs the captured refresh expiry after the post-verify redirect", () => {
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

        logAndPersistRefreshTokenExpiry("2026-12-31T23:59:59.000Z");
        flushPendingRefreshTokenExpiryLog();

        expect(consoleLogSpy).toHaveBeenCalledWith(
            `${REFRESH_TOKEN_EXPIRY_COOKIE_KEY}:`,
            "2026-12-31T23:59:59.000Z",
        );
        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY)).toBeNull();

        consoleLogSpy.mockRestore();
    });

    it("logs when refresh expiry header was missing after the post-verify redirect", () => {
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

        logAndPersistRefreshTokenExpiry(null);
        flushPendingRefreshTokenExpiryLog();

        expect(consoleLogSpy).toHaveBeenCalledWith("i did not find it to the console");

        consoleLogSpy.mockRestore();
    });

    it("clears refresh expiry from localStorage, cookie, and session markers", () => {
        setRefreshTokenExpiry("2026-12-31T23:59:59.000Z");
        logAndPersistRefreshTokenExpiry("2026-12-31T23:59:59.000Z");

        clearRefreshTokenExpiry();

        expect(getRefreshTokenExpiry()).toBeNull();
        expect(getLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY)).toBeNull();
        expect(getCookieValue(REFRESH_TOKEN_EXPIRY_COOKIE_KEY)).toBeNull();
        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY)).toBeNull();
        expect(getSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY)).toBeNull();
    });
});
