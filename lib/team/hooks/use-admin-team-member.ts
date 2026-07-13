"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    adminInviteTeamMember,
    adminResendInvite,
    adminRestoreInvite,
    adminRevokeInvite,
    adminTeamPermissions,
    adminTeamRoles,
    type AdminInviteApiResponse,
} from "@/lib/team/services/admin-invite.service";
import {
    toAdminInviteTeamMemberRequestBody,
    type AdminInviteTeamMemberFormValues,
} from "@/lib/team/schemas/admin-invite.schema";

interface UseAdminInviteTeamMemberOptions {
    /** Called after a successful invite before the modal closes. */
    onSuccess?: (response: AdminInviteApiResponse) => void;
}

/** TanStack Query mutation hook for inviting an admin team member. */
export function useAdminInviteTeamMember(options: UseAdminInviteTeamMemberOptions = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-invite-team-member"],
        mutationFn: async (formValues: AdminInviteTeamMemberFormValues) => {
            const inviteResult = await adminInviteTeamMember(
                toAdminInviteTeamMemberRequestBody(formValues),
            );
            return inviteResult.body;
        },
        retry: 0,
        onSuccess: (responseBody) => {
            toast.success(responseBody.message ?? "Invitation sent successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-teams-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] });
            options.onSuccess?.(responseBody);
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error(error.message || "Unable to send invitation. Please try again.");
        },
    });
}


/** TanStack Query mutation hook for resending a pending admin invitation. */
export function useAdminResendInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-resend-invite"],
        mutationFn: async (adminId: string) => {
            const resendResult = await adminResendInvite(adminId);
            return resendResult.body;
        },
        retry: 0,
        onSuccess: (responseBody) => {
            toast.success(responseBody.message ?? "Invitation resent successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-teams-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error(error.message || "Unable to resend invitation. Please try again.");
        },
    });
}

export interface AdminRevokeInviteInput {
    adminId: string;
    /** Toast fallback when the API response has no message. */
    successMessage?: string;
}

/** TanStack Query mutation hook for revoking an admin invitation / access. */
export function useAdminRevokeInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-revoke-invite"],
        mutationFn: async ({ adminId }: AdminRevokeInviteInput) => {
            const revokeResult = await adminRevokeInvite(adminId);
            return revokeResult.body;
        },
        retry: 0,
        onSuccess: (responseBody, variables) => {
            toast.success(
                responseBody.message ??
                    variables.successMessage ??
                    "Access revoked successfully.",
            );
            void queryClient.invalidateQueries({ queryKey: ["admin-teams-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error(error.message || "Unable to revoke access. Please try again.");
        },
    });
}

/** TanStack Query mutation hook for restoring a revoked admin. */
export function useAdminRestoreInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-restore-invite"],
        mutationFn: async (adminId: string) => {
            const restoreResult = await adminRestoreInvite(adminId);
            return restoreResult.body;
        },
        retry: 0,
        onSuccess: (responseBody) => {
            toast.success(responseBody.message ?? "Access restored successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admin-teams-overview"] });
            void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error(error.message || "Unable to restore access. Please try again.");
        },
    });
}

export function useAdminTeamRoles() {
    const { data, isLoading } = useQuery({
        queryKey: ["admin-roles"],
        queryFn: async () => {
            const response = await adminTeamRoles();
            return response.body as any;
        },
    });
    return {
        data: data?.data as any,
        isLoading: isLoading || !data,
    }
}

export function useAdminTeamPermissions() {
    const { data, isLoading } = useQuery({
        queryKey: ["admin-team-permissions"],
        queryFn: async () => {
            const response = await adminTeamPermissions();
            return response.body as any;
        },
    });
    return {
        data: data?.data as any,
        isLoading: isLoading || !data,
    }
}