"use client";

import React, { useState } from "react";
import PeriodDropdown, { type PeriodOption } from "@/components/period-dropdown";
import Typography from "@/components/typography";
import GmvOrdersTrendChart from "@/components/overview/gmv-orders-trend-chart";
import TopCategoriesChart from "@/components/overview/top-categories-chart";
import { BANNER_CARD_CLASS, CARD_BG_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
import {
    ArrowSquareOutIcon,
    ArrowsClockwiseIcon,
    BellIcon,
    ClockIcon,
    CloudArrowDownIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    UserCheckIcon,
    UserMinusIcon,
    UserPlusIcon,
    UserSwitchIcon,
    WarningIcon,
} from "@/components/vector";

export default function OverviewPage() {
    const [quickStatsPeriod, setQuickStatsPeriod] = useState<PeriodOption>("This month");
    const [engagementStatsPeriod, setEngagementStatsPeriod] = useState<PeriodOption>("This month");

    const quickStats = [
        {
            label: "Total GMV",
            value: "$2,400,501",
            change: "+12% vs last month",
            changeColor: "text-[#00A341]",
            iconBg: "bg-[#DC6803]/10",
            iconColor: "text-[#DC6803]",
            icon: CurrencyDollarIcon,
        },
        {
            label: "Active orders",
            value: "1,247",
            change: "+27% vs last month",
            changeColor: "text-[#00A341]",
            iconBg: "bg-[#1A1AFF]/10",
            iconColor: "text-[#1A1AFF]",
            icon: ShoppingCartIcon,
        },
        {
            label: "Verified sellers",
            value: "892",
            change: "+10% vs last month",
            changeColor: "text-[#00A341]",
            iconBg: "bg-[#00A341]/10",
            iconColor: "text-[#00A341]",
            icon: UserCheckIcon,
        },
        {
            label: "New buyer signups",
            value: "3,023",
            change: "+14% vs last month",
            changeColor: "text-[#00A341]",
            iconBg: "bg-[#BE02BE]/10",
            icon: UserPlusIcon,
        },
        {
            label: "Open disputes",
            value: "12",
            change: "-6% vs last month",
            changeColor: "text-[#CC2929]",
            iconBg: "bg-[#CC2929]/10",
            icon: WarningIcon,
        },
    ];

    const engagementStats = [
        {
            label: "Daily active users",
            value: "0",
            changeColor: "text-[#0B0E05A3]",
            iconBg: "bg-[#009D9D]/10",
            iconColor: "text-[#009D9D]",
            icon: UserCheckIcon,
        },
        {
            label: "Monthly active users",
            value: "0",
            changeColor: "text-[#0B0E05A3]",
            iconBg: "bg-[#DC6803]/10",
            iconColor: "text-[#DC6803]",
            icon: UserCheckIcon,
        },
        {
            label: "Avg. session duration",
            value: "-- mins",
            changeColor: "text-[#0B0E05A3]",
            iconBg: "bg-[#00A34114]",
            iconColor: "text-[#1A1AFF]",
            icon: ClockIcon,
        },
        {
            label: "Return user rate",
            value: "--%",
            changeColor: "text-[#0B0E05A3]",
            iconBg: "bg-[#00A34114]",
            iconColor: "text-[#00A341]",
            icon: UserSwitchIcon,
        },
        {
            label: "Churn rate",
            value: "--%",
            changeColor: "text-[#0B0E05A3]",
            iconBg: "bg-[#BE02BE14]",
            iconColor: "text-[#BE02BE]",
            icon: UserMinusIcon,
        },
    ];

    return (
        <div className="mx-auto w-full space-y-8 p-5">

            {/* =========================================================================
          TOP MONITORING STATUS BANNER
          ========================================================================= */}
            <div className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${BANNER_CARD_CLASS}`}>
                <div className="flex items-center gap-2.5">
                    {/* Pulsing online status ring indicator element wrapper */}
                    <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1.5">
                        <Typography fontWeight={500} className="text-[#0B0E05] text-[18px] italic">
                            Real-time monitoring is Live •
                        </Typography>
                        <Typography fontWeight={400} className="text-[#0B0E05] text-[18px] italic">
                            Last updated: 1:02:05 PM
                        </Typography>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">
                    <button className={`flex items-center gap-2 rounded-[13px] border border-[#0B0E0514] px-4 py-2 transition-hover hover:bg-slate-50 ${CARD_BG_CLASS}`}>
                        <CloudArrowDownIcon className="h-5 w-5 shrink-0 text-slate-700" />
                        <Typography type="text14" fontWeight={600} className="text-slate-700">
                            Export report
                        </Typography>
                    </button>
                    <button className={`flex items-center gap-2 rounded-[13px] border border-[#0B0E0514] px-4 py-2 transition-hover hover:bg-slate-50 ${CARD_BG_CLASS}`}>
                        <ArrowsClockwiseIcon className="h-5 w-5 shrink-0 text-slate-700" />
                        <Typography type="text14" fontWeight={600} className="text-slate-700">
                            Refresh data
                        </Typography>
                    </button>
                </div>
            </div>

            {/* =========================================================================
          SECTION 1: QUICK STATS GRID
          ========================================================================= */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Typography type="text16" fontWeight={700} className="text-slate-900">
                        Quick stats
                    </Typography>
                    <PeriodDropdown value={quickStatsPeriod} onChange={setQuickStatsPeriod} />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {quickStats.map((stat, i) => {
                        const Icon = stat.icon;

                        return (
                            <div key={i} className={`${STAT_CARD_CLASS} p-5`}>
                                <div className="flex items-start justify-between gap-3">
                                    <Typography type="text24" fontWeight={700} className="text-[#0B0E05A3]">
                                        {stat.value}
                                    </Typography>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                        <Icon className={`h-5 w-5 ${stat.iconColor ?? ""}`} />
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-col gap-0">
                                    <Typography type="text14" fontWeight={500} className="leading-tight text-[#0B0E05A3] truncate">
                                        {stat.label}
                                    </Typography>
                                    <Typography type="text12" fontWeight={500} className={`leading-tight ${stat.changeColor}`}>
                                        {stat.change}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* =========================================================================
          SECTION 2: ENGAGEMENT STATS GRID
          ========================================================================= */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Typography type="text16" fontWeight={700} className="text-slate-900">
                        Engagement stats
                    </Typography>
                    <PeriodDropdown value={engagementStatsPeriod} onChange={setEngagementStatsPeriod} />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {engagementStats.map((stat, i) => {
                        const Icon = stat.icon;

                        return (
                            <div key={i} className={`${STAT_CARD_CLASS} p-5`}>
                                <div className="flex items-start justify-between gap-3">
                                    <Typography type="text24" fontWeight={700} className="text-[#0B0E05A3]">
                                        {stat.value}
                                    </Typography>
                                    {Icon ? (
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                            <Icon className={`h-5 w-5 ${stat.iconColor ?? ""}`} />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                            <div className="h-4 w-4 rounded bg-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex flex-col gap-0">
                                    <Typography type="text14" fontWeight={500} className="leading-tight text-[#0B0E05A3] truncate">
                                        {stat.label}
                                    </Typography>
                                    <Typography type="text12" fontWeight={500} className={`leading-tight ${stat.changeColor}`}>
                                        {engagementStatsPeriod}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* =========================================================================
          DATA CHARTS AND VISUALIZATION LAYOUT SECTION
          ========================================================================= */}
            <div className="space-y-4">
                <Typography type="text16" fontWeight={700} className="text-slate-900">
                    Sales overview
                </Typography>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                    <div className="h-full lg:col-span-2">
                        <GmvOrdersTrendChart />
                    </div>
                    <div className="h-full">
                        <TopCategoriesChart />
                    </div>
                </div>
            </div>

            {/* =========================================================================
          BOTTOM SECTION: LIVE ACTIVITY FEED CANVAS PANEL
          ========================================================================= */}
            <div className={PANEL_CARD_SHELL_CLASS}>
                <div className={PANEL_CARD_CLASS}>
                <div className="border-b border-[#0B0E0514] px-6 py-4">
                    <Typography type="text16" fontWeight={700} className="text-slate-900">
                        Live activity feed
                    </Typography>
                </div>

                {/* Empty state activity illustration frame */}
                {/* <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="relative mb-4 flex h-24 w-20 items-center justify-center rounded-xl border-2 border-[#0B0E0514] bg-slate-50 p-4 shadow-inner transform -rotate-12">
                        <div className="w-full h-1 bg-slate-200 rounded absolute top-3 inset-x-4" />
                        <div className="w-2/3 h-1 bg-slate-200 rounded absolute top-6 left-4" />
                        <div className="w-1/2 h-1 bg-slate-200 rounded absolute top-9 left-4" />
                    </div>
                    <Typography type="text14" fontWeight={500} className="text-slate-500">
                        No activities to show yet
                    </Typography>
                </div> */}

                {/* Activity List Container */}
                <div className="divide-y divide-[#0B0E0514]">
                    {[
                        { id: "1", user: "Johnny Banes", actionText: " uploaded new lot: ", boldTarget: "Electronics Pallets #4521", timeAgo: "2 minutes ago" },
                        { id: "2", user: "Allen Smith", actionText: " submitted KYC application for review", timeAgo: "15 minutes ago" },
                        { id: "3", user: "Mayar Rogers", actionText: " placed a high-value order: ", boldTarget: "$45,000", timeAgo: "2 minutes ago" },
                        { id: "4", user: "Liquidation Hub", actionText: " uploaded new lot: ", boldTarget: "Apparel Returns", timeAgo: "1 hours ago" },
                    ].map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between py-4 px-6 transition-colors hover:bg-slate-50/50"
                        >
                            {/* Left Content Area */}
                            <div className="flex items-start gap-4 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B1EC5229]">
                                    <BellIcon className="h-5 w-5 text-[#518300]" />
                                </div>

                                {/* Text Meta Container */}
                                <div className="space-y-1">
                                    <div className="leading-tight">
                                        {activity.user && (
                                            <Typography
                                                type="text16"
                                                fontWeight={700}
                                                className="inline mr-1"
                                            >
                                                {activity.user}
                                            </Typography>
                                        )}

                                        <Typography
                                            type="text16"
                                            fontWeight={400}
                                            className={`inline ${activity.user ? "text-[#0B0E05]" : "text-[#0B0E05]"}`}
                                        >
                                            {activity.actionText}
                                        </Typography>

                                        {activity.boldTarget && (
                                            <Typography
                                                type="text16"
                                                fontWeight={400}
                                                className="inline text-[#0B0E05]"
                                            >
                                                {activity.boldTarget}
                                            </Typography>
                                        )}
                                    </div>

                                    {/* Timestamp tracking row */}
                                    <Typography type="text16" fontWeight={400} className="block text-[#0B0E05]">
                                        {activity.timeAgo}
                                    </Typography>
                                </div>
                            </div>

                            <button className="ml-4 p-2 rounded-lg hover:bg-slate-100 shrink-0 transition-colors">
                                <ArrowSquareOutIcon className="h-5 w-5 text-[#343330]" />
                            </button>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
}