"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceDetail, useAdminComplianceReviewAccept } from "@/lib/admin/hooks/use-admin-compliance";
import { buildComplianceReviewRequestBody } from "@/lib/compliance/utilities/build-compliance-review-request-body";
import { resolveComplianceVerificationTypeFromAccountType } from "@/lib/compliance/constants/admin-compliance-review.constant";

interface ComplianceApproveReviewModalProps {
    userId: string;
    accountType?: "Buyer" | "Seller";
}

/** Confirms approval for an entire compliance review from the row menu. */
export default function ComplianceApproveReviewModal({
    userId,
    accountType,
}: ComplianceApproveReviewModalProps) {
    const { closeModal } = useModal();
    const detailQuery = useAdminComplianceDetail(userId);
    const acceptReview = useAdminComplianceReviewAccept();
    const detail = detailQuery.data;
    const verificationType =
        detail?.verificationType ??
        resolveComplianceVerificationTypeFromAccountType(accountType);
    const verificationId = detail?.verificationId ?? "";

    const handleApprove = () => {
        if (!verificationId) {
            return;
        }

        acceptReview.mutate(
            {
                userId,
                payload: buildComplianceReviewRequestBody(verificationType, verificationId, "approve"),
            },
            { onSuccess: () => closeModal() },
        );
    };

    return (
        <ComplianceReviewDialog
            title="Approve review?"
            description="Do you wish to approve all documents for this compliance review?"
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={acceptReview.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Yes, Approve"
                        tone="approve"
                        disabled={
                            detailQuery.isLoading ||
                            !verificationId ||
                            acceptReview.isPending
                        }
                        onClick={handleApprove}
                    />
                </>
            }
        />
    );
}
