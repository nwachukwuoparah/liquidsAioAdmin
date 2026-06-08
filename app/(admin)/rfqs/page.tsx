"use client";

import RfqActionMenu from "@/components/rfq-action-menu";
import Typography from "@/components/typography";
import { CARD_BG_CLASS, LIST_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS } from "@/lib/card-styles";
import { formatCount } from "@/lib/format-count";
import React, { useState } from "react";

interface RFQRow {
    sn: string;
    name: string;
    avatarUrl: string;
    avatarFallbackBg: string;
    avatarText: string;
    budget: string;
    category: string;
    date: string;
    mobileTime: string;
    description: string;
}

export default function BuyerRFQsBody() {
    const [activeTab, setActiveTab] = useState<"Pending" | "Resolved">("Pending");
    const [openActionSn, setOpenActionSn] = useState<string | null>(null);

    const tabs = [
        { id: "Pending", name: "Pending", count: 109 },
        { id: "Resolved", name: "Resolved", count: 4 },
    ] as const;

    const mockRFQs: RFQRow[] = [
        { sn: "1.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-slate-200 text-slate-700", avatarText: "JP", budget: "$5,000 - $7,000", category: "Electronics", date: "Today", mobileTime: "2 mins ago", description: "Looking for 5–10 pallets of mixed electronics (headphones, Bluetooth speakers, and soundbars)." },
        { sn: "2.", name: "Mary Lynch", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-amber-100 text-amber-800", avatarText: "ML", budget: "$4,000 - $6,000", category: "Electronics", date: "Yesterday", mobileTime: "Yesterday", description: "Seeking 3-7 pallets of mixed clothing (shirts, pants, dresses). Looking for premium quality retail overstocks." },
        { sn: "3.", name: "Sarah Swaty", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-emerald-100 text-emerald-800", avatarText: "SS", budget: "$7,000 - $9,000", category: "Electronics", date: "Oct 8, 2025", mobileTime: "Oct 8, 2025", description: "Seeking 8-12 pallets of mixed apparel (shirts, pants, dresses). Looking for brand new condition items." },
        { sn: "4.", name: "Connel McAnthony", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-rose-100 text-rose-800", avatarText: "CM", budget: "$8,000 - $10,000", category: "Electronics", date: "Oct 9, 2025", mobileTime: "Oct 9, 2025", description: "Needing 12-15 pallets of mixed home goods (furniture, decor, appliances, cooking utensils) for warehouse inventory restocking." },
        { sn: "5.", name: "John McCarthy", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-blue-100 text-blue-800", avatarText: "JM", budget: "$5,000 - $7,000", category: "Electronics", date: "Oct 9, 2025", mobileTime: "Oct 9, 2025", description: "Requesting 3-5 pallets of mixed health and beauty items (cosmetics, skincare, haircare items) with clean retail packaging." },
        { sn: "6.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-purple-100 text-purple-800", avatarText: "JP", budget: "$5,000 - $7,000", category: "Electronics", date: "Oct 10, 2025", mobileTime: "Oct 10, 2025", description: "Wanting 7-11 pallets of mixed toys and baby items (toys, diapers, strollers). Needed urgently for the upcoming holiday rush." },
        { sn: "7.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-indigo-100 text-indigo-800", avatarText: "JP", budget: "$8,000 - $10,000", category: "Electronics", date: "Oct 10, 2025", mobileTime: "Oct 10, 2025", description: "Acquiring 10-14 pallets of mixed automotive parts (tires, batteries, accessories, and maintenance fluids)." }
    ];

    return (
        <div className="w-full space-y-5 p-4 md:p-6 min-h-screen">
            <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">

                {/* =========================================================================
                MOBILE ONLY NAVIGATION PILLS VIEW (Matches Buyer-RFQs 2_2.png)
                ========================================================================= */}
                <div className="flex md:hidden items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
                    {tabs.map((tab) => {
                        const isCurrent = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-full px-5 py-2.5 border transition-all duration-200 shrink-0 ${isCurrent
                                    ? "border-[#65A30D] bg-[#84CC16]/10 text-[#4D7C0F]"
                                    : "border-[#0B0E0514] bg-[#FFFFFF] text-slate-500"
                                    }`}
                            >
                                <Typography type="text14" className={`${isCurrent ? 'text-[#518300]' : ''}`} fontWeight={600}>
                                    {tab.name}{" "}
                                    {tab.count != null && `(${formatCount(tab.count)})`}
                                </Typography>
                            </button>
                        );
                    })}
                </div>

                {/* =========================================================================
                MOBILE独立 CARDS CONTAINER (Matches Buyer-RFQs 2_2.png layout structure)
                ========================================================================= */}
                <div className="block md:hidden space-y-3">
                    {mockRFQs.map((row) => (
                        <div
                            key={row.sn}
                            className={`flex w-full items-center justify-between gap-4 p-4 ${LIST_CARD_CLASS} rounded-xl`}
                        >
                            {/* Profile Info Setup */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-slate-100">
                                    {row.avatarUrl ? (
                                        <img
                                            src={row.avatarUrl}
                                            alt={row.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = "none";
                                            }}
                                        />
                                    ) : null}
                                    <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${row.avatarFallbackBg}`}>
                                        <Typography type="text12" fontWeight={700}>{row.avatarText}</Typography>
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <Typography type="text16" fontWeight={600} className="text-slate-900 truncate">
                                        {row.name}
                                    </Typography>
                                    <Typography type="text14" fontWeight={500} className="text-slate-500 mt-0.5 truncate">
                                        {row.category}
                                    </Typography>
                                </div>
                            </div>

                            {/* Metric and Timeline Data Right-aligned Side */}
                            <div className="flex flex-col text-right shrink-0">
                                <Typography type="text16" fontWeight={600} className="text-slate-900">
                                    {row.budget}
                                </Typography>
                                <Typography type="text12" fontWeight={500} className="text-slate-400 mt-0.5">
                                    {row.mobileTime}
                                </Typography>
                            </div>
                        </div>
                    ))}

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
                    <div className="flex items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6">
                        {tabs.map((tab) => {
                            const isCurrent = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-4 transition-colors shrink-0 flex items-center gap-2 ${isCurrent ? "text-[#65A30D]" : "text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    <Typography type="text14" fontWeight={isCurrent ? 600 : 500}>
                                        {tab.name}
                                    </Typography>
                                    {tab.count != null && (
                                        <span className="rounded-md bg-[#CC2929] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                                            {formatCount(tab.count)}
                                        </span>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#65A30D] rounded-t-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop Matrix Structure Table */}
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
                                {mockRFQs.map((row, index, array) => {
                                    const isNearBottom = index >= array.length - 3;

                                    return (
                                        <tr key={row.sn} className="hover:bg-[#0B0E050A] transition-colors">
                                            <td className="pl-6 pr-1 py-4.5">
                                                <Typography type="text14" fontWeight={700}>
                                                    {row.sn}
                                                </Typography>
                                            </td>

                                            <td className="pl-1 pr-6 py-4.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-slate-100 shadow-card">
                                                        {row.avatarUrl ? (
                                                            <img
                                                                src={row.avatarUrl}
                                                                alt={row.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.display = "none";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${row.avatarFallbackBg}`}>
                                                            <Typography type="text12" fontWeight={700}>{row.avatarText}</Typography>
                                                        </div>
                                                    </div>
                                                    <Typography type="text14" fontWeight={600} className="whitespace-nowrap">
                                                        {row.name}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4.5">
                                                <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                    {row.budget}
                                                </Typography>
                                            </td>

                                            <td className="px-6 py-4.5">
                                                <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                    {row.category}
                                                </Typography>
                                            </td>

                                            <td className="px-6 py-4.5">
                                                <Typography type="text14" fontWeight={500} className="whitespace-nowrap">
                                                    {row.date}
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

                    {/* Desktop Table Pagination Control Footer */}
                    <div className="flex items-center justify-center rounded-b-2xl border-t border-[#0B0E0514] bg-[#FFFFFF] py-5">
                        <button className="flex items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-5 py-2 shadow-card transition-colors hover:bg-[#0B0E050A]">
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