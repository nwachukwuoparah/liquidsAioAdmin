import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_REFRESH_BUFFER_SECONDS } from "@/lib/auth/constants/auth-api.constant";
import { AdminAccessTokenRefreshError } from "@/lib/auth/errors/admin-access-token-refresh.error";
import * as adminAuthRefreshService from "@/lib/auth/services/admin-auth-refresh.service";
import {
    clearProactiveRefreshSchedule,
    refreshAccessTokenQueued,
    resetAccessTokenRefreshQueueForTests,
    scheduleProactiveRefresh,
} from "@/lib/api/utilities/access-token-refresh-queue";
import { setAccessToken, getAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { setRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

vi.mock("@/lib/auth/services/admin-auth-refresh.service", () => ({
    refreshAdminAccessToken: vi.fn(),
}));

describe("refreshAccessTokenQueued", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        resetAccessTokenRefreshQueueForTests();
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockReset();
    });

    it("returns a refreshed token from the refresh service", async () => {
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockResolvedValueOnce(
            "new-access-token",
        );

        const refreshedToken = await refreshAccessTokenQueued();

        expect(refreshedToken).toBe("new-access-token");
        expect(adminAuthRefreshService.refreshAdminAccessToken).toHaveBeenCalledTimes(1);
    });

    it("deduplicates concurrent refresh calls", async () => {
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve("shared-access-token"), 20);
                }),
        );

        const [firstToken, secondToken] = await Promise.all([
            refreshAccessTokenQueued(),
            refreshAccessTokenQueued(),
        ]);

        expect(firstToken).toBe("shared-access-token");
        expect(secondToken).toBe("shared-access-token");
        expect(adminAuthRefreshService.refreshAdminAccessToken).toHaveBeenCalledTimes(1);
    });

    it("logs out when the refresh token expiry date is in the past", async () => {
        vi.stubGlobal("location", { pathname: "/overview", assign: vi.fn() });
        setRefreshTokenExpiry("2020-01-01T00:00:00.000Z");

        await expect(refreshAccessTokenQueued()).rejects.toThrow("Refresh token expired.");

        expect(adminAuthRefreshService.refreshAdminAccessToken).not.toHaveBeenCalled();
        expect(getAccessToken()).toBeNull();
    });

    it("clears the session when refresh session is expired", async () => {
        vi.stubGlobal("location", { pathname: "/overview", assign: vi.fn() });
        setAccessToken("existing-access-token");
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockRejectedValueOnce(
            new AdminAccessTokenRefreshError("Unable to refresh admin access token.", true),
        );

        await expect(refreshAccessTokenQueued()).rejects.toThrow(
            "Unable to refresh admin access token.",
        );

        expect(getAccessToken()).toBeNull();
    });

    it("keeps the existing token when refresh fails without session expiry", async () => {
        setAccessToken("existing-access-token");
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockRejectedValueOnce(
            new AdminAccessTokenRefreshError(
                "Refresh succeeded but no access token was returned.",
            ),
        );

        await expect(refreshAccessTokenQueued()).rejects.toThrow(
            "Refresh succeeded but no access token was returned.",
        );

        expect(getAccessToken()).toBe("existing-access-token");
    });
});

describe("scheduleProactiveRefresh", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        resetAccessTokenRefreshQueueForTests();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-23T12:00:00.000Z"));
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockReset();
        vi.mocked(adminAuthRefreshService.refreshAdminAccessToken).mockResolvedValue(
            "scheduled-access-token",
        );
    });

    afterEach(() => {
        clearProactiveRefreshSchedule();
        vi.useRealTimers();
    });

    it("schedules refresh at exp minus the 3-minute buffer", async () => {
        const tokenLifetimeSeconds = 15 * 60;
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds,
        });

        scheduleProactiveRefresh(accessToken);

        const delayMs = (tokenLifetimeSeconds - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS) * 1000;
        vi.advanceTimersByTime(delayMs - 1);
        expect(adminAuthRefreshService.refreshAdminAccessToken).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        await Promise.resolve();

        expect(adminAuthRefreshService.refreshAdminAccessToken).toHaveBeenCalledTimes(1);
    });

    it("refreshes immediately when already inside the buffer window", async () => {
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + 60,
        });

        scheduleProactiveRefresh(accessToken);
        await Promise.resolve();

        expect(adminAuthRefreshService.refreshAdminAccessToken).toHaveBeenCalledTimes(1);
    });
});
