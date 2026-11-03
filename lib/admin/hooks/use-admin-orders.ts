"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminOrders,
    fetchAdminOrdersPage,
    fetchAdminOrderStats,
    fetchAdminOrdersOverview,
    postAdminOrderAction,
} from "@/lib/admin/services/admin-dashboard.service";
import {
    fetchAdminOrderDetail,
    holdAdminOrderPayment,
    refundAdminOrderBuyer,
    releaseAdminOrderPaymentHold,
} from "@/lib/orders/services/admin-orders.service";
import type { AdminOrderActionRequestBody } from "@/lib/admin/types/admin-api.types";
import type { FetchAdminOrdersPageParams } from "@/lib/orders/types/admin-orders-api.types";
import { QueryConfig } from "@/lib/query/query-config";

/** Loads a cursor-paginated admin orders page for filters, status tab, and search query. */
export function useAdminOrdersPage(params: FetchAdminOrdersPageParams = {}, pageOffset = 0) {
    return useQuery({
        queryKey: ["admin-orders-page", params, pageOffset],
        queryFn: () => fetchAdminOrdersPage(params, pageOffset),
        ...QueryConfig.DEFAULT,
    });
}

/** Loads the admin orders list for the active tab and search query. */
export function useAdminOrders(params: FetchAdminOrdersPageParams = {}) {
    return useQuery({
        queryKey: ["admin-orders", params],
        queryFn: () => fetchAdminOrders(params),
        ...QueryConfig.DEFAULT,
    });
}

/** Loads admin order detail from GET /v1/orders/admin/{orderId}. */
export function useAdminOrderDetail(orderId?: string, enabled = true, fallbackId?: string) {
    return useQuery({
        queryKey: ["admin-order-detail", orderId, fallbackId],
        queryFn: () => {
            if (!orderId && !fallbackId) throw new Error("orderId is required");
            return fetchAdminOrderDetail(orderId || (fallbackId as string), fallbackId);
        },
        ...QueryConfig.DEFAULT,
        enabled: Boolean((orderId || fallbackId) && enabled),
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

/** Loads the unformatted admin overview from GET /v1/admins/overview. */
export function useAdminOrdersOverview(range?: { start?: string; end?: string }) {
    return useQuery({
        queryKey: ["admin-orders-overview", range?.start, range?.end],
        queryFn: () => fetchAdminOrdersOverview(range),
        ...QueryConfig.LIVE,
    });
}

export const useAdminOrderOverview = useAdminOrdersOverview;

/** Runs a POST action against an order (flag, release escrow, etc.). */
export function useAdminOrderAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-order-action"],
        mutationFn: (requestBody: AdminOrderActionRequestBody) => postAdminOrderAction(requestBody),
        retry: 0,
        onSuccess: () => {
            // toast.success(response.message ?? "Order action queued.");
            void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-overview"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Places a payment hold on an order: PATCH /v1/orders/admin/{orderId}/payment-hold */
export function useAdminOrderPaymentHold() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-order-payment-hold"],
        mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
            holdAdminOrderPayment(orderId, { reason }),
        retry: 0,
        onSuccess: (_data, variables) => {
            toast.success("Payment hold placed successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] });
            if (variables?.orderId) {
                const cleanId = variables.orderId.replace(/^#/, "");
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", variables.orderId],
                });
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", cleanId],
                });
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", `#${cleanId}`],
                });
            }
            void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-page"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error("Failed to place payment hold.");
            }
        },
    });
}

/** Releases a payment hold on an order: PATCH /v1/orders/admin/{orderId}/payment-hold/release */
export function useAdminOrderPaymentRelease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-order-payment-release"],
        mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
            releaseAdminOrderPaymentHold(orderId, { reason }),
        retry: 0,
        onSuccess: (_data, variables) => {
            toast.success("Payment hold released successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] });
            if (variables?.orderId) {
                const cleanId = variables.orderId.replace(/^#/, "");
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", variables.orderId],
                });
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", cleanId],
                });
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", `#${cleanId}`],
                });
            }
            void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-page"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error("Failed to release payment hold.");
            }
        },
    });
}

/** Starts a full buyer refund for an order: POST /v1/orders/admin/{orderId}/refund */
export function useAdminOrderRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-order-refund"],
        mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
            refundAdminOrderBuyer(orderId, { reason }),
        retry: 0,
        onSuccess: (_data, variables) => {
            toast.success("Refund queued successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] });
            if (variables?.orderId) {
                void queryClient.invalidateQueries({
                    queryKey: ["admin-order-detail", variables.orderId],
                });
            }
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-page"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-orders-overview"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error("Failed to process refund.");
            }
        },
    });
}
