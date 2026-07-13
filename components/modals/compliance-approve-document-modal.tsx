"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceReviewAccept } from "@/lib/admin/hooks/use-admin-compliance";
import { buildComplianceDocumentReviewRequestBody } from "@/lib/compliance/utilities/build-compliance-review-request-body";
import type { ComplianceDocumentRecord } from "@/lib/compliance/types/admin-compliance-detail.types";
import type { ComplianceVerificationType } from "@/lib/compliance/constants/admin-compliance-review.constant";

interface ComplianceApproveDocumentModalProps {
    userId: string;
    document: ComplianceDocumentRecord;
    verificationType: ComplianceVerificationType;
}

/** Confirms approval for a single compliance document. */
export default function ComplianceApproveDocumentModal({
    userId,
    document,
    verificationType,
}: ComplianceApproveDocumentModalProps) {
    const { closeModal } = useModal();
    const acceptReview = useAdminComplianceReviewAccept();

    const handleApprove = () => {
        acceptReview.mutate(
            {
                userId,
                payload: buildComplianceDocumentReviewRequestBody(
                    verificationType,
                    document.id,
                    "approve",
                ),
            },
            { onSuccess: () => closeModal() },
        );
    };

    return (
        <ComplianceReviewDialog
            title="Approve document?"
            description={
                <>
                    Do you wish to approve this user&apos;s{" "}
                    <span className="font-semibold text-[#0B0E05]">&quot;{document.title}&quot;</span>{" "}
                    document?
                </>
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={acceptReview.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Yes, Approve"
                        tone="approve"
                        disabled={acceptReview.isPending}
                        onClick={handleApprove}
                    />
                </>
            }
        />
    );
}
