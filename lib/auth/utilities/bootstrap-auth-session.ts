import { ACCESS_TOKEN_REFRESH_REASON } from "@/lib/api/constants/access-token-refresh-log.constant";
import {
    refreshAccessTokenQueued,
    scheduleProactiveRefresh,
} from "@/lib/api/utilities/access-token-refresh-queue";
import { getAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { isRefreshTokenExpired } from "@/lib/auth/utilities/refresh-token-lifetime";

/**
 * Hydrates the access token from the backend refresh cookie when entering the admin app.
 * Skipped on auth pages so login/sign-up are not blocked by refresh calls.
 */
export function bootstrapAuthSession(): void {
    const storedAccessToken = getAccessToken();

    if (storedAccessToken) {
        scheduleProactiveRefresh(storedAccessToken);
        return;
    }

    if (!isRefreshTokenExpired()) {
        void refreshAccessTokenQueued(ACCESS_TOKEN_REFRESH_REASON.BOOTSTRAP).catch(
            () => undefined,
        );
    }
}
