"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CalendarDotsIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    FlagIcon,
    RadioButtonIcon,
    SlidersHorizontalIcon,
    StorefrontIcon,
    TagIcon,
    TrendIcon,
    XCircleIcon,
} from "@/components/vector";
import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import { EmptyState } from "@/components/empty-state";
import InventoryActionMenu from "@/components/inventory-action-menu";
import InventoryFiltersModal from "@/components/modals/inventory-filters-modal";
import { LotStatusBadge } from "@/components/inventory-status-badge";
import SearchInput from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { AdminAsyncContent, DataTableSkeleton, ListRowsSkeleton, StatCardsSkeleton } from "@/components/skeletons";
import { useModal } from "@/context/modal-provider";
import PeriodDropdown, { type PeriodOption } from "@/components/period-dropdown";
import { formatCount } from "@/lib/format-count";
import Typography from '@/components/typography';
import { useAdminInventoryLots, useAdminInventoryOverview, useAdminInventoryTabCounts } from "@/lib/admin/hooks";
import {
    formatInventoryOverviewDelta,
    getInventoryOverviewRange,
    INVENTORY_OVERVIEW_STAT_CARDS,
} from "@/lib/admin/constants/admin-inventory-overview.constant";
import { getAdminIconComponent } from "@/lib/admin/utilities/admin-icon-map";
import {
    ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
    INVENTORY_CATEGORY_CODE_TO_LABEL,
    INVENTORY_CATEGORY_LABEL_TO_CODE,
    INVENTORY_CONDITION_LABEL_TO_VALUE,
    INVENTORY_CONDITION_VALUE_TO_LABEL,
    INVENTORY_REVIEW_STATUS_LABELS,
} from "@/lib/inventory/constants/admin-inventory-api.constant";
import {
    applyInventoryFilterChange,
    countActiveInventoryFilters,
} from "@/lib/inventory/utilities/apply-inventory-filter-change";
import { buildInventoryLotsQueryParams } from "@/lib/inventory/utilities/inventory-filter-params";
import { isLotImageUrl } from "@/lib/inventory/utilities/map-admin-inventory-lot-api-record";
import { CARD_BG_CLASS, LIST_CARD_CLASS, METRIC_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, SECTION_CARD_CLASS } from '@/lib/card-styles';

const FILTER_ICON_CLASS = "h-5 w-5 shrink-0 text-[#343330]";

function resolveInventoryCategoryLabel(code?: string): string | undefined {
    if (!code) {
        return undefined;
    }

    return INVENTORY_CATEGORY_CODE_TO_LABEL[code] ?? Object.entries(INVENTORY_CATEGORY_LABEL_TO_CODE).find(([, value]) => value === code)?.[0];
}

function resolveInventoryConditionLabel(value?: string): string | undefined {
    if (!value) {
        return undefined;
    }

    return INVENTORY_CONDITION_VALUE_TO_LABEL[value] ?? Object.entries(INVENTORY_CONDITION_LABEL_TO_VALUE).find(([, apiValue]) => apiValue === value)?.[0];
}

function renderLotThumbnail(lot: { img: string; alert?: boolean }, sizeClassName: string) {
    return (
        <div className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0B0E050A] ${sizeClassName}`}>
            {isLotImageUrl(lot.img) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lot.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <div className={`absolute inset-0 ${lot.img} opacity-90`} />
            )}
            {lot.alert ? (
                <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC2929]">
                    <FlagIcon className="h-2.5 w-2.5 text-white" />
                </div>
            ) : null}
        </div>
    );
}

export default function AllLotsContentSection() {
    const { showModal } = useModal();
    const [activeTab, setActiveTab] = useState('All Lots');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterParams, setFilterParams] = useState<Record<string, string>>({});
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT);
    const [overviewPeriod, setOverviewPeriod] = useState<PeriodOption>("This week");

    const lotsQueryParams = useMemo(
        () =>
            buildInventoryLotsQueryParams(filterParams, {
                activeTab,
                search: searchQuery.trim(),
                page,
                limit: pageSize,
            }),
        [activeTab, filterParams, page, pageSize, searchQuery],
    );

    const overviewRange = useMemo(
        () => getInventoryOverviewRange(overviewPeriod),
        [overviewPeriod],
    );

    const inventoryLotsQuery = useAdminInventoryLots(lotsQueryParams);
    const inventoryOverviewQuery = useAdminInventoryOverview(overviewRange);
    const inventoryTabCountsQuery = useAdminInventoryTabCounts();
    const lotsData = inventoryLotsQuery.data?.results ?? [];
    const totalLotsCount = inventoryLotsQuery.data?.totalCount ?? lotsData.length;

    const displayLots = useMemo(() => {
        if (!searchQuery.trim()) {
            return lotsData;
        }
        const term = searchQuery.trim().toLowerCase();
        return lotsData.filter((lot) =>
            lot.title.toLowerCase().includes(term) ||
            lot.seller.toLowerCase().includes(term) ||
            lot.cat.toLowerCase().includes(term) ||
            lot.cond.toLowerCase().includes(term) ||
            lot.status.toLowerCase().includes(term) ||
            lot.id.toLowerCase().includes(term)
        );
    }, [lotsData, searchQuery]);

    const inventoryOverview = inventoryOverviewQuery.data;
    const tabCounts = inventoryTabCountsQuery.tabCounts;
    const allLotsCount =
        activeTab === "All Lots" && totalLotsCount > 0
            ? totalLotsCount
            : tabCounts.allLots || totalLotsCount;
    const suspendedLotsCount = tabCounts.suspended;

    useEffect(() => {
        setPage(1);
    }, [activeTab, filterParams, searchQuery, pageSize]);

    const handlePageChange = useCallback((nextPage: number) => {
        setPage(nextPage);
    }, []);

    const handlePageSizeChange = useCallback((nextPageSize: number) => {
        setPageSize(nextPageSize);
    }, []);

    const overviewStatCards = useMemo(
        () =>
            INVENTORY_OVERVIEW_STAT_CARDS.map((stat) => {
                const metric = inventoryOverview?.[stat.key];
                const delta = metric
                    ? formatInventoryOverviewDelta(metric.delta, stat.deltaTone)
                    : { text: "0", className: "text-[#0B0E05A3]", trendDirection: "flat" as const };

                const lotsDerivedCount =
                    stat.key === "allListings"
                        ? allLotsCount
                        : stat.key === "suspendedListings"
                          ? suspendedLotsCount
                          : null;
                const displayCount =
                    lotsDerivedCount != null && lotsDerivedCount > 0
                        ? lotsDerivedCount
                        : (metric?.count ?? 0);

                return {
                    ...stat,
                    value: displayCount.toLocaleString(),
                    deltaText: delta.text,
                    deltaClassName: delta.className,
                    trendDirection: delta.trendDirection,
                };
            }),
        [allLotsCount, inventoryOverview, suspendedLotsCount],
    );

    const filterBlueprints: FilterConfig[] = [
        { id: 'status', label: 'Lot Status', defaultValue: 'All statuses', options: ['All statuses', 'Active', 'Pending', 'In review', 'Declined', 'Suspended'], icon: <RadioButtonIcon className={FILTER_ICON_CLASS} /> },
        { id: 'category', label: 'Category', defaultValue: 'All categories', options: ['All categories', 'Electronics', 'Apparel & Footwear', 'Home & Kitchen', 'Health & Beauty', 'General Merchandise', 'Toys & Baby'], icon: <TagIcon className={FILTER_ICON_CLASS} /> },
        { id: 'condition', label: 'Condition', defaultValue: 'All conditions', options: ['All conditions', 'New', 'Refurbished', 'Mixed', 'Overstock'], icon: <RadioButtonIcon className={FILTER_ICON_CLASS} /> },
        { id: 'datePosted', label: 'Date posted', defaultValue: 'All time', customRangeKind: 'date', options: ['All time', 'Today', 'This week', 'This month', 'Custom date'], icon: <CalendarDotsIcon className={FILTER_ICON_CLASS} /> },
        { id: 'priceRange', label: 'Price range', defaultValue: 'All prices', customRangeKind: 'price', options: ['All prices', '$0 - $500', '$500 - $2,000', '$2,000 - $10,000', 'Over $10,000', 'Custom range'], icon: <CurrencyDollarIcon className={FILTER_ICON_CLASS} /> },
    ];

    const selectedInventoryFilters = useMemo<Record<string, string | undefined>>(
        () => ({
            status: filterParams.review_status
                ? INVENTORY_REVIEW_STATUS_LABELS[filterParams.review_status]
                : undefined,
            category: resolveInventoryCategoryLabel(filterParams.category),
            condition: resolveInventoryConditionLabel(filterParams.condition),
            datePosted: filterParams.datePosted,
            priceRange: filterParams.priceRange,
        }),
        [filterParams],
    );

    const handleFilterUpdate = useCallback((filterId: string, value: string) => {
        setFilterParams((prevParams) => applyInventoryFilterChange(prevParams, filterId, value));
    }, []);

    const activeFiltersCount = useMemo(
        () => countActiveInventoryFilters(filterParams),
        [filterParams],
    );

    const openMobileFilters = useCallback(() => {
        // Filter sheet is mobile-only; desktop uses the inline DynamicFilters row.
        if (typeof window !== "undefined" && !window.matchMedia("(max-width: 767px)").matches) {
            return;
        }

        showModal({
            cover: true,
            panelClassName: "!w-full !max-w-none h-full max-h-[100vh] !rounded-none !bg-white",
            dismissOnOverlayClick: false,
            content: (close) => (
                <InventoryFiltersModal
                    initialParams={filterParams}
                    onApply={(nextParams) => setFilterParams(nextParams)}
                    onReset={() => setFilterParams({})}
                    onClose={close}
                />
            ),
        });
    }, [filterParams, showModal]);

    const serialNumberOffset = (page - 1) * pageSize;

    const mobileTabs = [
        { id: 'All Lots', label: 'All Lots', count: allLotsCount },
        { id: 'Pending approval', label: 'Pending approval', count: tabCounts.pendingApproval },
        { id: 'Reported', label: 'Reported', count: tabCounts.reported },
        { id: 'Suspended', label: 'Suspended', count: suspendedLotsCount },
    ] as const;

    return (
        <div className="w-full min-h-screen antialiased font-sans md:p-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">

            {/* OVERVIEW STATS ROW */}
            <div className="space-y-3 px-4 md:px-0">
                <div className="flex items-center justify-between">
                    <Typography type="text14" fontWeight={700} className="text-[#0B0E05] block">
                        Overview
                    </Typography>
                    <PeriodDropdown value={overviewPeriod} onChange={setOverviewPeriod} />
                </div>
                {inventoryOverviewQuery.isLoading ? (
                    <StatCardsSkeleton count={4} columnsClassName="grid grid-cols-2 lg:grid-cols-4 gap-3.5" />
                ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {overviewStatCards.map((card) => {
                        const Icon = getAdminIconComponent(card.iconKey);

                        return (
                            <div key={card.key} className={`${METRIC_CARD_CLASS} p-4`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Typography type="text24" fontWeight={700} className="block tracking-tight text-[#0B0E05]">
                                            {card.value}
                                        </Typography>
                                    </div>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                                    </div>
                                </div>
                                <Typography
                                    type="text16"
                                    fontWeight={500}
                                    className="mt-1 block text-[#0B0E05]"
                                    truncate={true}
                                    maxLength={18}
                                    lines={1}
                                >
                                    {card.label}
                                </Typography>
                                <div className="mt-1 flex items-center gap-1">
                                    {card.trendDirection !== "flat" ? (
                                        <TrendIcon
                                            direction={card.trendDirection}
                                            className={card.deltaClassName}
                                        />
                                    ) : null}
                                    <Typography type="text12" fontWeight={600} className="text-[#0B0E05A3]">
                                        <span className={`font-semibold ${card.deltaClassName}`}>{card.deltaText}</span>{" "}
                                        {overviewPeriod.toLowerCase()}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}
            </div>

            {/* MOBILE FULL-WIDTH LOTS PANEL */}
            <div className={`block w-full rounded-t-[32px] border-t border-[#0B0E0514] shadow-card md:hidden ${CARD_BG_CLASS}`}>
                <div className="border-b border-[#0B0E0514] p-4">
                    <div className="scrollbar-none flex gap-2 overflow-x-auto whitespace-nowrap">
                        {mobileTabs.map((tab) => {
                            const isActive = tab.id === activeTab;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`shrink-0 rounded-full border px-4 py-2 transition-all flex items-center gap-2 ${
                                        isActive
                                            ? 'border-[#518300] bg-[#B1EC5229]'
                                            : 'border-[#0B0E0514] bg-[#FFFFFF]'
                                    }`}
                                >
                                    <Typography
                                        type="text12"
                                        fontWeight={500}
                                        className={isActive ? 'text-[#518300]' : 'text-[#0B0E05A3]'}
                                    >
                                        {tab.label}
                                    </Typography>
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                        {formatCount(tab.count)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 border-b border-[#0B0E0514] p-4">
                    <SearchInput
                        containerClassName="flex-1"
                        placeholder="Search lots by title"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-2xl py-3 text-[13px] focus:border-[#0B0E0514]"
                    />

                    <button
                        type="button"
                        aria-label="Open filters"
                        onClick={openMobileFilters}
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card"
                    >
                        <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                        {activeFiltersCount > 0 ? (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#CC2929] text-[11px] font-bold text-white">
                            {activeFiltersCount}
                        </span>
                        ) : null}
                    </button>
                </div>

                <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
                    <AdminAsyncContent
                        isLoading={inventoryLotsQuery.isLoading}
                        isEmpty={displayLots.length === 0}
                        loadingFallback={<ListRowsSkeleton rows={5} />}
                        emptyFallback={<EmptyState title="No lots found" />}
                    >
                    {displayLots.map((lot) => (
                        <div
                            key={lot.id}
                            data-testid="mobile-lot-card"
                            className={`flex flex-col gap-3 p-4 ${LIST_CARD_CLASS} rounded-xl`}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                {renderLotThumbnail(lot, "h-12 w-12")}

                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                    <Typography
                                        type="text14"
                                        fontWeight={700}
                                        truncate
                                        maxLength={23}
                                        lines={1}
                                        className="min-w-0 flex-1 !text-[#0B0E05] leading-snug"
                                    >
                                        {lot.title}
                                    </Typography>
                                    <LotStatusBadge status={lot.status} />
                                </div>
                            </div>

                            <div className="h-px w-full bg-[#0B0E0514]" />

                            <div className="flex min-w-0 items-center justify-between gap-3">
                                <p className="min-w-0 truncate text-[13px]">
                                    <span className="font-medium text-[#0B0E05A3]">Seller: </span>
                                    <span className="font-semibold text-[#0B0E05]">{lot.seller}</span>
                                </p>
                                <p className="shrink-0 whitespace-nowrap text-[13px] text-[#0B0E05]">
                                    <span className="font-medium">{lot.qty} items</span>
                                    <span className="mx-1.5">•</span>
                                    <span className="font-bold">{lot.price}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                    </AdminAsyncContent>

                    <TablePagination
                        page={page}
                        pageSize={pageSize}
                        totalCount={totalLotsCount}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        disabled={inventoryLotsQuery.isFetching}
                    />
                </div>
            </div>

            {/* DESKTOP LOTS PANEL */}
            <div className={`hidden md:block ${PANEL_CARD_SHELL_CLASS}`}>
                <div className={PANEL_CARD_CLASS}>

                {/* DESKTOP TABS BAR */}
                <div className="flex items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6">
                    {[
                        { id: 'All Lots', label: 'All Lots', count: allLotsCount },
                        { id: 'Pending approval', label: 'Pending approval', count: tabCounts.pendingApproval },
                        { id: 'Reported', label: 'Reported', count: tabCounts.reported },
                        { id: 'Suspended', label: 'Suspended', count: suspendedLotsCount },
                    ].map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                            <React.Fragment key={tab.id}>
                                {tab.id === 'Reported' && (
                                    <div className="h-5 w-px shrink-0 bg-[#0B0E0529]" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex shrink-0 items-center gap-2 py-4 transition-colors ${
                                        isActive
                                            ? 'text-[#518300]'
                                            : '!text-[#0B0E05CC] hover:text-[#0B0E05]'
                                    }`}
                                >
                                    <Typography
                                        type="text14"
                                        fontWeight={isActive ? 600 : 500}
                                        className={isActive ? 'text-[#518300]' : '!text-[#0B0E05CC]'}
                                    >
                                        {tab.label}
                                    </Typography>
                                    {tab.count != null && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                            {formatCount(tab.count)}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#518300]" />
                                    )}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* INPUT FILTERS ENVELOPE PANEL */}
                <div className="border-b border-[#0B0E0514] bg-[#FFFFFF] p-4 lg:p-6">
                    <div className={`space-y-4 p-4 ${SECTION_CARD_CLASS}`}>
                        <SearchInput
                            containerClassName="w-full"
                            placeholder="Search lots by title"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="py-2 text-[13px] focus:border-[#0B0E0514]"
                        />

                        <DynamicFilters
                            filters={filterBlueprints}
                            selectedValues={selectedInventoryFilters}
                            onFilterChange={handleFilterUpdate}
                        />
                    </div>
                </div>

                {/* DESKTOP SPREADSHEET LAYOUT TABLE */}
                <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A] text-[#0B0E05A3]">
                                <th className="w-[48px] py-3.5 pl-6 pr-2 text-center">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">S/N</Typography>
                                </th>
                                <th className="w-[18%] py-3.5 pr-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Lot title</Typography>
                                </th>
                                <th className="w-[13%] py-3.5 px-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Seller</Typography>
                                </th>
                                <th className="w-[13%] py-3.5 px-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Category</Typography>
                                </th>
                                <th className="w-[8%] py-3.5 px-3 text-center">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Quantity</Typography>
                                </th>
                                <th className="w-[9%] py-3.5 px-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Price</Typography>
                                </th>
                                <th className="w-[10%] py-3.5 px-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Condition</Typography>
                                </th>
                                <th className="w-[10%] py-3.5 px-3">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Date posted</Typography>
                                </th>
                                <th className="w-[8%] py-3.5 pl-3 pr-2">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Status</Typography>
                                </th>
                                <th className="w-[44px] py-3.5 pl-2 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B0E0514]  bg-[#FFFFFF]">
                            <AdminAsyncContent
                                isLoading={inventoryLotsQuery.isLoading}
                                isEmpty={displayLots.length === 0}
                                loadingFallback={
                                    <tr>
                                        <td colSpan={10}>
                                            <DataTableSkeleton rows={8} columns={10} />
                                        </td>
                                    </tr>
                                }
                                emptyFallback={
                                    <tr>
                                        <td colSpan={10}>
                                            <EmptyState title="No lots found" />
                                        </td>
                                    </tr>
                                }
                            >
                            {displayLots.map((lot, index) => (
                                <tr key={lot.id} className="transition-colors hover:bg-[#0B0E050A]">
                                    <td className="py-3.5 pl-6 pr-2 text-center">
                                        <Typography type="text12" fontWeight={700} className="text-[#0B0E05A3]">
                                            {serialNumberOffset + index + 1}
                                        </Typography>
                                    </td>
                                    <td className="min-w-0 py-3.5 pr-3">
                                        <div className="flex w-full min-w-0 items-center">
                                            <div className={`relative mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg`}>
                                                {isLotImageUrl(lot.img) ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={lot.img} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className={`absolute inset-0 ${lot.img}`} />
                                                )}
                                                {lot.alert && <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-red-500" />}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <Typography
                                                    type="text14"
                                                    fontWeight={700}
                                                    className="block w-full"
                                                    truncate={true}
                                                    maxLength={19}
                                                    lines={1}
                                                >
                                                    {lot.title}
                                                </Typography>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="min-w-0 py-3.5 px-3">
                                        <div className="block w-full min-w-0">
                                            <Typography type="text14" fontWeight={500} truncate={true} maxLength={16} className="block w-full">
                                                {lot.seller}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="min-w-0 py-3.5 px-3">
                                        <div className="block w-full min-w-0">
                                            <Typography type="text14" fontWeight={500} truncate={true} maxLength={16} className="block w-full">
                                                {lot.cat}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                        <Typography type="text14" fontWeight={600} className="text-[#0B0E05CC]">{lot.qty}</Typography>
                                    </td>
                                    <td className="min-w-0 py-3.5 px-3">
                                        <Typography type="text14" fontWeight={700} className="truncate text-[#0B0E05]">{lot.price}</Typography>
                                    </td>
                                    <td className="min-w-0 py-3.5 px-3">
                                        <Typography type="text14" fontWeight={500} truncate maxLength={12} className="block w-full">
                                            {lot.cond}
                                        </Typography>
                                    </td>
                                    <td className="min-w-0 py-3.5 px-3">
                                        <Typography type="text14" fontWeight={400} className="truncate text-[#0B0E05A3]">{lot.date}</Typography>
                                    </td>
                                    <td className="min-w-0 py-3.5 pl-3 pr-2">
                                        <LotStatusBadge status={lot.status} />
                                    </td>
                                    <td className="relative py-3.5 pl-2 pr-4">
                                        <InventoryActionMenu
                                            lotId={lot.id}
                                            lotSlug={lot.slug}
                                            lotTitle={lot.title}
                                            lotStatus={lot.status}
                                            lotReported={Boolean(lot.alert)}
                                            isOpen={actionMenuId === lot.id}
                                            onToggle={() => setActionMenuId(actionMenuId === lot.id ? null : lot.id)}
                                            onClose={() => setActionMenuId(null)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </AdminAsyncContent>
                        </tbody>
                    </table>

                    {/* DESKTOP FOOTER CONTROL AREA */}
                    <TablePagination
                        page={page}
                        pageSize={pageSize}
                        totalCount={searchQuery.trim() ? displayLots.length : totalLotsCount}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        disabled={inventoryLotsQuery.isFetching}
                    />
                </div>

                </div>
            </div>
            </div>
        </div>
    );
}