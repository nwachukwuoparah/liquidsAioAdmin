"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceDetail, useAdminComplianceReviewReject } from "@/lib/admin/hooks/use-admin-compliance";
import { ApiError } from "@/lib/api/api-error";
import { COMPLIANCE_REJECTION_REASON_FIELD_KEY } from "@/lib/compliance/constants/admin-compliance-review.constant";
import {
    complianceRejectionReasonSchema,
    type ComplianceRejectionReasonFormValues,
} from "@/lib/compliance/schemas/compliance-rejection-reason.schema";
import { buildComplianceReviewRequestBody } from "@/lib/compliance/utilities/build-compliance-review-request-body";
import {
    resolveComplianceVerificationTypeFromAccountType,
    type ComplianceVerificationType,
} from "@/lib/compliance/constants/admin-compliance-review.constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const rejectReviewSchema = z.object({
    rejectionReason: complianceRejectionReasonSchema,
});

interface ComplianceRejectReviewModalProps {
    userId: string;
    accountType?: "Buyer" | "Seller";
    verificationType?: ComplianceVerificationType;
    verificationId?: string;
    targetLabel?: string;
}

/** Collects a rejection reason and rejects an entire compliance review or specific KYC/KYB set. */
export default function ComplianceRejectReviewModal({
    userId,
    accountType,
    verificationType: propVerificationType,
    verificationId: propVerificationId,
    targetLabel,
}: ComplianceRejectReviewModalProps) {
    const { closeModal, hideAllModals } = useModal();
    const detailQuery = useAdminComplianceDetail(userId);
    const rejectReview = useAdminComplianceReviewReject();
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

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<ComplianceRejectionReasonFormValues>({
        resolver: zodResolver(rejectReviewSchema),
        defaultValues: { rejectionReason: "" },
        mode: "onChange",
    });

    const onSubmit = handleSubmit(({ rejectionReason }) => {
        if (!verificationId) {
            return;
        }

        rejectReview.mutate(
            {
                userId,
                payload: buildComplianceReviewRequestBody(
                    verificationType,
                    verificationId,
                    "reject",
                    rejectionReason,
                ),
            },
            {
                onError: (error) => {
                    if (
                        error instanceof ApiError &&
                        error.fieldKey === COMPLIANCE_REJECTION_REASON_FIELD_KEY
                    ) {
                        setError("rejectionReason", { message: error.message });
                    }
                },
                onSuccess: () => {
                    if (typeof hideAllModals === "function") {
                        hideAllModals();
                    } else {
                        closeModal();
                    }
                },
            },
        );
    });

    return (
        <ComplianceReviewDialog
            title={`Reject ${label}?`}
            description={`Please add a reason for rejecting this user's ${label}.`}
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={rejectReview.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Reject"
                        tone="reject"
                        disabled={
                            !isValid ||
                            detailQuery.isLoading ||
                            !verificationId ||
                            rejectReview.isPending
                        }
                        onClick={onSubmit}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="reviewRejectionReason" className="text-sm font-medium text-[#0B0E05CC]">
                    Add a note/reason
                </label>
                <textarea
                    id="reviewRejectionReason"
                    rows={4}
                    placeholder={`help the user understand why this ${label} was rejected`}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-[#0B0E05] outline-none transition-colors placeholder:text-[#0B0E05A3] ${
                        errors.rejectionReason
                            ? "border-[#CC2929] focus:border-[#CC2929]"
                            : "border-[#0B0E0514] focus:border-[#518300]"
                    }`}
                    {...register("rejectionReason")}
                />
                {errors.rejectionReason ? (
                    <p className="text-sm text-[#CC2929]">{errors.rejectionReason.message}</p>
                ) : null}
            </div>
        </ComplianceReviewDialog>
    );
}
