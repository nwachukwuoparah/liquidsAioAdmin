import { describe, expect, it } from "vitest";
import {
    decodeInviteTokenPayload,
    getInviteEmailFromToken,
} from "@/lib/auth/utilities/decode-invite-token";

const SAMPLE_INVITE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleV8xIn0.eyJ0eXBlIjoiYWRtaW4iLCJ0YXJnZXQiOiIwMTllZTRjMi1mNzU5LTcyZjktODBjNC0yZTM1OGJiMmJjMjAiLCJlbWFpbCI6Im53YWNodWt3dW9wYXJhaEBnbWFpbC5jb20iLCJyb2xlTmFtZSI6InN1cGVyQWRtaW4iLCJpYXQiOjE3ODE5NTQ0NDMsImV4cCI6MTc4MjU1OTI0M30._ylcpeTyWGrNTC6EUTT-L3xI8nxadzGwr1BFaIff8Zc";

describe("decodeInviteTokenPayload", () => {
    it("decodes invite token payload fields", () => {
        const payload = decodeInviteTokenPayload(SAMPLE_INVITE_TOKEN);

        expect(payload).toEqual({
            type: "admin",
            target: "019ee4c2-f759-72f9-80c4-2e358bb2bc20",
            email: "nwachukwuoparah@gmail.com",
            roleName: "superAdmin",
            iat: 1781954443,
            exp: 1782559243,
        });
    });

    it("returns null for malformed tokens", () => {
        expect(decodeInviteTokenPayload("not-a-jwt")).toBeNull();
        expect(decodeInviteTokenPayload("a.b")).toBeNull();
        expect(decodeInviteTokenPayload("a.not-base64.c")).toBeNull();
    });
});

describe("getInviteEmailFromToken", () => {
    it("returns the email from a valid invite token", () => {
        expect(getInviteEmailFromToken(SAMPLE_INVITE_TOKEN)).toBe("nwachukwuoparah@gmail.com");
    });

    it("returns null when token is missing or invalid", () => {
        expect(getInviteEmailFromToken(null)).toBeNull();
        expect(getInviteEmailFromToken(undefined)).toBeNull();
        expect(getInviteEmailFromToken("")).toBeNull();
        expect(getInviteEmailFromToken("invalid-token")).toBeNull();
    });
});
