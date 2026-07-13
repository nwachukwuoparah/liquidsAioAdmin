import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    ADMIN_DASHBOARD_ROUTE,
    AUTH_LOGIN_ROUTE,
    AUTH_SETUP_2FA_ROUTE,
} from "@/lib/auth/constants/auth-routes.constant";
import {
    hasFullyAuthenticatedSession,
    shouldRedirectAuthenticatedUserFromAuthRoute,
    shouldRedirectToTwoFactorSetup,
    shouldRedirectUnauthenticatedUserToLogin,
} from "@/lib/auth/utilities/auth-middleware";
import { REGION_UNAVAILABLE_PATH } from "@/lib/constants/supported-region.constant";
import { isRequestFromSupportedRegion } from "@/lib/geo-region";

/** Applies U.S. geo restriction and admin auth redirects for incoming requests. */
export function handleAppProxy(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    if (pathname !== REGION_UNAVAILABLE_PATH && !isRequestFromSupportedRegion(request)) {
        return NextResponse.redirect(new URL(REGION_UNAVAILABLE_PATH, request.url));
    }

    if (pathname === REGION_UNAVAILABLE_PATH) {
        return NextResponse.next();
    }

    const requestCookies = request.cookies;
    const hasSession = hasFullyAuthenticatedSession(requestCookies);

    if (shouldRedirectToTwoFactorSetup(pathname, requestCookies)) {
        return NextResponse.redirect(new URL(AUTH_SETUP_2FA_ROUTE, request.url));
    }

    if (shouldRedirectAuthenticatedUserFromAuthRoute(pathname, hasSession)) {
        return NextResponse.redirect(new URL(ADMIN_DASHBOARD_ROUTE, request.url));
    }

    if (shouldRedirectUnauthenticatedUserToLogin(pathname, hasSession)) {
        return NextResponse.redirect(new URL(AUTH_LOGIN_ROUTE, request.url));
    }

    return NextResponse.next();
}
