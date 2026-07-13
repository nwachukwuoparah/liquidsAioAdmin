"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminOrders,
    fetchAdminOrderStats,
    postAdminOrderAction,
} from "@/lib/admin/services/admin-dashboard.service";
import type { AdminOrderActionRequestBody } from "@/lib/admin/types/admin-api.types";
import { QueryConfig } from "@/lib/query/query-config";

interface UseAdminOrdersOptions {
    tab?: string;
    search?: string;
}

/** Loads the admin orders list for the active tab and search query. */
export function useAdminOrders({ tab = "All", search = "" }: UseAdminOrdersOptions = {}) {
    return useQuery({
        queryKey: ["admin-orders", tab, search],
        queryFn: () => fetchAdminOrders({ tab, search }),
        ...QueryConfig.DEFAULT,
    });
}

/** Loads quick stats for the orders dashboard. */
export function useAdminOrderStats() {
    return useQuery({
        queryKey: ["admin-orders-stats"],
        queryFn: fetchAdminOrderStats,
        ...QueryConfig.LIVE,
    });
}

/** Runs a POST action against an order (flag, release escrow, etc.). */
export function useAdminOrderAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-order-action"],
        mutationFn: (requestBody: AdminOrderActionRequestBody) => postAdminOrderAction(requestBody),
        retry: 0,
        onSuccess: (response) => {
            toast.success(response.message ?? "Order action queued.");
            void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}
