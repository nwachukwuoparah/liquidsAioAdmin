"use client";

import {
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminRevokeInvite } from "@/lib/team/hooks/use-admin-team-member";

interface CancelInvitationModalProps {
    adminId: string;
}

/** Confirms cancelling a pending admin invitation via POST .../revoke. */
export function CancelInvitationModal({ adminId }: CancelInvitationModalProps) {
    const { closeModal } = useModal();
    const revokeInviteMutation = useAdminRevokeInvite();

    const handleConfirm = () => {
        revokeInviteMutation.mutate(
            {
                adminId,
                successMessage: "Invitation cancelled successfully.",
            },
            {
                onSuccess: () => closeModal(),
            },
        );
    };

    return (
        <ComplianceReviewDialog
            title="Cancel Invitation"
            description="Are you sure you want to cancel this invitation? The invited user will no longer be able to join the LiquidsAIO admin dashboard with this link."
            actions={
                <>
                    <button
                        type="button"
                        disabled={revokeInviteMutation.isPending}
                        onClick={closeModal}
                        className="rounded-[13px] border border-[#0B0E0514] px-5 py-2.5 text-sm font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
                    >
                        Keep it
                    </button>
                    <ComplianceReviewPrimaryButton
                        label={
                            revokeInviteMutation.isPending
                                ? "Cancelling..."
                                : "Cancel invitation"
                        }
                        tone="reject"
                        disabled={revokeInviteMutation.isPending}
                        onClick={handleConfirm}
                    />
                </>
            }
        />
    );
}
