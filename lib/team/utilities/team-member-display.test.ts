import { describe, expect, it } from "vitest";
import {
    getTeamMemberDisplayName,
    getTeamMemberInitials,
    getTeamMemberRoleName,
    getTeamMemberStatusLabel,
    isTeamMemberActive,
    isTeamMemberRevoked,
} from "./team-member-display";

describe("team-member-display", () => {
    it("builds display name and initials from raw fields", () => {
        const member = {
            firstName: "Jenny",
            lastName: "Wilson",
            email: "jenny@liquidsaio.com",
        };

        expect(getTeamMemberDisplayName(member)).toBe("Jenny Wilson");
        expect(getTeamMemberInitials(member)).toBe("JW");
    });

    it("returns the raw role name without reformatting", () => {
        expect(
            getTeamMemberRoleName({
                roles: [{ name: "superAdmin" }],
            }),
        ).toBe("superAdmin");
        expect(getTeamMemberRoleName({ roles: "compliance_reviewer" })).toBe("compliance_reviewer");
    });

    it("treats active non-revoked admins as Active", () => {
        expect(
            isTeamMemberActive({
                status: "active",
                revoked: false,
            }),
        ).toBe(true);
        expect(getTeamMemberStatusLabel({ status: "active", revoked: false })).toBe("Active");
    });

    it("hardcodes Revoked when revoked is true", () => {
        expect(isTeamMemberRevoked({ status: "active", revoked: true })).toBe(true);
        expect(getTeamMemberStatusLabel({ status: "active", revoked: true })).toBe("Revoked");
        expect(getTeamMemberStatusLabel({ status: "pending", revoked: true })).toBe("Revoked");
    });

    it("treats non-revoked pending admins as Pending", () => {
        expect(getTeamMemberStatusLabel({ status: "pending", revoked: false })).toBe("Pending");
    });
});
