import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_REFRESH_REASON } from "@/lib/api/constants/access-token-refresh-log.constant";
import * as accessTokenRefreshQueue from "@/lib/api/utilities/access-token-refresh-queue";
import { bootstrapAuthSession } from "@/lib/auth/utilities/bootstrap-auth-session";
import { setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { setRefreshTokenExpiry } from "@/lib/auth/utilities/refresh-token-expiry-storage";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

vi.mock("@/lib/api/utilities/access-token-refresh-queue", () => ({
    refreshAccessTokenQueued: vi.fn(),
    scheduleProactiveRefresh: vi.fn(),
}));

describe("bootstrapAuthSession", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        vi.mocked(accessTokenRefreshQueue.scheduleProactiveRefresh).mockReset();
        vi.mocked(accessTokenRefreshQueue.refreshAccessTokenQueued).mockReset();
    });

    it("schedules proactive refresh when x-laioat is present", () => {
        setAccessToken("stored-access-token");

        bootstrapAuthSession();

        expect(accessTokenRefreshQueue.scheduleProactiveRefresh).toHaveBeenCalledWith(
            "stored-access-token",
        );
        expect(accessTokenRefreshQueue.refreshAccessTokenQueued).not.toHaveBeenCalled();
    });

    it("hydrates from refresh when x-laioat is missing and refresh expiry is valid", () => {
        setRefreshTokenExpiry("2099-01-01T00:00:00.000Z");
        vi.mocked(accessTokenRefreshQueue.refreshAccessTokenQueued).mockResolvedValue(
            "hydrated-access-token",
        );

        bootstrapAuthSession();

        expect(accessTokenRefreshQueue.refreshAccessTokenQueued).toHaveBeenCalledWith(
            ACCESS_TOKEN_REFRESH_REASON.BOOTSTRAP,
        );
    });
});
