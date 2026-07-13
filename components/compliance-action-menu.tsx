"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import ComplianceApproveReviewModal from "@/components/modals/compliance-approve-review-modal";
import ComplianceDetailsModal from "@/components/modals/compliance-details-modal";
import ComplianceRejectReviewModal from "@/components/modals/compliance-reject-review-modal";
import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    DotsThreeIcon,
    EyeIcon,
    RejectXIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";

interface ComplianceActionMenuProps {
    userId: string;
    accountType: "Buyer" | "Seller";
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    triggerClassName?: string;
}

export default function ComplianceActionMenu({
    userId,
    accountType,
    isOpen,
    onToggle,
    onClose,
    placement = "top",
    triggerClassName = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-slate-50",
}: ComplianceActionMenuProps) {
    const { showModal } = useModal();
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose,
        placement,
        align: "right",
    });

    const openDetailsModal = () => {
        onClose();
        showModal({
            content: <ComplianceDetailsModal userId={userId} />,
            panelClassName: "lg:max-w-[70%]",
        });
    };

    const openApproveReviewModal = () => {
        onClose();
        showModal({
            content: <ComplianceApproveReviewModal userId={userId} accountType={accountType} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    const openRejectReviewModal = () => {
        onClose();
        showModal({
            content: <ComplianceRejectReviewModal userId={userId} accountType={accountType} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={onToggle}
                data-testid="compliance-action-trigger"
                aria-label="Open row actions"
                aria-expanded={isOpen}
                className={triggerClassName}
            >
                <DotsThreeIcon className="h-1 w-5 text-[#0B0E05]" />
            </button>

            <FloatingMenuPortal
                isOpen={isOpen}
                isMounted={isMounted}
                menuRef={menuRef}
                menuStyle={menuStyle}
                data-testid="compliance-action-menu"
                className="w-52 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] py-1.5 text-left shadow-card ring-1 ring-black/5"
            >
                <button
                    type="button"
                    onClick={openDetailsModal}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-slate-50"
                >
                    <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                        View detail
                    </Typography>
                </button>

                <hr className="my-1 border-[#0B0E0514]" />

                <button
                    type="button"
                    onClick={openApproveReviewModal}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-green-50/50"
                >
                    <ApproveCheckIcon className="h-3 w-4 text-[#00A341]" />
                    <Typography type="text14" fontWeight={600} className="text-[#00A341]">
                        Approve
                    </Typography>
                </button>

                <button
                    type="button"
                    onClick={openRejectReviewModal}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-red-50/50"
                >
                    <RejectXIcon className="h-5 w-5 text-[#CC2929]" />
                    <Typography type="text14" fontWeight={600} className="text-[#CC2929]">
                        Reject
                    </Typography>
                </button>
            </FloatingMenuPortal>
        </div>
    );
}
