import { describe, expect, it } from "vitest";
import {
    buildAuthFlowUrl,
    readAccessTokenFromAuthFlowSearchParams,
} from "@/lib/auth/utilities/build-auth-flow-url";

describe("buildAuthFlowUrl", () => {
    it("appends the token query param", () => {
        expect(buildAuthFlowUrl("/setup-2fa", "access-token")).toBe("/setup-2fa?token=access-token");
    });

    it("returns the route unchanged when token is missing", () => {
        expect(buildAuthFlowUrl("/setup-2fa", null)).toBe("/setup-2fa");
    });
});

describe("readAccessTokenFromAuthFlowSearchParams", () => {
    it("reads the token query param", () => {
        const searchParams = new URLSearchParams("token=access-token");

        expect(readAccessTokenFromAuthFlowSearchParams(searchParams)).toBe("access-token");
    });
});
