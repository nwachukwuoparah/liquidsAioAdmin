import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import {
    ACCESS_TOKEN_REFRESH_REASON,
    type AccessTokenRefreshReason,
} from "@/lib/api/constants/access-token-refresh-log.constant";
import {
    logRefreshFailed,
    logRefreshInitiated,
    logRefreshLogout,
    logRefreshQueueResumed,
    logRefreshRequestQueued,
    logRefreshScheduled,
    logRefreshWarning,
} from "@/lib/api/utilities/access-token-refresh-logger";
import { AdminAccessTokenRefreshError } from "@/lib/auth/errors/admin-access-token-refresh.error";
import { refreshAdminAccessToken } from "@/lib/auth/services/admin-auth-refresh.service";
import {
    getProactiveRefreshDelayMs,
    shouldProactivelyRefresh,
} from "@/lib/auth/utilities/access-token-lifetime";
import {
    clearAuthSession,
    getAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import {
    isRefreshTokenExpired,
    shouldForceLogout,
} from "@/lib/auth/utilities/refresh-token-lifetime";

type QueuedRefreshRequest = {
    resolve: (accessToken: string) => void;
    reject: (error: unknown) => void;
};

let isRefreshing = false;
let queuedRefreshRequests: QueuedRefreshRequest[] = [];
let refreshPromise: Promise<string> | null = null;
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

function processQueue(error: unknown, accessToken: string | null = null): void {
    const resumedRequestCount = queuedRefreshRequests.length;

    queuedRefreshRequests.forEach((queuedRequest) => {
        if (error) {
            queuedRequest.reject(error);
            return;
        }

        if (accessToken) {
            queuedRequest.resolve(accessToken);
        }
    });

    if (!error && accessToken && resumedRequestCount > 0) {
        logRefreshQueueResumed(resumedRequestCount);
    }

    queuedRefreshRequests = [];
}

/** Clears the scheduled proactive refresh timer. */
export function clearProactiveRefreshSchedule(): void {
    if (proactiveRefreshTimer) {
        clearTimeout(proactiveRefreshTimer);
    }

    proactiveRefreshTimer = null;
}

/** Clears the session and redirects to login. */
function logoutAfterRefreshFailure(): void {
    logRefreshLogout("Refresh failed with expired session — clearing auth and redirecting to login");
    clearProactiveRefreshSchedule();
    clearAuthSession();

    if (typeof window === "undefined" || window.location.pathname === AUTH_LOGIN_ROUTE) {
        return;
    }

    window.location.assign(AUTH_LOGIN_ROUTE);
}

function shouldLogoutAfterRefreshError(error: unknown): boolean {
    if (shouldForceLogout()) {
        return true;
    }

    return (
        error instanceof AdminAccessTokenRefreshError && error.isSessionExpired
    );
}

async function runRefreshAccessToken(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            return await refreshAdminAccessToken();
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Refreshes the access token with single-flight semantics.
 * Concurrent requests are queued and resumed with the new token on success.
 * @param refreshReason - What triggered the refresh attempt.
 */
export async function refreshAccessTokenQueued(
    refreshReason: AccessTokenRefreshReason = ACCESS_TOKEN_REFRESH_REASON.REQUEST_INTERCEPTOR,
): Promise<string> {
    if (isRefreshTokenExpired()) {
        logRefreshFailed("Refresh token expiry date is in the past");
        logoutAfterRefreshFailure();
        throw new AdminAccessTokenRefreshError("Refresh token expired.", true);
    }

    if (isRefreshing) {
        logRefreshRequestQueued(queuedRefreshRequests.length + 1);

        return new Promise<string>((resolve, reject) => {
            queuedRefreshRequests.push({ resolve, reject });
        });
    }

    logRefreshInitiated(refreshReason, {
        hasStoredAccessToken: Boolean(getAccessToken()),
    });

    isRefreshing = true;

    try {
        const refreshedAccessToken = await runRefreshAccessToken();
        processQueue(null, refreshedAccessToken);
        scheduleProactiveRefresh(refreshedAccessToken);
        return refreshedAccessToken;
    } catch (error) {
        logRefreshFailed(
            error instanceof AdminAccessTokenRefreshError
                ? error.message
                : "Refresh failed with an unexpected error",
            error,
        );

        if (shouldLogoutAfterRefreshError(error)) {
            logoutAfterRefreshFailure();
        } else {
            logRefreshWarning("Refresh failed but session was kept because refresh expiry is still valid");
        }

        processQueue(error, null);
        throw error instanceof AdminAccessTokenRefreshError
            ? error
            : new AdminAccessTokenRefreshError();
    } finally {
        isRefreshing = false;
    }
}

/**
 * Schedules a background refresh at JWT exp minus the proactive buffer.
 * @param accessToken - Optional token override; defaults to the stored x-laioat cookie token.
 */
export function scheduleProactiveRefresh(accessToken?: string | null): void {
    if (typeof window === "undefined") {
        return;
    }

    clearProactiveRefreshSchedule();

    const activeAccessToken = accessToken ?? getAccessToken();

    if (!activeAccessToken) {
        return;
    }

    const proactiveDelayMs = getProactiveRefreshDelayMs(activeAccessToken);

    if (proactiveDelayMs === null) {
        if (shouldProactivelyRefresh(activeAccessToken)) {
            void refreshAccessTokenQueued(ACCESS_TOKEN_REFRESH_REASON.PROACTIVE_BUFFER).catch(
                () => undefined,
            );
        }

        return;
    }

    if (proactiveDelayMs === 0) {
        void refreshAccessTokenQueued(ACCESS_TOKEN_REFRESH_REASON.PROACTIVE_BUFFER).catch(
            () => undefined,
        );
        return;
    }

    logRefreshScheduled(proactiveDelayMs);

    proactiveRefreshTimer = setTimeout(() => {
        void refreshAccessTokenQueued(ACCESS_TOKEN_REFRESH_REASON.PROACTIVE_TIMER).catch(
            () => undefined,
        );
    }, proactiveDelayMs);
}

/** Resets module state for tests. */
export function resetAccessTokenRefreshQueueForTests(): void {
    clearProactiveRefreshSchedule();
    isRefreshing = false;
    queuedRefreshRequests = [];
    refreshPromise = null;
}
