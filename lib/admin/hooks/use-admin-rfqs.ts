"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import type { AdminRfqTabStatus } from "@/lib/rfq/constants/admin-rfqs-api.constant";
import { fetchAdminRfqsPage, postAdminRfqResolve } from "@/lib/rfq/services/admin-rfqs.service";
import { QueryConfig } from "@/lib/query/query-config";
import type { AdminRfqApiRecord } from "@/lib/rfq/types/admin-rfqs-api.types";

export interface AdminRfqsQueryData {
    totalCount: number;
    hasNext: boolean;
    rfqs: AdminRfqApiRecord[];
}

/** Loads buyer RFQs for the active pending/resolved tab. */
export function useAdminRfqs(status: AdminRfqTabStatus) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["admin-rfqs", status],
        queryFn: async (): Promise<AdminRfqsQueryData> => {
            return await fetchAdminRfqsPage({ status });
        },
        ...QueryConfig.DEFAULT,
    });
    return { data, isLoading, isError, refetch };
}

/** Loads pending/resolved tab badge counts from the RFQ admin endpoint. */
export function useAdminRfqTabCounts() {
    const pendingQuery = useQuery({
        queryKey: ["admin-rfqs", "pending", "count"],
        queryFn: async () => {
            const page = await fetchAdminRfqsPage({ status: "pending", limit: 1 });
            return page.totalCount;
        },
        ...QueryConfig.DEFAULT,
    });

    const resolvedQuery = useQuery({
        queryKey: ["admin-rfqs", "resolved", "count"],
        queryFn: async () => {
            const page = await fetchAdminRfqsPage({ status: "resolved", limit: 1 });
            return page.totalCount;
        },
        ...QueryConfig.DEFAULT,
    });

    return {
        pending: pendingQuery.data,
        resolved: resolvedQuery.data,
        isLoading: pendingQuery.isLoading || resolvedQuery.isLoading,
        isError: pendingQuery.isError || resolvedQuery.isError,
        refetch: () => Promise.all([pendingQuery.refetch(), resolvedQuery.refetch()]),
    };
}

/** Marks a pending buyer RFQ as resolved and refreshes RFQ lists. */
export function useAdminRfqResolve() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-rfq-resolve"],
        mutationFn: (rfqId: string) => postAdminRfqResolve(rfqId),
        retry: 0,
        onSuccess: (response) => {
            toast.success(response.message || "Request marked as resolved.");
            void queryClient.invalidateQueries({ queryKey: ["admin-rfqs"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                const permissionHint =
                    error.statusCode === 401 || error.statusCode === 403
                        ? " Your account may be missing the rfqs:resolve permission."
                        : "";
                toast.error(`${error.message}${permissionHint}`);
                return;
            }

            toast.error(error.message || "Failed to mark request as resolved.");
        },
    });
}
