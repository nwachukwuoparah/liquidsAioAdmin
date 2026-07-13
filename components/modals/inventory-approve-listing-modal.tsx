"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminInventoryLotApprove } from "@/lib/inventory/hooks/use-admin-inventory-review";

interface InventoryApproveListingModalProps {
    lotId: string;
    lotTitle?: string;
}

/** Confirms approval for a pending lot listing. */
export default function InventoryApproveListingModal({
    lotId,
    lotTitle,
}: InventoryApproveListingModalProps) {
    const { closeModal } = useModal();
    const approveListing = useAdminInventoryLotApprove();

    const handleApprove = () => {
        approveListing.mutate(
            { lotId, action: "approve" },
            { onSuccess: () => closeModal() },
        );
    };

    return (
        <ComplianceReviewDialog
            title="Approve listing?"
            description={
                lotTitle
                    ? `Do you wish to approve "${lotTitle}" and make it live on the marketplace?`
                    : "Do you wish to approve this listing and make it live on the marketplace?"
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={approveListing.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Yes, Approve"
                        tone="approve"
                        disabled={approveListing.isPending}
                        onClick={handleApprove}
                    />
                </>
            }
        />
    );
}
