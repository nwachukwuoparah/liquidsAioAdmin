import { describe, expect, it } from "vitest";
import { ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA } from "@/lib/auth/constants/two-factor.constant";
import { resolvePostLoginAuthRoute } from "@/lib/auth/utilities/resolve-post-login-auth-route";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("resolvePostLoginAuthRoute", () => {
    it("routes pending_2fa tokens to setup 2FA", () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
        });

        expect(resolvePostLoginAuthRoute(accessToken)).toBe("/setup-2fa");
    });

    it("routes other tokens to verify 2FA", () => {
        const accessToken = buildTestJwt({
            status: "active",
        });

        expect(resolvePostLoginAuthRoute(accessToken)).toBe("/verify");
    });
});
