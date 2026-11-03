"use client";

import { FormFilterDropdownField } from "@/components/form/form-filter-dropdown-field";
import Typography from "@/components/typography";
import { ModalCloseIcon } from "@/components/vector";
import {
    applyUserFilterChange,
    USER_ACCOUNT_STATUS_OPTIONS,
    USER_DATE_OPTIONS,
    USER_VERIFICATION_OPTIONS,
} from "@/lib/users/utilities/user-filter-params";
import { useMemo, useState } from "react";

export interface UserFiltersModalProps {
    initialParams: Record<string, string>;
    onApply: (nextParams: Record<string, string>) => void;
    onReset: () => void;
    onClose: () => void;
}

function AccountStatusChip({
    label,
    selected,
    onSelect,
}: {
    label: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors ${
                selected
                    ? "border-[#518300] bg-[#B1EC521A]"
                    : "border-[#0B0E0514] bg-[#FFFFFF]"
            }`}
        >
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-[#518300]" : "border-[#0B0E0529]"
                }`}
            >
                {selected ? <span className="h-2 w-2 rounded-full bg-[#518300]" /> : null}
            </span>
            <Typography
                type="text14"
                fontWeight={selected ? 600 : 500}
                className={selected ? "text-[#518300]" : "text-[#0B0E05]"}
            >
                {label}
            </Typography>
        </button>
    );
}

/**
 * Mobile-first filter sheet for the Users dashboard.
 * Only surfaces filters accounted for on the server (Compliance status, Account status, Joined date).
 */
export default function UserFiltersModal({
    initialParams,
    onApply,
    onReset,
    onClose,
}: UserFiltersModalProps) {
    const [draftParams, setDraftParams] = useState<Record<string, string>>(() => ({
        ...initialParams,
    }));

    const updateDraft = (filterId: string, value: string) => {
        setDraftParams((prev) => applyUserFilterChange(prev, filterId, value));
    };

    const handleResetAll = () => {
        onReset();
        onClose();
    };

    const handleApply = () => {
        onApply(draftParams);
        onClose();
    };

    const complianceOptions = useMemo(
        () => USER_VERIFICATION_OPTIONS.map((opt) => ({ value: opt, label: opt })),
        [],
    );

    const dateOptions = useMemo(
        () => USER_DATE_OPTIONS.map((opt) => ({ value: opt, label: opt })),
        [],
    );

    const currentAccountStatus = draftParams.accountStatus ?? "All";

    return (
        <div
            className="flex h-full w-full flex-col bg-[#FFFFFF]"
            data-testid="user-filters-modal"
        >
            <div className="flex items-center gap-3 border-b border-[#0B0E0514] px-4 py-4">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close filters"
                    className="p-0.5 text-[#0B0E05]"
                >
                    <ModalCloseIcon className="h-5 w-5 text-[#0B0E05]" />
                </button>
                <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                    Filter users
                </Typography>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                <FormFilterDropdownField
                    label="Compliance status"
                    value={draftParams.complianceStatus ?? "All statuses"}
                    options={complianceOptions}
                    onChange={(value) => updateDraft("complianceStatus", value)}
                    testId="user-filter-compliance-status"
                />

                <div className="space-y-3">
                    <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                        Account status
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                        {USER_ACCOUNT_STATUS_OPTIONS.map((option) => (
                            <AccountStatusChip
                                key={option}
                                label={option}
                                selected={
                                    currentAccountStatus.toLowerCase() === option.toLowerCase()
                                }
                                onSelect={() => updateDraft("accountStatus", option)}
                            />
                        ))}
                    </div>
                </div>

                <FormFilterDropdownField
                    label="Joined date"
                    value={draftParams.joinedDate ?? "All time"}
                    options={dateOptions}
                    onChange={(value) => updateDraft("joinedDate", value)}
                    customRangeKind="date"
                    testId="user-filter-joined-date"
                />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#0B0E0514] px-4 py-4">
                <button
                    type="button"
                    onClick={handleResetAll}
                    className="rounded-[12px] border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A]"
                >
                    Reset all
                </button>
                <button
                    type="button"
                    onClick={handleApply}
                    className="rounded-[12px] bg-[#B1EC52] px-4 py-3 text-sm font-semibold text-[#0B0E05] transition-colors hover:brightness-95"
                >
                    Apply filter
                </button>
            </div>
        </div>
    );
}
