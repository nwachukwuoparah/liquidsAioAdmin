"use client";

import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import SearchInput from "@/components/search-input";
import {
    AllUsersIcon,
    CalendarDotsIcon,
    RadioButtonIcon,
    UsersIcon,
} from "@/components/vector";
import { type ReactNode } from "react";

export interface ComplianceFilterConfig extends FilterConfig {
    icon: ReactNode;
}

interface ComplianceFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filters: ComplianceFilterConfig[];
    selectedValues: Record<string, string>;
    onFilterChange: (filterId: string, value: string) => void;
}

export const COMPLIANCE_FILTER_BLUEPRINTS: ComplianceFilterConfig[] = [
    {
        id: "accountType",
        label: "User type",
        defaultValue: "All account types",
        options: ["All account types", "Buyer", "Seller"],
        icon: <UsersIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "reviewStatus",
        label: "Review status",
        defaultValue: "All statuses",
        options: ["All statuses", "Pending", "In Review", "Needs info"],
        icon: <RadioButtonIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "dateRange",
        label: "Custom range",
        defaultValue: "All time",
        options: ["All time", "Today", "This week", "This month", "Last 30 days"],
        icon: <CalendarDotsIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "assignedTo",
        label: "Assigned to",
        defaultValue: "Everyone",
        options: ["Everyone"],
        isSearchable: true,
        searchPlaceholder: "Search assignee...",
        icon: <AllUsersIcon className="h-5 w-5 text-[#343330]" />,
    },
];

export default function ComplianceFilters({
    searchQuery,
    onSearchChange,
    filters,
    selectedValues,
    onFilterChange,
}: ComplianceFiltersProps) {
    return (
        <div className="space-y-4">
            <SearchInput
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search people by name..."
                data-testid="compliance-search-input"
                className="bg-[#F8FAFC] py-2.5 focus:bg-[#FFFFFF]"
            />

            <DynamicFilters
                filters={filters}
                selectedValues={selectedValues}
                onFilterChange={onFilterChange}
                className="relative z-30 flex flex-wrap items-center gap-3"
                testIdPrefix="compliance"
            />
        </div>
    );
}
