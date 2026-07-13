"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query/query-config";
import { fetchAdminTeamMembers } from "@/lib/team/services/admin-invite.service";
import type { FetchAdminTeamMembersParams } from "@/lib/team/types/admin-team-members.types";

/** Loads cursor-paginated admin team members for Teams & permission. */
export function useAdminTeamMembers(params: FetchAdminTeamMembersParams = {}) {
    return useQuery({
        queryKey: ["admin-team-members", params],
        queryFn: () => fetchAdminTeamMembers(params),
        ...QueryConfig.DEFAULT,
    });
}
