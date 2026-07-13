"use client";

import React, { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import PeriodDropdown, { type PeriodOption } from "@/components/period-dropdown";
import {
    AdminAsyncContent,
    AdminQueryState,
    ChartPanelSkeleton,
    ListRowsSkeleton,
    StatCardsSkeleton,
} from "@/components/skeletons";
import Typography from "@/components/typography";
import GmvOrdersTrendChart from "@/components/overview/gmv-orders-trend-chart";
import TopCategoriesChart from "@/components/overview/top-categories-chart";
import { useAdminOverview } from "@/lib/admin/hooks";
import type { AdminOverviewStatRecord } from "@/lib/admin/types/admin-api.types";
import { getAdminIconComponent } from "@/lib/admin/utilities/admin-icon-map";
import {
    BANNER_CARD_CLASS,
    CARD_BG_CLASS,
    PANEL_CARD_CLASS,
    PANEL_CARD_SHELL_CLASS,
    STAT_CARD_CLASS,
} from "@/lib/card-styles";
import { ArrowSquareOutIcon, ArrowsClockwiseIcon, CloudArrowDownIcon } from "@/components/vector";

function OverviewStatCard({
    stat,
    footer,
}: {
    stat: AdminOverviewStatRecord;
    footer?: string;
}) {
    const Icon = getAdminIconComponent(stat.iconKey);

    return (
        <div className={`${STAT_CARD_CLASS} p-5`}>
            <div className="flex items-start justify-between gap-3">
                <Typography type="text24" fontWeight={700} className="text-[#0B0E05]">
                    {stat.value}
                </Typography>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor ?? ""}`} />
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-0">
                <Typography type="text14" fontWeight={500} className="truncate leading-tight text-[#0B0E05A3]">
                    {stat.label}
                </Typography>
                {footer ? (
                    <Typography type="text12" fontWeight={500} className={`leading-tight ${stat.changeColor}`}>
                        {footer}
                    </Typography>
                ) : null}
            </div>
        </div>
    );
}

export default function OverviewPage() {
    const [quickStatsPeriod, setQuickStatsPeriod] = useState<PeriodOption>("This month");
    const [engagementStatsPeriod, setEngagementStatsPeriod] = useState<PeriodOption>("This month");
    const overviewQuery = useAdminOverview(quickStatsPeriod);
    const dashboard = overviewQuery.data?.dashboard;
    const charts = overviewQuery.data?.charts;
    const quickStats = dashboard?.quickStats ?? [];
    const engagementStats = dashboard?.engagementStats ?? [];
    const activityFeed = dashboard?.activityFeed ?? [];

    return (
        <div className="mx-auto w-full space-y-8 p-5">
            <div className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${BANNER_CARD_CLASS}`}>
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1.5">
                        <Typography fontWeight={500} className="text-[18px] italic text-[#0B0E05]">
                            Real-time monitoring is Live •
                        </Typography>
                        <Typography fontWeight={400} className="text-[18px] italic text-[#0B0E05]">
                            Last updated: 1:02:05 PM
                        </Typography>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className={`flex items-center gap-2 rounded-[13px] border border-[#0B0E0514] px-4 py-2 transition-hover hover:bg-slate-50 ${CARD_BG_CLASS}`}
                    >
                        <CloudArrowDownIcon className="h-5 w-5 shrink-0 text-slate-700" />
                        <Typography type="text14" fontWeight={600} className="text-slate-700">
                            Export report
                        </Typography>
                    </button>
                    <button
                        type="button"
                        onClick={() => void overviewQuery.refetch()}
                        className={`flex items-center gap-2 rounded-[13px] border border-[#0B0E0514] px-4 py-2 transition-hover hover:bg-slate-50 ${CARD_BG_CLASS}`}
                    >
                        <ArrowsClockwiseIcon className="h-5 w-5 shrink-0 text-slate-700" />
                        <Typography type="text14" fontWeight={600} className="text-slate-700">
                            Refresh data
                        </Typography>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Typography type="text16" fontWeight={700} className="text-slate-900">
                        Quick stats
                    </Typography>
                    <PeriodDropdown value={quickStatsPeriod} onChange={setQuickStatsPeriod} />
                </div>

                {overviewQuery.isLoading ? (
                    <StatCardsSkeleton count={5} columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
                ) : (
                    <AdminQueryState isError={overviewQuery.isError} onRetry={() => void overviewQuery.refetch()}>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {quickStats.map((stat) => (
                                <OverviewStatCard
                                    key={stat.label}
                                    stat={stat}
                                    footer={stat.change ?? quickStatsPeriod}
                                />
                            ))}
                        </div>
                    </AdminQueryState>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Typography type="text16" fontWeight={700} className="text-slate-900">
                        Engagement stats
                    </Typography>
                    <PeriodDropdown value={engagementStatsPeriod} onChange={setEngagementStatsPeriod} />
                </div>

                {overviewQuery.isLoading ? (
                    <StatCardsSkeleton count={5} columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {engagementStats.map((stat) => (
                            <OverviewStatCard
                                key={stat.label}
                                stat={stat}
                                footer={stat.change ?? engagementStatsPeriod}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Typography type="text16" fontWeight={700} className="text-slate-900">
                    Sales overview
                </Typography>

                {overviewQuery.isLoading ? (
                    <ChartPanelSkeleton />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                        <div className="h-full lg:col-span-2">
                            <GmvOrdersTrendChart trendData={charts?.trendData} />
                        </div>
                        <div className="h-full">
                            <TopCategoriesChart categoryData={charts?.categoryData} />
                        </div>
                    </div>
                )}
            </div>

            <div className={PANEL_CARD_SHELL_CLASS}>
                <div className={PANEL_CARD_CLASS}>
                    <div className="border-b border-[#0B0E0514] px-6 py-4">
                        <Typography type="text16" fontWeight={700} className="text-slate-900">
                            Live activity feed
                        </Typography>
                    </div>

                    <AdminQueryState isError={overviewQuery.isError} onRetry={() => void overviewQuery.refetch()}>
                        <AdminAsyncContent
                            isLoading={overviewQuery.isLoading}
                            isEmpty={activityFeed.length === 0}
                            loadingFallback={<ListRowsSkeleton rows={4} className="p-4" />}
                            emptyFallback={
                                <EmptyState
                                    title="No activities to show yet"
                                    description="Live activity will appear here once events start coming in."
                                />
                            }
                        >
                            <div className="divide-y divide-[#0B0E0514]">
                                {activityFeed.map((activity) => {
                                    const Icon = getAdminIconComponent(activity.iconKey);

                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50"
                                        >
                                            <div className="flex min-w-0 items-start gap-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}>
                                                    <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <Typography type="text16" fontWeight={700} className="block text-[#0B0E05]">
                                                        {activity.title}
                                                    </Typography>
                                                    <Typography type="text14" fontWeight={400} className="block text-[#0B0E05A3]">
                                                        {activity.subtitle}
                                                    </Typography>
                                                    <Typography type="text14" fontWeight={400} className="block text-[#0B0E05A3]">
                                                        {activity.time}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="ml-4 shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100"
                                            >
                                                <ArrowSquareOutIcon className="h-5 w-5 text-[#343330]" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </AdminAsyncContent>
                    </AdminQueryState>
                </div>
            </div>
        </div>
    );
}
