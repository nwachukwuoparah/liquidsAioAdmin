"use client";

import Typography from "@/components/typography";
import { ApproveCheckIcon, DotsThreeIcon, EyeIcon } from "@/components/vector";
import { useEffect, useRef } from "react";

interface RfqActionMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    placement?: "top" | "bottom";
}

export default function RfqActionMenu({
    isOpen,
    onToggle,
    onClose,
    placement = "top",
}: RfqActionMenuProps) {
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
                data-testid="rfq-action-trigger"
                aria-label="Open row actions"
                aria-expanded={isOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-slate-50"
            >
                <DotsThreeIcon className="h-1 w-5 text-[#0B0E05]" />
            </button>

            {isOpen && (
                <div
                    data-testid="rfq-action-menu"
                    className={`absolute z-50 w-48 rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] py-1 text-left ${menuPositionClass}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                        <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            View detail
                        </Typography>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                        <ApproveCheckIcon className="h-3 w-4 text-[#0B0E05]" />
                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05]">
                            Mark as resolved
                        </Typography>
                    </button>
                </div>
            )}
        </div>
    );
}
