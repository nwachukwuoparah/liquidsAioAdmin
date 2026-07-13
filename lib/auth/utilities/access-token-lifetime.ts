import { ACCESS_TOKEN_REFRESH_BUFFER_SECONDS } from "@/lib/auth/constants/auth-api.constant";
import { decodeJwtPayload } from "@/lib/auth/utilities/decode-jwt-payload";

interface AccessTokenJwtPayload extends Record<string, unknown> {
    exp?: number;
}

/**
 * Returns true when the access token JWT is missing, malformed, or past its exp claim.
 * @param accessToken - JWT access token from the x-laioat cookie.
 */
export function isAccessTokenExpired(accessToken: string | null): boolean {
    if (!accessToken) {
        return true;
    }

    const tokenPayload = decodeJwtPayload<AccessTokenJwtPayload>(accessToken);

    if (!tokenPayload?.exp) {
        return true;
    }

    return tokenPayload.exp <= Date.now() / 1000;
}

/**
 * Returns seconds until JWT exp, or null when exp is unavailable.
 * @param accessToken - JWT access token from the x-laioat cookie.
 */
export function getAccessTokenSecondsRemaining(accessToken: string): number | null {
    const tokenPayload = decodeJwtPayload<AccessTokenJwtPayload>(accessToken);

    if (!tokenPayload?.exp) {
        return null;
    }

    return tokenPayload.exp - Date.now() / 1000;
}

/**
 * Returns true when the token should be refreshed proactively (expired or within buffer).
 * @param accessToken - JWT access token from the x-laioat cookie.
 */
export function shouldProactivelyRefresh(accessToken: string | null): boolean {
    if (!accessToken) {
        return true;
    }

    if (isAccessTokenExpired(accessToken)) {
        return true;
    }

    const secondsRemaining = getAccessTokenSecondsRemaining(accessToken);

    if (secondsRemaining === null) {
        return false;
    }

    return secondsRemaining <= ACCESS_TOKEN_REFRESH_BUFFER_SECONDS;
}

/**
 * Returns milliseconds until proactive refresh should run (JWT exp minus buffer).
 * Returns 0 when refresh should happen immediately, or null when exp is unavailable.
 * @param accessToken - JWT access token from the x-laioat cookie.
 */
export function getProactiveRefreshDelayMs(accessToken: string): number | null {
    const tokenPayload = decodeJwtPayload<AccessTokenJwtPayload>(accessToken);

    if (!tokenPayload?.exp) {
        return null;
    }

    const refreshAtMs =
        tokenPayload.exp * 1000 - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS * 1000;

    return Math.max(refreshAtMs - Date.now(), 0);
}
