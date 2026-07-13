import {
    REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY,
    REFRESH_TOKEN_EXPIRY_COOKIE_KEY,
    REFRESH_TOKEN_EXPIRY_COOKIE_MAX_AGE_SECONDS,
    REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY,
    REFRESH_TOKEN_EXPIRY_MISSING_MARKER,
    REFRESH_TOKEN_EXPIRY_STORAGE_KEY,
} from "@/lib/auth/constants/auth-api.constant";
import { deleteCookieValue, getCookieValue, setCookieValue } from "@/lib/helpers/cookie-storage";
import {
    deleteLocalStorageValue,
    getLocalStorageValue,
    setLocalStorageValue,
} from "@/lib/helpers/local-storage";
import {
    deleteSessionStorageValue,
    getSessionStorageValue,
    setSessionStorageValue,
} from "@/lib/helpers/session-storage";

const REFRESH_EXPIRY_NOT_FOUND_LOG_MESSAGE = "i did not find it to the console";

/** Reads the stored refresh token expiry date from localStorage or cookie. */
export function getRefreshTokenExpiry(): string | null {
    const localStorageExpiry = getLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY);

    if (localStorageExpiry) {
        return localStorageExpiry;
    }

    return getCookieValue(REFRESH_TOKEN_EXPIRY_COOKIE_KEY);
}

/**
 * Persists refresh token expiry in localStorage and a long-lived cookie.
 * @param refreshTokenExpiry - ISO expiry date from the x-laiort-expiry-date response header.
 */
export function setRefreshTokenExpiry(refreshTokenExpiry: string): void {
    const normalizedRefreshTokenExpiry = (() => {
        try {
            return decodeURIComponent(refreshTokenExpiry.trim());
        } catch {
            return refreshTokenExpiry.trim();
        }
    })();

    setLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY, normalizedRefreshTokenExpiry);
    setCookieValue(REFRESH_TOKEN_EXPIRY_COOKIE_KEY, normalizedRefreshTokenExpiry, {
        maxAgeSeconds: REFRESH_TOKEN_EXPIRY_COOKIE_MAX_AGE_SECONDS,
    });
}

/** Clears the stored refresh token expiry from localStorage and cookies. */
export function clearRefreshTokenExpiry(): void {
    deleteLocalStorageValue(REFRESH_TOKEN_EXPIRY_STORAGE_KEY);
    deleteCookieValue(REFRESH_TOKEN_EXPIRY_COOKIE_KEY);
    deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY);
    deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY);
}

/**
 * Queues the refresh expiry log for the next page load after verify redirects.
 * Full-page navigation clears the console, so the log is flushed on the dashboard.
 * @param refreshTokenExpiry - Value from the x-laiort-expiry-date response header.
 */
export function logAndPersistRefreshTokenExpiry(refreshTokenExpiry: string | null): void {
    setSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY, "true");
    setSessionStorageValue(
        REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY,
        refreshTokenExpiry ?? REFRESH_TOKEN_EXPIRY_MISSING_MARKER,
    );

    if (!refreshTokenExpiry) {
        return;
    }

    setRefreshTokenExpiry(refreshTokenExpiry);
}

/** Writes the deferred verify refresh-expiry log after the post-verify redirect. */
export function flushPendingRefreshTokenExpiryLog(): void {
    if (getSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY) !== "true") {
        return;
    }

    deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY);

    const capturedRefreshTokenExpiry = getSessionStorageValue(
        REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY,
    );
    deleteSessionStorageValue(REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY);

    if (
        !capturedRefreshTokenExpiry ||
        capturedRefreshTokenExpiry === REFRESH_TOKEN_EXPIRY_MISSING_MARKER
    ) {
        console.log(REFRESH_EXPIRY_NOT_FOUND_LOG_MESSAGE);
        return;
    }

    console.log(`${REFRESH_TOKEN_EXPIRY_COOKIE_KEY}:`, capturedRefreshTokenExpiry);
}
