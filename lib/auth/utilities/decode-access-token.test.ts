import { describe, expect, it } from "vitest";
import { ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA } from "@/lib/auth/constants/two-factor.constant";
import {
    decodeAdminAccessTokenPayload,
    isPendingTwoFactorSetupAccessToken,
} from "@/lib/auth/utilities/decode-access-token";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("decodeAdminAccessTokenPayload", () => {
    it("decodes the access token status claim", () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
            email: "admin@liquidsaio.com",
        });

        expect(decodeAdminAccessTokenPayload(accessToken)).toEqual({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
            email: "admin@liquidsaio.com",
        });
    });

    it("returns null for malformed tokens", () => {
        expect(decodeAdminAccessTokenPayload("not-a-jwt")).toBeNull();
    });
});

describe("isPendingTwoFactorSetupAccessToken", () => {
    it("returns true when status is pending_2fa", () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
        });

        expect(isPendingTwoFactorSetupAccessToken(accessToken)).toBe(true);
    });

    it("returns false for other statuses", () => {
        const accessToken = buildTestJwt({
            status: "active",
        });

        expect(isPendingTwoFactorSetupAccessToken(accessToken)).toBe(false);
    });
});
