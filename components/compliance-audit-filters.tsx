"use client";

import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import SearchInput from "@/components/search-input";
import {
    CalendarDotsIcon,
    GavelIcon,
} from "@/components/vector";
import { ADMIN_COMPLIANCE_AUDIT_ACTIONS } from "@/lib/compliance/constants/admin-compliance-audit.constant";
import { type ReactNode } from "react";

export interface ComplianceAuditFilterConfig extends FilterConfig {
    icon: ReactNode;
}

interface ComplianceAuditFiltersProps {
    adminIdQuery: string;
    onAdminIdQueryChange: (value: string) => void;
    filters: ComplianceAuditFilterConfig[];
    selectedValues: Record<string, string | undefined>;
    onFilterChange: (filterId: string, value: string) => void;
}

const ACTION_LABELS: Record<string, string> = {
    submit: "Submit",
    update: "Update",
    delete: "Delete",
    add: "Add",
    claim: "Claim",
    unclaim: "Unclaim",
    resend: "Resend",
    revoke: "Revoke",
    restore: "Restore",
    "review:approve": "Approve",
    "review:reject": "Reject",
    "review:suspend": "Suspend",
};

export const COMPLIANCE_AUDIT_ACTION_OPTIONS = [
    "All actions",
    ...ADMIN_COMPLIANCE_AUDIT_ACTIONS.map((action) => ACTION_LABELS[action] ?? action),
];

export const COMPLIANCE_AUDIT_ACTION_VALUE_MAP: Record<string, string> = Object.fromEntries(
    ADMIN_COMPLIANCE_AUDIT_ACTIONS.map((action) => [ACTION_LABELS[action] ?? action, action]),
);

export const COMPLIANCE_AUDIT_FILTER_BLUEPRINTS: ComplianceAuditFilterConfig[] = [
    {
        id: "action",
        label: "Action",
        defaultValue: "All actions",
        options: COMPLIANCE_AUDIT_ACTION_OPTIONS,
        icon: <GavelIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "dateRange",
        label: "Custom range",
        defaultValue: "All time",
        options: ["All time", "Today", "This week", "This month", "Last 30 days"],
        icon: <CalendarDotsIcon className="h-5 w-5 text-[#343330]" />,
    },
];

export default function ComplianceAuditFilters({
    adminIdQuery,
    onAdminIdQueryChange,
    filters,
    selectedValues,
    onFilterChange,
}: ComplianceAuditFiltersProps) {
    return (
        <div className="space-y-4">
            <SearchInput
                value={adminIdQuery}
                onChange={(event) => onAdminIdQueryChange(event.target.value)}
                placeholder="Filter by admin ID..."
                data-testid="compliance-audit-admin-search"
                className="bg-[#F8FAFC] py-2.5 focus:bg-[#FFFFFF]"
            />

            <DynamicFilters
                filters={filters}
                selectedValues={selectedValues}
                onFilterChange={onFilterChange}
                className="relative z-30 flex flex-wrap items-center gap-3"
                testIdPrefix="compliance-audit"
            />
        </div>
    );
}
