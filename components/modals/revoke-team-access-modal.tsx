"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminRevokeInvite } from "@/lib/team/hooks/use-admin-team-member";
import { useState } from "react";

interface RevokeTeamAccessModalProps {
    adminId: string;
    memberName: string;
}

/** Confirms revoking an active admin's access via POST .../revoke. */
export function RevokeTeamAccessModal({ adminId, memberName }: RevokeTeamAccessModalProps) {
    const { closeModal } = useModal();
    const revokeInviteMutation = useAdminRevokeInvite();
    const [note, setNote] = useState("");

    const handleConfirm = () => {
        revokeInviteMutation.mutate(
            {
                adminId,
                successMessage: "Access revoked successfully.",
            },
            {
                onSuccess: () => closeModal(),
            },
        );
    };

    return (
        <ComplianceReviewDialog
            title="Revoke access"
            description={
                <>
                    Are you sure you want to revoke <span className="font-semibold">{memberName}</span>
                    &apos;s access? They&apos;ll no longer be able to log in or view the admin
                    dashboard.
                </>
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={revokeInviteMutation.isPending} />
                    <ComplianceReviewPrimaryButton
                        label={
                            revokeInviteMutation.isPending ? "Revoking..." : "Revoke access"
                        }
                        tone="reject"
                        disabled={revokeInviteMutation.isPending}
                        onClick={handleConfirm}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="revokeAccessNote" className="text-sm font-medium text-[#0B0E05CC]">
                    Add a note/reason{" "}
                    <span className="font-normal text-[#0B0E05A3]">(optional)</span>
                </label>
                <textarea
                    id="revokeAccessNote"
                    rows={4}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={revokeInviteMutation.isPending}
                    placeholder="e.g. No longer part of the operations team."
                    className="w-full resize-none rounded-xl border border-[#0B0E0514] px-4 py-3 text-sm text-[#0B0E05] outline-none transition-colors placeholder:text-[#0B0E05A3] focus:border-[#518300] disabled:opacity-60"
                />
            </div>
        </ComplianceReviewDialog>
    );
}
