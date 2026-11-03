"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceDetail, useAdminComplianceReviewAccept } from "@/lib/admin/hooks/use-admin-compliance";
import { buildComplianceReviewRequestBody } from "@/lib/compliance/utilities/build-compliance-review-request-body";
import {
    resolveComplianceVerificationTypeFromAccountType,
    type ComplianceVerificationType,
} from "@/lib/compliance/constants/admin-compliance-review.constant";

interface ComplianceApproveReviewModalProps {
    userId: string;
    accountType?: "Buyer" | "Seller";
    verificationType?: ComplianceVerificationType;
    verificationId?: string;
    targetLabel?: string;
}

/** Confirms approval for an entire compliance review or specific KYC/KYB set. */
export default function ComplianceApproveReviewModal({
    userId,
    accountType,
    verificationType: propVerificationType,
    verificationId: propVerificationId,
    targetLabel,
}: ComplianceApproveReviewModalProps) {
    const { closeModal, hideAllModals } = useModal();
    const detailQuery = useAdminComplianceDetail(userId);
    const acceptReview = useAdminComplianceReviewAccept();
    const detail = detailQuery.data;

    const isSeller = (accountType ?? detail?.complianceData?.accountType)?.toLowerCase() === "seller";

    const verificationType: ComplianceVerificationType =
        propVerificationType ??
        (isSeller
            ? (detail?.kyb?.id ? "kyb" : detail?.kyc?.id ? "kyc" : "kyb")
            : "kyc");

    const kybId =
        detail?.kyb?.id ??
        (detail as any)?.kybId ??
        (detail?.complianceData as any)?.kybId ??
        (detail?.kyb?.kybDocuments?.[0] as any)?.kybId ??
        "";
    const kycId =
        detail?.kyc?.id ??
        (detail as any)?.kycId ??
        (detail?.complianceData as any)?.kycId ??
        (detail?.kyc?.kycDocuments?.[0] as any)?.kycId ??
        "";

    const verificationId =
        propVerificationId ??
        (verificationType === "kyb" ? kybId : kycId);

    const label =
        targetLabel ??
        (verificationType === "kyb"
            ? "KYB submission"
            : verificationType === "kyc"
              ? "KYC submission"
              : "compliance review");

    const handleApprove = () => {
        if (!verificationId) {
            return;
        }

        acceptReview.mutate(
            {
                userId,
                payload: buildComplianceReviewRequestBody(verificationType, verificationId, "approve"),
            },
            {
                onSuccess: () => {
                    if (typeof hideAllModals === "function") {
                        hideAllModals();
                    } else {
                        closeModal();
                    }
                },
            },
        );
    };

    return (
        <ComplianceReviewDialog
            title={`Approve ${label}?`}
            description={`Do you wish to approve all documents and information for this ${label}?`}
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
