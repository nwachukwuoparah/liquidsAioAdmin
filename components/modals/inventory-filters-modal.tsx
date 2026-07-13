"use client";

import { FormFilterDropdownField } from "@/components/form/form-filter-dropdown-field";
import Typography from "@/components/typography";
import { ModalCloseIcon } from "@/components/vector";
import { INVENTORY_REVIEW_STATUS_LABELS } from "@/lib/inventory/constants/admin-inventory-api.constant";
import { applyInventoryFilterChange } from "@/lib/inventory/utilities/apply-inventory-filter-change";
import { useMemo, useState } from "react";

const SELLER_STATUS_OPTIONS = ["All sellers", "Verified", "Unverified"] as const;

const CATEGORY_OPTIONS = [
    { value: "All categories", label: "All categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Apparel & Footwear", label: "Apparel & Footwear" },
    { value: "Home & Kitchen", label: "Home & Kitchen" },
    { value: "Health & Beauty", label: "Health & Beauty" },
] as const;

const CONDITION_OPTIONS = [
    { value: "All conditions", label: "All conditions" },
    { value: "New", label: "New" },
    { value: "Mixed", label: "Mixed" },
    { value: "Overstock", label: "Overstock" },
] as const;

const LOCATION_OPTIONS = [
    { value: "All location", label: "All location" },
    { value: "California, USA", label: "California, USA" },
    { value: "Texas, USA", label: "Texas, USA" },
] as const;

const DATE_POSTED_OPTIONS = [
    { value: "All time", label: "All time" },
    { value: "Today", label: "Today" },
    { value: "This week", label: "This week" },
] as const;

const PRICE_RANGE_OPTIONS = [
    "All prices",
    "$0 - $500",
    "$500 - $2,000",
    "$2,000 - $10,000",
    "Over $10,000",
] as const;

const LOT_STATUS_OPTIONS = [
    "All status",
    "Active",
    "Pending approval",
    "Rejected",
    "Out-of-stock",
    "Suspended",
] as const;

const CATEGORY_CODE_TO_LABEL: Record<string, string> = {
    elt: "Electronics",
    afw: "Apparel & Footwear",
    hkn: "Home & Kitchen",
    hby: "Health & Beauty",
};

const CONDITION_VALUE_TO_LABEL: Record<string, string> = {
    new: "New",
    mixed: "Mixed",
    overstock: "Overstock",
};

interface InventoryFiltersModalProps {
    initialParams: Record<string, string>;
    onApply: (nextParams: Record<string, string>) => void;
    onReset: () => void;
    onClose: () => void;
}

function RadioOption({
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
            className="flex w-full items-center gap-3 py-1.5 text-left"
            aria-pressed={selected}
        >
            <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#518300]" : "border-[#0B0E0529]"
                }`}
            >
                {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#518300]" /> : null}
            </span>
            <Typography
                type="text14"
                fontWeight={selected ? 600 : 500}
                className={selected ? "text-[#0B0E05]" : "text-[#0B0E05CC]"}
            >
                {label}
            </Typography>
        </button>
    );
}

function LotStatusChip({
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

function resolveDraftSelections(params: Record<string, string>) {
    const reviewStatusLabel = params.review_status
        ? INVENTORY_REVIEW_STATUS_LABELS[params.review_status]
        : undefined;

    let lotStatus: (typeof LOT_STATUS_OPTIONS)[number] = "All status";
    if (reviewStatusLabel === "Active") lotStatus = "Active";
    else if (reviewStatusLabel === "Pending") lotStatus = "Pending approval";
    else if (reviewStatusLabel === "Declined") lotStatus = "Rejected";
    else if (reviewStatusLabel === "Suspended") lotStatus = "Suspended";

    const sellerStatus =
        params.sellerStatus === "Verified" || params.sellerStatus === "Unverified"
            ? params.sellerStatus
            : "All sellers";

    return {
        sellerStatus,
        category: CATEGORY_CODE_TO_LABEL[params.category ?? ""] ?? "All categories",
        condition: CONDITION_VALUE_TO_LABEL[params.condition ?? ""] ?? "All conditions",
        location: params.location ?? "All location",
        datePosted: params.datePosted ?? "All time",
        priceRange: params.priceRange ?? "All prices",
        lotStatus,
    };
}

/** Full-screen mobile inventory filter sheet with draft state and Apply / Reset. */
export default function InventoryFiltersModal({
    initialParams,
    onApply,
    onReset,
    onClose,
}: InventoryFiltersModalProps) {
    const [draftParams, setDraftParams] = useState<Record<string, string>>(() => ({
        ...initialParams,
    }));

    const selections = useMemo(() => resolveDraftSelections(draftParams), [draftParams]);

    const updateDraft = (filterId: string, value: string) => {
        setDraftParams((previous) => applyInventoryFilterChange(previous, filterId, value));
    };

    const handleResetAll = () => {
        onReset();
        onClose();
    };

    const handleApply = () => {
        onApply(draftParams);
        onClose();
    };

    return (
        <div
            className="flex h-full w-full flex-col bg-[#FFFFFF]"
            data-testid="inventory-filters-modal"
        >
            <div className="flex items-center gap-3 border-b border-[#0B0E0514] px-4 py-4">
                <button type="button" onClick={onClose} aria-label="Close filters" className="p-0.5">
                    <ModalCloseIcon className="h-5 w-5 text-[#0B0E05]" />
                </button>
                <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                    Filter
                </Typography>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                            Seller status
                        </Typography>
                        <div className="space-y-1">
                            {SELLER_STATUS_OPTIONS.map((option) => (
                                <RadioOption
                                    key={option}
                                    label={option}
                                    selected={selections.sellerStatus === option}
                                    onSelect={() =>
                                        updateDraft(
                                            "sellerStatus",
                                            option === "All sellers" ? "All" : option,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <FormFilterDropdownField
                        label="Categories"
                        value={selections.category}
                        options={[...CATEGORY_OPTIONS]}
                        onChange={(value) => updateDraft("category", value)}
                        testId="inventory-filter-category"
                    />

                    <FormFilterDropdownField
                        label="Condition"
                        value={selections.condition}
                        options={[...CONDITION_OPTIONS]}
                        onChange={(value) => updateDraft("condition", value)}
                        testId="inventory-filter-condition"
                    />

                    <FormFilterDropdownField
                        label="Location"
                        value={selections.location}
                        options={[...LOCATION_OPTIONS]}
                        onChange={(value) => updateDraft("location", value)}
                        testId="inventory-filter-location"
                    />

                    <FormFilterDropdownField
                        label="Date posted"
                        value={selections.datePosted}
                        options={[...DATE_POSTED_OPTIONS]}
                        onChange={(value) => updateDraft("datePosted", value)}
                        testId="inventory-filter-date-posted"
                    />

                    <div className="space-y-2">
                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                            Price range
                        </Typography>
                        <div className="space-y-1">
                            {PRICE_RANGE_OPTIONS.map((option) => (
                                <RadioOption
                                    key={option}
                                    label={option}
                                    selected={selections.priceRange === option}
                                    onSelect={() => updateDraft("priceRange", option)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                            Lot status:
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                            {LOT_STATUS_OPTIONS.map((option) => (
                                <LotStatusChip
                                    key={option}
                                    label={option}
                                    selected={selections.lotStatus === option}
                                    onSelect={() =>
                                        updateDraft(
                                            "status",
                                            option === "All status" ? "All statuses" : option,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
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
