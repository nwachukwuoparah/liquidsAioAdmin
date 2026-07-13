"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminInventoryLotDecline } from "@/lib/inventory/hooks/use-admin-inventory-review";
import { ApiError } from "@/lib/api/api-error";
import { INVENTORY_DECLINE_REASON_FIELD_KEY } from "@/lib/inventory/constants/admin-inventory-review.constant";
import {
    inventoryDeclineReasonFormSchema,
    type InventoryDeclineReasonFormValues,
} from "@/lib/inventory/schemas/inventory-decline-reason.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface InventoryDeclineListingModalProps {
    lotId: string;
    lotTitle?: string;
}

/** Collects a decline reason and rejects a pending lot listing. */
export default function InventoryDeclineListingModal({
    lotId,
    lotTitle,
}: InventoryDeclineListingModalProps) {
    const { closeModal } = useModal();
    const declineListing = useAdminInventoryLotDecline();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<InventoryDeclineReasonFormValues>({
        resolver: zodResolver(inventoryDeclineReasonFormSchema),
        defaultValues: { rejectionReason: "" },
        mode: "onChange",
    });

    const onSubmit = handleSubmit(({ rejectionReason }) => {
        declineListing.mutate(
            { lotId, action: "reject", rejectionReason },
            {
                onError: (error) => {
                    if (
                        error instanceof ApiError &&
                        error.fieldKey === INVENTORY_DECLINE_REASON_FIELD_KEY
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
            title="Decline this listing?"
            description={
                <>
                    Are you sure you want to decline the listing
                    {lotTitle ? ` - "${lotTitle}"` : ""}? The seller will be notified and asked to
                    review or update their submission before resubmitting.
                </>
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={declineListing.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Yes, Decline listing"
                        tone="reject"
                        disabled={!isValid || declineListing.isPending}
                        onClick={onSubmit}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="lotDeclineReason" className="text-sm font-medium text-[#0B0E05CC]">
                    Add a note/reason
                </label>
                <textarea
                    id="lotDeclineReason"
                    rows={4}
                    placeholder="help the seller understand why their listing request was declined & what they can do"
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
