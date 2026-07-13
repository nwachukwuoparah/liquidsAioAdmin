import { ACCESS_TOKEN_STORAGE_KEY, LEGACY_ACCESS_TOKEN_STORAGE_KEYS } from "@/lib/auth/constants/auth-api.constant";
import {
    GUEST_ONLY_AUTH_ROUTES,
    PROTECTED_ADMIN_ROUTE_PREFIXES,
    TWO_FACTOR_SETUP_AUTH_ROUTES,
} from "@/lib/auth/constants/auth-routes.constant";
import { isPendingTwoFactorSetupAccessToken } from "@/lib/auth/utilities/decode-access-token";

interface RequestCookieReader {
    get(cookieName: string): { value: string } | undefined;
}

/**
 * Reads the access token from request cookies, including legacy migration keys.
 * @param requestCookies - Next.js request cookie reader.
 */
export function getAccessTokenFromRequestCookies(
    requestCookies: RequestCookieReader,
): string | null {
    const canonicalAccessToken = requestCookies.get(ACCESS_TOKEN_STORAGE_KEY)?.value;

    if (canonicalAccessToken) {
        return canonicalAccessToken;
    }

    for (const legacyStorageKey of LEGACY_ACCESS_TOKEN_STORAGE_KEYS) {
        const legacyAccessToken = requestCookies.get(legacyStorageKey)?.value;

        if (legacyAccessToken) {
            return legacyAccessToken;
        }
    }

    return null;
}

/** Returns true when the request includes a stored access token cookie. */
export function hasAccessTokenInRequestCookies(requestCookies: RequestCookieReader): boolean {
    return Boolean(getAccessTokenFromRequestCookies(requestCookies));
}

/** Returns true when the user has a fully authenticated admin session. */
export function hasFullyAuthenticatedSession(requestCookies: RequestCookieReader): boolean {
    const accessToken = getAccessTokenFromRequestCookies(requestCookies);

    if (!accessToken) {
        return false;
    }

    return !isPendingTwoFactorSetupAccessToken(accessToken);
}

/** Returns true when the pathname is limited to unauthenticated users. */
export function isGuestOnlyAuthRoute(pathname: string): boolean {
    return GUEST_ONLY_AUTH_ROUTES.some((guestOnlyRoute) => pathname === guestOnlyRoute);
}

/** Returns true when the pathname is part of the 2FA setup flow. */
export function isTwoFactorSetupAuthRoute(pathname: string): boolean {
    return TWO_FACTOR_SETUP_AUTH_ROUTES.some((setupRoute) => pathname === setupRoute);
}

/** Returns true when the pathname requires an authenticated session. */
export function isProtectedAdminRoute(pathname: string): boolean {
    return PROTECTED_ADMIN_ROUTE_PREFIXES.some(
        (protectedRoutePrefix) =>
            pathname === protectedRoutePrefix || pathname.startsWith(`${protectedRoutePrefix}/`),
    );
}

/** Returns true when a signed-in user should leave a guest-only auth route. */
export function shouldRedirectAuthenticatedUserFromAuthRoute(
    pathname: string,
    hasSession: boolean,
): boolean {
    return hasSession && isGuestOnlyAuthRoute(pathname);
}

/** Returns true when a guest should be sent to login from a protected admin route. */
export function shouldRedirectUnauthenticatedUserToLogin(
    pathname: string,
    hasSession: boolean,
): boolean {
    return !hasSession && isProtectedAdminRoute(pathname);
}

/** Returns true when a user with pending 2FA should finish setup first. */
export function shouldRedirectToTwoFactorSetup(
    pathname: string,
    requestCookies: RequestCookieReader,
): boolean {
    const accessToken = getAccessTokenFromRequestCookies(requestCookies);

    if (!accessToken || !isPendingTwoFactorSetupAccessToken(accessToken)) {
        return false;
    }

    return isProtectedAdminRoute(pathname) || isGuestOnlyAuthRoute(pathname);
}
