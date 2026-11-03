"use client";

import React from "react";
import Typography from "@/components/typography";
import { ModalCloseIcon } from "@/components/vector";
import { useAdminOrderPaymentRelease } from "@/lib/admin/hooks/use-admin-orders";

export interface ReleasePaymentModalProps {
    orderId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ReleasePaymentModal({
    orderId,
    onClose,
    onSuccess,
}: ReleasePaymentModalProps) {
    const releasePaymentMutation = useAdminOrderPaymentRelease();

    const handleConfirm = () => {
        if (releasePaymentMutation.isPending) return;

        releasePaymentMutation.mutate(
            { orderId, reason: "Admin released payment hold" },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                },
            },
        );
    };

    return (
        <div className="flex w-full flex-col bg-white rounded-2xl overflow-hidden p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
                <Typography type="text18" fontWeight={700} className="text-[#0B0E05]">
                    Release payment?
                </Typography>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="p-1 rounded-lg text-[#0B0E05A3] hover:bg-[#0B0E050A] transition-colors"
                >
                    <ModalCloseIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Description */}
            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] leading-relaxed">
                You are about to release this payment to the seller. The buyer and seller will be notified. This action cannot be undone.
            </Typography>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-6">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={releasePaymentMutation.isPending}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[#0B0E0514] bg-white text-sm font-semibold text-[#0B0E05] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={releasePaymentMutation.isPending}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#B1EC52] hover:bg-[#A2DD43] text-sm font-bold text-[#0B0E05] transition-colors disabled:opacity-50"
                >
                    {releasePaymentMutation.isPending ? "Releasing..." : "Yes, Release payment"}
                </button>
            </div>
        </div>
    );
}
