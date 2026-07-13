"use client";

import InventoryApproveListingModal from "@/components/modals/inventory-approve-listing-modal";
import InventoryDeclineListingModal from "@/components/modals/inventory-decline-listing-modal";
import InventorySuspendListingModal from "@/components/modals/inventory-suspend-listing-modal";
import LotDetailsModal from "@/components/modals/lot-details-modal";
import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    DotsThreeIcon,
    EyeIcon,
    ProhibitIcon,
    RejectXIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";

interface InventoryActionMenuProps {
    lotId: string;
    lotSlug?: string;
    lotTitle?: string;
    lotStatus?: string;
    lotReported?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    triggerClassName?: string;
}

export default function InventoryActionMenu({
    lotId,
    lotSlug,
    lotTitle,
    lotStatus,
    lotReported = false,
    isOpen,
    onToggle,
    onClose,
    placement = "bottom",
    triggerClassName = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A]",
}: InventoryActionMenuProps) {
    const { showModal } = useModal();
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose,
        placement,
        align: "right",
    });

    const normalizedStatus = lotStatus?.toLowerCase() ?? "";
    const canApproveOrDecline = normalizedStatus === "pending";
    const canSuspend = normalizedStatus === "active" || lotReported;

    const openDetailsModal = () => {
        onClose();
        showModal({
            content: <LotDetailsModal lotId={lotSlug ?? lotId} />,
            panelClassName: "lg:max-w-[720px]",
            dismissOnOverlayClick: true,
        });
    };

    const openApproveModal = () => {
        onClose();
        showModal({
            content: <InventoryApproveListingModal lotId={lotId} lotTitle={lotTitle} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    const openDeclineModal = () => {
        onClose();
        showModal({
            content: <InventoryDeclineListingModal lotId={lotId} lotTitle={lotTitle} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    const openSuspendModal = () => {
        onClose();
        showModal({
            content: <InventorySuspendListingModal lotId={lotId} lotTitle={lotTitle} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
        });
    };

    return (
        <div className="relative ml-auto">
            <button
                ref={triggerRef}
                type="button"
                onClick={onToggle}
                data-testid="inventory-action-trigger"
                aria-label="Open lot actions"
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
                data-testid="inventory-action-menu"
                className="w-52 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] py-1.5 text-left shadow-card ring-1 ring-black/5"
            >
                <button
                    type="button"
                    onClick={openDetailsModal}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                >
                    <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                        View lot details
                    </Typography>
                </button>

                {canApproveOrDecline ? (
                    <>
                        <button
                            type="button"
                            onClick={openApproveModal}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                        >
                            <ApproveCheckIcon className="h-3 w-4 text-[#0B0E05]" />
                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                                Approve listing
                            </Typography>
                        </button>

                        <button
                            type="button"
                            onClick={openDeclineModal}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                        >
                            <RejectXIcon className="h-5 w-5 text-[#0B0E05]" />
                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                                Decline listing
                            </Typography>
                        </button>
                    </>
                ) : null}

                {canSuspend ? (
                    <>
                        {canApproveOrDecline ? <hr className="my-1 border-[#0B0E0514]" /> : null}
                        <button
                            type="button"
                            onClick={openSuspendModal}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                        >
                            <ProhibitIcon className="h-5 w-5 text-[#CC2929]" />
                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                                Suspend
                            </Typography>
                        </button>
                    </>
                ) : null}
            </FloatingMenuPortal>
        </div>
    );
}
