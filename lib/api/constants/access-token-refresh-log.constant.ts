/** Console tag prefix for access token refresh logs. */
export const ACCESS_TOKEN_REFRESH_LOG_TAG = "REFRESH";

/** Blue style for informational refresh logs. */
export const ACCESS_TOKEN_REFRESH_LOG_INFO_STYLE =
    "color: #3b82f6; font-weight: bold;";

/** Green style for successful refresh logs. */
export const ACCESS_TOKEN_REFRESH_LOG_SUCCESS_STYLE =
    "color: #22c55e; font-weight: bold;";

/** Yellow style for refresh warnings. */
export const ACCESS_TOKEN_REFRESH_LOG_WARN_STYLE =
    "color: #eab308; font-weight: bold;";

/** Red style for refresh failures. */
export const ACCESS_TOKEN_REFRESH_LOG_ERROR_STYLE =
    "color: #ef4444; font-weight: bold;";

/** Cyan style for queue and scheduling logs. */
export const ACCESS_TOKEN_REFRESH_LOG_QUEUE_STYLE =
    "color: #06b6d4; font-weight: bold;";

/** Purple style for API request logs. */
export const ACCESS_TOKEN_REFRESH_LOG_API_STYLE =
    "color: #a855f7; font-weight: bold;";

/** Reasons a refresh attempt was initiated. */
export const ACCESS_TOKEN_REFRESH_REASON = {
    BOOTSTRAP: "BOOTSTRAP",
    PROACTIVE_TIMER: "PROACTIVE_TIMER",
    PROACTIVE_BUFFER: "PROACTIVE_BUFFER",
    REQUEST_INTERCEPTOR: "REQUEST_INTERCEPTOR",
    UNAUTHORIZED_RETRY: "UNAUTHORIZED_RETRY",
} as const;

export type AccessTokenRefreshReason =
    (typeof ACCESS_TOKEN_REFRESH_REASON)[keyof typeof ACCESS_TOKEN_REFRESH_REASON];

/** Sources used to resolve the refreshed access token. */
export const REFRESHED_ACCESS_TOKEN_SOURCE = {
    RESPONSE_HEADER: "RESPONSE_HEADER",
    COOKIE: "COOKIE",
    RESPONSE_BODY: "RESPONSE_BODY",
} as const;

export type RefreshedAccessTokenSource =
    (typeof REFRESHED_ACCESS_TOKEN_SOURCE)[keyof typeof REFRESHED_ACCESS_TOKEN_SOURCE];
