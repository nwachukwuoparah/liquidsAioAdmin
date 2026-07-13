"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import { ChevronDownIcon } from "@/components/vector";
import { useFloatingMenu, type FloatingMenuPlacement } from "@/lib/hooks/use-floating-menu";
import { useEffect, useId, useState, type ReactNode } from "react";

export interface CustomDropdownOption {
    value: string;
    label: string;
}

export type CustomDropdownVariant = "filter-pill" | "form-field" | "compact";

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
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose: () => setIsOpen(false),
        placement,
        align: "left",
        matchTriggerWidth: !isFilterPill,
    });

    const selectedOption = options.find((option) => option.value === value);
    const selectedLabel = selectedOption?.label ?? value;
    const isActive = isFilterPill && defaultValue !== undefined && value !== defaultValue;

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const displayedOptions = isSearchable
        ? options.filter((option) =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : options;

    const triggerLabel = isFilterPill
        ? isActive
            ? selectedLabel
            : (filterLabel ?? selectedLabel)
        : selectedLabel;

    const handleToggle = () => {
        if (disabled) {
            return;
        }

        setIsOpen((open) => !open);
    };

    const handleSelect = (nextValue: string) => {
        onChange(nextValue);
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
                        ? isSearchable
                            ? "w-60"
                            : "min-w-[11rem]"
                        : "w-full"
                }`}
            >
                    {isSearchable ? (
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

                    <div className="max-h-48 overflow-y-auto">
                        {displayedOptions.map((option) => {
                            const isSelected = option.value === value;

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
                    </div>
            </FloatingMenuPortal>
        </div>
    );
}
