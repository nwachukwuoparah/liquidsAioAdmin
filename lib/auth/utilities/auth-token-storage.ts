import {
    ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
    ACCESS_TOKEN_HEADER,
    ACCESS_TOKEN_STORAGE_KEY,
    EPHEMERAL_AUTH_FLOW_COOKIE_KEYS,
    LEGACY_ACCESS_TOKEN_STORAGE_KEYS,
} from "@/lib/auth/constants/auth-api.constant";
import { notifyAdminSessionProfileChanged } from "@/lib/auth/utilities/admin-session-profile-events";
import { clearRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import {
    deleteCookieValue,
    getCookieValue,
    setCookieValue,
} from "@/lib/helpers/cookie-storage";

/** Removes sign-up-only cookies that the backend may set during invite completion. */
export function clearEphemeralAuthFlowCookies(): void {
    for (const ephemeralCookieKey of EPHEMERAL_AUTH_FLOW_COOKIE_KEYS) {
        deleteCookieValue(ephemeralCookieKey);
    }
}

/** Removes duplicate legacy access token cookies before persisting the canonical key. */
function clearLegacyAccessTokenCookies(): void {
    for (const legacyStorageKey of LEGACY_ACCESS_TOKEN_STORAGE_KEYS) {
        deleteCookieValue(legacyStorageKey);
    }
}

/** Persists the access token in a browser cookie. */
export function setAccessToken(accessToken: string): void {
    clearLegacyAccessTokenCookies();
    clearEphemeralAuthFlowCookies();

    setCookieValue(ACCESS_TOKEN_STORAGE_KEY, accessToken, {
        maxAgeSeconds: ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
    });
    notifyAdminSessionProfileChanged();

    if (typeof window !== "undefined") {
        void import("@/lib/api/utilities/access-token-refresh-queue").then(
            ({ scheduleProactiveRefresh }) => {
                scheduleProactiveRefresh(accessToken);
            },
        );
    }
}

/** Reads the stored access token from cookies. */
export function getAccessToken(): string | null {
    const currentAccessToken = getCookieValue(ACCESS_TOKEN_STORAGE_KEY);

    if (currentAccessToken) {
        return currentAccessToken;
    }

    for (const legacyStorageKey of LEGACY_ACCESS_TOKEN_STORAGE_KEYS) {
        const legacyAccessToken = getCookieValue(legacyStorageKey);

        if (legacyAccessToken) {
            return legacyAccessToken;
        }
    }

    return null;
}

/** Caches laioat from response headers when present. */
export function cacheAccessTokenFromHeaders(responseHeaders: Headers): void {
    const accessToken = responseHeaders.get(ACCESS_TOKEN_HEADER);

    if (!accessToken) {
        return;
    }

    setAccessToken(accessToken);
}

/** Clears the stored access token and ends the session. */
export function clearAuthSession(): void {
    deleteCookieValue(ACCESS_TOKEN_STORAGE_KEY);

    clearLegacyAccessTokenCookies();
    clearEphemeralAuthFlowCookies();

    clearRefreshTokenExpiry();
    notifyAdminSessionProfileChanged();

    if (typeof window !== "undefined") {
        void import("@/lib/api/utilities/access-token-refresh-queue").then(
            ({ clearProactiveRefreshSchedule }) => {
                clearProactiveRefreshSchedule();
            },
        );
    }
}

/** Returns true when the user has a persisted access token. */
export function hasAuthSession(): boolean {
    return Boolean(getAccessToken());
}
