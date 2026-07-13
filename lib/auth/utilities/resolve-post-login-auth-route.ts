import {
    AUTH_SETUP_2FA_ROUTE,
    AUTH_VERIFY_ROUTE,
} from "@/lib/auth/constants/auth-routes.constant";
import { isPendingTwoFactorSetupAccessToken } from "@/lib/auth/utilities/decode-access-token";

/**
 * Resolves the post-login auth route from the access token status claim.
 * @param accessToken - JWT access token from a successful login response.
 */
export function resolvePostLoginAuthRoute(accessToken: string): string {
    if (isPendingTwoFactorSetupAccessToken(accessToken)) {
        return AUTH_SETUP_2FA_ROUTE;
    }

    return AUTH_VERIFY_ROUTE;
}
