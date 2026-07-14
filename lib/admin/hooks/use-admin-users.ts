"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchAdminUserDetails,
    fetchAdminUsers,
    fetchAdminUsersPage,
    fetchAdminUserStats,
    postAdminUserAction,
} from "@/lib/admin/services/admin-dashboard.service";
import { QueryConfig } from "@/lib/query/query-config";
import {
    AdminUserRecord,
    AdminUserSegmentTab,
    AdminUserStatRecord,
    AdminUserTabCounts,
} from "../types/admin-api.types";
import { toast } from "sonner";

const USER_TAB_COUNT_KEYS: ReadonlyArray<{ accountType: AdminUserSegmentTab; countKey: keyof AdminUserTabCounts }> = [
    { accountType: "buyer", countKey: "buyers" },
    { accountType: "seller", countKey: "sellers" },
    { accountType: "reported", countKey: "reported" },
];

/** Loads users for the active admin segment and search/filter params. */
export function useAdminUsers(filterParams: Record<string, string> = {}) {
    const { data, isLoading, error } = useQuery<AdminUserRecord[]>({
        queryKey: ["admin-users", filterParams],
        queryFn: () => fetchAdminUsers(filterParams),
        ...QueryConfig.DEFAULT,
    });

    return { data, isLoading, error };
}

/** Loads engagement stats for the users dashboard. */
export function useAdminUserStats() {
    return useQuery<{ data: { stats: AdminUserStatRecord } }>({
        queryKey: ["admin-users-stats"],
        queryFn: () => fetchAdminUserStats(),
        ...QueryConfig.LIVE,
    });
}

/** Loads buyer/seller/reported tab badge counts from GET /users totals. */
export function useAdminUserTabCounts(): {
    tabCounts: AdminUserTabCounts;
    isLoading: boolean;
    isError: boolean;
} {
    const countQueries = useQueries({
        queries: USER_TAB_COUNT_KEYS.map(({ accountType }) => ({
            queryKey: ["admin-users", "count", accountType],
            queryFn: async () => {
                const page = await fetchAdminUsersPage({
                    accountType,
                    limit: "1",
                });
                return page.totalCount;
            },
            ...QueryConfig.LIVE,
        })),
    });

    const tabCounts = USER_TAB_COUNT_KEYS.reduce<AdminUserTabCounts>(
        (counts, { countKey }, index) => {
            counts[countKey] = countQueries[index]?.data ?? 0;
            return counts;
        },
        {
            buyers: 0,
            sellers: 0,
            reported: 0,
        },
    );

    return {
        tabCounts,
        isLoading: countQueries.some((query) => query.isLoading),
        isError: countQueries.some((query) => query.isError),
    };
}

export function useAdminUserDetails(userId: string) {
    return useQuery<{ data: { user: AdminUserRecord } }>({
        queryKey: ["admin-user-details", userId],
        queryFn: ({ queryKey }) => fetchAdminUserDetails(queryKey[1] as string),
        ...QueryConfig.DEFAULT,
    });
}

export function useAdminSuspendAccount(
    userId: string,
    action: "suspend" | "restore",
    options?: { onSuccess?: () => void, onError?: (error: Error) => void }
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reason }: { reason?: string }) => {
            // Build the payload dynamically; if reason is missing, it won't be sent in the body
            const payload = {
                userId,
                action,
                ...(reason ? { reason } : {})
            };
            return postAdminUserAction(payload as any);
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["admin-user-details", userId] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            options?.onSuccess?.();
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message);
            options?.onError?.(error);
        },
    });
}
