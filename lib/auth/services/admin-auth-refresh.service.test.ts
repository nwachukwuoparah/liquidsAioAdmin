import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import {
    ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
    ACCESS_TOKEN_HEADER,
    ADMIN_AUTH_REFRESH_PATH,
    REFRESH_TOKEN_EXPIRY_HEADER,
} from "@/lib/auth/constants/auth-api.constant";
import { AdminAccessTokenRefreshError } from "@/lib/auth/errors/admin-access-token-refresh.error";
import { refreshAdminAccessToken } from "@/lib/auth/services/admin-auth-refresh.service";
import { getAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { getRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import { clearAllCookiesForTests, setCookieValue } from "@/lib/helpers/cookie-storage";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();

    return {
        ...actual,
        default: {
            ...actual.default,
            get: vi.fn(),
        },
    };
});

describe("refreshAdminAccessToken", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        vi.mocked(axios.get).mockReset();
    });

    it("calls the refresh endpoint with credentials and device headers", async () => {
        vi.mocked(axios.get).mockResolvedValueOnce({
            status: 200,
            headers: {
                [ACCESS_TOKEN_HEADER]: "refreshed-access-token",
            },
        });

        await refreshAdminAccessToken();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining(ADMIN_AUTH_REFRESH_PATH),
            expect.objectContaining({
                withCredentials: true,
                headers: expect.objectContaining({
                    "x-id": expect.any(String),
                    "x-name": expect.any(String),
                    "x-platform": expect.any(String),
                    "x-tz": expect.any(String),
                }),
            }),
        );
    });

    it("persists laioat from AxiosHeaders refresh responses", async () => {
        const { AxiosHeaders } = await import("axios");

        vi.mocked(axios.get).mockResolvedValueOnce({
            status: 200,
            headers: new AxiosHeaders({
                [ACCESS_TOKEN_HEADER]: "refreshed-access-token",
            }),
        });

        const refreshedToken = await refreshAdminAccessToken();

        expect(refreshedToken).toBe("refreshed-access-token");
        expect(getAccessToken()).toBe("refreshed-access-token");
    });

    it("falls back to backend Set-Cookie access token when laioat header is missing", async () => {
        setCookieValue("x_laiort", "cookie-refreshed-access-token", {
            maxAgeSeconds: ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
        });

        vi.mocked(axios.get).mockImplementationOnce(async () => {
            setCookieValue("x_laiort", "cookie-refreshed-access-token", {
                maxAgeSeconds: ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
            });

            return {
                status: 200,
                headers: {},
            };
        });

        const refreshedToken = await refreshAdminAccessToken();

        expect(refreshedToken).toBe("cookie-refreshed-access-token");
        expect(getAccessToken()).toBe("cookie-refreshed-access-token");
    });

    it("persists refresh expiry from the refresh response header", async () => {
        vi.mocked(axios.get).mockResolvedValueOnce({
            status: 200,
            headers: {
                [ACCESS_TOKEN_HEADER]: "refreshed-access-token",
                [REFRESH_TOKEN_EXPIRY_HEADER]: "2026-12-31T23:59:59.000Z",
            },
        });

        await refreshAdminAccessToken();

        expect(getRefreshTokenExpiry()).toBe("2026-12-31T23:59:59.000Z");
    });

    it("throws a session-expired error when refresh returns 401", async () => {
        vi.mocked(axios.get).mockResolvedValueOnce({
            status: 401,
            headers: {},
        });

        await expect(refreshAdminAccessToken()).rejects.toMatchObject({
            message: "Unable to refresh admin access token.",
            isSessionExpired: true,
        } satisfies Partial<AdminAccessTokenRefreshError>);
    });

    it("throws when laioat header and cookie fallback are missing", async () => {
        vi.mocked(axios.get).mockResolvedValueOnce({
            status: 200,
            headers: {},
        });

        await expect(refreshAdminAccessToken()).rejects.toThrow(
            "Refresh succeeded but no access token was returned.",
        );
    });
});
