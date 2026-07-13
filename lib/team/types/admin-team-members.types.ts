import type { AdminTeamMemberStatusFilter } from "@/lib/team/constants/admin-invite.constant";

export interface AdminTeamMembersApiCursor {
    cursor_id?: string;
    cursor_sort_at?: string;
}

export interface AdminTeamMemberRoleApiRecord {
    id?: string;
    name?: string;
    description?: string;
}

export interface AdminTeamMemberPermissionApiRecord {
    resource?: string;
    action?: string;
    scope?: string;
}

export interface AdminTeamMemberApiRecord {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roles?: Array<string | AdminTeamMemberRoleApiRecord> | string;
    permissions?: Array<string | AdminTeamMemberPermissionApiRecord> | string;
    lastActive?: string | null;
    last_active?: string | null;
    status?: string;
    revoked?: boolean;
    createdAt?: string;
    profilePicture?: string;
    profileImageUrl?: string;
}

export interface AdminTeamMembersApiPagePayload {
    totalCount?: number;
    /** Backend may return the page size/count as a number, or a results array. */
    results?: number | AdminTeamMemberApiRecord[];
    admins?: AdminTeamMemberApiRecord[];
    hasNext?: boolean;
    nextCursor?: AdminTeamMembersApiCursor | null;
}

export interface AdminTeamMembersApiPage {
    totalCount: number;
    results: AdminTeamMemberApiRecord[];
    hasNext: boolean;
    nextCursor?: AdminTeamMembersApiCursor | null;
}

export interface AdminTeamMembersApiResponseBody {
    status?: string;
    message?: string;
    data?: AdminTeamMembersApiPagePayload;
    totalCount?: number;
    results?: number | AdminTeamMemberApiRecord[];
    admins?: AdminTeamMemberApiRecord[];
    hasNext?: boolean;
    nextCursor?: AdminTeamMembersApiCursor | null;
}

export interface FetchAdminTeamMembersParams {
    limit?: number;
    order?: "asc" | "desc";
    cursorId?: string;
    cursorSortAt?: string;
    status?: AdminTeamMemberStatusFilter;
}

export interface AdminTeamMembersQueryData {
    /** Raw admin records from GET /admins (not UI-mapped). */
    members: AdminTeamMemberApiRecord[];
    totalCount: number;
    hasNext: boolean;
    nextCursor?: AdminTeamMembersApiCursor | null;
}
