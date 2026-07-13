import {
    ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
    ACCESS_TOKEN_REFRESH_LOG_TAG,
    ACCESS_TOKEN_REFRESH_LOG_WARN_STYLE,
    type AccessTokenRefreshReason,
    type RefreshedAccessTokenSource,
} from "@/lib/api/constants/access-token-refresh-log.constant";

function canLogRefreshProcess(): boolean {
    return process.env.NODE_ENV === "development";
}

function logRefreshMessage(
    stageStyle: string,
    stageLabel: string,
    message: string,
    details?: unknown,
): void {
    if (!canLogRefreshProcess()) {
        return;
    }

    if (details === undefined) {
        console.log(
            `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][${stageLabel}] %c${message}`,
            stageStyle,
            "color: inherit;",
        );
        return;
    }

    console.log(
        `%c[${ACCESS_TOKEN_REFRESH_LOG_TAG}][${stageLabel}] %c${message}`,
        stageStyle,
        "color: inherit;",
        details,
    );
}

/** Logs when a refresh attempt is initiated. */
export function logRefreshInitiated(
    reason: AccessTokenRefreshReason,
    details?: Record<string, unknown>,
): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
        "INIT",
        `Refresh initiated (${reason})`,
        details,
    );
}

/** Logs when a request is queued behind an in-flight refresh. */
export function logRefreshRequestQueued(queuedRequestCount: number): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
        "QUEUE",
        `Request queued behind in-flight refresh (${queuedRequestCount} waiting)`,
    );
}

/** Logs when the refresh HTTP call starts. */
export function logRefreshApiRequestStarted(refreshUrl: string): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
        "API",
        `Calling refresh endpoint ${refreshUrl}`,
    );
}

/** Logs when the refresh HTTP call returns. */
export function logRefreshApiResponseReceived(
    statusCode: number,
    details?: Record<string, unknown>,
): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_API_STYLE,
        "API",
        `Refresh response received (${statusCode})`,
        details,
    );
}

/** Logs when the refreshed access token is resolved from a response source. */
export function logRefreshTokenResolved(source: RefreshedAccessTokenSource): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
        "TOKEN",
        `Access token resolved from ${source}`,
    );
}

/** Logs when the refresh expiry header is updated. */
export function logRefreshExpiryUpdated(refreshTokenExpiry: string): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE,
        "EXPIRY",
        `Refresh expiry updated (${refreshTokenExpiry})`,
    );
}

/** Logs when proactive refresh is scheduled. */
export function logRefreshScheduled(delayMs: number): void {
    const delaySeconds = Math.round(delayMs / 1000);
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE,
        "SCHEDULE",
        `Proactive refresh scheduled in ${delaySeconds}s`,
    );
}

/** Logs when queued requests resume after a successful refresh. */
export function logRefreshQueueResumed(resumedRequestCount: number): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
        "RESUME",
        `Resumed ${resumedRequestCount} queued request(s) with new access token`,
    );
}

/** Logs when refresh completes successfully. */
export function logRefreshSucceeded(details?: Record<string, unknown>): void {
    logRefreshMessage(
        ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE,
        "SUCCESS",
        "Refresh completed and access token cached",
        details,
    );
}

/** Logs refresh warnings such as skipped logout or missing expiry. */
export function logRefreshWarning(message: string, details?: unknown): void {
    logRefreshMessage(ACCESS_TOKEN_REFRESH_LOG_WARN_STYLE, "WARN", message, details);
}

/** Logs refresh failures. */
export function logRefreshFailed(message: string, details?: unknown): void {
    logRefreshMessage(ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE, "FAIL", message, details);
}

/** Logs when refresh failure triggers logout. */
export function logRefreshLogout(message: string): void {
    logRefreshMessage(ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE, "LOGOUT", message);
}
