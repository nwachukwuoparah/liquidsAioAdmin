"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminInventoryLotDetail,
    postAdminLotReview,
} from "@/lib/inventory/services/admin-inventory.service";
import type { AdminLotReviewRequestBody } from "@/lib/inventory/types/admin-inventory-detail.types";
import { QueryConfig } from "@/lib/query/query-config";

/** Loads a single lot detail for the review modal. */
export function useAdminInventoryLotDetail(lotId: string) {
    return useQuery({
        queryKey: ["admin-inventory-lot-detail", lotId],
        queryFn: () => fetchAdminInventoryLotDetail(lotId),
        ...QueryConfig.DEFAULT,
        enabled: Boolean(lotId),
    });
}

function useAdminLotReviewMutation(mutationKey: string, successFallback: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [mutationKey],
        mutationFn: (requestBody: AdminLotReviewRequestBody) => postAdminLotReview(requestBody),
        retry: 0,
        onSuccess: (response, variables) => {
            toast.success(response.message || successFallback);
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-lots"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-stats"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory-overview"] });
            void queryClient.invalidateQueries({
                queryKey: ["admin-inventory-lot-detail", variables.lotId],
            });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Approves a pending lot listing. */
export function useAdminInventoryLotApprove() {
    return useAdminLotReviewMutation("admin-inventory-lot-approve", "Listing approved.");
}

/** Declines a pending lot listing. */
export function useAdminInventoryLotDecline() {
    return useAdminLotReviewMutation("admin-inventory-lot-decline", "Listing declined.");
}

/** Suspends an active or reported lot listing. */
export function useAdminInventoryLotSuspend() {
    return useAdminLotReviewMutation("admin-inventory-lot-suspend", "Listing suspended.");
}
