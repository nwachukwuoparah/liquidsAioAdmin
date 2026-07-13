import { describe, expect, it } from "vitest";
import { parseAdminTeamsOverviewResponse } from "@/lib/team/utilities/parse-admin-teams-overview-response";

describe("parseAdminTeamsOverviewResponse", () => {
    it("parses wrapped camelCase overview counts", () => {
        expect(
            parseAdminTeamsOverviewResponse({
                status: "success",
                data: {
                    activeMembers: 3,
                    pendingInvites: 2,
                    revokedAdmins: 1,
                },
            }),
        ).toEqual({
            activeMembers: 3,
            pendingInvites: 2,
            revokedAdmins: 1,
        });
    });

    it("parses snake_case fields and defaults missing values to 0", () => {
        expect(
            parseAdminTeamsOverviewResponse({
                active_members: 5,
                pending_invites: "4",
            }),
        ).toEqual({
            activeMembers: 5,
            pendingInvites: 4,
            revokedAdmins: 0,
        });
    });
});
