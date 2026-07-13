"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query/query-config";
import { fetchAdminTeamsOverview } from "@/lib/team/services/admin-invite.service";

/** Loads Active members / Pending invites counts for Teams & permission. */
export function useAdminTeamsOverview() {
    return useQuery({
        queryKey: ["admin-teams-overview"],
        queryFn: fetchAdminTeamsOverview,
        ...QueryConfig.DEFAULT,
    });
}
