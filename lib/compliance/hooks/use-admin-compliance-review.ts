"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    postAdminComplianceReviewAccept,
    postAdminComplianceReviewReject,
} from "@/lib/compliance/services/admin-compliance.service";
import type { ComplianceReviewMutationVariables } from "@/lib/compliance/types/admin-compliance-review.types";

function invalidateComplianceQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    userId: string,
) {
    void queryClient.invalidateQueries({ queryKey: ["admin-compliance-reviews"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-compliance-overview"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-compliance-detail", userId] });
}

/** Accepts a compliance document or full review. */
export function useAdminComplianceReviewAccept() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-review-accept"],
        mutationFn: (variables: ComplianceReviewMutationVariables) =>
            postAdminComplianceReviewAccept(variables),
        retry: 0,
        onSuccess: (response, variables) => {
            toast.success(response.message);
            invalidateComplianceQueries(queryClient, variables.userId);
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Rejects a compliance document or full review. */
export function useAdminComplianceReviewReject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-compliance-review-reject"],
        mutationFn: (variables: ComplianceReviewMutationVariables) =>
            postAdminComplianceReviewReject(variables),
        retry: 0,
        onSuccess: (response, variables) => {
            toast.success(response.message);
            invalidateComplianceQueries(queryClient, variables.userId);
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}
