/** Admin invite endpoint path. */
export const ADMIN_INVITE_PATH = "/auth/admin/invite";
export const ADMIN_TEAM_ROLES_PATH = "/auth/admin/roles";
export const ADMIN_TEAM_ROLE_PERMISSIONS_PATH = "/auth/admin/role-permissions";

/** Returns POST path to resend a pending admin invitation. */
export function getAdminInviteResendPath(adminId: string): string {
    return `/auth/admin/${encodeURIComponent(adminId)}/invite/resend`;
}

/** Returns POST path to revoke an admin invitation / access. */
export function getAdminRevokePath(adminId: string): string {
    return `/auth/admin/${encodeURIComponent(adminId)}/revoke`;
}

/** Returns POST path to restore a revoked admin. */
export function getAdminRestorePath(adminId: string): string {
    return `/auth/admin/${encodeURIComponent(adminId)}/restore`;
}

/** Teams & permission metric counts: GET /admins/overview. */
export const ADMIN_TEAMS_OVERVIEW_PATH = "/admins/overview";

/** Cursor-paginated admin team members list: GET /admins. */
export const ADMIN_TEAM_MEMBERS_PATH = "/admins";

export const ADMIN_TEAM_MEMBERS_DEFAULT_PAGE_LIMIT = 25;

export const ADMIN_TEAM_MEMBERS_DEFAULT_ORDER = "desc" as const;

export const ADMIN_TEAM_MEMBER_STATUSES = ["pending", "pending_2fa", "active"] as const;

export type AdminTeamMemberStatusFilter = (typeof ADMIN_TEAM_MEMBER_STATUSES)[number];
/** Admin invite role sent to the API. */
export const ADMIN_INVITE_ROLE = {
    ADMIN: "admin",
    SUPER_ADMIN: "superAdmin",
} as const;

export type AdminInviteRole = (typeof ADMIN_INVITE_ROLE)[keyof typeof ADMIN_INVITE_ROLE];

/** Selectable admin invite roles shown in the add-team-member form. */
export const ADMIN_INVITE_ROLE_OPTIONS = [
    {
        value: ADMIN_INVITE_ROLE.ADMIN,
        label: "Admin",
    },
] as const;

/** Default admin invite role preselected in the add-team-member form. */
export const ADMIN_INVITE_DEFAULT_ROLE = ADMIN_INVITE_ROLE.ADMIN;

/** Placeholder email shown in the add-team-member form. */
export const ADMIN_INVITE_EMAIL_PLACEHOLDER = "e.g. sarahchen@liquidsAIO.com";

/** Placeholder message shown in the optional invite message field. */
export const ADMIN_INVITE_MESSAGE_PLACEHOLDER =
    "Please use your work email and finish setup today.";
