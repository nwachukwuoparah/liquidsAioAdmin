"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import ComplianceDetailsModal from "@/components/modals/compliance-details-modal";
import Typography from "@/components/typography";
import { DotsThreeIcon, EyeIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";

interface ComplianceActionMenuProps {
    userId: string;
    accountType?: "Buyer" | "Seller";
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    triggerClassName?: string;
}

export default function ComplianceActionMenu({
    userId,
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
                className="w-44 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] py-1 text-left shadow-card ring-1 ring-black/5"
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
            </FloatingMenuPortal>
        </div>
    );
}
