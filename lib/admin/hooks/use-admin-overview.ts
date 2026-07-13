"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminOverview } from "@/lib/admin/services/admin-dashboard.service";
import { QueryConfig } from "@/lib/query/query-config";

/** Loads overview dashboard stats, charts, and activity feed. */
export function useAdminOverview(period = "This month") {
    return useQuery({
        queryKey: ["admin-overview", period],
        queryFn: () => fetchAdminOverview(period),
        ...QueryConfig.LIVE,
    });
}
