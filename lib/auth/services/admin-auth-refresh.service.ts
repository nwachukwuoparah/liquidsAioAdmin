import axios, { type AxiosResponse } from "axios";
import { getAxiosResponseHeader } from "@/lib/api/utilities/axios-response-headers";
import {
    REFRESHED_ACCESS_TOKEN_SOURCE,
    type RefreshedAccessTokenSource,
} from "@/lib/api/constants/access-token-refresh-log.constant";
import {
    logRefreshApiRequestStarted,
    logRefreshApiResponseReceived,
    logRefreshExpiryUpdated,
    logRefreshFailed,
    logRefreshSucceeded,
    logRefreshTokenResolved,
} from "@/lib/api/utilities/access-token-refresh-logger";
import { API_JSON_CONTENT_TYPE } from "@/lib/api/constants/api.constant";
import { API_CLIENT_PLATFORM } from "@/lib/api/constants/client-device.constant";
import {
    ACCESS_TOKEN_HEADER,
    ACCESS_TOKEN_STORAGE_KEY,
    ADMIN_AUTH_REFRESH_PATH,
    LEGACY_ACCESS_TOKEN_STORAGE_KEYS,
    REFRESH_TOKEN_EXPIRY_HEADER,
} from "@/lib/auth/constants/auth-api.constant";
import { AdminAccessTokenRefreshError } from "@/lib/auth/errors/admin-access-token-refresh.error";
import { setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { setRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import {
    getClientDeviceId,
    getClientDeviceName,
    getClientTimezone,
} from "@/lib/helpers/client-device";
import { getCookieValue } from "@/lib/helpers/cookie-storage";
import { getAdminApiBaseUrl } from "@/lib/admin/services/admin-api-client";

interface RefreshResponseBody {
    token?: string;
    accessToken?: string;
    data?: {
        token?: string;
        accessToken?: string;
    };
}

interface ResolvedRefreshedAccessToken {
    accessToken: string;
    accessTokenSource: RefreshedAccessTokenSource;
}

/**
 * Resolves the refreshed access token from response headers, Set-Cookie values, or JSON body.
 * @param refreshResponse - Axios response from the admin refresh endpoint.
 */
function resolveRefreshedAccessTokenFromRefreshResponse(
    refreshResponse: AxiosResponse,
): ResolvedRefreshedAccessToken | null {
    const accessTokenFromHeader = getAxiosResponseHeader(refreshResponse, ACCESS_TOKEN_HEADER);

    if (accessTokenFromHeader) {
        return {
            accessToken: accessTokenFromHeader,
            accessTokenSource: REFRESHED_ACCESS_TOKEN_SOURCE.RESPONSE_HEADER,
        };
    }

    const cookieStorageKeys = [ACCESS_TOKEN_STORAGE_KEY, ...LEGACY_ACCESS_TOKEN_STORAGE_KEYS];

    for (const cookieStorageKey of cookieStorageKeys) {
        const accessTokenFromCookie = getCookieValue(cookieStorageKey);

        if (accessTokenFromCookie) {
            return {
                accessToken: accessTokenFromCookie,
                accessTokenSource: REFRESHED_ACCESS_TOKEN_SOURCE.COOKIE,
            };
        }
    }

    const responseBody = refreshResponse.data as RefreshResponseBody | undefined;

    if (responseBody && typeof responseBody === "object") {
        const accessTokenFromBody =
            responseBody.token ??
            responseBody.accessToken ??
            responseBody.data?.token ??
            responseBody.data?.accessToken;

        if (typeof accessTokenFromBody === "string" && accessTokenFromBody.length > 0) {
            return {
                accessToken: accessTokenFromBody,
                accessTokenSource: REFRESHED_ACCESS_TOKEN_SOURCE.RESPONSE_BODY,
            };
        }
    }

    return null;
}

/**
 * Calls the admin refresh endpoint and persists the new access token.
 * Uses a standalone axios call to avoid the api-client refresh interceptor loop.
 */
export async function refreshAdminAccessToken(): Promise<string> {
    const adminApiBaseUrl = getAdminApiBaseUrl();
    if (!adminApiBaseUrl) {
        throw new Error("Admin API base URL is not set");
    }
    const refreshUrl = `${adminApiBaseUrl}${ADMIN_AUTH_REFRESH_PATH}`;
    logRefreshApiRequestStarted(refreshUrl);

    let refreshResponse: AxiosResponse;

    try {
        refreshResponse = await axios.get(refreshUrl, {
            withCredentials: true,
            validateStatus: () => true,
            headers: {
                "Content-Type": API_JSON_CONTENT_TYPE,
                "x-platform": API_CLIENT_PLATFORM,
                "x-id": getClientDeviceId(),
                "x-name": getClientDeviceName(),
                "x-tz": getClientTimezone(),
            },
        });
    } catch (networkError) {
        logRefreshFailed("Refresh network request failed", networkError);
        throw new AdminAccessTokenRefreshError();
    }

    logRefreshApiResponseReceived(refreshResponse.status);

    if (refreshResponse.status === 401 || refreshResponse.status === 403) {
        logRefreshFailed("Refresh session expired", { statusCode: refreshResponse.status });
        throw new AdminAccessTokenRefreshError(
            "Unable to refresh admin access token.",
            true,
        );
    }

    if (refreshResponse.status < 200 || refreshResponse.status >= 300) {
        logRefreshFailed("Refresh returned a non-success status", {
            statusCode: refreshResponse.status,
        });
        throw new AdminAccessTokenRefreshError();
    }

    const resolvedRefreshToken = resolveRefreshedAccessTokenFromRefreshResponse(refreshResponse);

    if (!resolvedRefreshToken) {
        logRefreshFailed("Refresh succeeded but no access token was returned");
        throw new AdminAccessTokenRefreshError(
            "Refresh succeeded but no access token was returned.",
        );
    }

    logRefreshTokenResolved(resolvedRefreshToken.accessTokenSource);
    setAccessToken(resolvedRefreshToken.accessToken);

    const refreshTokenExpiry = getAxiosResponseHeader(
        refreshResponse,
        REFRESH_TOKEN_EXPIRY_HEADER,
    );

    if (refreshTokenExpiry) {
        setRefreshTokenExpiry(refreshTokenExpiry);
        logRefreshExpiryUpdated(refreshTokenExpiry);
    }

    logRefreshSucceeded({
        accessTokenSource: resolvedRefreshToken.accessTokenSource,
    });

    return resolvedRefreshToken.accessToken;
}
