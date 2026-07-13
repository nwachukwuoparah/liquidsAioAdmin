import type {
    AdminTeamMembersApiPage,
    AdminTeamMembersApiPagePayload,
    AdminTeamMembersApiResponseBody,
    AdminTeamMemberApiRecord,
} from "@/lib/team/types/admin-team-members.types";

function resolveAdminRecords(page: AdminTeamMembersApiPagePayload): AdminTeamMemberApiRecord[] {
    if (Array.isArray(page.admins)) {
        return page.admins;
    }

    if (Array.isArray(page.results)) {
        return page.results;
    }

    return [];
}

function resolveTotalCount(
    page: AdminTeamMembersApiPagePayload,
    adminRecords: AdminTeamMemberApiRecord[],
): number {
    if (typeof page.totalCount === "number" && Number.isFinite(page.totalCount)) {
        return page.totalCount;
    }

    if (typeof page.results === "number" && Number.isFinite(page.results)) {
        return page.results;
    }

    return adminRecords.length;
}

function normalizePagePayload(payload: AdminTeamMembersApiResponseBody): AdminTeamMembersApiPage {
    const page = payload.data ?? payload;
    const adminRecords = resolveAdminRecords(page);

    return {
        totalCount: resolveTotalCount(page, adminRecords),
        results: adminRecords,
        hasNext: page.hasNext ?? false,
        nextCursor: page.nextCursor ?? null,
    };
}

/** Parses GET /admins into a normalized cursor page. */
export function parseAdminTeamMembersApiResponse(
    responseBody: AdminTeamMembersApiResponseBody,
): AdminTeamMembersApiPage {
    if (responseBody.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch team members.");
    }

    return normalizePagePayload(responseBody);
}
