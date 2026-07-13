"use client";

import { EmptyState } from "@/components/empty-state";
import ComplianceActionMenu from "@/components/compliance-action-menu";
import ComplianceFilters, { COMPLIANCE_FILTER_BLUEPRINTS } from "@/components/compliance-filters";
import { ProfileAvatar } from "@/components/profile-avatar";
import SearchInput from "@/components/search-input";
import { StatCardsSkeleton, AdminAsyncContent, DataTableSkeleton, ListRowsSkeleton } from "@/components/skeletons";
import Typography from "@/components/typography";
import { useAdminComplianceReviews } from "@/lib/admin/hooks";
import { getAdminIconComponent } from "@/lib/admin/utilities/admin-icon-map";
import { buildComplianceReviewQueryParams, resolveComplianceDateRange } from "@/lib/admin/utilities/compliance-filter-params";
import { CARD_BG_CLASS, LIST_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, SECTION_CARD_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
import { formatCount } from "@/lib/format-count";
import { SlidersHorizontalIcon } from "@/components/vector";
import React, { useCallback, useMemo, useState } from "react";
import { COMPLIANCE_OVERVIEW_STAT_CARDS } from "@/lib/admin/constants/admin-overview.constant";
import { useAdminComplianceOverview } from "@/lib/admin/hooks/use-admin-compliance";
import type { AdminComplianceReviewRecord } from "@/lib/admin/types/admin-api.types";

const ACTIVE_TAB_STATUS_MAP: Record<string, string | undefined> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
    "Audit logs": undefined,
};

const COMPLIANCE_REVIEW_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    in_review: "In review",
    approved: "Approved",
    rejected: "Rejected",
};

function getProfileName(row: AdminComplianceReviewRecord): string {
    return [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
}

function mapComplianceReviewStatusValue(value: string): string {
    switch (value.toLowerCase()) {
        case "pending":
            return "pending";
        case "in review":
            return "in_review";
        case "approved":
            return "approved";
        case "rejected":
            return "rejected";
        default:
            return value.toLowerCase().replace(/\s+/g, "_");
    }
}

function getAccountTypeBg(accountType: AdminComplianceReviewRecord["accountType"]) {
    switch (accountType) {
        case "Buyer":
            return "bg-[#00A34114]";
        case "Seller":
            return "bg-[#DC680314]";
    }
}

function getAccountTypeTextColor(accountType: AdminComplianceReviewRecord["accountType"]) {
    switch (accountType) {
        case "Buyer":
            return "!text-[#00A341]";
        case "Seller":
            return "!text-[#DC6803]";
    }
}

function formatAccountTypeLabel(accountType: AdminComplianceReviewRecord["accountType"]) {
    return accountType === "Buyer" ? "BUYER ACCOUNT" : "SELLER ACCOUNT";
}

function formatReviewStatusLabel(status: AdminComplianceReviewRecord["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "Pending";
        case "In Review":
            return "In review";
        case "Approved":
            return "Approved";
        case "Rejected":
            return "Rejected";
    }
}

function getReviewStatusBg(status: AdminComplianceReviewRecord["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "bg-[#DC680314]";
        case "In Review":
            return "bg-[#0B0E050A]";
        case "Approved":
            return "bg-[#00A34114]";
        case "Rejected":
            return "bg-[#CC292914]";
    }
}

function getReviewStatusTextColor(status: AdminComplianceReviewRecord["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "!text-[#DC6803]";
        case "In Review":
            return "!text-[#0B0E05CC]";
        case "Approved":
            return "!text-[#00A341]";
        case "Rejected":
            return "!text-[#CC2929]";
    }
}

function ComplianceLoadMoreButton({
    hasNext,
    isLoading,
    onClick,
}: {
    hasNext: boolean;
    isLoading: boolean;
    onClick: () => void;
}) {
    return (
        <div className="flex items-center justify-center border-t border-[#0B0E0514] bg-[#FFFFFF] py-5 md:rounded-b-2xl">
            <button
                type="button"
                disabled={!hasNext || isLoading}
                onClick={onClick}
                className={`${hasNext && !isLoading ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"} flex items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-5 py-2 shadow-card transition-colors hover:bg-[#0B0E050A]`}
            >
                <Typography type="text14" fontWeight={600} className="text-slate-700">
                    {isLoading ? "Loading..." : "See more"}
                </Typography>
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    );
}

export default function ComplianceBody() {
    const [activeTab, setActiveTab] = useState<string>("Pending");
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterParams, setFilterParams] = useState<Record<string, string>>({});

    const activeTabStatus = ACTIVE_TAB_STATUS_MAP[activeTab];
    const complianceQueryParams = useMemo(
        () => ({
            ...buildComplianceReviewQueryParams(filterParams),
            ...(searchQuery.trim() ? { email: searchQuery.trim() } : {}),
            ...(activeTabStatus ? { compliance_review_status: activeTabStatus } : {}),
        }),
        [activeTabStatus, filterParams, searchQuery],
    );

    const complianceReviewsQuery = useAdminComplianceReviews(complianceQueryParams);
    const complianceOverviewQuery = useAdminComplianceOverview();

    const tableRows = useMemo(() => {
        const pages = complianceReviewsQuery.data?.pages ?? [];
        let serial = 0;

        return pages.flatMap((page) =>
            page.results.map((row) => {
                serial += 1;
                return { ...row, sn: `${serial}.` };
            }),
        );
    }, [complianceReviewsQuery.data]);

    const hasNextPage = complianceReviewsQuery.hasNextPage ?? false;
    const complianceOverviewStats = complianceOverviewQuery.data?.overview ?? {
        pending: 0,
        approved: 0,
        rejected: 0,
    };

    const subTabs = [
        { name: "Pending", count: complianceOverviewStats.pending },
        { name: "Approved", count: complianceOverviewStats.approved },
        { name: "Rejected", count: complianceOverviewStats.rejected },
        { name: "Audit logs", count: null as number | null },
    ];

    const selectedComplianceFilters = useMemo<Record<string, string | undefined>>(
        () => ({
            account_type: filterParams.account_type
                ? filterParams.account_type.charAt(0).toUpperCase() + filterParams.account_type.slice(1)
                : undefined,
            compliance_review_status: filterParams.compliance_review_status
                ? COMPLIANCE_REVIEW_STATUS_LABELS[filterParams.compliance_review_status]
                : undefined,
            dateRange: filterParams.dateRange,
        }),
        [filterParams],
    );

    const handleComplianceFilterChange = useCallback((filterId: string, value: string) => {
        setFilterParams((prevParams) => {
            const updatedParams = { ...prevParams };

            const isDefaultValue =
                value === "" ||
                value.toLowerCase() === "all account types" ||
                value.toLowerCase() === "all statuses" ||
                value.toLowerCase() === "all time";

            if (filterId === "dateRange") {
                delete updatedParams.start;
                delete updatedParams.end;
                delete updatedParams.dateRange;

                if (!isDefaultValue) {
                    updatedParams.dateRange = value;
                    const { start, end } = resolveComplianceDateRange(value);
                    if (start) {
                        updatedParams.start = start;
                    }
                    if (end) {
                        updatedParams.end = end;
                    }
                }

                return updatedParams;
            };

            if (isDefaultValue) {
                delete updatedParams[filterId];
            } else if (filterId === "account_type") {
                updatedParams.account_type = value.toLowerCase();
            } else if (filterId === "compliance_review_status") {
                updatedParams.compliance_review_status = mapComplianceReviewStatusValue(value);
            } else {
                updatedParams[filterId] = value.toLowerCase().trim();
            }

            return updatedParams;
        });
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filterParams.account_type) count++;
        if (filterParams.compliance_review_status) count++;
        if (filterParams.start || filterParams.end) count++;
        return count || 1;
    }, [filterParams]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !complianceReviewsQuery.isFetchingNextPage) {
            void complianceReviewsQuery.fetchNextPage();
        }
    }, [complianceReviewsQuery, hasNextPage]);

    return (
        <div className="w-full space-y-6 py-5 md:p-6 min-h-screen">
            <div className="mx-auto max-w-7xl space-y-6">

                <div className="space-y-4 px-4 md:px-0">
                    <Typography type="text20" fontWeight={700} className="text-slate-900">
                        Overview
                    </Typography>
                    {complianceOverviewQuery.isLoading ? (
                        <StatCardsSkeleton count={3} columnsClassName="grid grid-cols-2 gap-3.5 lg:grid-cols-3" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
                            {COMPLIANCE_OVERVIEW_STAT_CARDS.map((stat) => {
                                const Icon = getAdminIconComponent(stat.iconKey);

                                return (
                                    <div
                                        key={stat.key}
                                        className={`${STAT_CARD_CLASS} p-4`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-col gap-0">
                                                <Typography type="text28" fontWeight={700} className="leading-none text-slate-900">
                                                    {complianceOverviewStats[stat.key]}
                                                </Typography>
                                                <Typography
                                                    type="text14"
                                                    fontWeight={500}
                                                    className="leading-tight text-[#0B0E05A3]"
                                                >
                                                    {stat.label}
                                                </Typography>
                                            </div>
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={`block min-h-[500px] w-full rounded-t-[32px] border-t border-[#0B0E0514] shadow-card md:hidden ${CARD_BG_CLASS}`}>

                    <div className="flex flex-wrap items-center gap-2.5 px-4 pt-5 pb-4 border-b border-[#0B0E0514]">
                        {subTabs.map((tab) => {
                            const isActive = activeTab === tab.name;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`rounded-full px-5 py-2.5 border transition-all duration-150 shrink-0 flex items-center gap-2 ${isActive
                                        ? "border-[#65A30D] bg-[#84CC16]/10 text-[#4D7C0F]"
                                        : "border-[#0B0E0514] text-slate-500 bg-[#FFFFFF]"
                                        }`}
                                >
                                    <Typography type="text14" fontWeight={600}>
                                        {tab.name}
                                    </Typography>
                                    {tab.count != null ? (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                            {formatCount(tab.count)}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2.5 p-4 border-b border-[#0B0E0514]">
                        <SearchInput
                            containerClassName="flex-1"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search people by email..."
                            className="rounded-2xl py-3 focus:border-[#0B0E0514]"
                        />
                        <button
                            type="button"
                            aria-label="Open filters"
                            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card"
                        >
                            <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-card">{activeFiltersCount}</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
                        <AdminAsyncContent
                            isLoading={complianceReviewsQuery.isLoading}
                            isEmpty={tableRows.length === 0}
                            loadingFallback={<ListRowsSkeleton rows={5} />}
                            emptyFallback={<EmptyState title="No compliance reviews found" />}
                        >
                            {tableRows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`p-4 ${LIST_CARD_CLASS} rounded-xl`}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <ProfileAvatar
                                                name={getProfileName(row)}
                                                email={row.email}
                                                imageUrl={row.avatarUrl}
                                                size="lg"
                                            />

                                            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                                                <div className="flex flex-col min-w-0 space-y-1">
                                                    <Typography
                                                        type="text16"
                                                        fontWeight={700}
                                                        className="!text-[#0B0E05] leading-tight"
                                                    >
                                                        {row.name}
                                                    </Typography>
                                                    <Typography
                                                        type="text12"
                                                        fontWeight={600}
                                                        className={`uppercase tracking-[0.04em] ${getAccountTypeTextColor(row.accountType)}`}
                                                    >
                                                        {formatAccountTypeLabel(row.accountType)}
                                                    </Typography>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 ${getReviewStatusBg(row.reviewStatus)}`}
                                                >
                                                    <Typography
                                                        type="text12"
                                                        fontWeight={600}
                                                        className={getReviewStatusTextColor(row.reviewStatus)}
                                                    >
                                                        {formatReviewStatusLabel(row.reviewStatus)}
                                                    </Typography>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <Typography
                                                type="text12"
                                                fontWeight={400}
                                                className="min-w-0 !text-[#0B0E05A3]"
                                            >
                                                Assigned to:{" "}
                                                <span className="font-semibold !text-[#0B0E05]">
                                                    {row.assignedTo}
                                                </span>
                                            </Typography>
                                            <Typography
                                                type="text12"
                                                fontWeight={500}
                                                className="shrink-0 whitespace-nowrap !text-[#0B0E05]"
                                            >
                                                {row.dateSubmitted}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </AdminAsyncContent>
                    </div>

                    {!complianceReviewsQuery.isLoading && tableRows.length > 0 ? (
                        <ComplianceLoadMoreButton
                            hasNext={hasNextPage}
                            isLoading={complianceReviewsQuery.isFetchingNextPage}
                            onClick={handleLoadMore}
                        />
                    ) : null}
                </div>

                <div className={`hidden pt-2 md:block ${PANEL_CARD_SHELL_CLASS}`}>
                    <div className={PANEL_CARD_CLASS}>

                        <div className="flex items-center gap-8 px-6 border-b border-[#0B0E0514] whitespace-nowrap">
                            {subTabs.map((tab) => {
                                const isActive = activeTab === tab.name;
                                return (
                                    <button
                                        key={tab.name}
                                        onClick={() => setActiveTab(tab.name)}
                                        className={`relative py-4 transition-colors shrink-0 flex items-center gap-2 ${isActive ? "text-[#65A30D]" : "text-slate-500 hover:text-slate-800"
                                            }`}
                                    >
                                        <Typography type="text14" fontWeight={isActive ? 600 : 500}>
                                            {tab.name}
                                        </Typography>
                                        {tab.count != null ? (
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                                {formatCount(tab.count)}
                                            </span>
                                        ) : null}
                                        {isActive && (
                                            <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#65A30D] rounded-t-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6 border-b border-[#0B0E0514]">
                            <div className={`p-4 ${SECTION_CARD_CLASS}`}>
                                <ComplianceFilters
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    filters={COMPLIANCE_FILTER_BLUEPRINTS}
                                    selectedValues={selectedComplianceFilters}
                                    onFilterChange={handleComplianceFilterChange}
                                />
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full min-w-[960px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A]">
                                        {["S/N", "User", "Account type", "Date submitted", "Assigned to", "Review status", ""].map((head, index) => (
                                            <th key={index} className="px-6 py-4.5">
                                                <Typography type="text14" fontWeight={600} className="text-slate-700 whitespace-nowrap">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#0B0E0529]">
                                    <AdminAsyncContent
                                        isLoading={complianceReviewsQuery.isLoading}
                                        isEmpty={tableRows.length === 0}
                                        loadingFallback={
                                            <tr>
                                                <td colSpan={7}>
                                                    <DataTableSkeleton rows={6} columns={7} />
                                                </td>
                                            </tr>
                                        }
                                        emptyFallback={
                                            <tr>
                                                <td colSpan={7}>
                                                    <EmptyState title="No compliance reviews found" />
                                                </td>
                                            </tr>
                                        }
                                    >
                                        {tableRows.map((row, index, array) => {
                                            const isNearBottom = index >= array.length - 2;

                                            return (
                                                <tr key={row.id} className="hover:bg-[#0B0E050A] transition-colors">
                                                    <td className="px-6 py-4.5 w-12">
                                                        <Typography type="text14" fontWeight={700} className="text-slate-900">{row.sn}</Typography>
                                                    </td>

                                                    <td className="px-6 py-4.5">
                                                        <div className="flex items-center gap-3">
                                                            <ProfileAvatar
                                                                name={getProfileName(row)}
                                                                email={row.email}
                                                                imageUrl={row.avatarUrl}
                                                                size="sm"
                                                            />
                                                            <Typography type="text14" fontWeight={600} className="text-slate-800 whitespace-nowrap">
                                                                {row.name}
                                                            </Typography>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4.5">
                                                        <span className={`inline-block rounded-md px-2.5 py-0.5 ${getAccountTypeBg(row.accountType)}`}>
                                                            <Typography
                                                                type="text12"
                                                                fontWeight={600}
                                                                className={getAccountTypeTextColor(row.accountType)}
                                                            >
                                                                {row.accountType}
                                                            </Typography>
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4.5">
                                                        <Typography type="text14" fontWeight={500} className="text-slate-600 whitespace-nowrap">
                                                            {row.dateSubmitted}
                                                        </Typography>
                                                    </td>

                                                    <td className="px-6 py-4.5">
                                                        <Typography type="text14" fontWeight={500} className="text-slate-600 whitespace-nowrap">
                                                            {row.assignedTo}
                                                        </Typography>
                                                    </td>

                                                    <td className="px-6 py-4.5">
                                                        <span className={`inline-block rounded-md px-2.5 py-0.5 ${getReviewStatusBg(row.reviewStatus)}`}>
                                                            <Typography
                                                                type="text12"
                                                                fontWeight={600}
                                                                className={getReviewStatusTextColor(row.reviewStatus)}
                                                            >
                                                                {formatReviewStatusLabel(row.reviewStatus)}
                                                            </Typography>
                                                        </span>
                                                    </td>

                                                    <td className="relative w-16 px-6 py-4.5 text-right">
                                                        <ComplianceActionMenu
                                                            userId={row.id}
                                                            accountType={row.accountType}
                                                            isOpen={openActionId === row.id}
                                                            onToggle={() => setOpenActionId(openActionId === row.id ? null : row.id)}
                                                            onClose={() => setOpenActionId(null)}
                                                            placement={isNearBottom ? "bottom" : "top"}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </AdminAsyncContent>
                                </tbody>
                            </table>
                        </div>

                        {!complianceReviewsQuery.isLoading && tableRows.length > 0 ? (
                            <ComplianceLoadMoreButton
                                hasNext={hasNextPage}
                                isLoading={complianceReviewsQuery.isFetchingNextPage}
                                onClick={handleLoadMore}
                            />
                        ) : null}

                    </div>
                </div>
            </div>
        </div>
    );
}
