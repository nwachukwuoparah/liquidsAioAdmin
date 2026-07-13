"use client";

import { CustomDropdown } from "@/components/custom-dropdown";
import { type ReactNode } from "react";

export interface FilterConfig {
    id: string;
    label: string;
    options: string[];
    defaultValue: string;
    icon?: ReactNode;
    isSearchable?: boolean;
    searchPlaceholder?: string;
}

export interface DynamicFiltersProps {
    filters: FilterConfig[];
    selectedValues: Record<string, string | undefined>;
    onFilterChange: (filterId: string, value: string) => void;
    className?: string;
    testIdPrefix?: string;
    formatOptionLabel?: (option: string) => string;
}

export default function DynamicFilters({
    filters,
    selectedValues,
    onFilterChange,
    className = "relative z-30 flex w-full flex-wrap items-center gap-2",
    testIdPrefix,
    formatOptionLabel,
}: DynamicFiltersProps) {
    const getOptionLabel = (option: string) => formatOptionLabel?.(option) ?? option;

    return (
        <div className={className}>
            {filters.map((filter) => {
                const currentValue = selectedValues[filter.id] || filter.defaultValue;

                return (
                    <CustomDropdown
                        key={filter.id}
                        value={currentValue}
                        defaultValue={filter.defaultValue}
                        filterLabel={filter.label}
                        filterIcon={filter.icon}
                        isSearchable={filter.isSearchable}
                        searchPlaceholder={filter.searchPlaceholder}
                        options={filter.options.map((option) => ({
                            value: option,
                            label: getOptionLabel(option),
                        }))}
                        onChange={(nextValue) => onFilterChange(filter.id, nextValue)}
                        testId={testIdPrefix ? `${testIdPrefix}-filter-${filter.id}` : undefined}
                        menuTestId={
                            testIdPrefix ? `${testIdPrefix}-filter-menu-${filter.id}` : undefined
                        }
                        optionTestIdPrefix={
                            testIdPrefix ? `${testIdPrefix}-filter-option-${filter.id}` : undefined
                        }
                    />
                );
            })}
        </div>
    );
}
