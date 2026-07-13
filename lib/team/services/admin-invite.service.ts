import { apiClient } from "@/lib/api/api-client";
import {
    ADMIN_INVITE_PATH,
    ADMIN_TEAM_MEMBERS_DEFAULT_ORDER,
    ADMIN_TEAM_MEMBERS_DEFAULT_PAGE_LIMIT,
    ADMIN_TEAM_MEMBERS_PATH,
    ADMIN_TEAM_ROLE_PERMISSIONS_PATH,
    ADMIN_TEAM_ROLES_PATH,
    ADMIN_TEAMS_OVERVIEW_PATH,
    getAdminInviteResendPath,
    getAdminRestorePath,
    getAdminRevokePath,
} from "@/lib/team/constants/admin-invite.constant";
import type { AdminInviteTeamMemberRequestBody } from "@/lib/team/schemas/admin-invite.schema";
import type {
    AdminTeamMembersApiResponseBody,
    AdminTeamMembersQueryData,
    FetchAdminTeamMembersParams,
} from "@/lib/team/types/admin-team-members.types";
import type { AdminTeamsOverviewCounts } from "@/lib/team/types/admin-teams-overview.types";
import { parseAdminTeamMembersApiResponse } from "@/lib/team/utilities/parse-admin-team-members-api-response";
import { parseAdminTeamsOverviewResponse } from "@/lib/team/utilities/parse-admin-teams-overview-response";

/** Parsed JSON body from the admin invite endpoint. */
export interface AdminInviteApiResponse {
    status?: string;
    message?: string;
    data?: unknown;
}

/**
 * Sends an admin team member invite to the provided email address.
 * @param requestBody - Invite email and role payload validated on the client.
 */
export async function adminInviteTeamMember(requestBody: AdminInviteTeamMemberRequestBody) {
    return apiClient.post<AdminInviteApiResponse>(ADMIN_INVITE_PATH, requestBody);
}

/**
 * Resends a pending, non-revoked admin invitation.
 * Rate-limited to one resend per minute per invited admin.
 */
export async function adminResendInvite(adminId: string) {
    return apiClient.post<AdminInviteApiResponse>(getAdminInviteResendPath(adminId));
}

/**
 * Revokes an admin invitation / access.
 * Sets revoked=true and closes open invitation rows. Admins cannot revoke themselves.
 */
export async function adminRevokeInvite(adminId: string) {
    return apiClient.post<AdminInviteApiResponse>(getAdminRevokePath(adminId));
}

/**
 * Restores a revoked admin.
 * Sets revoked=false; if still pending, backend creates and emails a new invitation.
 */
export async function adminRestoreInvite(adminId: string) {
    return apiClient.post<AdminInviteApiResponse>(getAdminRestorePath(adminId));
}

export async function adminTeamRoles() {
    return apiClient.get<unknown[]>(ADMIN_TEAM_ROLES_PATH);
}

export async function adminTeamPermissions() {
    return apiClient.get<unknown[]>(ADMIN_TEAM_ROLE_PERMISSIONS_PATH);
}

/** Fetches Teams & permission overview counts from GET /admins/overview. */
export async function fetchAdminTeamsOverview(): Promise<AdminTeamsOverviewCounts> {
    const { body } = await apiClient.get<unknown>(ADMIN_TEAMS_OVERVIEW_PATH);
    return parseAdminTeamsOverviewResponse(body);
}

function buildAdminTeamMembersQueryParams({
    limit = ADMIN_TEAM_MEMBERS_DEFAULT_PAGE_LIMIT,
    order = ADMIN_TEAM_MEMBERS_DEFAULT_ORDER,
    cursorId,
    cursorSortAt,
    status,
}: FetchAdminTeamMembersParams = {}): Record<string, string | undefined> {
    return {
        limit: String(limit),
        order,
        cursor_id: cursorId,
        cursor_sort_at: cursorSortAt,
        status,
    };
}

/** Fetches cursor-paginated admin team members from GET /admins. */
export async function fetchAdminTeamMembers(
    params: FetchAdminTeamMembersParams = {},
): Promise<AdminTeamMembersQueryData> {
    const { body } = await apiClient.get<AdminTeamMembersApiResponseBody>(
        ADMIN_TEAM_MEMBERS_PATH,
        buildAdminTeamMembersQueryParams(params),
    );
    const page = parseAdminTeamMembersApiResponse(body);

    return {
        members: page.results,
        totalCount: page.totalCount,
        hasNext: page.hasNext,
        nextCursor: page.nextCursor,
    };
}
