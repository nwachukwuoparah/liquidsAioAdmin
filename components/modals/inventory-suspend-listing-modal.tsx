"use client";

import { CustomDropdown } from "@/components/custom-dropdown";
import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { ApiError } from "@/lib/api/api-error";
import {
    INVENTORY_SUSPEND_REASON_FIELD_KEY,
    INVENTORY_SUSPEND_REASON_OPTIONS,
    INVENTORY_SUSPEND_REASON_OTHER,
} from "@/lib/inventory/constants/admin-inventory-review.constant";
import { useAdminInventoryLotSuspend } from "@/lib/inventory/hooks/use-admin-inventory-review";
import {
    inventorySuspendReasonFormSchema,
    type InventorySuspendReasonFormValues,
} from "@/lib/inventory/schemas/inventory-suspend-reason.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface InventorySuspendListingModalProps {
    lotId: string;
    lotTitle?: string;
}

const REASON_SELECT_OPTIONS = [
    { value: "", label: "select an option" },
    ...INVENTORY_SUSPEND_REASON_OPTIONS,
];

/** Collects a reason (with optional note) and suspends an active or reported lot listing. */
export default function InventorySuspendListingModal({
    lotId,
    lotTitle,
}: InventorySuspendListingModalProps) {
    const { closeModal } = useModal();
    const suspendListing = useAdminInventoryLotSuspend();

    const {
        control,
        register,
        watch,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<InventorySuspendReasonFormValues>({
        resolver: zodResolver(inventorySuspendReasonFormSchema),
        defaultValues: { reason: "", note: "" },
        mode: "onChange",
    });

    const selectedReason = watch("reason");
    const isOtherReason = selectedReason === INVENTORY_SUSPEND_REASON_OTHER;

    const onSubmit = handleSubmit(({ reason, note }) => {
        const trimmedNote = note?.trim() ?? "";

        suspendListing.mutate(
            {
                lotId,
                action: "suspend",
                suspensionReason: reason,
                note: trimmedNote || undefined,
            },
            {
                onError: (error) => {
                    if (
                        error instanceof ApiError &&
                        error.fieldKey === INVENTORY_SUSPEND_REASON_FIELD_KEY
                    ) {
                        setError("reason", { message: error.message });
                    }
                },
                onSuccess: () => closeModal(),
            },
        );
    });

    return (
        <ComplianceReviewDialog
            title="Suspend this listing?"
            description={
                <>
                    Are you sure you want to suspend the listing
                    {lotTitle ? ` - "${lotTitle}"` : ""}? It will be hidden from buyers and removed
                    from search results until further review. The seller will be notified about the
                    suspension and its reason.
                </>
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={suspendListing.isPending} />
                    <ComplianceReviewPrimaryButton
                        label="Suspend listing"
                        tone="reject"
                        disabled={!isValid || suspendListing.isPending}
                        onClick={onSubmit}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="lotSuspendReason" className="text-sm font-medium text-[#0B0E05CC]">
                        Select reason
                    </label>
                    <Controller
                        control={control}
                        name="reason"
                        render={({ field }) => (
                            <CustomDropdown
                                id="lotSuspendReason"
                                variant="form-field"
                                value={field.value}
                                options={REASON_SELECT_OPTIONS}
                                onChange={field.onChange}
                                hasError={Boolean(errors.reason)}
                                ariaLabel="Select reason"
                                testId="lot-suspend-reason-trigger"
                                menuTestId="lot-suspend-reason-menu"
                                optionTestIdPrefix="lot-suspend-reason"
                            />
                        )}
                    />
                    {errors.reason ? (
                        <p className="text-sm text-[#CC2929]">{errors.reason.message}</p>
                    ) : null}
                </div>

                {isOtherReason ? (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="lotSuspendNote" className="text-sm font-medium text-[#0B0E05CC]">
                            Add a note/reason
                        </label>
                        <textarea
                            id="lotSuspendNote"
                            rows={3}
                            placeholder="Describe the reason for suspending this listing"
                            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-[#0B0E05] outline-none transition-colors placeholder:text-[#0B0E05A3] ${
                                errors.note
                                    ? "border-[#CC2929] focus:border-[#CC2929]"
                                    : "border-[#0B0E0514] focus:border-[#518300]"
                            }`}
                            {...register("note")}
                        />
                        {errors.note ? (
                            <p className="text-sm text-[#CC2929]">{errors.note.message}</p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </ComplianceReviewDialog>
    );
}
