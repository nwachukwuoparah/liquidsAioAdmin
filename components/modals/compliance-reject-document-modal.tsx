"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceReviewReject } from "@/lib/admin/hooks/use-admin-compliance";
import { ApiError } from "@/lib/api/api-error";
import { COMPLIANCE_REJECTION_REASON_FIELD_KEY } from "@/lib/compliance/constants/admin-compliance-review.constant";
import {
    complianceRejectionReasonSchema,
    type ComplianceRejectionReasonFormValues,
} from "@/lib/compliance/schemas/compliance-rejection-reason.schema";
import type { ComplianceDocumentRecord } from "@/lib/compliance/types/admin-compliance-detail.types";
import type { ComplianceVerificationType } from "@/lib/compliance/constants/admin-compliance-review.constant";
import { buildComplianceDocumentReviewRequestBody } from "@/lib/compliance/utilities/build-compliance-review-request-body";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const rejectDocumentSchema = z.object({
    rejectionReason: complianceRejectionReasonSchema,
});

interface ComplianceRejectDocumentModalProps {
    userId: string;
    document: ComplianceDocumentRecord;
    verificationType: ComplianceVerificationType;
}

/** Collects a rejection reason and rejects a single compliance document. */
export default function ComplianceRejectDocumentModal({
    userId,
    document,
    verificationType,
}: ComplianceRejectDocumentModalProps) {
    const { closeModal } = useModal();
    const rejectReview = useAdminComplianceReviewReject();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<ComplianceRejectionReasonFormValues>({
        resolver: zodResolver(rejectDocumentSchema),
        defaultValues: { rejectionReason: "" },
        mode: "onChange",
    });

    const onSubmit = handleSubmit(({ rejectionReason }) => {
        rejectReview.mutate(
            {
                userId,
                payload: buildComplianceDocumentReviewRequestBody(
                    verificationType,
                    document.id,
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
                onSuccess: () => closeModal(),
            },
        );
    });

    return (
        <ComplianceReviewDialog
            title="Reject document?"
            description={
                <>
                    Please add a reason for rejecting this user&apos;s{" "}
                    <span className="font-semibold text-[#0B0E05]">&quot;{document.title}&quot;</span>{" "}
                    document.
                </>
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={rejectReview.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Reject"
                        tone="reject"
                        disabled={!isValid || rejectReview.isPending}
                        onClick={onSubmit}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="rejectionReason" className="text-sm font-medium text-[#0B0E05CC]">
                    Add a note/reason
                </label>
                <textarea
                    id="rejectionReason"
                    rows={4}
                    placeholder="help the user understand why this document was rejected"
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
