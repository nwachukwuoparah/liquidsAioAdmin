import { describe, expect, it } from "vitest";
import { resolveAdminSessionUserId } from "@/lib/auth/utilities/resolve-admin-session-user-id";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("resolveAdminSessionUserId", () => {
    it("returns null when no token is available", () => {
        expect(resolveAdminSessionUserId(null)).toBeNull();
    });

    it("reads the user id from the sub claim", () => {
        expect(resolveAdminSessionUserId(buildTestJwt({ sub: "user-123" }))).toBe("user-123");
    });

    it("reads nested user.id when top-level claims are missing", () => {
        expect(
            resolveAdminSessionUserId(
                buildTestJwt({
                    user: { id: "nested-user-9" },
                }),
            ),
        ).toBe("nested-user-9");
    });
});
