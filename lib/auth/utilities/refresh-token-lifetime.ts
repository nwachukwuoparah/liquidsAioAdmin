import { getRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import {
    getAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import { isAccessTokenExpired } from "@/lib/auth/utilities/access-token-lifetime";

/**
 * Normalizes a refresh expiry value that may be URL-encoded in cookies.
 * @param refreshTokenExpiry - Raw expiry string from storage or a response header.
 */
export function normalizeRefreshTokenExpiryDate(refreshTokenExpiry: string): string {
    try {
        return decodeURIComponent(refreshTokenExpiry.trim());
    } catch {
        return refreshTokenExpiry.trim();
    }
}

/** Returns true when a refresh token expiry date has been persisted. */
export function hasRefreshTokenExpiry(): boolean {
    return Boolean(getRefreshTokenExpiry());
}

/**
 * Returns true when the persisted refresh token expiry date is in the past.
 * When no expiry is stored, returns false so refresh can still be attempted.
 */
export function isRefreshTokenExpired(): boolean {
    const storedRefreshTokenExpiry = getRefreshTokenExpiry();

    if (!storedRefreshTokenExpiry) {
        return false;
    }

    const normalizedRefreshTokenExpiry =
        normalizeRefreshTokenExpiryDate(storedRefreshTokenExpiry);
    const refreshExpiryTimestampMs = Date.parse(normalizedRefreshTokenExpiry);

    if (Number.isNaN(refreshExpiryTimestampMs)) {
        return false;
    }

    return refreshExpiryTimestampMs <= Date.now();
}

/**
 * Returns true when the session should end because both access and refresh are expired.
 * Access JWT exp drives proactive refresh; refresh expiry drives logout.
 */
export function shouldForceLogout(): boolean {
    const accessToken = getAccessToken();

    if (accessToken && !isAccessTokenExpired(accessToken)) {
        return false;
    }

    if (!hasRefreshTokenExpiry()) {
        return false;
    }

    return isRefreshTokenExpired();
}
