"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminComplianceOverview,
} from "@/lib/admin/services/admin-dashboard.service";
import type { AdminComplianceActionRequestBody } from "@/lib/admin/types/admin-api.types";
import {
    fetchAdminComplianceReviewsPage,
    fetchAdminComplianceDetail,
    postAdminComplianceActionRequest,
    postAdminComplianceAssignee,
    postAdminComplianceClaim,
    postAdminComplianceUnclaim,
} from "@/lib/compliance/services/admin-compliance.service";
import type { AdminComplianceApiCursor } from "@/lib/compliance/types/admin-compliance-api.types";
import type { AdminComplianceDetailRecord } from "@/lib/compliance/types/admin-compliance-detail.types";
import { QueryConfig } from "@/lib/query/query-config";

function invalidateComplianceAssignmentQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    userId: string,
) {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-compliance-detail", userId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-compliance-reviews"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-compliance-overview"] }),
    ]);
}

function patchComplianceDetailAssignee(
    queryClient: ReturnType<typeof useQueryClient>,
    userId: string,
    assignedTo: string,
) {
    queryClient.setQueryData<AdminComplianceDetailRecord>(
        ["admin-compliance-detail", userId],
        (currentDetail) => {
            if (!currentDetail) {
                return currentDetail;
            }

            return {
                ...currentDetail,
                assignedTo,
            };
        },
    );
}

/** Loads cursor-paginated compliance review queue rows. */
export function useAdminComplianceReviews(filterParams: Record<string, string> = {}) {
    return useInfiniteQuery({
        queryKey: ["admin-compliance-reviews", filterParams],
        queryFn: ({ pageParam }) =>
            fetchAdminComplianceReviewsPage({
                ...filterParams,
                ...(pageParam as AdminComplianceApiCursor),
            }),
        initialPageParam: {} as AdminComplianceApiCursor,
        getNextPageParam: (lastPage) =>
            lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
        ...QueryConfig.DEFAULT,
    });
}

/** Loads compliance dashboard stats. */
export function useAdminComplianceOverview() {
    return useQuery({
        queryKey: ["admin-compliance-overview"],
        queryFn: fetchAdminComplianceOverview,
        ...QueryConfig.LIVE,
    });
}

/** Loads a single compliance user detail payload. */
export function useAdminComplianceDetail(userId: string) {
    return useQuery({
        queryKey: ["admin-compliance-detail", userId],
        queryFn: () => fetchAdminComplianceDetail(userId),
        ...QueryConfig.DEFAULT,
        enabled: Boolean(userId),
    });
}

/** Runs approve/reject/request-update on a review or document. */
export function useAdminComplianceAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-action"],
        mutationFn: (requestBody: AdminComplianceActionRequestBody) =>
            postAdminComplianceActionRequest(requestBody),
        retry: 0,
        onSuccess: (_response, variables) => {
            toast.success("Compliance action queued.");
            void queryClient.invalidateQueries({ queryKey: ["admin-compliance-reviews"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-compliance-overview"] });
            void queryClient.invalidateQueries({
                queryKey: ["admin-compliance-detail", variables.reviewId],
            });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Updates the assignee on a compliance review. */
export function useAdminComplianceAssignee(reviewId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-assign", reviewId],
        mutationFn: (assignedTo: string) =>
            postAdminComplianceAssignee(reviewId, { assignedTo }),
        retry: 0,
        onSuccess: () => {
            toast.success("Assignee updated.");
            invalidateComplianceAssignmentQueries(queryClient, reviewId);
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Claims a compliance case for the signed-in admin. */
export function useAdminComplianceClaim(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-claim", userId],
        mutationFn: async (assignedReviewerName: string) => {
            const response = await postAdminComplianceClaim(userId);
            return { ...response, assignedReviewerName };
        },
        retry: 0,
        onSuccess: async (response) => {
            toast.success(response.message);
            await invalidateComplianceAssignmentQueries(queryClient, userId);

            const currentDetail = queryClient.getQueryData<AdminComplianceDetailRecord>([
                "admin-compliance-detail",
                userId,
            ]);
            const hasServerAssignee = Boolean(currentDetail?.assignedTo?.trim());

            if (!hasServerAssignee && response.assignedReviewerName.trim()) {
                patchComplianceDetailAssignee(queryClient, userId, response.assignedReviewerName.trim());
            }
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Releases a previously claimed compliance case. */
export function useAdminComplianceUnclaim(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-unclaim", userId],
        mutationFn: () => postAdminComplianceUnclaim(userId),
        retry: 0,
        onSuccess: async (response) => {
            toast.success(response.message);
            await invalidateComplianceAssignmentQueries(queryClient, userId);
            patchComplianceDetailAssignee(queryClient, userId, "");
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

export {
    useAdminComplianceReviewAccept,
    useAdminComplianceReviewReject,
} from "@/lib/compliance/hooks/use-admin-compliance-review";