"use client";

import { EmptyState } from "@/components/empty-state";
import { ProfileAvatar } from "@/components/profile-avatar";
import RfqActionMenu from "@/components/rfq-action-menu";
import { AdminAsyncContent, AdminQueryState, DataTableSkeleton, ListRowsSkeleton } from "@/components/skeletons";
import Typography from "@/components/typography";
import { useAdminRfqs, useAdminRfqTabCounts } from "@/lib/admin/hooks";
import { LIST_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS } from "@/lib/card-styles";
import { formatCount } from "@/lib/format-count";
import type { AdminRfqTabStatus } from "@/lib/rfq/constants/admin-rfqs-api.constant";
import {
    formatAdminRfqBudget,
    formatAdminRfqDate,
} from "@/lib/rfq/utilities/map-admin-rfq-api-record";
import React, { useState } from "react";

export default function BuyerRFQsBody() {
    const [activeTab, setActiveTab] = useState<AdminRfqTabStatus>("pending");
    const [openActionId, setOpenActionId] = useState<string | null>(null);

    const rfqsQuery = useAdminRfqs(activeTab);
    const rfqTabCounts = useAdminRfqTabCounts();
    const rfqRows = rfqsQuery.data?.rfqs ?? [];

    const RFQ_TABS: ReadonlyArray<{ id: AdminRfqTabStatus; name: string; count: number }> = [
        { id: "pending", name: "Pending", count: rfqTabCounts.pending ?? 0 },
        { id: "resolved", name: "Resolved", count: rfqTabCounts.resolved ?? 0 },
    ];

    return (
        <div className="w-full space-y-5 p-4 md:p-6 min-h-screen">
            <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">

                {/* =========================================================================
                MOBILE ONLY NAVIGATION PILLS VIEW (Matches Buyer-RFQs 2_2.png)
                ========================================================================= */}
                <div className="flex md:hidden items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
                    {RFQ_TABS.map((tab) => {
                        const isCurrent = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-full px-5 py-2.5 border transition-all duration-200 shrink-0 flex items-center gap-2 ${isCurrent
                                    ? "border-[#65A30D] bg-[#84CC16]/10 text-[#4D7C0F]"
                                    : "border-[#0B0E0514] bg-[#FFFFFF] text-slate-500"
                                    }`}
                            >
                                <Typography type="text14" className={`${isCurrent ? 'text-[#518300]' : ''}`} fontWeight={600}>
                                    {tab.name}
                                </Typography>
                                {tab.count > 0 ? (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                        {formatCount(tab.count)}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {/* =========================================================================
                MOBILE独立 CARDS CONTAINER (Matches Buyer-RFQs 2_2.png layout structure)
                ========================================================================= */}
                <div className="block md:hidden space-y-3">
                    <AdminQueryState isError={rfqsQuery.isError} onRetry={() => void rfqsQuery.refetch()}>
                        <AdminAsyncContent
                            isLoading={rfqsQuery.isLoading}
                            isEmpty={rfqRows.length === 0}
                            loadingFallback={<ListRowsSkeleton rows={5} />}
                            emptyFallback={<EmptyState title="No RFQs found" />}
                        >
                            {rfqRows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`flex w-full items-center justify-between gap-4 p-4 ${LIST_CARD_CLASS} rounded-xl`}
                                >
                                    {/* Profile Info Setup */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <ProfileAvatar
                                            name={row.user.firstName ?? ""}
                                            initials={row.user.firstName.charAt(0)}
                                            imageUrl={row.user.profilePicture}
                                            isLoading={false}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <Typography type="text16" fontWeight={600} className="text-slate-900 truncate">
                                                {row.user.firstName} {row.user.lastName}
                                            </Typography>
                                            <Typography type="text14" fontWeight={500} className="text-slate-500 mt-0.5 truncate">
                                                {getCategoryLabel(row.category)}
                                            </Typography>
                                        </div>
                                    </div>

                                    {/* Metric and Timeline Data Right-aligned Side */}
                                    <div className="flex flex-col text-right shrink-0">
                                        <Typography type="text16" fontWeight={600} className="text-slate-900">
                                            {formatAdminRfqBudget(row.minPrice, row.maxPrice)}
                                        </Typography>
                                        <Typography type="text12" fontWeight={500} className="text-slate-400 mt-0.5">
                                            {formatAdminRfqDate(row.resolvedAt || row.createdAt)}
                                        </Typography>
                                    </div>
                                </div>
                            ))}
                        </AdminAsyncContent>
                    </AdminQueryState>

                    {/* Centered Mobile Inline Load More Trigger Box */}
                    <div className="pt-4 flex justify-center w-full">
                        <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 px-6 py-3 w-auto transition-colors">
                            <Typography type="text14" fontWeight={600} className="text-slate-800">
                                Load more
                            </Typography>
                            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* =========================================================================
                DESKTOP DATA TABLE BOX VIEW (Hidden completely on mobile viewports)
                ========================================================================= */}
                <div className={`hidden pt-2 md:block ${PANEL_CARD_SHELL_CLASS}`}>
                    <div className={PANEL_CARD_CLASS}>
                        {/* Desktop Tab Rules Switcher */}
                        <div className="flex items-center whitespace-nowrap border-b border-[#0B0E0514]">
                            {RFQ_TABS.map((tab) => {
                                const isCurrent = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative py-3 px-6 transition-colors shrink-0 flex items-center gap-2 ${isCurrent ? "text-[#65A30D]" : "text-slate-500 hover:text-slate-800"
                                            }`}
                                    >
                                        <Typography type="text14" fontWeight={isCurrent ? 600 : 500}>
                                            {tab.name}
                                        </Typography>
                                        {tab.count > 0 ? (
                                            <span className="rounded-md bg-[#CC2929] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                                                {formatCount(tab.count)}
                                            </span>
                                        ) : null}
                                        <div className={`${isCurrent ? "bg-[#65A30D]" : "bg-transparent"} absolute bottom-0 inset-x-0 h-[2.5px] rounded-t-full`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop Matrix Structure Table */}
                        <AdminQueryState isError={rfqsQuery.isError} onRetry={() => void rfqsQuery.refetch()}>
                            <AdminAsyncContent
                                isLoading={rfqsQuery.isLoading}
                                isEmpty={rfqRows.length === 0}
                                loadingFallback={<DataTableSkeleton rows={6} columns={6} />}
                                emptyFallback={<EmptyState title="No RFQs found" />}
                            >
                                <div className="w-full overflow-x-auto scrollbar-thin">
                                    <table className="w-full min-w-[1000px] border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A]">
                                                {[
                                                    { text: "S/N", className: "pl-6 pr-1 w-12" },
                                                    { text: "Buyer", className: "pl-1 pr-6 w-48" },
                                                    { text: "Budget", className: "px-6 w-40" },
                                                    { text: "Category", className: "px-6 w-44" },
                                                    { text: "Date", className: "px-6 w-28" },
                                                    { text: "Description or requirements", className: "px-6 flex-1" },
                                                    { text: "", className: "px-6 w-20" }
                                                ].map((head, index) => (
                                                    <th key={index} className={`py-4.5 ${head.className}`}>
                                                        <Typography type="text14" fontWeight={600} className="text-slate-700 whitespace-nowrap">
                                                            {head.text}
                                                        </Typography>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#0B0E0514]">
                                            {rfqRows.map((row, index, array) => {
                                                const isNearBottom = index >= array.length - 3;

                                                return (
                                                    <tr key={row.id} className="hover:bg-[#0B0E050A] transition-colors">
                                                        <td className="pl-6 pr-1 py-4.5">
                                                            <Typography type="text14" fontWeight={700}>
                                                                {index + 1}
                                                            </Typography>
                                                        </td>

                                                        <td className="pl-1 pr-6 py-4.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="relative h-8 w-8 items-center justify-center shrink-0 rounded-full overflow-hidden bg-slate-100 shadow-card">
                                                                    <ProfileAvatar
                                                                        name={row.user.firstName ?? ""}
                                                                        initials={row.user.firstName.charAt(0)}
                                                                        imageUrl={row.user.profilePicture}
                                                                        isLoading={false}
                                                                    />
                                                                </div>
                                                                <Typography type="text14" fontWeight={600} className="whitespace-nowrap">
                                                                    {row.user.firstName} {row.user.lastName}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4.5">
                                                            <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                                {formatAdminRfqBudget(row.minPrice, row.maxPrice)}
                                                            </Typography>
                                                        </td>

                                                        <td className="px-6 py-4.5">
                                                            <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                                {getCategoryLabel(row.category)}
                                                            </Typography>
                                                        </td>

                                                        <td className="px-6 py-4.5">
                                                            <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                                {formatAdminRfqDate(row.resolvedAt || row.createdAt)}
                                                            </Typography>
                                                        </td>

                                                        <td className="px-6 py-4.5 max-w-xs xl:max-w-[100px]">
                                                            <Typography
                                                                type="text14"
                                                                fontWeight={500}
                                                                truncate={true}
                                                                lines={1}
                                                                maxLength={10}
                                                                className=""
                                                            >
                                                                {row.description}
                                                            </Typography>
                                                        </td>

                                                        <td className="relative px-6 py-4.5 text-right">
                                                            <RfqActionMenu
                                                                details={row}
                                                                isOpen={openActionId === row.id}
                                                                onToggle={() =>
                                                                    setOpenActionId(openActionId === row.id ? null : row.id)
                                                                }
                                                                onClose={() => setOpenActionId(null)}
                                                                placement={isNearBottom ? "bottom" : "top"}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </AdminAsyncContent>
                        </AdminQueryState>

                        {/* Desktop Table Pagination Control Footer */}
                        <div className="flex items-center justify-center rounded-b-2xl border-t border-[#0B0E0514] bg-[#FFFFFF] py-5">
                            <button className={`${rfqsQuery.data?.hasNext ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'} flex items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-5 py-2 shadow-card transition-colors hover:bg-[#0B0E050A]`}>
                                <Typography type="text14" fontWeight={600} className="text-slate-700">
                                    See more
                                </Typography>
                                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function getCategoryLabel(value: string): string {
    const CATEGORY_MAP: Record<string, string> = {
        GML: "General Merchandise / Mixed Lots",
        ELT: "Electronics",
        AFW: "Apparel & Footwear",
        HKN: "Home & Kitchen",
        HBY: "Health & Beauty",
        TBY: "Toys & Baby",
    };

    return CATEGORY_MAP[value] || "---";
}