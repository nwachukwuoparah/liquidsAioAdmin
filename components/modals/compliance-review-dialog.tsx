"use client";

import Typography from "@/components/typography";
import { ModalCloseIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import type { ReactNode } from "react";

interface ComplianceReviewDialogProps {
    title: string;
    description: ReactNode;
    children?: ReactNode;
    actions: ReactNode;
    onClose?: () => void;
}

/** Shared confirmation content for compliance review dialogs. */
export function ComplianceReviewDialog({
    title,
    description,
    children,
    actions,
    onClose,
}: ComplianceReviewDialogProps) {
    const { closeModal } = useModal();

    const handleClose = () => {
        onClose?.();
        closeModal();
    };

    return (
        <div className="w-full p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
                <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                    {title}
                </Typography>
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close dialog"
                    className="text-[#0B0E05] transition-opacity hover:opacity-70"
                >
                    <ModalCloseIcon className="h-5 w-5" />
                </button>
            </div>

            <Typography type="text14" className="leading-relaxed text-[#0B0E05CC]">
                {description}
            </Typography>

            {children ? <div className="mt-4">{children}</div> : null}

            <div className="mt-6 flex items-center justify-end gap-3">{actions}</div>
        </div>
    );
}

export function ComplianceReviewCancelButton({
    onClick,
    disabled = false,
}: {
    onClick?: () => void;
    disabled?: boolean;
}) {
    const { closeModal } = useModal();

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => {
                onClick?.();
                closeModal();
            }}
            className="rounded-[13px] border border-[#0B0E0514] px-5 py-2.5 text-sm font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
        >
            Cancel
        </button>
    );
}

export function ComplianceReviewPrimaryButton({
    label,
    onClick,
    disabled = false,
    tone = "approve",
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    tone?: "approve" | "reject";
}) {
    const toneClasses =
        tone === "approve"
            ? "bg-[#B1EC52] text-[#0B0E05] hover:brightness-95"
            : "bg-[#CC2929] text-white hover:bg-[#B42318]";

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`rounded-[13px] px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses}`}
        >
            {label}
        </button>
    );
}
