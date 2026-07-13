import axios, { type AxiosResponse, type InternalAxiosRequestConfig, type Method } from "axios";
import { ApiError, toApiError } from "@/lib/api/api-error";
import { API_CLIENT_PLATFORM } from "@/lib/api/constants/client-device.constant";
import {
    API_JSON_CONTENT_TYPE,
    HTTP_STATUS_UNAUTHORIZED,
} from "@/lib/api/constants/api.constant";
import {
    refreshAccessTokenQueued,
} from "@/lib/api/utilities/access-token-refresh-queue";
import { ACCESS_TOKEN_REFRESH_REASON } from "@/lib/api/constants/access-token-refresh-log.constant";
import { getAxiosResponseHeader } from "@/lib/api/utilities/axios-response-headers";
import {
    getClientDeviceId,
    getClientDeviceName,
    getClientTimezone,
} from "@/lib/helpers/client-device";
import {
    ACCESS_TOKEN_HEADER,
    ADMIN_AUTH_VERIFY_2FA_CODE_PATH,
    AUTH_PATHS_WITHOUT_SESSION_BEARER,
    AUTH_PATHS_WITH_TOKEN_CACHE,
    AUTH_PATHS_WITHOUT_SESSION_CLEAR,
    AUTHORIZATION_HEADER,
    BEARER_TOKEN_PREFIX,
    PRE_VERIFY_AUTH_PATHS,
    REFRESH_TOKEN_EXPIRY_HEADER,
    SETUP_TOKEN_REQUEST_HEADER,
} from "@/lib/auth/constants/auth-api.constant";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import {
    isAccessTokenExpired,
    shouldProactivelyRefresh,
} from "@/lib/auth/utilities/access-token-lifetime";
import {
    cacheAccessTokenFromHeaders,
    clearAuthSession,
    getAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import { logAndPersistRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import {
    shouldForceLogout,
} from "@/lib/auth/utilities/refresh-token-lifetime";
import { getAdminApiBaseUrl } from "../admin/services/admin-api-client";

declare module "axios" {
    export interface AxiosRequestConfig {
        /** Relative API path used for auth routing (e.g. `/v1/admin/example`). */
        apiPath?: string;
        /** When true, the session bearer from the x-laioat cookie is not attached. */
        skipSessionBearer?: boolean;
    }
}

export interface ApiRequestHeaderOptions {
    headers?: HeadersInit;
    /** When `null`, skips attaching the session Bearer token from the x-laioat cookie. */
    accessToken?: string | null;
    token?: string | null;
    bearerToken?: string | null;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body">, ApiRequestHeaderOptions {
    body?: unknown;
}

/** Axios instance configured to preserve fetch-like status handling. */
const liquidsAioHttpClient = axios.create({
    validateStatus: () => true,
});

function shouldAttachSessionBearer(apiPath: string, skipSessionBearer: boolean): boolean {
    if (skipSessionBearer) {
        return false;
    }

    return !AUTH_PATHS_WITHOUT_SESSION_BEARER.includes(
        apiPath as (typeof AUTH_PATHS_WITHOUT_SESSION_BEARER)[number],
    );
}

function hasAuthorizationHeader(headers: InternalAxiosRequestConfig["headers"]): boolean {
    if (!headers) {
        return false;
    }

    if (typeof headers === "object" && "has" in headers && typeof headers.has === "function") {
        return (
            headers.has(AUTHORIZATION_HEADER) ||
            headers.has(AUTHORIZATION_HEADER.toLowerCase())
        );
    }

    const headerRecord = headers as Record<string, string | undefined>;

    return Boolean(
        headerRecord[AUTHORIZATION_HEADER] ?? headerRecord[AUTHORIZATION_HEADER.toLowerCase()],
    );
}

function setAuthorizationHeader(
    config: InternalAxiosRequestConfig,
    accessToken: string,
): InternalAxiosRequestConfig {
    const authorizationValue = `${BEARER_TOKEN_PREFIX} ${accessToken}`;

    if (!config.headers) {
        config.headers = {
            [AUTHORIZATION_HEADER]: authorizationValue,
        } as InternalAxiosRequestConfig["headers"];
        return config;
    }

    if (typeof config.headers === "object" && !Array.isArray(config.headers)) {
        (config.headers as Record<string, string>)[AUTHORIZATION_HEADER] = authorizationValue;
    }

    return config;
}

/**
 * Resolves and attaches the session Bearer token from the x-laioat JWT cookie.
 * Refreshes proactively when JWT exp is within 3 minutes, or when x-laioat is missing.
 */
async function resolveSessionBearerToken(
    config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
    const apiPath = config.apiPath ?? "";

    if (!shouldAttachSessionBearer(apiPath, config.skipSessionBearer === true)) {
        return config;
    }

    if (hasAuthorizationHeader(config.headers)) {
        return config;
    }

    let sessionAccessToken = getAccessToken();

    if (!sessionAccessToken || shouldProactivelyRefresh(sessionAccessToken)) {
        try {
            sessionAccessToken = await refreshAccessTokenQueued(
                ACCESS_TOKEN_REFRESH_REASON.REQUEST_INTERCEPTOR,
            );
        } catch {
            const existingAccessToken = getAccessToken();

            if (existingAccessToken && !isAccessTokenExpired(existingAccessToken)) {
                sessionAccessToken = existingAccessToken;
            }
        }
    }

    if (!sessionAccessToken) {
        return config;
    }

    return setAuthorizationHeader(config, sessionAccessToken);
}

liquidsAioHttpClient.interceptors.request.use((config) => resolveSessionBearerToken(config));

/** Builds default client headers required by the LiquidsAIO API. */
export function buildApiClientHeaders(options: ApiRequestHeaderOptions = {}): Headers {
    const requestHeaders = new Headers(options.headers);
    requestHeaders.set("Content-Type", API_JSON_CONTENT_TYPE);
    requestHeaders.set("x-platform", API_CLIENT_PLATFORM);
    requestHeaders.set("x-id", getClientDeviceId());
    requestHeaders.set("x-name", getClientDeviceName());
    requestHeaders.set("x-tz", getClientTimezone());

    if (options.token) {
        requestHeaders.set("token", options.token);
    }

    if (options.bearerToken) {
        requestHeaders.set(AUTHORIZATION_HEADER, `${BEARER_TOKEN_PREFIX} ${options.bearerToken}`);
    }

    return requestHeaders;
}

function headersToRecord(requestHeaders: Headers): Record<string, string> {
    return Object.fromEntries(requestHeaders.entries());
}

function shouldClearSessionOnUnauthorized(path: string): boolean {
    return !AUTH_PATHS_WITHOUT_SESSION_CLEAR.includes(
        path as (typeof AUTH_PATHS_WITHOUT_SESSION_CLEAR)[number],
    );
}

function shouldCacheAccessTokenFromResponse(path: string): boolean {
    return AUTH_PATHS_WITH_TOKEN_CACHE.includes(
        path as (typeof AUTH_PATHS_WITH_TOKEN_CACHE)[number],
    );
}

function shouldSendCredentials(path: string): boolean {
    return !PRE_VERIFY_AUTH_PATHS.includes(path as (typeof PRE_VERIFY_AUTH_PATHS)[number]);
}

/** Clears the session and sends the user to login when the refresh window has ended. */
function logoutOnUnauthorized(path: string): void {
    if (!shouldClearSessionOnUnauthorized(path)) {
        return;
    }

    if (!shouldForceLogout()) {
        return;
    }

    clearAuthSession();

    if (typeof window === "undefined" || window.location.pathname === AUTH_LOGIN_ROUTE) {
        return;
    }

    window.location.assign(AUTH_LOGIN_ROUTE);
}

async function executeApiRequest(
    path: string,
    options: ApiRequestOptions = {},
    isRetryAfterRefresh = false,
) {
    const adminApiBaseUrl = getAdminApiBaseUrl();
    if (!adminApiBaseUrl) {
        throw new Error("Admin API base URL is not set");
    }
    const requestUrl = `${adminApiBaseUrl}${path}`;
    const requestHeaders = buildApiClientHeaders(options);
    const requestMethod = (options.method ?? "GET").toUpperCase() as Method;

    const axiosResponse = await liquidsAioHttpClient.request({
        url: requestUrl,
        method: requestMethod,
        headers: headersToRecord(requestHeaders),
        data: options.body,
        withCredentials: shouldSendCredentials(path),
        signal: options.signal ?? undefined,
        apiPath: path,
        skipSessionBearer: options.accessToken === null,
    });

    const response = toFetchResponse(axiosResponse);

    if (shouldCacheAccessTokenFromResponse(path)) {
        cacheAccessTokenFromHeaders(response.headers);
    }

    if (response.status === HTTP_STATUS_UNAUTHORIZED && shouldClearSessionOnUnauthorized(path)) {
        if (isRetryAfterRefresh || shouldForceLogout()) {
            logoutOnUnauthorized(path);
            return { axiosResponse, response };
        }

        try {
            await refreshAccessTokenQueued(ACCESS_TOKEN_REFRESH_REASON.UNAUTHORIZED_RETRY);
            return executeApiRequest(path, options, true);
        } catch {
            if (shouldForceLogout()) {
                logoutOnUnauthorized(path);
            }
        }
    }

    return { axiosResponse, response };
}

/** Converts an Axios response into a fetch-compatible Response object. */
function toFetchResponse(axiosResponse: AxiosResponse): Response {
    const responseHeaders = new Headers();

    Object.entries(axiosResponse.headers).forEach(([headerName, headerValue]) => {
        if (Array.isArray(headerValue)) {
            headerValue.forEach((value) => {
                responseHeaders.append(headerName, String(value));
            });
            return;
        }

        if (headerValue !== undefined && headerValue !== null) {
            responseHeaders.set(headerName, String(headerValue));
        }
    });

    let responseBody: BodyInit | null = null;
    const responseData = axiosResponse.data;

    if (responseData !== undefined && responseData !== null && responseData !== "") {
        if (typeof responseData === "string") {
            responseBody = responseData;
        } else if (responseData instanceof ArrayBuffer || responseData instanceof Blob) {
            responseBody = responseData;
        } else {
            responseBody = JSON.stringify(responseData);
        }
    }

    return new Response(responseBody, {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: responseHeaders,
    });
}

/**
 * Sends an HTTP request to the LiquidsAIO API and returns the raw Response.
 * Proactively refreshes the access token within 3 minutes of JWT expiry,
 * caches laioat only after full 2FA verification, and retries once on 401.
 */
export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<Response> {
    const { response } = await executeApiRequest(path, options);
    return response;
}

/** Parsed JSON API result with optional auth tokens from response headers and decoded body. */
export interface ApiJsonResult<TResponse> {
    setupToken: string | null;
    token: string | null;
    refreshTokenExpiry: string | null;
    body: TResponse;
}

function buildPathWithQuery(
    path: string,
    params?: Record<string, string | undefined>,
): string {
    if (!params) {
        return path;
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, value);
        }
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}

function resolveApiPath(path: string): string {
    return path.split("?")[0] ?? path;
}

/**
 * Sends an API request and parses JSON, throwing ApiError when unsuccessful.
 */
export async function apiRequestJson<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<ApiJsonResult<TResponse>> {
    const { axiosResponse, response } = await executeApiRequest(path, options);
    const responseBody = (await response.json().catch(() => null)) as TResponse;

    if (!response.ok) {
        throw toApiError(response.status, responseBody);
    }

    if (
        typeof responseBody === "object" &&
        responseBody !== null &&
        "status" in responseBody &&
        (responseBody as { status?: string }).status === "failed"
    ) {
        throw toApiError(response.status, responseBody);
    }

    const refreshTokenExpiry = getAxiosResponseHeader(axiosResponse, REFRESH_TOKEN_EXPIRY_HEADER);

    if (resolveApiPath(path) === ADMIN_AUTH_VERIFY_2FA_CODE_PATH) {
        logAndPersistRefreshTokenExpiry(refreshTokenExpiry);
    }

    return {
        setupToken: getAxiosResponseHeader(axiosResponse, SETUP_TOKEN_REQUEST_HEADER),
        token: getAxiosResponseHeader(axiosResponse, ACCESS_TOKEN_HEADER),
        refreshTokenExpiry,
        body: responseBody,
    };
}

/** Axios-backed API client with typed GET/POST helpers. */
export const apiClient = {
    get<TResponse>(
        path: string,
        params?: Record<string, string | undefined>,
        options: Omit<ApiRequestOptions, "method" | "body"> = {},
    ) {
        return apiRequestJson<TResponse>(buildPathWithQuery(path, params), {
            ...options,
            method: "GET",
        });
    },

    post<TResponse>(
        path: string,
        body?: unknown,
        options: Omit<ApiRequestOptions, "method" | "body"> = {},
    ) {
        return apiRequestJson<TResponse>(path, {
            ...options,
            method: "POST",
            body,
        });
    },

    delete<TResponse>(
        path: string,
        options: Omit<ApiRequestOptions, "method" | "body"> = {},
    ) {
        return apiRequestJson<TResponse>(path, {
            ...options,
            method: "DELETE",
        });
    },

    patch<TResponse>(
        path: string,
        body?: unknown,
        options: Omit<ApiRequestOptions, "method" | "body"> = {},
    ) {
        return apiRequestJson<TResponse>(path, {
            ...options,
            method: "PATCH",
            body,
        });
    },
};

export { ApiError, liquidsAioHttpClient, resolveSessionBearerToken };
