"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import RfqResolveModal from "@/components/modals/rfq-resolve-modal";
import RfqsDetailsModal from "@/components/modals/rfqs-details-modal";
import Typography from "@/components/typography";
import { ApproveCheckIcon, DotsThreeIcon, EyeIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import type { AdminRfqApiRecord } from "@/lib/rfq/types/admin-rfqs-api.types";

interface RfqActionMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    details: AdminRfqApiRecord;
}

export default function RfqActionMenu({
    isOpen,
    onToggle,
    onClose,
    placement = "top",
    details,
}: RfqActionMenuProps) {
    const { showModal } = useModal();
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose,
        placement,
        align: "right",
    });
    const isResolved = details.status === "resolved";
    const buyerName = [details.user?.firstName, details.user?.lastName].filter(Boolean).join(" ");

    const openDetailsModal = () => {
        onClose();
        showModal({
            content: () => <RfqsDetailsModal details={details} />,
            panelClassName: "w-full md:max-w-lg !rounded-2xl overflow-hidden shadow-xl",
            dismissOnOverlayClick: false,
        });
    };

    const openResolveModal = () => {
        onClose();
        showModal({
            content: <RfqResolveModal rfqId={details.id} buyerName={buyerName || undefined} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={onToggle}
                data-testid="rfq-action-trigger"
                aria-label="Open row actions"
                aria-expanded={isOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-slate-50"
            >
                <DotsThreeIcon className="h-1 w-5 text-[#0B0E05]" />
            </button>

            <FloatingMenuPortal
                isOpen={isOpen}
                isMounted={isMounted}
                menuRef={menuRef}
                menuStyle={menuStyle}
                data-testid="rfq-action-menu"
                className="w-48 rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] py-1 text-left"
            >
                <button
                    type="button"
                    onClick={openDetailsModal}
                    className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                    <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                        View detail
                    </Typography>
                </button>

                {!isResolved ? (
                    <button
                        type="button"
                        onClick={openResolveModal}
                        data-testid="rfq-mark-resolved"
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                        <ApproveCheckIcon className="h-3 w-4 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Mark as resolved
                        </Typography>
                    </button>
                ) : null}
            </FloatingMenuPortal>
        </div>
    );
}
