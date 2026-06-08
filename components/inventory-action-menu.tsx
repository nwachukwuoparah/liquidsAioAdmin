"use client";

import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    DotsThreeIcon,
    EyeIcon,
    ProhibitIcon,
    RejectXIcon,
} from "@/components/vector";
import { useEffect, useRef } from "react";

interface InventoryActionMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    triggerClassName?: string;
}

export default function InventoryActionMenu({
    isOpen,
    onToggle,
    onClose,
    placement = "bottom",
    triggerClassName = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A]",
}: InventoryActionMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const menuPositionClass =
        placement === "bottom" ? "right-0 top-10" : "bottom-10 right-0";

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <div ref={menuRef} className="relative ml-auto">
            <button
                type="button"
                onClick={onToggle}
                data-testid="inventory-action-trigger"
                aria-label="Open lot actions"
                aria-expanded={isOpen}
                className={triggerClassName}
            >
                <DotsThreeIcon className="h-1 w-5 text-[#0B0E05]" />
            </button>

            {isOpen && (
                <div
                    data-testid="inventory-action-menu"
                    className={`absolute z-50 w-52 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] py-1.5 text-left shadow-card ring-1 ring-black/5 ${menuPositionClass}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                    >
                        <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            View lot details
                        </Typography>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                    >
                        <ApproveCheckIcon className="h-3 w-4 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Approve listing
                        </Typography>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                    >
                        <RejectXIcon className="h-5 w-5 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Decline listing
                        </Typography>
                    </button>

                    <hr className="my-1 border-[#0B0E0514]" />

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#0B0E050A]"
                    >
                        <ProhibitIcon className="h-5 w-5 text-[#CC2929]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Suspend
                        </Typography>
                    </button>
                </div>
            )}
        </div>
    );
}
