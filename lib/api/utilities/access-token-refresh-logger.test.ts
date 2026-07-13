import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_WARN_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_TAG,
    ACCESS_TOKEN_REFRESH_REASON,
    REFRESHED_ACCESS_TOKEN_SOURCE,
} from "@/lib/api/constants/access-token-refresh-log.constant";
import {
    logRefreshApiRequestStarted,
    logRefreshApiResponseReceived,
    logRefreshFailed,
    logRefreshInitiated,
    logRefreshLogout,
    logRefreshQueueResumed,
    logRefreshRequestQueued,
    logRefreshScheduled,
    logRefreshSucceeded,
    logRefreshTokenResolved,
    logRefreshWarning,
} from "@/lib/api/utilities/access-token-refresh-logger";

describe("access-token-refresh-logger", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        vi.restoreAllMocks();
    });

    it("does not log outside development", () => {
        process.env.NODE_ENV = "test";

        logRefreshInitiated(ACCESS_TOKEN_REFRESH_REASON.BOOTSTRAP);

        expect(console.log).not.toHaveBeenCalled();
    });

    it("logs initiation with info styling in development", () => {
        process.env.NODE_ENV = "development";

        logRefreshInitiated(ACCESS_TOKEN_REFRESH_REASON.REQUEST_INTERCEPTOR, {
            hasStoredAccessToken: true,
        });

        expect(console.log).toHaveBeenCalledWith(
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][INIT] %cRefresh initiated (${ACCESS_TOKEN_REFRESH_REASON.REQUEST_INTERCEPTOR})`,
            ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
            "color: inherit;",
            { hasStoredAccessToken: true },
        );
    });

    it("logs queue, schedule, and resume stages with queue styling", () => {
        process.env.NODE_ENV = "development";

        logRefreshRequestQueued(2);
        logRefreshScheduled(120_000);
        logRefreshQueueResumed(3);

        expect(console.log).toHaveBeenNthCalledWith(
            1,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][QUEUE] %cRequest queued behind in-flight refresh (2 waiting)`,
            ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
            "color: inherit;",
        );
        expect(console.log).toHaveBeenNthCalledWith(
            2,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][SCHEDULE] %cProactive refresh scheduled in 120s`,
            ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
            "color: inherit;",
        );
        expect(console.log).toHaveBeenNthCalledWith(
            3,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][RESUME] %cResumed 3 queued request(s) with new access token`,
            ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
            "color: inherit;",
        );
    });

    it("logs API, token resolution, and success stages", () => {
        process.env.NODE_ENV = "development";

        logRefreshApiRequestStarted("https://example.com/v1/auth/admin/refresh");
        logRefreshApiResponseReceived(200, { ok: true });
        logRefreshTokenResolved(REFRESHED_ACCESS_TOKEN_SOURCE.RESPONSE_HEADER);
        logRefreshSucceeded({ accessTokenSource: REFRESHED_ACCESS_TOKEN_SOURCE.COOKIE });

        expect(console.log).toHaveBeenNthCalledWith(
            1,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][API] %cCalling refresh endpoint https://example.com/v1/auth/admin/refresh`,
            ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
            "color: inherit;",
        );
        expect(console.log).toHaveBeenNthCalledWith(
            2,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][API] %cRefresh response received (200)`,
            ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
            "color: inherit;",
            { ok: true },
        );
        expect(console.log).toHaveBeenNthCalledWith(
            3,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][TOKEN] %cAccess token resolved from ${REFRESHED_ACCESS_TOKEN_SOURCE.RESPONSE_HEADER}`,
            ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
            "color: inherit;",
        );
        expect(console.log).toHaveBeenNthCalledWith(
            4,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][SUCCESS] %cRefresh completed and access token cached`,
            ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
            "color: inherit;",
            { accessTokenSource: REFRESHED_ACCESS_TOKEN_SOURCE.COOKIE },
        );
    });

    it("logs failures and logout with error styling", () => {
        process.env.NODE_ENV = "development";
        const refreshError = new Error("network down");

        logRefreshFailed("Refresh network request failed", refreshError);
        logRefreshLogout("Refresh failed with expired session — clearing auth and redirecting to login");
        logRefreshWarning("Refresh failed but session was kept because refresh expiry is still valid");

        expect(console.log).toHaveBeenNthCalledWith(
            1,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][FAIL] %cRefresh network request failed`,
            ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE,
            "color: inherit;",
            refreshError,
        );
        expect(console.log).toHaveBeenNthCalledWith(
            2,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][LOGOUT] %cRefresh failed with expired session — clearing auth and redirecting to login`,
            ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE,
            "color: inherit;",
        );
        expect(console.log).toHaveBeenNthCalledWith(
            3,
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][WARN] %cRefresh failed but session was kept because refresh expiry is still valid`,
            ACCESS_TOKEN_REFRESH_LOG_WARN_STYLE,
            "color: inherit;",
        );
    });
});
