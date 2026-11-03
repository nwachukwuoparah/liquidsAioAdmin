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
    fetchAdminComplianceAuditLogsPage,
    fetchAdminComplianceDetail,
    fetchAdminComplianceDocumentViewingLink,
    type FetchAdminComplianceViewingLinkParams,
    postAdminComplianceActionRequest,
    postAdminComplianceAssignee,
    postAdminComplianceClaim,
    postAdminComplianceUnclaim,
} from "@/lib/compliance/services/admin-compliance.service";
import type { AdminComplianceApiCursor } from "@/lib/compliance/types/admin-compliance-api.types";
import type { AdminComplianceDetailData } from "@/lib/compliance/types/admin-compliance-detail.types";
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
    assignedAdminName: string,
) {
    queryClient.setQueryData<any>(
        ["admin-compliance-detail", userId],
        (currentDetail: any) => {
            if (!currentDetail) {
                return currentDetail;
            }

            const updated: any = {
                ...currentDetail,
                assignedTo: assignedAdminName,
            };

            if (currentDetail.complianceData) {
                if (!assignedAdminName) {
                    updated.complianceData = {
                        ...currentDetail.complianceData,
                        complianceReviewAssignment: null,
                    };
                } else {
                    updated.complianceData = {
                        ...currentDetail.complianceData,
                        complianceReviewAssignment: {
                            id:
                                currentDetail.complianceData.complianceReviewAssignment?.id ?? "",
                            userId,
                            assignedAdminId:
                                currentDetail.complianceData.complianceReviewAssignment?.assignedAdminId ?? "",
                            status: "claimed",
                            createdAt:
                                currentDetail.complianceData.complianceReviewAssignment?.createdAt ??
                                new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            assignedAdmin: {
                                id:
                                    currentDetail.complianceData.complianceReviewAssignment?.assignedAdmin?.id ??
                                    "",
                                firstName: assignedAdminName,
                                lastName: "",
                                email: "",
                            },
                        },
                    };
                }
            }

            return updated;
        },
    );
}

/** Loads cursor-paginated compliance review queue rows. */
export function useAdminComplianceReviews(
    filterParams: Record<string, string> = {},
    enabled = true,
) {
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
        enabled,
    });
}

/** Loads cursor-paginated compliance audit trail rows. */
export function useAdminComplianceAuditLogs(
    filterParams: Record<string, string> = {},
    enabled = true,
) {
    return useInfiniteQuery({
        queryKey: ["admin-compliance-audit-logs", filterParams],
        queryFn: ({ pageParam }) =>
            fetchAdminComplianceAuditLogsPage({
                ...filterParams,
                ...(pageParam as AdminComplianceApiCursor),
            }),
        initialPageParam: {} as AdminComplianceApiCursor,
        getNextPageParam: (lastPage) =>
            lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
        ...QueryConfig.DEFAULT,
        enabled,
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

            const currentDetail = queryClient.getQueryData<AdminComplianceDetailData>([
                "admin-compliance-detail",
                userId,
            ]);
            const hasServerAssignee = Boolean(
                currentDetail?.complianceData?.complianceReviewAssignment?.status === "claimed",
            );

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

/** Loads a secure signed viewing link for a compliance document. */
export function useAdminComplianceDocumentViewingLink(
    params?: FetchAdminComplianceViewingLinkParams | null,
    enabled = true,
) {
    return useQuery({
        queryKey: ["admin-compliance-document-viewing-link", params?.file_id, params?.format, params?.type],
        queryFn: () => {
            if (!params?.file_id || !params?.type) {
                throw new Error("Document file ID and type are required.");
            }
            return fetchAdminComplianceDocumentViewingLink(params);
        },
        enabled: Boolean(params?.file_id && params?.type) && enabled,
        staleTime: 1000 * 90, // 90 seconds (signed URL expires in 2m)
        refetchOnWindowFocus: false,
    });
}

export {
    useAdminComplianceReviewAccept,
    useAdminComplianceReviewReject,
} from "@/lib/compliance/hooks/use-admin-compliance-review";