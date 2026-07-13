"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import Typography from "../typography";
import { ModalCloseIcon } from "../vector";
import { useAdminSuspendAccount } from "@/lib/admin/hooks/use-admin-users";
import { useModal } from "@/context/modal-provider";

const SUSPEND_MESSAGE_PLACEHOLDER = "Write a short reason for account deactivation";

interface SuspendFormValues {
    reason: string;
    customNote: string;
}

interface SuspendAccountModalProps {
    onClose: () => void;
    details: any
}

function FormTextareaField({ label, showRequiredIndicator, className, hasError, ...props }: any) {
    return (
        <div className="flex flex-col gap-1.5 w-full text-left">
            <label className="text-[14px] font-medium text-[#0B0E05CC]">
                {label} {showRequiredIndicator && <span className="text-[#D92D20]">*</span>}
            </label>
            <textarea
                {...props}
                className={`w-full p-3.5 border rounded-xl text-sm text-[#0B0E05] placeholder-[#0B0E05A3] bg-white outline-none transition-colors resize-none ${hasError
                    ? "border-[#D92D20] focus:border-[#D92D20]"
                    : "border-[#0B0E0514] focus:border-[#518300]"
                    } ${className}`}
            />
        </div>
    );
}

export default function SuspendAccountModal({ onClose, details }: SuspendAccountModalProps) {
    const { closeModal } = useModal();

    const { mutate: suspendAccount, isPending: isSuspendAccountPending } = useAdminSuspendAccount(details.id, "suspend", {
        onSuccess: () => {
            closeModal()
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDropdownText, setSelectedDropdownText] = useState("Select reason");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, setValue, clearErrors, formState: { errors } } = useForm<SuspendFormValues>({
        defaultValues: {
            reason: "",
            customNote: ""
        }
    });

    const showCustomTextarea = selectedDropdownText === "Other (please specify)";

    const dropdownOptions = [
        "Fraudulent or suspicious activity",
        "Repeated dispute or policy violation",
        "Compliance issue (KYC/KYB failed or expired)",
        "User request",
        "Other (please specify)"
    ];

    const handleConfirmSuspendSubmit = (finalReason: string) => {
        suspendAccount({ reason: finalReason });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectOption = (option: string) => {
        setSelectedDropdownText(option);
        setIsDropdownOpen(false);
        clearErrors("customNote");

        if (option === "Other (please specify)") {
            setValue("reason", "");
        } else {
            setValue("reason", option);
            setValue("customNote", "");
        }
    };

    const handleFormSubmit = (data: SuspendFormValues) => {
        const finalReason = showCustomTextarea ? data.customNote : data.reason;
        handleConfirmSuspendSubmit(finalReason);
    };


    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl overflow-hidden p-6 text-left animate-in zoom-in-95 duration-150 flex flex-col max-h-[90%]">
                <div className="flex justify-between items-center mb-3 shrink-0">
                    <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                        Suspend this account?
                    </Typography>
                    <button onClick={onClose} className="text-[#0B0E05A3] hover:text-[#0B0E05] p-1">
                        <ModalCloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-1 flex-1 space-y-4 pb-2">
                    <div className="flex flex-col gap-4 border-b pb-2 border-[#0B0E0514]">
                        <div className="flex flex-col gap-2">
                            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] leading-relaxed block">
                                You’re about to suspend this user’s account. They’ll no longer be able to log in, list inventory, or place new orders until reactivated.
                            </Typography>
                            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] leading-relaxed block">
                                All existing orders will remain visible in their dashboard, but activity will be paused.
                            </Typography>
                        </div>
                        <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] leading-relaxed block">
                            Please select a reason for deactivation and confirm your action below.
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div className="flex flex-col gap-1.5 relative w-full text-left" ref={dropdownRef}>
                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05] leading-relaxed block">
                                Select reason
                            </Typography>
                            <div
                                onClick={() => !isSuspendAccountPending && setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full p-3.5 border border-[#0B0E0514] rounded-xl text-sm flex items-center justify-between cursor-pointer bg-white transition-colors select-none ${isDropdownOpen ? 'border-[#518300]' : ''}`}
                            >
                                <span className={selectedDropdownText === "Select reason" ? "text-[#0B0E05A3]" : "text-[#0B0E05]"}>
                                    {selectedDropdownText}
                                </span>
                                <svg className={`w-5 h-5 text-[#0B0E05A3] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#0B0E0514] rounded-xl shadow-lg z-50 overflow-hidden py-1">
                                    {dropdownOptions.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => handleSelectOption(option)}
                                            className="px-4 py-3 text-sm text-[#0B0E05] hover:bg-[#0B0E0505] cursor-pointer transition-colors"
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {showCustomTextarea && (
                            <FormTextareaField
                                label="Add a note/reason"
                                placeholder={SUSPEND_MESSAGE_PLACEHOLDER}
                                showRequiredIndicator={true}
                                disabled={isSuspendAccountPending}
                                hasError={!!errors.customNote}
                                className="min-h-[110px]"
                                {...register("customNote", { required: showCustomTextarea })}
                            />
                        )}

                        <div className="flex items-center gap-3 pt-3 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSuspendAccountPending}
                                className="flex-1 py-3 text-sm font-semibold border border-[#0B0E0514] rounded-xl text-[#0B0E05] bg-white hover:bg-[#0B0E0505] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSuspendAccountPending || selectedDropdownText === "Select reason"}
                                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[#D92D20] text-white hover:bg-[#D92D20]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSuspendAccountPending ? "Suspending..." : "Deactivate account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}