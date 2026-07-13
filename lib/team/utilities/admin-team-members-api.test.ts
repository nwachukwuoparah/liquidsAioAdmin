import { describe, expect, it } from "vitest";
import { parseAdminTeamMembersApiResponse } from "@/lib/team/utilities/parse-admin-team-members-api-response";

describe("parseAdminTeamMembersApiResponse", () => {
    it("parses admins array when results is a count", () => {
        const page = parseAdminTeamMembersApiResponse({
            status: "success",
            data: {
                results: 4,
                admins: [
                    {
                        id: "019f3466-9ed8-74cc-b084-ad3a25dc3fd9",
                        firstName: "Jude",
                        lastName: "Nnamdi",
                        email: "jude@dummyinbox.com",
                        status: "active",
                    },
                    {
                        id: "admin-2",
                        firstName: "Emeka",
                        lastName: "Nnamdi",
                        email: "emeka@dummyinbox.com",
                        status: "active",
                    },
                ],
                hasNext: false,
                nextCursor: null,
            },
        });

        expect(page.totalCount).toBe(4);
        expect(page.results).toHaveLength(2);
        expect(page.results[0]?.email).toBe("jude@dummyinbox.com");
        expect(page.hasNext).toBe(false);
    });

    it("still supports results as an array", () => {
        const page = parseAdminTeamMembersApiResponse({
            status: "success",
            data: {
                totalCount: 1,
                results: [{ id: "admin-1", email: "a@example.com" }],
                hasNext: true,
                nextCursor: { cursor_id: "cursor-1", cursor_sort_at: "2026-07-01T12:00:00.000Z" },
            },
        });

        expect(page.totalCount).toBe(1);
        expect(page.results).toHaveLength(1);
        expect(page.hasNext).toBe(true);
        expect(page.nextCursor?.cursor_id).toBe("cursor-1");
    });

    it("preserves the full admin record without transforming fields", () => {
        const adminRecord = {
            id: "admin-1",
            firstName: "Jenny",
            lastName: "Wilson",
            email: "jenny@liquidsaio.com",
            roles: [{ name: "superAdmin", description: "All rights" }],
            permissions: [{ resource: "settings", action: "edit", scope: "general" }],
            lastActive: "2026-07-01T12:00:00.000Z",
            status: "active",
            revoked: false,
            createdAt: "2026-06-01T08:00:00.000Z",
            profilePicture: "https://example.com/jenny.jpg",
        };

        const page = parseAdminTeamMembersApiResponse({
            status: "success",
            data: {
                results: 1,
                admins: [adminRecord],
                hasNext: false,
                nextCursor: null,
            },
        });

        expect(page.results[0]).toEqual(adminRecord);
    });
});
