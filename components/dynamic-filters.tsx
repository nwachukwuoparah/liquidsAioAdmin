"use client";

import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import { ChevronDownIcon } from "@/components/vector";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
    selectedValues: Record<string, string>;
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
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setSearchTerm("");
    }, [activeDropdown]);

    const getOptionLabel = (option: string) => formatOptionLabel?.(option) ?? option;

    return (
        <div ref={dropdownRef} className={className}>
            {filters.map((filter) => {
                const currentValue = selectedValues[filter.id] || filter.defaultValue;
                const isActive = currentValue !== filter.defaultValue;
                const isOpen = activeDropdown === filter.id;

                const displayedOptions = filter.isSearchable
                    ? filter.options.filter((option) =>
                          option.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    : filter.options;

                return (
                    <div key={filter.id} className="relative">
                        <button
                            type="button"
                            data-testid={testIdPrefix ? `${testIdPrefix}-filter-${filter.id}` : undefined}
                            onClick={() => setActiveDropdown(isOpen ? null : filter.id)}
                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-colors ${
                                isActive
                                    ? "border-[#518300] bg-[#B1EC521A]"
                                    : "border-[#0B0E0514] bg-[#FFFFFF] hover:bg-[#0B0E050A]"
                            }`}
                        >
                            {filter.icon}
                            <Typography
                                type="text14"
                                fontWeight={isActive ? 600 : 500}
                                className={isActive ? "text-[#518300]" : "!text-[#0B0E05]"}
                            >
                                {isActive ? getOptionLabel(currentValue) : filter.label}
                            </Typography>
                            <ChevronDownIcon
                                className={`ml-0.5 h-[6px] w-[11px] shrink-0 transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                } ${isActive ? "text-[#518300]" : "text-[#0B0E05A3]"}`}
                            />
                        </button>

                        {isOpen && (
                            <div
                                data-testid={testIdPrefix ? `${testIdPrefix}-filter-menu-${filter.id}` : undefined}
                                className={`absolute left-0 z-50 mt-1.5 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-1 shadow-card ring-1 ring-black/5 ${
                                    filter.isSearchable ? "w-60" : "min-w-[11rem]"
                                }`}
                            >
                                {filter.isSearchable && (
                                    <div className="mb-1 p-1">
                                        <SearchInput
                                            size="compact"
                                            placeholder={filter.searchPlaceholder || "Search..."}
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            data-testid={
                                                testIdPrefix
                                                    ? `${testIdPrefix}-filter-search-${filter.id}`
                                                    : undefined
                                            }
                                        />
                                    </div>
                                )}
                                <div className="max-h-48 overflow-y-auto">
                                    {displayedOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            data-testid={
                                                testIdPrefix
                                                    ? `${testIdPrefix}-filter-option-${filter.id}-${option.replace(/\s+/g, "-").toLowerCase()}`
                                                    : undefined
                                            }
                                            onClick={() => {
                                                onFilterChange(filter.id, option);
                                                setActiveDropdown(null);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left ${
                                                option === currentValue ? "bg-[#0B0E050A]" : "hover:bg-[#0B0E050A]"
                                            }`}
                                        >
                                            <Typography
                                                type="text14"
                                                fontWeight={option === currentValue ? 600 : 500}
                                                className={
                                                    option === currentValue
                                                        ? "text-[#518300]"
                                                        : "!text-[#0B0E05]"
                                                }
                                            >
                                                {getOptionLabel(option)}
                                            </Typography>
                                            {option === currentValue && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#518300]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
