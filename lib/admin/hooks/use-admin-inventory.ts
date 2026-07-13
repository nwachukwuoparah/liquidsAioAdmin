"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminInventoryOverview,
    fetchAdminInventoryStats,
    postAdminInventoryAction,
} from "@/lib/admin/services/admin-dashboard.service";
import type {
    AdminInventoryActionRequestBody,
    AdminInventoryTabCounts,
} from "@/lib/admin/types/admin-api.types";
import {
    INVENTORY_TAB_QUERY_PARAMS,
    type AdminInventoryTabId,
} from "@/lib/inventory/constants/admin-inventory-api.constant";
import { fetchAdminInventoryLotsPage } from "@/lib/inventory/services/admin-inventory.service";
import { QueryConfig } from "@/lib/query/query-config";

const INVENTORY_TAB_COUNT_KEYS = [
    { tabId: "All Lots" as const, countKey: "allLots" as const },
    { tabId: "Pending approval" as const, countKey: "pendingApproval" as const },
    { tabId: "Reported" as const, countKey: "reported" as const },
    { tabId: "Suspended" as const, countKey: "suspended" as const },
];

/** Loads a single page of inventory lots from GET /lots. */
export function useAdminInventoryLots(queryParams: Record<string, string> = {}) {
    return useQuery({
        queryKey: ["admin-inventory-lots", queryParams],
        queryFn: () => fetchAdminInventoryLotsPage(queryParams),
        ...QueryConfig.DEFAULT,
    });
}

/** Loads inventory overview stats for the selected date range. */
export function useAdminInventoryOverview(range?: { start?: string; end?: string }) {
    return useQuery({
        queryKey: ["admin-inventory-overview", range?.start, range?.end],
        queryFn: () => fetchAdminInventoryOverview(range),
        ...QueryConfig.LIVE,
    });
}

/** Loads inventory tab badge counts. */
export function useAdminInventoryStats() {
    return useQuery({
        queryKey: ["admin-inventory-stats"],
        queryFn: fetchAdminInventoryStats,
        ...QueryConfig.LIVE,
    });
}

/**
 * Loads live tab badge counts from GET /lots totals.
 * Prefer this over /inventory/stats when that endpoint returns empty/zero counts.
 */
export function useAdminInventoryTabCounts(): {
    tabCounts: AdminInventoryTabCounts;
    isLoading: boolean;
    isError: boolean;
} {
    const countQueries = useQueries({
        queries: INVENTORY_TAB_COUNT_KEYS.map(({ tabId }) => ({
            queryKey: ["admin-inventory-lots", "count", tabId],
            queryFn: async () => {
                const page = await fetchAdminInventoryLotsPage({
                    ...INVENTORY_TAB_QUERY_PARAMS[tabId as AdminInventoryTabId],
                    page: "1",
                    limit: "1",
                });
                return page.totalCount;
            },
            ...QueryConfig.LIVE,
        })),
    });

    const tabCounts = INVENTORY_TAB_COUNT_KEYS.reduce<AdminInventoryTabCounts>(
        (counts, { countKey }, index) => {
            counts[countKey] = countQueries[index]?.data ?? 0;
            return counts;
        },
        {
            allLots: 0,
            pendingApproval: 0,
            reported: 0,
            suspended: 0,
        },
    );

    return {
        tabCounts,
        isLoading: countQueries.some((query) => query.isLoading),
        isError: countQueries.some((query) => query.isError),
    };
}

/** Runs a POST action against an inventory lot. */
export function useAdminInventoryAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-inventory-action"],
        mutationFn: (requestBody: AdminInventoryActionRequestBody) => postAdminInventoryAction(requestBody),
        retry: 0,
        onSuccess: () => {
            toast.success("Inventory action queued.");
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-lots"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-stats"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-overview"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}
