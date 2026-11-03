"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import { ChevronDownIcon } from "@/components/vector";
import {
    CUSTOM_DATE_RANGE_OPTION,
    encodeCustomDateRange,
    formatCustomDateRangeLabel,
    isCustomDateRangeOption,
    isCustomDateRangeValue,
    parseCustomDateRange,
} from "@/lib/filters/custom-date-range";
import {
    CUSTOM_PRICE_RANGE_OPTION,
    encodeCustomPriceRange,
    formatCustomPriceRangeLabel,
    isCustomPriceRangeValue,
    parseCustomPriceRange,
} from "@/lib/filters/custom-price-range";
import { useGooglePlacesAutocomplete } from "@/lib/hooks/use-google-places-autocomplete";
import { useFloatingMenu, type FloatingMenuPlacement } from "@/lib/hooks/use-floating-menu";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

export interface CustomDropdownOption {
    value: string;
    label: string;
}

export type CustomDropdownVariant = "filter-pill" | "form-field" | "compact";
export type CustomRangeKind = "date" | "price";

export interface CustomDropdownProps {
    /** Current selected option value. */
    value: string;
    /** Available dropdown options. */
    options: readonly CustomDropdownOption[];
    /** Called when the user selects a new option. */
    onChange: (value: string) => void;
    /** Disables opening and selecting options. */
    disabled?: boolean;
    /** Visual style for filter chips or full-width form fields. */
    variant?: CustomDropdownVariant;
    /**
     * Menu placement relative to the trigger.
     * Use `"auto"` near the bottom of the viewport so the menu flips upward.
     */
    placement?: FloatingMenuPlacement;
    /** Marks the form-field trigger as invalid. */
    hasError?: boolean;
    /** Filter pill label shown when no non-default value is selected. */
    filterLabel?: string;
    /** Optional icon shown on filter pill triggers. */
    filterIcon?: ReactNode;
    /** Value treated as the filter pill inactive state. */
    defaultValue?: string;
    /** Enables search inside the dropdown menu. */
    isSearchable?: boolean;
    /** Uses Google Places predictions for the searchable location list. */
    isPlacesAutocomplete?: boolean;
    /**
     * When options include "Custom range", chooses date or price inputs.
     * Defaults to date.
     */
    customRangeKind?: CustomRangeKind;
    /** Placeholder for the searchable dropdown input. */
    searchPlaceholder?: string;
    /** Optional id for the trigger button. */
    id?: string;
    /** Accessible label for the trigger button. */
    ariaLabel?: string;
    /** Test id for the trigger button. */
    testId?: string;
    /** Test id for the dropdown menu container. */
    menuTestId?: string;
    /** Prefix used to build option test ids. */
    optionTestIdPrefix?: string;
}

/**
 * Reusable custom dropdown shared by filter chips and form fields.
 * @param props - Dropdown value, options, styling variant, and handlers.
 */
export function CustomDropdown({
    value,
    options,
    onChange,
    disabled = false,
    variant = "filter-pill",
    placement = "bottom",
    hasError = false,
    filterLabel,
    filterIcon,
    defaultValue,
    isSearchable = false,
    isPlacesAutocomplete = false,
    customRangeKind = "date",
    searchPlaceholder = "Search...",
    id,
    ariaLabel,
    testId,
    menuTestId,
    optionTestIdPrefix,
}: CustomDropdownProps) {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const isFilterPill = variant === "filter-pill";
    const isCompact = variant === "compact";
    const isSearchEnabled = isSearchable || isPlacesAutocomplete;
    const isPriceCustomRange = customRangeKind === "price";
    const customRangeOption = isPriceCustomRange
        ? CUSTOM_PRICE_RANGE_OPTION
        : (options.find((opt) => isCustomDateRangeOption(opt.value))?.value ?? CUSTOM_DATE_RANGE_OPTION);
    const supportsCustomRange = options.some((option) =>
        isPriceCustomRange
            ? option.value === CUSTOM_PRICE_RANGE_OPTION
            : isCustomDateRangeOption(option.value),
    );
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCustomRangePanelOpen, setIsCustomRangePanelOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [customMinPrice, setCustomMinPrice] = useState("");
    const [customMaxPrice, setCustomMaxPrice] = useState("");
    const [customRangeError, setCustomRangeError] = useState<string | null>(null);
    const {
        predictions: placePredictions,
        isLoading: isPlacesLoading,
        errorMessage: placesErrorMessage,
    } = useGooglePlacesAutocomplete(searchTerm, isOpen && isPlacesAutocomplete);
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose: () => setIsOpen(false),
        placement,
        align: "left",
        matchTriggerWidth: !isFilterPill,
    });

    const selectedOption = options.find((option) => option.value === value);
    const selectedLabel = isCustomPriceRangeValue(value)
        ? formatCustomPriceRangeLabel(value)
        : isCustomDateRangeValue(value)
          ? formatCustomDateRangeLabel(value)
          : (selectedOption?.label ?? value);
    const isActive = isFilterPill && defaultValue !== undefined && value !== defaultValue;
    const isCustomRangeSelected = isPriceCustomRange
        ? isCustomPriceRangeValue(value)
        : isCustomDateRangeValue(value);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setIsCustomRangePanelOpen(false);
            setCustomRangeError(null);
            return;
        }

        if (isPriceCustomRange) {
            const parsedCustomPrice = parseCustomPriceRange(value);

            if (parsedCustomPrice) {
                setCustomMinPrice(parsedCustomPrice.minPrice);
                setCustomMaxPrice(parsedCustomPrice.maxPrice);
                setIsCustomRangePanelOpen(true);
                return;
            }

            if (!isCustomRangeSelected) {
                setCustomMinPrice("");
                setCustomMaxPrice("");
            }

            return;
        }

        const parsedCustomRange = parseCustomDateRange(value);

        if (parsedCustomRange) {
            setCustomStartDate(parsedCustomRange.startDate);
            setCustomEndDate(parsedCustomRange.endDate);
            setIsCustomRangePanelOpen(true);
            return;
        }

        if (!isCustomRangeSelected) {
            setCustomStartDate("");
            setCustomEndDate("");
        }
    }, [isCustomRangeSelected, isOpen, isPriceCustomRange, value]);

    const displayedOptions = useMemo(() => {
        if (isPlacesAutocomplete) {
            const defaultOption =
                options.find((option) => option.value === defaultValue) ??
                (defaultValue
                    ? { value: defaultValue, label: defaultValue }
                    : null);
            const selectedPlaceOption =
                value && value !== defaultValue
                    ? options.find((option) => option.value === value) ?? {
                          value,
                          label: value,
                      }
                    : null;
            const predictionOptions = placePredictions.map((prediction) => ({
                value: prediction,
                label: prediction,
            }));
            const mergedOptions = [
                ...(defaultOption ? [defaultOption] : []),
                ...(selectedPlaceOption &&
                selectedPlaceOption.value !== defaultOption?.value &&
                !predictionOptions.some((option) => option.value === selectedPlaceOption.value)
                    ? [selectedPlaceOption]
                    : []),
                ...predictionOptions.filter(
                    (option) => option.value !== defaultOption?.value,
                ),
            ];

            return mergedOptions;
        }

        if (isSearchEnabled) {
            return options.filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return options;
    }, [
        defaultValue,
        isPlacesAutocomplete,
        isSearchEnabled,
        options,
        placePredictions,
        searchTerm,
        value,
    ]);

    const triggerLabel = isFilterPill
        ? isActive
            ? selectedLabel
            : (filterLabel ?? selectedLabel)
        : selectedLabel;

    const canApplyCustomRange = isPriceCustomRange
        ? Boolean(customMinPrice) &&
          Boolean(customMaxPrice) &&
          Number(customMinPrice) <= Number(customMaxPrice)
        : Boolean(customStartDate) &&
          Boolean(customEndDate) &&
          customStartDate <= customEndDate;

    const emptyPlacesMessage =
        isPlacesAutocomplete && searchTerm.trim().length >= 2 && !isPlacesLoading
            ? placesErrorMessage ??
              (placePredictions.length === 0 ? "No locations found." : null)
            : isPlacesAutocomplete && searchTerm.trim().length > 0 && searchTerm.trim().length < 2
              ? "Keep typing to search locations."
              : null;

    const handleToggle = () => {
        if (disabled) {
            return;
        }

        setIsOpen((open) => !open);
    };

    const handleSelect = (nextValue: string) => {
        if (
            supportsCustomRange &&
            (nextValue === customRangeOption || (!isPriceCustomRange && isCustomDateRangeOption(nextValue)))
        ) {
            setIsCustomRangePanelOpen(true);
            setCustomRangeError(null);
            return;
        }

        setIsCustomRangePanelOpen(false);
        onChange(nextValue);
        setIsOpen(false);
    };

    const handleApplyCustomRange = () => {
        if (isPriceCustomRange) {
            if (!customMinPrice || !customMaxPrice) {
                setCustomRangeError("Enter a start and end price.");
                return;
            }

            const minPrice = Number(customMinPrice);
            const maxPrice = Number(customMaxPrice);

            if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
                setCustomRangeError("Enter valid prices.");
                return;
            }

            if (minPrice > maxPrice) {
                setCustomRangeError("Start price must be less than or equal to end price.");
                return;
            }

            onChange(encodeCustomPriceRange(String(minPrice), String(maxPrice)));
            setCustomRangeError(null);
            setIsOpen(false);
            return;
        }

        if (!customStartDate || !customEndDate) {
            setCustomRangeError("Select a start and end date.");
            return;
        }

        if (customStartDate > customEndDate) {
            setCustomRangeError("Start date must be on or before end date.");
            return;
        }

        onChange(encodeCustomDateRange(customStartDate, customEndDate));
        setCustomRangeError(null);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                data-testid={testId}
                aria-label={ariaLabel ?? triggerLabel}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                disabled={disabled}
                onClick={handleToggle}
                className={
                    isFilterPill
                        ? `flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-colors ${
                              isActive
                                  ? "border-[#518300] bg-[#B1EC521A]"
                                  : "border-[#0B0E0514] bg-[#FFFFFF] hover:bg-[#0B0E050A]"
                          }`
                        : isCompact
                          ? "flex w-full items-center justify-between rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] py-1 pl-2 pr-2 text-left text-xs font-medium text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:cursor-not-allowed disabled:opacity-60"
                          : `flex w-full items-center justify-between rounded-xl border bg-[#FFFFFF] px-4 py-3 text-left text-sm font-medium transition-colors focus:border-[#518300] disabled:cursor-not-allowed disabled:bg-[#0B0E050A] disabled:text-[#0B0E05A3] ${
                                hasError ? "border-[#CC2929]" : "border-[#0B0E0514]"
                            }`
                }
            >
                <span className="flex min-w-0 items-center gap-2">
                    {isFilterPill ? filterIcon : null}
                    {isFilterPill ? (
                        <Typography
                            type="text14"
                            fontWeight={isActive ? 600 : 500}
                            className={isActive ? "text-[#518300]" : "!text-[#0B0E05]"}
                        >
                            {triggerLabel}
                        </Typography>
                    ) : (
                        <span className="truncate text-[#0B0E05]">{triggerLabel}</span>
                    )}
                </span>
                <ChevronDownIcon
                    className={`ml-2 h-[6px] w-[11px] shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    } ${isActive ? "text-[#518300]" : "text-[#0B0E05A3]"}`}
                />
            </button>

            <FloatingMenuPortal
                isOpen={isOpen}
                isMounted={isMounted}
                menuRef={menuRef}
                menuStyle={menuStyle}
                data-testid={menuTestId}
                role="listbox"
                className={`rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-1 shadow-card ring-1 ring-black/5 ${
                    isFilterPill
                        ? isCustomRangePanelOpen || isPlacesAutocomplete
                            ? "w-72"
                            : isSearchEnabled
                              ? "w-60"
                              : "min-w-[11rem]"
                        : "w-full"
                }`}
            >
                    {isSearchEnabled ? (
                        <div className="mb-1 p-1">
                            <SearchInput
                                size="compact"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                data-testid={
                                    optionTestIdPrefix
                                        ? `${optionTestIdPrefix}-search`
                                        : undefined
                                }
                            />
                        </div>
                    ) : null}

                    <div className="max-h-80 overflow-y-auto">
                        {displayedOptions.map((option) => {
                            const isSelected =
                                option.value === customRangeOption
                                    ? isCustomRangeSelected
                                    : option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    data-testid={
                                        optionTestIdPrefix
                                            ? `${optionTestIdPrefix}-${option.label.replace(/\s+/g, "-").toLowerCase()}`
                                            : undefined
                                    }
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left ${
                                        isSelected ? "bg-[#0B0E050A]" : "hover:bg-[#0B0E050A]"
                                    }`}
                                >
                                    <Typography
                                        type="text14"
                                        fontWeight={isSelected ? 600 : 500}
                                        className={isSelected ? "text-[#518300]" : "!text-[#0B0E05]"}
                                    >
                                        {option.label}
                                    </Typography>
                                    {isSelected ? (
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#518300]" />
                                    ) : null}
                                </button>
                            );
                        })}

                        {isPlacesAutocomplete && isPlacesLoading ? (
                            <Typography
                                type="text14"
                                fontWeight={500}
                                className="px-3 py-2 !text-[#0B0E05A3]"
                            >
                                Searching locations...
                            </Typography>
                        ) : null}

                        {emptyPlacesMessage ? (
                            <Typography
                                type="text14"
                                fontWeight={500}
                                className="px-3 py-2 !text-[#0B0E05A3]"
                            >
                                {emptyPlacesMessage}
                            </Typography>
                        ) : null}
                    </div>

                    {supportsCustomRange && isCustomRangePanelOpen ? (
                        <div
                            className="mt-1 space-y-3 border-t border-[#0B0E0514] p-2"
                            data-testid={
                                optionTestIdPrefix
                                    ? `${optionTestIdPrefix}-custom-range-panel`
                                    : undefined
                            }
                        >
                            {isPriceCustomRange ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`${triggerId}-custom-min-price`}
                                            className="block text-xs font-medium text-[#0B0E05A3]"
                                        >
                                            Start price
                                        </label>
                                        <input
                                            id={`${triggerId}-custom-min-price`}
                                            type="number"
                                            min={0}
                                            step="1"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={customMinPrice}
                                            onChange={(event) => {
                                                setCustomMinPrice(event.target.value);
                                                setCustomRangeError(null);
                                            }}
                                            data-testid={
                                                optionTestIdPrefix
                                                    ? `${optionTestIdPrefix}-custom-min-price`
                                                    : undefined
                                            }
                                            className="w-full rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0B0E05] outline-none transition-colors focus:border-[#518300]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`${triggerId}-custom-max-price`}
                                            className="block text-xs font-medium text-[#0B0E05A3]"
                                        >
                                            End price
                                        </label>
                                        <input
                                            id={`${triggerId}-custom-max-price`}
                                            type="number"
                                            min={0}
                                            step="1"
                                            inputMode="decimal"
                                            placeholder="1000"
                                            value={customMaxPrice}
                                            onChange={(event) => {
                                                setCustomMaxPrice(event.target.value);
                                                setCustomRangeError(null);
                                            }}
                                            data-testid={
                                                optionTestIdPrefix
                                                    ? `${optionTestIdPrefix}-custom-max-price`
                                                    : undefined
                                            }
                                            className="w-full rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0B0E05] outline-none transition-colors focus:border-[#518300]"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`${triggerId}-custom-start`}
                                            className="block text-xs font-medium text-[#0B0E05A3]"
                                        >
                                            Start date
                                        </label>
                                        <input
                                            id={`${triggerId}-custom-start`}
                                            type="date"
                                            value={customStartDate}
                                            max={customEndDate || undefined}
                                            onChange={(event) => {
                                                setCustomStartDate(event.target.value);
                                                setCustomRangeError(null);
                                            }}
                                            data-testid={
                                                optionTestIdPrefix
                                                    ? `${optionTestIdPrefix}-custom-start`
                                                    : undefined
                                            }
                                            className="w-full rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0B0E05] outline-none transition-colors focus:border-[#518300]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`${triggerId}-custom-end`}
                                            className="block text-xs font-medium text-[#0B0E05A3]"
                                        >
                                            End date
                                        </label>
                                        <input
                                            id={`${triggerId}-custom-end`}
                                            type="date"
                                            value={customEndDate}
                                            min={customStartDate || undefined}
                                            onChange={(event) => {
                                                setCustomEndDate(event.target.value);
                                                setCustomRangeError(null);
                                            }}
                                            data-testid={
                                                optionTestIdPrefix
                                                    ? `${optionTestIdPrefix}-custom-end`
                                                    : undefined
                                            }
                                            className="w-full rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0B0E05] outline-none transition-colors focus:border-[#518300]"
                                        />
                                    </div>
                                </>
                            )}

                            {customRangeError ? (
                                <p className="text-xs text-[#CC2929]">{customRangeError}</p>
                            ) : null}

                            <button
                                type="button"
                                disabled={!canApplyCustomRange}
                                onClick={handleApplyCustomRange}
                                data-testid={
                                    optionTestIdPrefix
                                        ? `${optionTestIdPrefix}-custom-apply`
                                        : undefined
                                }
                                className="w-full rounded-lg bg-[#518300] px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Apply range
                            </button>
                        </div>
                    ) : null}
            </FloatingMenuPortal>
        </div>
    );
}
