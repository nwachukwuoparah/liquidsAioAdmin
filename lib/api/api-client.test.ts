import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_CLIENT_PLATFORM } from "@/lib/api/constants/client-device.constant";
import {
    ACCESS_TOKEN_HEADER,
    AUTHORIZATION_HEADER,
    REFRESH_TOKEN_EXPIRY_HEADER,
} from "@/lib/auth/constants/auth-api.constant";
import {
    getAccessToken,
    hasAuthSession,
    setAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import { setRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import * as clientDevice from "@/lib/helpers/client-device";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

const mockAxiosRequest = vi.hoisted(() => vi.fn());
const requestInterceptorHandlers = vi.hoisted(() => [] as Array<(config: unknown) => unknown>);
const mockRefreshAccessTokenQueued = vi.hoisted(() => vi.fn());
const mockScheduleProactiveRefresh = vi.hoisted(() => vi.fn());
const mockLogAndPersistRefreshTokenExpiry = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/utilities/refresh-token-expiry-storage", async (importOriginal) => {
    const actual = await importOriginal<
        typeof import("@/lib/auth/utilities/refresh-token-expiry-storage")
    >();

    return {
        ...actual,
        logAndPersistRefreshTokenExpiry: (...args: unknown[]) =>
            mockLogAndPersistRefreshTokenExpiry(...args),
    };
});

vi.mock("@/lib/api/utilities/access-token-refresh-queue", () => ({
    refreshAccessTokenQueued: (...args: unknown[]) => mockRefreshAccessTokenQueued(...args),
    scheduleProactiveRefresh: (...args: unknown[]) => mockScheduleProactiveRefresh(...args),
    clearProactiveRefreshSchedule: vi.fn(),
}));

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();

    return {
        ...actual,
        default: {
            ...actual.default,
            create: vi.fn(() => ({
                interceptors: {
                    request: {
                        use: vi.fn((onFulfilled: (config: unknown) => unknown) => {
                            requestInterceptorHandlers.push(onFulfilled);
                        }),
                    },
                    response: { use: vi.fn() },
                },
                request: vi.fn(async (requestConfig: Record<string, unknown>) => {
                    let processedConfig = requestConfig;

                    for (const interceptorHandler of requestInterceptorHandlers) {
                        processedConfig = (await interceptorHandler(processedConfig)) as Record<
                            string,
                            unknown
                        >;
                    }

                    return mockAxiosRequest(processedConfig);
                }),
            })),
        },
    };
});

import * as apiClient from "@/lib/api/api-client";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

function createValidAccessToken(): string {
    return buildTestJwt({
        exp: Math.floor(Date.now() / 1000) + 900,
    });
}

function createBufferWindowAccessToken(): string {
    return buildTestJwt({
        exp: Math.floor(Date.now() / 1000) + 60,
    });
}

function createAxiosResponse({
    status,
    statusText = "OK",
    headers = {},
    data = null,
}: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: unknown;
}) {
    return {
        status,
        statusText,
        headers,
        data,
        config: {},
        request: {},
    };
}

describe("buildApiClientHeaders", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        vi.spyOn(clientDevice, "getClientDeviceId").mockReturnValue("device-id-123");
        vi.spyOn(clientDevice, "getClientDeviceName").mockReturnValue("Chrome on macOS");
        vi.spyOn(clientDevice, "getClientTimezone").mockReturnValue("Africa/Lagos");
    });

    it("attaches runtime client metadata headers", () => {
        const requestHeaders = apiClient.buildApiClientHeaders();

        expect(requestHeaders.get("x-platform")).toBe(API_CLIENT_PLATFORM);
        expect(requestHeaders.get("x-id")).toBe("device-id-123");
        expect(requestHeaders.get("x-name")).toBe("Chrome on macOS");
        expect(requestHeaders.get("x-tz")).toBe("Africa/Lagos");
    });

    it("does not attach session bearer in header builder", () => {
        setAccessToken("stored-access-token");

        const requestHeaders = apiClient.buildApiClientHeaders();

        expect(requestHeaders.get(AUTHORIZATION_HEADER)).toBeNull();
        expect(requestHeaders.get(ACCESS_TOKEN_HEADER)).toBeNull();
    });

    it("attaches bearer authorization when bearerToken is provided", () => {
        const requestHeaders = apiClient.buildApiClientHeaders({
            bearerToken: "session-token",
        });

        expect(requestHeaders.get(AUTHORIZATION_HEADER)).toBe("Bearer session-token");
    });
});

describe("resolveSessionBearerToken", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        mockRefreshAccessTokenQueued.mockReset();
    });

    it("attaches stored access token as Bearer on protected routes", async () => {
        const validAccessToken = createValidAccessToken();
        setAccessToken(validAccessToken);

        const requestConfig = await apiClient.resolveSessionBearerToken({
            apiPath: "/v1/admin/example",
            headers: {},
        });

        expect((requestConfig.headers as Record<string, string>)[AUTHORIZATION_HEADER]).toBe(
            `Bearer ${validAccessToken}`,
        );
        expect(mockRefreshAccessTokenQueued).not.toHaveBeenCalled();
    });

    it("refreshes proactively when the token is inside the buffer window", async () => {
        setAccessToken(createBufferWindowAccessToken());
        mockRefreshAccessTokenQueued.mockResolvedValueOnce("refreshed-access-token");

        const requestConfig = await apiClient.resolveSessionBearerToken({
            apiPath: "/v1/admin/example",
            headers: {},
        });

        expect(mockRefreshAccessTokenQueued).toHaveBeenCalledTimes(1);
        expect((requestConfig.headers as Record<string, string>)[AUTHORIZATION_HEADER]).toBe(
            "Bearer refreshed-access-token",
        );
    });

    it("skips session bearer on login routes", async () => {
        setAccessToken(createValidAccessToken());

        const requestConfig = await apiClient.resolveSessionBearerToken({
            apiPath: "/v1/auth/admin/login",
            headers: {},
        });

        expect(requestConfig.headers).toEqual({});
        expect(mockRefreshAccessTokenQueued).not.toHaveBeenCalled();
    });

    it("skips session bearer when skipSessionBearer is true", async () => {
        setAccessToken(createValidAccessToken());

        const requestConfig = await apiClient.resolveSessionBearerToken({
            apiPath: "/v1/admin/example",
            skipSessionBearer: true,
            headers: {},
        });

        expect(requestConfig.headers).toEqual({});
    });

    it("does not override an existing Authorization header", async () => {
        setAccessToken(createValidAccessToken());

        const requestConfig = await apiClient.resolveSessionBearerToken({
            apiPath: "/v1/admin/example",
            headers: {
                [AUTHORIZATION_HEADER]: "Bearer session-token",
            },
        });

        expect((requestConfig.headers as Record<string, string>)[AUTHORIZATION_HEADER]).toBe(
            "Bearer session-token",
        );
        expect(mockRefreshAccessTokenQueued).not.toHaveBeenCalled();
    });
});

describe("apiRequest", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        setAccessToken(createValidAccessToken());
        mockAxiosRequest.mockReset();
        mockRefreshAccessTokenQueued.mockReset();
    });

    it("sends Bearer token on GET requests when the user is logged in", async () => {
        mockAxiosRequest.mockResolvedValueOnce(createAxiosResponse({ status: 200 }));
        const validAccessToken = getAccessToken();

        await apiClient.apiRequest("/v1/admin/example", { method: "GET" });

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    [AUTHORIZATION_HEADER]: `Bearer ${validAccessToken}`,
                }),
            }),
        );
        expect(mockRefreshAccessTokenQueued).not.toHaveBeenCalled();
    });

    it("refreshes before sending when the token is inside the buffer window", async () => {
        setAccessToken(createBufferWindowAccessToken());
        mockRefreshAccessTokenQueued.mockResolvedValueOnce("refreshed-access-token");
        mockAxiosRequest.mockResolvedValueOnce(createAxiosResponse({ status: 200 }));

        await apiClient.apiRequest("/v1/admin/example", { method: "GET" });

        expect(mockRefreshAccessTokenQueued).toHaveBeenCalledTimes(1);
        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    [AUTHORIZATION_HEADER]: "Bearer refreshed-access-token",
                }),
            }),
        );
    });

    it("does not send session Bearer on login routes", async () => {
        mockAxiosRequest.mockResolvedValueOnce(createAxiosResponse({ status: 401 }));

        await apiClient.apiRequest("/v1/auth/admin/login");

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    [AUTHORIZATION_HEADER]: expect.any(String),
                }),
            }),
        );
        expect(mockRefreshAccessTokenQueued).not.toHaveBeenCalled();
    });

    it("clears auth session on 401 when the refresh token expiry has passed", async () => {
        const assignMock = vi.fn();
        vi.stubGlobal("location", { pathname: "/overview", assign: assignMock });

        setAccessToken(
            buildTestJwt({
                exp: Math.floor(Date.now() / 1000) - 60,
            }),
        );
        setRefreshTokenExpiry("2020-01-01T00:00:00.000Z");

        mockRefreshAccessTokenQueued.mockRejectedValueOnce(
            new Error("Refresh token expired."),
        );

        mockAxiosRequest.mockResolvedValueOnce(createAxiosResponse({ status: 401 }));

        await apiClient.apiRequest("/v1/admin/example");

        expect(mockRefreshAccessTokenQueued).toHaveBeenCalled();
        expect(getAccessToken()).toBeNull();
        expect(assignMock).toHaveBeenCalledWith("/login");
    });

    it("retries once on 401 after refreshing when the refresh token is still valid", async () => {
        setAccessToken(createValidAccessToken());
        setRefreshTokenExpiry("2099-01-01T00:00:00.000Z");
        mockRefreshAccessTokenQueued.mockResolvedValueOnce("refreshed-access-token");
        mockAxiosRequest
            .mockResolvedValueOnce(createAxiosResponse({ status: 401 }))
            .mockResolvedValueOnce(createAxiosResponse({ status: 200 }));

        await apiClient.apiRequest("/v1/admin/example");

        expect(mockRefreshAccessTokenQueued).toHaveBeenCalledTimes(1);
        expect(mockAxiosRequest).toHaveBeenCalledTimes(2);
        expect(getAccessToken()).toBeTruthy();
    });

    it("does not clear auth session on 401 for login routes", async () => {
        const storedAccessToken = getAccessToken();
        mockAxiosRequest.mockResolvedValueOnce(createAxiosResponse({ status: 401 }));

        await apiClient.apiRequest("/v1/auth/admin/login");

        expect(getAccessToken()).toBe(storedAccessToken);
    });

    it("does not cache laioat from login responses", async () => {
        clearAllCookiesForTests();

        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: { [ACCESS_TOKEN_HEADER]: "login-access-token" },
            }),
        );

        await apiClient.apiRequest("/v1/auth/admin/login");

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                withCredentials: false,
            }),
        );
        expect(getAccessToken()).toBeNull();
    });

    it("persists access token only after verify-2fa-code succeeds", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: { [ACCESS_TOKEN_HEADER]: "signed-in-access-token" },
            }),
        );

        await apiClient.apiRequest("/v1/auth/admin/verify-2fa-code", {
            method: "POST",
            body: { code: "123456" },
        });

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                withCredentials: true,
                headers: expect.objectContaining({
                    [AUTHORIZATION_HEADER]: expect.stringMatching(/^Bearer /),
                }),
            }),
        );
        expect(getAccessToken()).toBe("signed-in-access-token");
    });

    it("does not persist access token from other response headers", async () => {
        const storedAccessToken = getAccessToken();

        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: { [ACCESS_TOKEN_HEADER]: "new-access-token" },
            }),
        );

        await apiClient.apiRequest("/v1/admin/example");

        expect(getAccessToken()).toBe(storedAccessToken);
    });
});

describe("apiRequestJson", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        mockAxiosRequest.mockReset();
        mockRefreshAccessTokenQueued.mockReset();
        mockLogAndPersistRefreshTokenExpiry.mockReset();
    });

    it("returns setup and access tokens from response headers when available", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: {
                    token: "setup-token",
                    [ACCESS_TOKEN_HEADER]: "login-access-token",
                },
                data: { status: "success", message: "Welcome back." },
            }),
        );

        const apiResult = await apiClient.apiRequestJson("/v1/auth/admin/login");

        expect(apiResult.setupToken).toBe("setup-token");
        expect(apiResult.token).toBe("login-access-token");
        expect(apiResult.refreshTokenExpiry).toBeNull();
        expect(apiResult.body).toEqual({ status: "success", message: "Welcome back." });
    });

    it("returns refresh token expiry from response headers when available", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: {
                    [ACCESS_TOKEN_HEADER]: "signed-in-access-token",
                    [REFRESH_TOKEN_EXPIRY_HEADER]: "2026-12-31T23:59:59.000Z",
                },
                data: { status: "success" },
            }),
        );

        const apiResult = await apiClient.apiRequestJson("/v1/auth/admin/verify-2fa-code");

        expect(apiResult.refreshTokenExpiry).toBe("2026-12-31T23:59:59.000Z");
        expect(mockLogAndPersistRefreshTokenExpiry).toHaveBeenCalledWith(
            "2026-12-31T23:59:59.000Z",
        );
    });

    it("queues refresh expiry logging when verify response header is missing", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                headers: {
                    [ACCESS_TOKEN_HEADER]: "signed-in-access-token",
                },
                data: { status: "success" },
            }),
        );

        await apiClient.apiRequestJson("/v1/auth/admin/verify-2fa-code");

        expect(mockLogAndPersistRefreshTokenExpiry).toHaveBeenCalledWith(null);
    });

    it("returns null tokens when response headers are missing", async () => {
        setAccessToken(createValidAccessToken());

        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                data: { status: "success" },
            }),
        );

        const apiResult = await apiClient.apiRequestJson("/v1/admin/example");

        expect(apiResult.setupToken).toBeNull();
        expect(apiResult.token).toBeNull();
        expect(apiResult.refreshTokenExpiry).toBeNull();
        expect(apiResult.body).toEqual({ status: "success" });
    });
});

describe("apiClient", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        mockAxiosRequest.mockReset();
        mockRefreshAccessTokenQueued.mockReset();
        mockLogAndPersistRefreshTokenExpiry.mockReset();
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/v1");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("get sends query params through axios", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                data: { status: "success", data: { totalCount: 3 } },
            }),
        );

        const apiResult = await apiClient.apiClient.get("/v1/rfqs/admin", {
            status: "pending",
            limit: "25",
        });

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining("/v1/rfqs/admin?status=pending&limit=25"),
                method: "GET",
            }),
        );
        expect(apiResult.body).toEqual({ status: "success", data: { totalCount: 3 } });
    });

    it("post sends JSON body through axios", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                data: { status: "success", message: "Invitation sent." },
            }),
        );

        const apiResult = await apiClient.apiClient.post("/v1/auth/admin/login", {
            email: "admin@liquidsaio.com",
            password: "password123",
        });

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining("/v1/auth/admin/login"),
                method: "POST",
                data: {
                    email: "admin@liquidsaio.com",
                    password: "password123",
                },
            }),
        );
        expect(apiResult.body).toEqual({ status: "success", message: "Invitation sent." });
    });

    it("delete sends a DELETE request through axios", async () => {
        mockAxiosRequest.mockResolvedValueOnce(
            createAxiosResponse({
                status: 200,
                data: { status: "success", data: { profilePicture: null } },
            }),
        );

        const apiResult = await apiClient.apiClient.delete("/profile/picture");

        expect(mockAxiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining("/profile/picture"),
                method: "DELETE",
            }),
        );
        expect(apiResult.body).toEqual({ status: "success", data: { profilePicture: null } });
    });
});

describe("hasAuthSession", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
    });

    it("detects an active session from the access token cookie", () => {
        expect(hasAuthSession()).toBe(false);

        setAccessToken("access-token");
        expect(hasAuthSession()).toBe(true);
    });
});
