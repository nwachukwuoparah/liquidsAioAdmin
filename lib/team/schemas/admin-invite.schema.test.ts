import { describe, expect, it } from "vitest";
import {
    adminInviteTeamMemberSchema,
    toAdminInviteTeamMemberRequestBody,
} from "@/lib/team/schemas/admin-invite.schema";
import { ADMIN_INVITE_ROLE } from "@/lib/team/constants/admin-invite.constant";

describe("adminInviteTeamMemberSchema", () => {
    it("accepts valid invite form values", () => {
        const parsedValues = adminInviteTeamMemberSchema.parse({
            email: "new.admin@liquidsaio.com",
            role: ADMIN_INVITE_ROLE.ADMIN,
            message: "Welcome to the team.",
        });

        expect(parsedValues.email).toBe("new.admin@liquidsaio.com");
        expect(parsedValues.role).toBe(ADMIN_INVITE_ROLE.ADMIN);
    });

    it("rejects invalid email addresses", () => {
        const result = adminInviteTeamMemberSchema.safeParse({
            email: "not-an-email",
            role: ADMIN_INVITE_ROLE.ADMIN,
        });

        expect(result.success).toBe(false);
    });

    it("rejects unsupported roles", () => {
        const result = adminInviteTeamMemberSchema.safeParse({
            email: "new.admin@liquidsaio.com",
            role: ADMIN_INVITE_ROLE.SUPER_ADMIN,
        });

        expect(result.success).toBe(false);
    });
});

describe("toAdminInviteTeamMemberRequestBody", () => {
    it("maps validated form values to the invite API payload", () => {
        expect(
            toAdminInviteTeamMemberRequestBody({
                email: "  new.admin@liquidsaio.com ",
                role: ADMIN_INVITE_ROLE.ADMIN,
                message: "Optional note",
            }),
        ).toEqual({
            email: "new.admin@liquidsaio.com",
            role: ADMIN_INVITE_ROLE.ADMIN,
        });
    });
});
