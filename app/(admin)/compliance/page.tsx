"use client";

import ComplianceActionMenu from "@/components/compliance-action-menu";
import ComplianceFilters, {
    COMPLIANCE_FILTER_BLUEPRINTS,
    type ComplianceFilterConfig,
} from "@/components/compliance-filters";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import { CARD_BG_CLASS, LIST_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, SECTION_CARD_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
import {
    CheckCircleIcon,
    HourglassIcon,
    SlidersHorizontalIcon,
    TimerClockIcon,
    XCircleIcon,
} from "@/components/vector";
import React, { useMemo, useState } from "react";

interface ComplianceRow {
    sn: string;
    name: string;
    avatarBg: string;
    avatarText: string;
    accountType: "Seller" | "Buyer";
    dateSubmitted: string;
    assignedTo: string;
    reviewStatus: "Pending" | "In Review" | "Needs info";
}

const DEFAULT_FILTER_VALUES = {
    accountType: "All account types",
    reviewStatus: "All statuses",
    dateRange: "All time",
    assignedTo: "Everyone",
} as const;

function getAccountTypeBg(accountType: ComplianceRow["accountType"]) {
    switch (accountType) {
        case "Buyer":
            return "bg-[#00A34114]";
        case "Seller":
            return "bg-[#DC680314]";
    }
}

function getAccountTypeTextColor(accountType: ComplianceRow["accountType"]) {
    switch (accountType) {
        case "Buyer":
            return "!text-[#00A341]";
        case "Seller":
            return "!text-[#DC6803]";
    }
}

function formatAccountTypeLabel(accountType: ComplianceRow["accountType"]) {
    return accountType === "Buyer" ? "BUYER ACCOUNT" : "SELLER ACCOUNT";
}

function formatReviewStatusLabel(status: ComplianceRow["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "Pending";
        case "In Review":
            return "In review";
        case "Needs info":
            return "Needs info";
    }
}

function getReviewStatusBg(status: ComplianceRow["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "bg-[#DC680314]";
        case "In Review":
            return "bg-[#0B0E050A]";
        case "Needs info":
            return "bg-[#1A1AFF14]";
    }
}

function getReviewStatusTextColor(status: ComplianceRow["reviewStatus"]) {
    switch (status) {
        case "Pending":
            return "!text-[#DC6803]";
        case "In Review":
            return "!text-[#0B0E05CC]";
        case "Needs info":
            return "!text-[#1A1AFF]";
    }
}

export default function ComplianceBody() {
    const [activeTab, setActiveTab] = useState<string>("Pending");
    const [openActionSn, setOpenActionSn] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
        ...DEFAULT_FILTER_VALUES,
    });

    const complianceStats = [
        {
            label: "Pending reviews",
            value: "0",
            iconBg: "bg-[#DC680314]",
            iconColor: "text-[#DC6803]",
            icon: HourglassIcon,
            iconClassName: "h-5 w-[14px]",
        },
        {
            label: "Approved users",
            value: "0",
            iconBg: "bg-[#00A34114]",
            iconColor: "text-[#00A341]",
            icon: CheckCircleIcon,
            iconClassName: "h-5 w-5",
        },
        {
            label: "Rejected users",
            value: "0",
            iconBg: "bg-[#CC292914]",
            iconColor: "text-[#CC2929]",
            icon: XCircleIcon,
            iconClassName: "h-5 w-5",
        },
        {
            label: "Overdue documents",
            value: "0",
            iconBg: "bg-[#009D9D14]",
            iconColor: "text-[#009D9D]",
            icon: TimerClockIcon,
            iconClassName: "h-5 w-5",
        },
    ];

    const subTabs = [
        { name: "Pending" },
        { name: "Approved" },
        { name: "Rejected" },
        { name: "Audit logs" }
    ];

    const mockTableRows: ComplianceRow[] = [
        { sn: "1.", name: "John Peters", avatarBg: "bg-slate-200 text-slate-700", avatarText: "JP", accountType: "Seller", dateSubmitted: "Oct 8, 2025", assignedTo: "Sarah Chen", reviewStatus: "Pending" },
        { sn: "2.", name: "Mary Lynch", avatarBg: "bg-amber-100 text-amber-800", avatarText: "ML", accountType: "Buyer", dateSubmitted: "Oct 8, 2025", assignedTo: "Sarah Chen", reviewStatus: "Pending" },
        { sn: "3.", name: "Sarah Swaty", avatarBg: "bg-emerald-100 text-emerald-800", avatarText: "SS", accountType: "Buyer", dateSubmitted: "Oct 8, 2025", assignedTo: "Sarah Chen", reviewStatus: "In Review" },
        { sn: "4.", name: "Connel McAnthony", avatarBg: "bg-sky-100 text-sky-800", avatarText: "CM", accountType: "Seller", dateSubmitted: "Oct 8, 2025", assignedTo: "Sarah Chen", reviewStatus: "In Review" },
        { sn: "5.", name: "John McCarthy", avatarBg: "bg-rose-100 text-rose-800", avatarText: "JM", accountType: "Seller", dateSubmitted: "Oct 8, 2025", assignedTo: "Sarah Chen", reviewStatus: "Pending" },
    ];

    const filterConfigs = useMemo<ComplianceFilterConfig[]>(() => {
        const assignees = Array.from(new Set(mockTableRows.map((row) => row.assignedTo)));

        return COMPLIANCE_FILTER_BLUEPRINTS.map((filter) =>
            filter.id === "assignedTo"
                ? { ...filter, options: ["Everyone", ...assignees] }
                : filter
        );
    }, []);

    const filteredTableRows = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return mockTableRows.filter((row) => {
            if (normalizedSearch && !row.name.toLowerCase().includes(normalizedSearch)) {
                return false;
            }

            if (
                selectedFilters.accountType !== DEFAULT_FILTER_VALUES.accountType &&
                row.accountType !== selectedFilters.accountType
            ) {
                return false;
            }

            if (
                selectedFilters.reviewStatus !== DEFAULT_FILTER_VALUES.reviewStatus &&
                row.reviewStatus !== selectedFilters.reviewStatus
            ) {
                return false;
            }

            if (
                selectedFilters.assignedTo !== DEFAULT_FILTER_VALUES.assignedTo &&
                row.assignedTo !== selectedFilters.assignedTo
            ) {
                return false;
            }

            return true;
        });
    }, [mockTableRows, searchQuery, selectedFilters]);

    const handleFilterChange = (filterId: string, value: string) => {
        setSelectedFilters((current) => ({ ...current, [filterId]: value }));
    };

    return (
        <div className="w-full space-y-6 py-5 md:p-6 min-h-screen">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* =========================================================================
                TOP STATS SUMMARY CARDS
                ========================================================================= */}
                <div className="space-y-4 px-4 md:px-0">
                    <Typography type="text20" fontWeight={700} className="text-slate-900">
                        Overview
                    </Typography>
                    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                        {complianceStats.map((stat, idx) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={idx}
                                    className={`${STAT_CARD_CLASS} p-4`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 flex-col gap-0">
                                            <Typography type="text28" fontWeight={700} className="leading-none text-slate-900">
                                                {stat.value}
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
                                            <Icon className={`${stat.iconClassName} ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* =========================================================================
                MOBILE WORKFLOW CONTAINER (Completely Full-Width)
                ========================================================================= */}
                <div className={`block min-h-[500px] w-full rounded-t-[32px] border-t border-[#0B0E0514] shadow-card md:hidden ${CARD_BG_CLASS}`}>

                    {/* Navigation Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 px-4 pt-5 pb-4 border-b border-[#0B0E0514]">
                        {subTabs.map((tab) => {
                            const isActive = activeTab === tab.name;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`rounded-full px-5 py-2.5 border transition-all duration-150 shrink-0 ${isActive
                                        ? "border-[#65A30D] bg-[#84CC16]/10 text-[#4D7C0F]"
                                        : "border-[#0B0E0514] text-slate-500 bg-[#FFFFFF]"
                                        }`}
                                >
                                    <Typography type="text14" fontWeight={600}>
                                        {tab.name}
                                    </Typography>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Search Inputs */}
                    <div className="flex items-center gap-2.5 p-4 border-b border-[#0B0E0514]">
                        <SearchInput
                            containerClassName="flex-1"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search people by name..."
                            className="rounded-2xl py-3 focus:border-[#0B0E0514]"
                        />
                        <button
                            type="button"
                            aria-label="Open filters"
                            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card"
                        >
                            <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-card">1</span>
                        </button>
                    </div>

                    {/* Mobile Card List */}
                    <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
                        {filteredTableRows.map((row) => (
                            <div
                                key={row.sn}
                                className={`p-4 ${LIST_CARD_CLASS} rounded-xl`}
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold ${row.avatarBg}`}
                                        >
                                            <Typography type="text12" fontWeight={700}>
                                                {row.avatarText}
                                            </Typography>
                                        </div>

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
                    </div>
                </div>

                {/* =========================================================================
                DESKTOP CONTAINER VIEW
                ========================================================================= */}
                <div className={`hidden pt-2 md:block ${PANEL_CARD_SHELL_CLASS}`}>
                    <div className={PANEL_CARD_CLASS}>

                    {/* Desktop Underlined Navigation Tabs */}
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
                                    {isActive && (
                                        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#65A30D] rounded-t-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter Action Group Layout */}
                    <div className="p-6 border-b border-[#0B0E0514]">
                        <div className={`p-4 ${SECTION_CARD_CLASS}`}>
                            <ComplianceFilters
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                filters={filterConfigs}
                                selectedValues={selectedFilters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Desktop Matrix Structure Data Table */}
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
                                {filteredTableRows.map((row, index, array) => {
                                    const isNearBottom = index >= array.length - 2;

                                    return (
                                        <tr key={row.sn} className="hover:bg-[#0B0E050A] transition-colors">
                                            <td className="px-6 py-4.5 w-12">
                                                <Typography type="text14" fontWeight={700} className="text-slate-900">{row.sn}</Typography>
                                            </td>

                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${row.avatarBg}`}>
                                                        <Typography type="text12" fontWeight={700}>{row.avatarText}</Typography>
                                                    </div>
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
                                                        {row.reviewStatus}
                                                    </Typography>
                                                </span>
                                            </td>

                                            <td className="relative w-16 px-6 py-4.5 text-right">
                                                <ComplianceActionMenu
                                                    isOpen={openActionSn === row.sn}
                                                    onToggle={() => setOpenActionSn(openActionSn === row.sn ? null : row.sn)}
                                                    onClose={() => setOpenActionSn(null)}
                                                    placement={isNearBottom ? "bottom" : "top"}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    </div>
                </div>
            </div>
        </div>
    );
}