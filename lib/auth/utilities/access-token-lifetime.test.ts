import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_REFRESH_BUFFER_SECONDS } from "@/lib/auth/constants/auth-api.constant";
import {
    getAccessTokenSecondsRemaining,
    getProactiveRefreshDelayMs,
    isAccessTokenExpired,
    shouldProactivelyRefresh,
} from "@/lib/auth/utilities/access-token-lifetime";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("isAccessTokenExpired", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-23T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns true for null tokens", () => {
        expect(isAccessTokenExpired(null)).toBe(true);
    });

    it("returns true when exp is in the past", () => {
        const accessToken = buildTestJwt({ exp: Math.floor(Date.now() / 1000) - 60 });

        expect(isAccessTokenExpired(accessToken)).toBe(true);
    });

    it("returns false when exp is in the future", () => {
        const accessToken = buildTestJwt({ exp: Math.floor(Date.now() / 1000) + 900 });

        expect(isAccessTokenExpired(accessToken)).toBe(false);
    });
});

describe("shouldProactivelyRefresh", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-23T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns true when token is null", () => {
        expect(shouldProactivelyRefresh(null)).toBe(true);
    });

    it("returns true when within the 3-minute buffer", () => {
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_REFRESH_BUFFER_SECONDS - 30,
        });

        expect(shouldProactivelyRefresh(accessToken)).toBe(true);
    });

    it("returns false when more than 3 minutes remain", () => {
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_REFRESH_BUFFER_SECONDS + 60,
        });

        expect(shouldProactivelyRefresh(accessToken)).toBe(false);
    });
});

describe("getProactiveRefreshDelayMs", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-23T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns delay until exp minus buffer for a 15-minute token", () => {
        const tokenLifetimeSeconds = 15 * 60;
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds,
        });

        const expectedDelayMs =
            (tokenLifetimeSeconds - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS) * 1000;

        expect(getProactiveRefreshDelayMs(accessToken)).toBe(expectedDelayMs);
    });

    it("returns 0 when already inside the buffer window", () => {
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + 60,
        });

        expect(getProactiveRefreshDelayMs(accessToken)).toBe(0);
    });
});

describe("getAccessTokenSecondsRemaining", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-23T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns seconds until exp", () => {
        const accessToken = buildTestJwt({
            exp: Math.floor(Date.now() / 1000) + 300,
        });

        expect(getAccessTokenSecondsRemaining(accessToken)).toBe(300);
    });
});
