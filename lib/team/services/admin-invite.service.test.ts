import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";
import {
    ADMIN_INVITE_PATH,
    ADMIN_INVITE_ROLE,
    ADMIN_TEAM_MEMBERS_PATH,
    ADMIN_TEAMS_OVERVIEW_PATH,
    getAdminInviteResendPath,
    getAdminRestorePath,
    getAdminRevokePath,
} from "@/lib/team/constants/admin-invite.constant";
import {
    adminInviteTeamMember,
    adminResendInvite,
    adminRestoreInvite,
    adminRevokeInvite,
    fetchAdminTeamMembers,
    fetchAdminTeamsOverview,
} from "@/lib/team/services/admin-invite.service";

const mockApiClientPost = vi.fn();
const mockApiClientGet = vi.fn();

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: (...args: unknown[]) => mockApiClientPost(...args),
        get: (...args: unknown[]) => mockApiClientGet(...args),
    },
}));

describe("adminInviteTeamMember", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
        mockApiClientGet.mockReset();
        clearAllCookiesForTests();
    });

    it("posts the invite payload to the admin invite endpoint", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation sent." },
        });

        const inviteResult = await adminInviteTeamMember({
            email: "new.admin@liquidsaio.com",
            role: ADMIN_INVITE_ROLE.ADMIN,
        });

        expect(mockApiClientPost).toHaveBeenCalledWith(ADMIN_INVITE_PATH, {
            email: "new.admin@liquidsaio.com",
            role: ADMIN_INVITE_ROLE.ADMIN,
        });
        expect(inviteResult.body).toEqual({
            status: "success",
            message: "Invitation sent.",
        });
    });
});

describe("adminResendInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts to the admin invite resend endpoint for the given admin id", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Invitation resent." },
        });

        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
        const resendResult = await adminResendInvite(adminId);

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminInviteResendPath(adminId));
        expect(resendResult.body).toEqual({
            status: "success",
            message: "Invitation resent.",
        });
    });
});

describe("adminRevokeInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts to the admin revoke endpoint for the given admin id", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access revoked." },
        });

        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
        const revokeResult = await adminRevokeInvite(adminId);

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminRevokePath(adminId));
        expect(revokeResult.body).toEqual({
            status: "success",
            message: "Access revoked.",
        });
    });
});

describe("adminRestoreInvite", () => {
    beforeEach(() => {
        mockApiClientPost.mockReset();
    });

    it("posts to the admin restore endpoint for the given admin id", async () => {
        mockApiClientPost.mockResolvedValue({
            setupToken: null,
            token: null,
            body: { status: "success", message: "Access restored." },
        });

        const adminId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
        const restoreResult = await adminRestoreInvite(adminId);

        expect(mockApiClientPost).toHaveBeenCalledWith(getAdminRestorePath(adminId));
        expect(restoreResult.body).toEqual({
            status: "success",
            message: "Access restored.",
        });
    });
});

describe("fetchAdminTeamsOverview", () => {
    beforeEach(() => {
        mockApiClientGet.mockReset();
    });

    it("fetches and parses GET /admins/overview counts", async () => {
        mockApiClientGet.mockResolvedValue({
            setupToken: null,
            token: null,
            body: {
                status: "success",
                data: {
                    activeMembers: 3,
                    pendingInvites: 2,
                    revokedAdmins: 0,
                },
            },
        });

        const overview = await fetchAdminTeamsOverview();

        expect(mockApiClientGet).toHaveBeenCalledWith(ADMIN_TEAMS_OVERVIEW_PATH);
        expect(overview).toEqual({
            activeMembers: 3,
            pendingInvites: 2,
            revokedAdmins: 0,
        });
    });
});

describe("fetchAdminTeamMembers", () => {
    beforeEach(() => {
        mockApiClientGet.mockReset();
    });

    it("fetches GET /admins and returns raw admin records", async () => {
        const adminRecord = {
            id: "admin-1",
            firstName: "Jenny",
            lastName: "Wilson",
            email: "jenny@liquidsaio.com",
            roles: [{ name: "admin" }],
            status: "active",
            lastActive: "2026-07-01T12:00:00.000Z",
            revoked: false,
            permissions: [{ resource: "settings", action: "edit", scope: "general" }],
        };

        mockApiClientGet.mockResolvedValue({
            setupToken: null,
            token: null,
            body: {
                status: "success",
                data: {
                    results: 1,
                    hasNext: false,
                    nextCursor: null,
                    admins: [adminRecord],
                },
            },
        });

        const page = await fetchAdminTeamMembers({ limit: 10, order: "asc" });

        expect(mockApiClientGet).toHaveBeenCalledWith(ADMIN_TEAM_MEMBERS_PATH, {
            limit: "10",
            order: "asc",
            cursor_id: undefined,
            cursor_sort_at: undefined,
            status: undefined,
        });
        expect(page.totalCount).toBe(1);
        expect(page.hasNext).toBe(false);
        expect(page.members[0]).toEqual(adminRecord);
    });
});
