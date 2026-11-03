"use client";

import React, { useState } from "react";
import Typography from "@/components/typography";
import { ModalCloseIcon } from "@/components/vector";
import { useAdminOrderRefund } from "@/lib/admin/hooks/use-admin-orders";

export interface RefundBuyerModalProps {
    orderId: string;
    amount?: string;
    buyerName?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RefundBuyerModal({
    orderId,
    amount = "$9,000",
    buyerName = "John Peters",
    onClose,
    onSuccess,
}: RefundBuyerModalProps) {
    const [reason, setReason] = useState("");
    const refundMutation = useAdminOrderRefund();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim() || refundMutation.isPending) return;

        refundMutation.mutate(
            { orderId, reason: reason.trim() },
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
                    Refund buyer?
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
                Are you sure you want to refund{" "}
                <strong className="font-bold text-[#0B0E05]">{amount}</strong> to{" "}
                <strong className="font-bold text-[#0B0E05]">{buyerName}</strong>? This action cannot be undone.
            </Typography>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="refund-reason" className="block text-xs font-bold text-[#0B0E05] mb-2">
                        Enter reason for refund
                    </label>
                    <textarea
                        id="refund-reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Write a reason here..."
                        className="w-full rounded-xl border border-[#0B0E0514] p-3 text-sm text-[#0B0E05] placeholder-[#0B0E0566] focus:border-[#518300] focus:outline-none resize-none transition-colors"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={refundMutation.isPending}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-[#0B0E0514] bg-white text-sm font-semibold text-[#0B0E05] hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!reason.trim() || refundMutation.isPending}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-colors bg-[#CC2929] hover:bg-[#B52424] disabled:bg-[#F09999] disabled:cursor-not-allowed"
                    >
                        {refundMutation.isPending ? "Refunding..." : "Issue refund"}
                    </button>
                </div>
            </form>
        </div>
    );
}
