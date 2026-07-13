"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import Typography from "@/components/typography";
import { DotsThreeIcon, EyeIcon, ProhibitIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import UserDetailsModal from "./modals/user-details-modal";
import { AdminUserRecord } from "@/lib/admin/types/admin-api.types";
import SuspendAccountModal from "./modals/suspend-account-modal";

interface UserActionMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    userDetails: any
}

export default function UserActionMenu({
    isOpen,
    onToggle,
    onClose,
    placement = "top",
    userDetails,
}: UserActionMenuProps) {
    const { showModal, closeModal } = useModal();
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose,
        placement,
        align: "right",
    });

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={onToggle}
                data-testid="user-action-trigger"
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
                data-testid="user-action-menu"
                className="w-48 rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] py-1 text-left"
            >
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        showModal({
                            content: <UserDetailsModal details={userDetails} />,
                        });
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                    <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                        View profile
                    </Typography>
                </button>

                {userDetails?.accountStatus !== "suspended" && <hr className="my-1 border-[#0B0E0514]" />}

                {userDetails?.accountStatus !== "suspended" && <button
                    type="button"
                    onClick={() => {
                        onClose();
                        showModal({
                            content: <SuspendAccountModal onClose={closeModal} details={userDetails} />,
                        });
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-red-50/50"
                >
                    <ProhibitIcon className="h-5 w-5 text-[#CC2929]" />
                    <Typography type="text14" fontWeight={600} className="!text-[#CC2929]">
                        Suspend account
                    </Typography>
                </button>}
            </FloatingMenuPortal>
        </div>
    );
}
