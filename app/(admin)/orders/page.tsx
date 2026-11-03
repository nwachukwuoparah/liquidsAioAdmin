"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import {
    AdminAsyncContent,
    AdminQueryState,
    DataTableSkeleton,
    ListRowsSkeleton,
    StatCardsSkeleton,
} from "@/components/skeletons";
import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import { TablePagination } from "@/components/table-pagination";
import { useModal } from "@/context/modal-provider";
import OrderDetailsModal from "@/components/modals/order-details-modal";
import { useAdminOrdersOverview, useAdminOrdersPage } from "@/lib/admin/hooks";
import {
    ADMIN_ORDER_OVERVIEW_CARDS,
    getAdminOrderOverviewRange,
} from "@/lib/admin/constants/admin-orders-overview.constant";
import {
    ORDER_STATUS_FILTER_TO_API,
    ORDER_TAB_TO_STATUS,
    PAYMENT_STATUS_FILTER_TO_API,
    getOrdersFilterDateRange,
} from "@/lib/orders/constants/admin-orders-api.constant";
import {
    getLotFallbackImageByTitle,
    isLotImageUrl,
} from "@/lib/orders/utilities/map-admin-order-api-record";
import type { AdminOrderRecord } from "@/lib/admin/types/admin-api.types";
import type {
    AdminOrderApiCursor,
    FetchAdminOrdersPageParams,
} from "@/lib/orders/types/admin-orders-api.types";
import {
    LIST_CARD_CLASS,
    PANEL_CARD_CLASS,
    PANEL_CARD_SHELL_CLASS,
    SECTION_CARD_CLASS,
    STAT_CARD_CLASS,
} from "@/lib/card-styles";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import PeriodDropdown, { type PeriodOption } from "@/components/period-dropdown";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import {
    CalendarDotsIcon,
    CameraIcon,
    CurrencyDollarIcon,
    EyeIcon,
    FlagIcon,
    RadioButtonIcon,
    SlidersHorizontalIcon,
    TrendIcon,
    UserMinusIcon,
    UserPlusIcon,
    UsersGroupIcon,
} from "@/components/vector";

const FILTER_ICON_CLASS = "h-5 w-5 shrink-0 text-[#343330]";

type OrderTab = {
    id: string;
    label: string;
    dividerBefore?: boolean;
};

const TABS: OrderTab[] = [
    { id: "All", label: "All" },
    { id: "Active orders", label: "Active orders" },
    { id: "Completed", label: "Completed" },
    { id: "Dispute / Refunds", label: "Dispute / Refunds", dividerBefore: true },
    { id: "Cancelled", label: "Cancelled" },
];

function OrderLotThumbnail({
    order,
    sizeClassName,
}: {
    order: AdminOrderRecord;
    sizeClassName: string;
}) {
    const fallbackUrl = useMemo(
        () => getLotFallbackImageByTitle(order.title),
        [order.title],
    );

    const initialSrc =
        order.thumbnailUrl && isLotImageUrl(order.thumbnailUrl)
            ? order.thumbnailUrl
            : fallbackUrl;

    const [src, setSrc] = useState<string | undefined>(initialSrc);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const nextSrc =
            order.thumbnailUrl && isLotImageUrl(order.thumbnailUrl)
                ? order.thumbnailUrl
                : fallbackUrl;
        setSrc(nextSrc);
        setFailed(false);
    }, [order.thumbnailUrl, fallbackUrl]);

    const handleImgError = () => {
        if (src !== fallbackUrl && fallbackUrl) {
            setSrc(fallbackUrl);
        } else {
            setFailed(true);
        }
    };

    const showImage = Boolean(src && !failed);

    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5 ${
                order.colorBg || "bg-[#0B0E050A]"
            } ${sizeClassName}`}
        >
            {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={order.title || "Lot image"}
                    onError={handleImgError}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <CameraIcon className="h-4 w-4 text-[#0B0E0533]" />
            )}
            {order.alert ? (
                <div
                    className="absolute -bottom-0.5 -right-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#CC2929] ring-1 ring-white"
                    aria-label="Dispute alert"
                >
                    <FlagIcon className="h-2 w-2 text-white" />
                </div>
            ) : null}
        </div>
    );
}

export default function AllOrdersDashboardContentSection() {
    const [activeTab, setActiveTab] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [statsPeriod, setStatsPeriod] = useState<PeriodOption>("This month");
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [cursorMap, setCursorMap] = useState<Record<number, AdminOrderApiCursor>>({});

    const filterBlueprints: FilterConfig[] = [
        {
            id: "orderStatus",
            label: "Order Status",
            defaultValue: "All",
            options: ["All", "Awaiting shipment / In-transit", "Delivered", "Dispute", "Cancelled"],
            icon: <RadioButtonIcon className={FILTER_ICON_CLASS} />,
        },
        {
            id: "paymentStatus",
            label: "Payment status",
            defaultValue: "All",
            options: ["All", "Pending", "Released", "Refunded"],
            icon: <CurrencyDollarIcon className={FILTER_ICON_CLASS} />,
        },
        {
            id: "dateRange",
            label: "Date range",
            defaultValue: "All time",
            options: ["All time", "This month", "Last 7 days", "Custom range"],
            icon: <CalendarDotsIcon className={FILTER_ICON_CLASS} />,
        },
    ];

    // Reset pagination to page 1 whenever active tab, search query, or filters change
    useEffect(() => {
        setPage(1);
        setCursorMap({});
    }, [activeTab, searchQuery, selectedFilters, pageSize]);

    const activeCursor = page > 1 ? cursorMap[page] : undefined;

    const orderStatusFromFilter = selectedFilters.orderStatus
        ? ORDER_STATUS_FILTER_TO_API[selectedFilters.orderStatus]
        : undefined;
    const paymentStatusFromFilter = selectedFilters.paymentStatus
        ? PAYMENT_STATUS_FILTER_TO_API[selectedFilters.paymentStatus]
        : undefined;
    const dateRangeFromFilter = useMemo(
        () => getOrdersFilterDateRange(selectedFilters.dateRange),
        [selectedFilters.dateRange],
    );

    const ordersQueryParams: FetchAdminOrdersPageParams = useMemo(() => {
        return {
            tab: activeTab,
            q: searchQuery.trim() || undefined,
            order_status: orderStatusFromFilter || ORDER_TAB_TO_STATUS[activeTab],
            payment_status: paymentStatusFromFilter,
            start: dateRangeFromFilter.start,
            end: dateRangeFromFilter.end,
            limit: pageSize,
            cursor_id: activeCursor?.cursor_id,
            cursor_sort_at: activeCursor?.cursor_sort_at,
            cursor_search_rank: activeCursor?.cursor_search_rank,
        };
    }, [
        activeTab,
        searchQuery,
        orderStatusFromFilter,
        paymentStatusFromFilter,
        dateRangeFromFilter.start,
        dateRangeFromFilter.end,
        pageSize,
        activeCursor,
    ]);

    const pageOffset = (page - 1) * pageSize;
    const ordersQuery = useAdminOrdersPage(ordersQueryParams, pageOffset);

    // Save next page cursor when received
    useEffect(() => {
        if (ordersQuery.data?.nextCursor) {
            setCursorMap((prev) => ({
                ...prev,
                [page + 1]: ordersQuery.data!.nextCursor!,
            }));
        }
    }, [ordersQuery.data?.nextCursor, page]);

    const isDisputeTab = activeTab === "Dispute / Refunds";
    const rawOrderRecords =
        isDisputeTab && ordersQuery.isError ? [] : (ordersQuery.data?.orders ?? []);
    const isOrdersTableError = ordersQuery.isError && !isDisputeTab;

    const orderRecords = rawOrderRecords;

    const totalOrdersCount = ordersQuery.data?.totalCount ?? orderRecords.length;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1);
    };

    const overviewRange = useMemo(() => getAdminOrderOverviewRange(statsPeriod), [statsPeriod]);
    const orderOverviewQuery = useAdminOrdersOverview(overviewRange);

    const quickStats = useMemo(() => {
        const rawData = orderOverviewQuery.data;

        if (Array.isArray(rawData)) {
            return rawData;
        }

        const statsPayload =
            typeof rawData === "object" && rawData !== null
                ? ("data" in rawData && rawData.data && typeof rawData.data === "object"
                    ? (rawData.data as Record<string, unknown>)
                    : (rawData as Record<string, unknown>))
                : {};

        const hasAdminOverviewKeys =
            "activeMembers" in statsPayload ||
            "active_members" in statsPayload ||
            "pendingInvites" in statsPayload ||
            "pending_invites" in statsPayload ||
            "revokedAdmins" in statsPayload ||
            "revoked_admins" in statsPayload;

        const hasOrderOverviewKeys =
            "totalOrders" in statsPayload ||
            "total_orders" in statsPayload ||
            "completedOrders" in statsPayload ||
            "completed_orders" in statsPayload;

        if (hasAdminOverviewKeys && !hasOrderOverviewKeys) {
            return [
                {
                    title: "Active Members",
                    count: String(statsPayload.activeMembers ?? statsPayload.active_members ?? 0),
                    change: "—",
                    trendDirection: undefined,
                    isPositive: true,
                    footerText: "",
                    iconKey: "usersGroup",
                    iconBg: "bg-[#009D9D14]",
                    iconColor: "text-[#009D9D]",
                    Icon: UsersGroupIcon,
                },
                {
                    title: "Pending Invites",
                    count: String(statsPayload.pendingInvites ?? statsPayload.pending_invites ?? 0),
                    change: "—",
                    trendDirection: undefined,
                    isPositive: true,
                    footerText: "",
                    iconKey: "userPlus",
                    iconBg: "bg-[#BE02BE14]",
                    iconColor: "text-[#BE02BE]",
                    Icon: UserPlusIcon,
                },
                {
                    title: "Revoked Admins",
                    count: String(statsPayload.revokedAdmins ?? statsPayload.revoked_admins ?? 0),
                    change: "—",
                    trendDirection: undefined,
                    isPositive: true,
                    footerText: "",
                    iconKey: "userMinus",
                    iconBg: "bg-[#CC292914]",
                    iconColor: "text-[#CC2929]",
                    Icon: UserMinusIcon,
                },
            ];
        }

        const resolveMetric = (key: string) => {
            if (key === "totalOrders") {
                return (
                    statsPayload.totalOrders ??
                    statsPayload.total_orders ??
                    statsPayload.totalOrdersYtd ??
                    statsPayload.total_orders_ytd ??
                    statsPayload.total
                );
            }
            if (key === "activeOrders") {
                return (
                    statsPayload.activeOrders ??
                    statsPayload.active_orders ??
                    statsPayload.active
                );
            }
            if (key === "completedOrders") {
                return statsPayload.completedOrders ?? statsPayload.completed_orders ?? statsPayload.completed;
            }
            if (key === "disputedOrders") {
                return (
                    statsPayload.disputedOrders ??
                    statsPayload.disputed_orders ??
                    statsPayload.disputed ??
                    statsPayload.disputes
                );
            }
            if (key === "allRefundsIssued") {
                return (
                    statsPayload.allRefundsIssued ??
                    statsPayload.all_refunds_issued ??
                    statsPayload.refundsIssued ??
                    statsPayload.refunds
                );
            }
            if (key === "currentlyInEscrow") {
                return (
                    statsPayload.currentlyInEscrow ??
                    statsPayload.currently_in_escrow ??
                    statsPayload.inEscrow ??
                    statsPayload.in_escrow ??
                    statsPayload.escrow
                );
            }
            if (key === "avgOrderValue") {
                return statsPayload.avgOrderValue ?? statsPayload.avg_order_value ?? statsPayload.averageOrderValue ?? statsPayload.aov;
            }
            if (key === "platformFees") {
                return statsPayload.platformFees ?? statsPayload.platform_fees ?? statsPayload.platformFeesEarning ?? statsPayload.platform_fees_earning;
            }
            return statsPayload[key];
        };

        const periodLabel = statsPeriod.toLowerCase();

        return ADMIN_ORDER_OVERVIEW_CARDS.map((cardConfig) => {
            const metric = resolveMetric(cardConfig.key);
            const rawValue =
                typeof metric === "object" && metric !== null
                    ? ((metric as { count?: unknown; total?: unknown; amount?: unknown; value?: unknown }).count ??
                       (metric as { count?: unknown; total?: unknown; amount?: unknown; value?: unknown }).total ??
                       (metric as { count?: unknown; total?: unknown; amount?: unknown; value?: unknown }).amount ??
                       (metric as { count?: unknown; total?: unknown; amount?: unknown; value?: unknown }).value ??
                       0)
                    : (metric ?? 0);

            let countDisplay = "0";
            if (cardConfig.isCurrency) {
                if (typeof rawValue === "number") {
                    countDisplay = `$${rawValue.toLocaleString()}`;
                } else if (typeof rawValue === "string") {
                    countDisplay = rawValue.startsWith("$") ? rawValue : `$${rawValue}`;
                } else {
                    countDisplay = "$0";
                }
            } else {
                countDisplay = typeof rawValue === "number" ? rawValue.toLocaleString() : String(rawValue ?? "0");
            }

            const deltaPercentage =
                typeof metric === "object" && metric !== null && "deltaPercentage" in metric
                    ? (metric as { deltaPercentage?: number | null }).deltaPercentage
                    : null;

            let change = "";
            let trendDirection: "up" | "down" | undefined;
            let isPositive = true;
            let footerText = "";

            if (cardConfig.key === "totalOrders") {
                change = deltaPercentage != null ? `${deltaPercentage > 0 ? "+" : ""}${deltaPercentage}` : "—";
                trendDirection = deltaPercentage != null && deltaPercentage !== 0 ? (deltaPercentage > 0 ? "up" : "down") : undefined;
                isPositive = deltaPercentage != null ? deltaPercentage >= 0 : true;
                footerText = deltaPercentage != null ? periodLabel : "";
            } else if (deltaPercentage != null) {
                change = `${deltaPercentage > 0 ? "+" : ""}${deltaPercentage}%`;
                trendDirection = deltaPercentage !== 0 ? (deltaPercentage > 0 ? "up" : "down") : undefined;
                isPositive = cardConfig.deltaTone === "alert" ? deltaPercentage <= 0 : deltaPercentage >= 0;
                footerText = periodLabel;
            } else {
                change = "—";
                trendDirection = undefined;
                footerText = "";
            }

            return {
                title: cardConfig.title,
                count: countDisplay,
                change,
                trendDirection,
                isPositive,
                footerText,
                iconKey: cardConfig.iconKey,
                iconBg: cardConfig.iconBg,
                iconColor: cardConfig.iconColor,
                iconClassName: cardConfig.iconClassName,
            };
        });
    }, [orderOverviewQuery.data, statsPeriod]);

    const { showModal } = useModal();

    const handleViewOrder = (order: AdminOrderRecord) => {
        showModal({
            content: (closeModal) => (
                <OrderDetailsModal
                    orderId={order.rawId || order.orderId || order.internalId}
                    order={order}
                    onClose={closeModal}
                />
            ),
            panelClassName: "max-w-[560px] w-full p-0 rounded-2xl overflow-hidden",
        });
    };

    const handleFilterUpdate = (filterId: string, value: string) => {
        setSelectedFilters((prev) => ({ ...prev, [filterId]: value }));
    };

    return (
        <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-6 p-4 font-sans antialiased lg:p-8">

            {/* QUICK STATS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                        Quick stats
                    </Typography>
                    <PeriodDropdown value={statsPeriod} onChange={setStatsPeriod} />
                </div>

                {orderOverviewQuery.isLoading ? (
                    <StatCardsSkeleton
                        count={quickStats.length > 0 ? quickStats.length : 3}
                        columnsClassName={
                            quickStats.length === 3
                                ? "grid grid-cols-1 gap-3.5 sm:grid-cols-3"
                                : "grid grid-cols-2 gap-3.5 md:grid-cols-4"
                        }
                    />
                ) : (
                <AdminQueryState
                    isError={orderOverviewQuery.isError}
                    errorMessage={
                        orderOverviewQuery.error instanceof Error
                            ? orderOverviewQuery.error.message
                            : undefined
                    }
                    onRetry={() => void orderOverviewQuery.refetch()}
                >
                <div
                    className={`grid gap-3.5 ${
                        quickStats.length === 3
                            ? "grid-cols-1 sm:grid-cols-3"
                            : "grid-cols-2 md:grid-cols-4"
                    }`}
                >
                    {quickStats.map((card) => {
                        const changeClass = card.isPositive ? "text-[#00A341]" : "text-[#CC2929]";

                        return (
                            <div
                                key={card.title}
                                className={`${STAT_CARD_CLASS} min-h-[128px] p-4`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Typography type="text24" fontWeight={700} className="block tracking-tight text-[#0B0E05]">
                                            {card.count}
                                        </Typography>
                                        <Typography
                                            type="text14"
                                            fontWeight={500}
                                            className="mt-0.5 block text-[#0B0E05A3]"
                                            truncate
                                            maxLength={24}
                                            lines={1}
                                        >
                                            {card.title}
                                        </Typography>
                                    </div>
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                                        aria-hidden="true"
                                    >
                                        {"Icon" in card && card.Icon ? (
                                            <card.Icon className={`h-5 w-5 ${card.iconColor ?? ""}`} />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {card.trendDirection ? (
                                        <TrendIcon
                                            direction={card.trendDirection}
                                            className={changeClass}
                                        />
                                    ) : null}
                                    <Typography type="text12" fontWeight={600} className="text-[#0B0E05A3]">
                                        {card.change ? <span className={changeClass}>{card.change}</span> : null}
                                        {card.change && card.footerText ? " " : null}
                                        {card.footerText}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </AdminQueryState>
                )}
            </div>

            {/* MAIN TABLE PANEL */}
            <div className={PANEL_CARD_SHELL_CLASS}>
                <div className={PANEL_CARD_CLASS}>

                {/* DESKTOP TABS */}
                <div className="hidden items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6 md:flex">
                    {TABS.map((tab) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <React.Fragment key={tab.id}>
                                {tab.dividerBefore && (
                                    <div className="h-5 w-px shrink-0 bg-[#0B0E0529]" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex shrink-0 items-center gap-2 py-4 transition-colors ${
                                        isActive ? "text-[#518300]" : "!text-[#0B0E05CC] hover:text-[#0B0E05]"
                                    }`}
                                >
                                    <Typography
                                        type="text14"
                                        fontWeight={isActive ? 600 : 500}
                                        className={isActive ? "text-[#518300]" : "!text-[#0B0E05CC]"}
                                    >
                                        {tab.label}
                                    </Typography>
                                    {isActive && (
                                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#518300]" />
                                    )}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* MOBILE TABS */}
                <div className="block border-b border-[#0B0E0514] p-4 md:hidden">
                    <div className="scrollbar-none flex gap-2 overflow-x-auto whitespace-nowrap">
                        {TABS.map((tab) => {
                            const isActive = tab.id === activeTab;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap rounded-full border px-4 py-2 transition-all ${
                                        isActive ? "border-[#518300] bg-[#FFFFFF]" : "border-[#0B0E0514] bg-[#FFFFFF]"
                                    }`}
                                >
                                    <Typography
                                        type="text12"
                                        fontWeight={500}
                                        className={isActive ? "text-[#518300]" : "text-[#0B0E05A3]"}
                                    >
                                        {tab.label}
                                    </Typography>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FILTERS */}
                <div className="border-b border-[#0B0E0514] bg-[#FFFFFF] p-4 lg:p-6">
                    <div className={`space-y-4 p-4 ${SECTION_CARD_CLASS}`}>
                        <div className="flex w-full gap-2">
                            <SearchInput
                                containerClassName="flex-1"
                                placeholder="Search orders, buyers, sellers, etc"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 text-[13px] focus:border-[#0B0E0514]"
                            />
                            <button
                                type="button"
                                className="relative flex h-[38px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] md:hidden"
                                aria-label="Open filters"
                            >
                                <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                            </button>
                        </div>

                        <div className="hidden md:block">
                            <DynamicFilters
                                filters={filterBlueprints}
                                selectedValues={selectedFilters}
                                onFilterChange={handleFilterUpdate}
                            />
                        </div>
                    </div>
                </div>

                {/* MOBILE LIST */}
                <div className="block space-y-3 p-4 md:hidden">
                    <AdminQueryState isError={isOrdersTableError} onRetry={() => void ordersQuery.refetch()}>
                        <AdminAsyncContent
                            isLoading={ordersQuery.isLoading}
                            isEmpty={orderRecords.length === 0}
                            loadingFallback={<ListRowsSkeleton rows={5} />}
                            emptyFallback={<EmptyState title="No orders found" />}
                        >
                            {orderRecords.map((order, index) => (
                                <div
                                    key={order.orderId || index}
                                    onClick={() => handleViewOrder(order)}
                                    className={`flex flex-col space-y-3 p-4 cursor-pointer transition-shadow hover:shadow-md ${LIST_CARD_CLASS}`}
                                >
                                    <div className="flex w-full min-w-0 items-center gap-3">
                                        <OrderLotThumbnail order={order} sizeClassName="h-10 w-10" />
                                        <div className="min-w-0 flex-1">
                                            <Typography
                                                type="text14"
                                                fontWeight={500}
                                                truncate
                                                maxLength={80}
                                                lines={2}
                                                className="block w-full leading-5 !text-[#0B0E05]"
                                            >
                                                {order.title}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-[#0B0E0514]" />
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <div className="truncate text-xs">
                                                <span className="font-medium text-[#0B0E05A3]">Seller: </span>
                                                <Typography type="text12" fontWeight={600} className="inline text-[#0B0E05]">
                                                    {order.seller}
                                                </Typography>
                                            </div>
                                            <div className="truncate text-xs">
                                                <span className="font-medium text-[#0B0E05A3]">Buyer: </span>
                                                <Typography type="text12" fontWeight={600} className="inline text-[#0B0E05]">
                                                    {order.buyer}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end space-y-1.5 text-right">
                                            <OrderStatusBadge status={order.orderStatus} />
                                            <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                                                {order.amount}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2">
                                <TablePagination
                                    page={page}
                                    pageSize={pageSize}
                                    totalCount={totalOrdersCount}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    pageSizeOptions={["10", "25"]}
                                    disabled={ordersQuery.isFetching}
                                />
                            </div>
                        </AdminAsyncContent>
                    </AdminQueryState>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden w-full md:block">
                    <AdminQueryState isError={isOrdersTableError} onRetry={() => void ordersQuery.refetch()}>
                        <AdminAsyncContent
                            isLoading={ordersQuery.isLoading}
                            isEmpty={orderRecords.length === 0}
                            loadingFallback={<DataTableSkeleton rows={8} columns={10} />}
                            emptyFallback={<EmptyState title="No orders found" />}
                        >
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[1320px] table-auto border-collapse text-left">
                                    <thead>
                                        <tr className="whitespace-nowrap border-b border-[#0B0E0514] bg-[#0B0E050A]">
                                            {[
                                                { label: "S/N", className: "w-[50px] py-3.5 pl-6 pr-2 text-center" },
                                                { label: "Order ID", className: "min-w-[120px] py-3.5 px-4" },
                                                { label: "Lot title", className: "min-w-[260px] max-w-[340px] py-3.5 px-4" },
                                                { label: "Seller name", className: "min-w-[130px] py-3.5 px-4" },
                                                { label: "Buyer name", className: "min-w-[130px] py-3.5 px-4" },
                                                { label: "Amount", className: "min-w-[90px] py-3.5 px-4" },
                                                { label: "Payment status", className: "min-w-[130px] py-3.5 px-4" },
                                                { label: "Order status", className: "min-w-[180px] py-3.5 px-4" },
                                                { label: "Order date", className: "min-w-[120px] py-3.5 px-4" },
                                                { label: "", className: "w-[50px] py-3.5 pr-6 pl-2 text-center" },
                                            ].map((head) => (
                                                <th key={head.label} className={head.className}>
                                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">
                                                        {head.label}
                                                    </Typography>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#0B0E0514] bg-[#FFFFFF]">
                                        {orderRecords.map((order, index) => (
                                            <tr key={order.orderId || index} className="transition-colors hover:bg-[#0B0E050A]">
                                                <td className="py-4 pl-6 pr-2 text-center">
                                                    <Typography type="text14" fontWeight={600} className="text-[#0B0E05A3]">
                                                        {order.id}
                                                    </Typography>
                                                </td>
                                                <td className="overflow-hidden text-ellipsis py-4 px-4">
                                                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05] leading-5">
                                                        {order.orderId}
                                                    </Typography>
                                                </td>
                                                <td className="min-w-0 max-w-[340px] py-4 px-4">
                                                    <div className="flex w-full min-w-0 items-center">
                                                        <div className="mr-3 shrink-0">
                                                            <OrderLotThumbnail order={order} sizeClassName="h-8 w-8" />
                                                        </div>
                                                        <div className="min-w-0 flex-1 max-w-[256px]">
                                                            <Typography
                                                                type="text14"
                                                                fontWeight={500}
                                                                truncate
                                                                maxLength={80}
                                                                lines={2}
                                                                className="block w-full !text-[#0B0E05] leading-5"
                                                            >
                                                                {order.title}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap py-4 px-4">
                                                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05CC]">
                                                        {order.seller}
                                                    </Typography>
                                                </td>
                                                <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap py-4 px-4">
                                                    <Typography type="text14" fontWeight={500} className="text-[#0B0E05CC]">
                                                        {order.buyer}
                                                    </Typography>
                                                </td>
                                                <td className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap py-4 px-4">
                                                    <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                                        {order.amount}
                                                    </Typography>
                                                </td>
                                                <td className="min-w-[130px] whitespace-nowrap py-4 px-4">
                                                    <PaymentStatusBadge status={order.payStatus} />
                                                </td>
                                                <td className="min-w-[180px] whitespace-nowrap py-4 px-4">
                                                    <OrderStatusBadge status={order.orderStatus} />
                                                </td>
                                                <td className="min-w-[120px] whitespace-nowrap py-4 px-4">
                                                    <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                                        {order.date}
                                                    </Typography>
                                                </td>
                                                <td className="py-4 pr-6 pl-2 text-center">
                                                    <button
                                                        type="button"
                                                        aria-label="View order details"
                                                        onClick={() => handleViewOrder(order)}
                                                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A]"
                                                    >
                                                        <EyeIcon className="h-5 w-5 text-[#0B0E05]" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <TablePagination
                                page={page}
                                pageSize={pageSize}
                                totalCount={totalOrdersCount}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={["10", "25"]}
                                disabled={ordersQuery.isFetching}
                            />
                        </AdminAsyncContent>
                    </AdminQueryState>
                </div>
                </div>
            </div>
        </div>
    );
}
