"use client";

import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    ArrowsClockwiseIcon,
    DotsThreeIcon,
    EyeIcon,
    RejectXIcon,
} from "@/components/vector";
import { useEffect, useRef } from "react";

interface ComplianceActionMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
    triggerClassName?: string;
}

export default function ComplianceActionMenu({
    isOpen,
    onToggle,
    onClose,
    placement = "top",
    triggerClassName = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-slate-50",
}: ComplianceActionMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const menuPositionClass =
        placement === "bottom" ? "bottom-12 right-0" : "top-10 right-0";

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
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={onToggle}
                data-testid="compliance-action-trigger"
                aria-label="Open row actions"
                aria-expanded={isOpen}
                className={triggerClassName}
            >
                <DotsThreeIcon className="h-1 w-5 text-[#0B0E05]" />
            </button>

            {isOpen && (
                <div
                    data-testid="compliance-action-menu"
                    className={`absolute z-50 w-52 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] py-1.5 text-left shadow-card ring-1 ring-black/5 ${menuPositionClass}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-slate-50"
                    >
                        <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            View detail
                        </Typography>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-slate-50"
                    >
                        <ArrowsClockwiseIcon className="h-5 w-5 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Request update
                        </Typography>
                    </button>

                    <hr className="my-1 border-[#0B0E0514]" />

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-green-50/50"
                    >
                        <ApproveCheckIcon className="h-3 w-4 text-[#00A341]" />
                        <Typography type="text14" fontWeight={600} className="text-[#00A341]">
                            Approve
                        </Typography>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-red-50/50"
                    >
                        <RejectXIcon className="h-5 w-5 text-[#CC2929]" />
                        <Typography type="text14" fontWeight={600} className="text-[#CC2929]">
                            Reject
                        </Typography>
                    </button>
                </div>
            )}
        </div>
    );
}
