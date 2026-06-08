"use client";

import React, { useState } from "react";
import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import { CARD_BG_CLASS, LIST_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, SECTION_CARD_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import PeriodDropdown, { type PeriodOption } from "@/components/period-dropdown";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import {
    ArrowUUpLeftIcon,
    ArrowsLeftRightIcon,
    CalendarDotsIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    EyeIcon,
    FlagIcon,
    HandCoinsIcon,
    RadioButtonIcon,
    SlidersHorizontalIcon,
    ThumbsUpIcon,
    TrendIcon,
    TruckIcon,
    UsersIcon,
} from "@/components/vector";

const FILTER_ICON_CLASS = "h-5 w-5 shrink-0 text-[#343330]";

type QuickStatCard = {
    title: string;
    count: string;
    change: string;
    trendDirection: "up" | "down";
    isPositive: boolean;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconBg: string;
    iconColor: string;
    iconClassName?: string;
};

const MOCK_ORDERS_DATA = [
    { id: "1.", orderId: "#ORD-2024-001", title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers", seller: "Savannah Nguyen", buyer: "John Peters", amount: "$9,000", payStatus: "In Escrow", orderStatus: "Awaiting shipment", date: "05-07-2025", colorBg: "bg-amber-100" },
    { id: "2.", orderId: "#ORD-2024-002", title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)", seller: "Ronald Richards", buyer: "Wade Warren", amount: "$1,500", payStatus: "Released", orderStatus: "Awaiting shipment", date: "04-07-2025", colorBg: "bg-blue-100" },
    { id: "3.", orderId: "#ORD-2024-003", title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)", seller: "Robert Fox", buyer: "Kathryn Murphy", amount: "$800", payStatus: "Released", orderStatus: "In-transit", date: "03-07-2025", colorBg: "bg-[#0B0E050A]" },
    { id: "4.", orderId: "#ORD-2024-004", title: "Beauty & Cosmetics Lot – 500 Mixed Units", seller: "Marvin McKinney", buyer: "Ronald Richards", amount: "$1,200", payStatus: "In Escrow", orderStatus: "Awaiting shipment", date: "05-07-2025", colorBg: "bg-red-100" },
    { id: "5.", orderId: "#ORD-2024-002", title: "Baby Products Pallet – Diapers, Toys, Accessories", seller: "John stockton", buyer: "Cameron Williamson", amount: "$950", payStatus: "Released", orderStatus: "Delivered", date: "05-07-2025", colorBg: "bg-purple-100" },
    { id: "6.", orderId: "#ORD-2024-002", title: "Automotive Accessories – 150 Mixed Items", seller: "Cameron Williamson", buyer: "Marvin McKinney", amount: "$1,700", payStatus: "In Escrow", orderStatus: "Dispute", date: "05-07-2025", colorBg: "bg-emerald-100" },
    { id: "7.", orderId: "#ORD-2024-002", title: "Grocery Shelf Pulls – Snacks & Beverages", seller: "Wade Warren", buyer: "Robert Fox", amount: "$600", payStatus: "Refunded", orderStatus: "Cancelled", date: "05-07-2025", colorBg: "bg-amber-100" },
    { id: "8.", orderId: "#ORD-2024-002", title: "Office Supplies Pallet – Printers, Paper, Toners", seller: "Kathryn Murphy", buyer: "Savannah Nguyen", amount: "$1,100", payStatus: "Refunded", orderStatus: "Order completed", date: "05-07-2025", colorBg: "bg-indigo-100" },
];

const TABS = [
    { id: "All", label: "All" },
    { id: "Active orders", label: "Active orders" },
    { id: "Completed", label: "Completed" },
    { id: "Dispute / Refunds", label: "Dispute / Refunds", dividerBefore: true },
    { id: "Cancelled", label: "Cancelled" },
] as const;

export default function AllOrdersDashboardContentSection() {
    const [activeTab, setActiveTab] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [statsPeriod, setStatsPeriod] = useState<PeriodOption>("This month");

    const filterBlueprints: FilterConfig[] = [
        {
            id: "orderStatus",
            label: "Order Status",
            defaultValue: "All",
            options: ["All", "Awaiting shipment", "In-transit", "Delivered", "Dispute", "Order completed"],
            icon: <RadioButtonIcon className={FILTER_ICON_CLASS} />,
        },
        {
            id: "buyerName",
            label: "Buyer name",
            defaultValue: "All",
            isSearchable: true,
            searchPlaceholder: "Search buyer...",
            options: ["All", "John Doe", "...name b", "...name c"],
            icon: <UsersIcon className={FILTER_ICON_CLASS} />,
        },
        {
            id: "sellerName",
            label: "Seller name",
            defaultValue: "All",
            isSearchable: true,
            searchPlaceholder: "Search seller...",
            options: ["All", "John Doe", "...name b", "...name c"],
            icon: <UsersIcon className={FILTER_ICON_CLASS} />,
        },
        {
            id: "paymentStatus",
            label: "Payment status",
            defaultValue: "All",
            options: ["All", "In Escrow", "Released", "Refunded"],
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

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

    const handleFilterUpdate = (filterId: string, value: string) => {
        setSelectedFilters((prev) => ({ ...prev, [filterId]: value }));
    };

    const quickStats: QuickStatCard[] = [
        {
            title: "Total Orders (YTD)",
            count: "2,486",
            change: "+145",
            trendDirection: "up",
            isPositive: true,
            icon: TruckIcon,
            iconBg: "bg-[#BE02BE14]",
            iconColor: "text-[#BE02BE]",
        },
        {
            title: "Active Orders",
            count: "307",
            change: "+12%",
            trendDirection: "up",
            isPositive: true,
            icon: ThumbsUpIcon,
            iconBg: "bg-[#00A34114]",
            iconColor: "text-[#00A341]",
        },
        {
            title: "Completed Orders",
            count: "115",
            change: "+3%",
            trendDirection: "up",
            isPositive: true,
            icon: CheckCircleIcon,
            iconBg: "bg-[#00A34114]",
            iconColor: "text-[#00A341]",
        },
        {
            title: "Disputed Orders",
            count: "19",
            change: "-2%",
            trendDirection: "down",
            isPositive: true,
            icon: FlagIcon,
            iconBg: "bg-[#CC292914]",
            iconColor: "text-[#CC2929]",
            iconClassName: "h-4 w-[15px]",
        },
        {
            title: "All Refunds Issued",
            count: "30",
            change: "+3%",
            trendDirection: "up",
            isPositive: false,
            icon: ArrowUUpLeftIcon,
            iconBg: "bg-[#CC292914]",
            iconColor: "text-[#CC2929]",
        },
        {
            title: "Currently in Escrow",
            count: "$49,500",
            change: "+3%",
            trendDirection: "up",
            isPositive: true,
            icon: ArrowsLeftRightIcon,
            iconBg: "bg-[#BE02BE14]",
            iconColor: "text-[#BE02BE]",
        },
        {
            title: "Avg. Order Value",
            count: "$2,342",
            change: "+5%",
            trendDirection: "up",
            isPositive: true,
            icon: TruckIcon,
            iconBg: "bg-[#1A1AFF14]",
            iconColor: "text-[#1A1AFF]",
        },
        {
            title: "Platform Fees Earning",
            count: "$3,209",
            change: "-12%",
            trendDirection: "down",
            isPositive: false,
            icon: HandCoinsIcon,
            iconBg: "bg-[#DC680314]",
            iconColor: "text-[#DC6803]",
        },
    ];

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

                <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
                    {quickStats.map((card) => {
                        const Icon = card.icon;
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
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                                        <Icon className={`${card.iconClassName ?? "h-5 w-5"} ${card.iconColor}`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendIcon
                                        direction={card.trendDirection}
                                        className={changeClass}
                                    />
                                    <Typography type="text12" fontWeight={600} className="text-[#0B0E05A3]">
                                        <span className={changeClass}>{card.change}</span> this month
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
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
                    {MOCK_ORDERS_DATA.map((order, index) => (
                        <div key={index} className={`flex flex-col space-y-3 p-4 ${LIST_CARD_CLASS}`}>
                            <div className="flex w-full min-w-0 items-center gap-3">
                                <div className={`h-10 w-10 shrink-0 rounded-xl border border-black/5 ${order.colorBg}`} />
                                <div className="min-w-0 flex-1">
                                    <Typography
                                        type="text14"
                                        fontWeight={700}
                                        truncate
                                        maxLength={36}
                                        lines={2}
                                        className="block w-full leading-snug !text-[#0B0E05]"
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
                        <button
                            type="button"
                            className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] py-2.5 shadow-card"
                        >
                            <Typography type="text12" fontWeight={700} className="text-[#0B0E05CC]">
                                Load more
                            </Typography>
                            <span className="mb-0.5 ml-0.5 block h-1.5 w-1.5 rotate-45 border-b-2 border-r-2 border-[#0B0E0514]" />
                        </button>
                    </div>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden w-full md:block">
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
                                {MOCK_ORDERS_DATA.map((order, index) => (
                                    <tr key={index} className="transition-colors hover:bg-[#0B0E050A]">
                                        <td className="py-4 pl-6 pr-2 text-center">
                                            <Typography type="text14" fontWeight={600} className="text-[#0B0E05A3]">
                                                {order.id}
                                            </Typography>
                                        </td>
                                        <td className="overflow-hidden text-ellipsis py-4 px-4">
                                            <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                                                {order.orderId}
                                            </Typography>
                                        </td>
                                        <td className="min-w-0 max-w-[340px] py-4 px-4">
                                            <div className="flex w-full min-w-0 items-center">
                                                <div className={`mr-3 h-8 w-8 shrink-0 rounded-lg border border-black/5 ${order.colorBg}`} />
                                                <div className="min-w-0 flex-1">
                                                    <Typography
                                                        type="text14"
                                                        fontWeight={700}
                                                        truncate
                                                        maxLength={40}
                                                        lines={1}
                                                        className="block w-full !text-[#0B0E05]"
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

                    {/* PAGINATION */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B0E0514] bg-[#FFFFFF] px-6 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                            <Typography type="text12" fontWeight={600} className="whitespace-nowrap text-[#0B0E05]">
                                Rows per page
                            </Typography>
                            <div className="relative shrink-0">
                                <select className="cursor-pointer appearance-none rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] py-1 pl-2 pr-6 text-xs font-medium text-[#0B0E05] outline-none">
                                    <option>10</option>
                                    <option>25</option>
                                </select>
                                <div className="pointer-events-none absolute right-2.5 top-2.5 h-0 w-0 border-l-[3px] border-r-[3px] border-t-[3.5px] border-l-transparent border-r-transparent border-t-[#0B0E0514]" />
                            </div>
                            <Typography type="text12" fontWeight={500} className="ml-2 truncate text-[#0B0E05A3]">
                                Showing 1-20 of 3,598 results
                            </Typography>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3] shadow-none disabled:opacity-40"
                                disabled
                                aria-label="Previous page"
                            >
                                <span className="mb-0.5 block h-2 w-2 rotate-45 border-b border-l border-current" />
                            </button>
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B1EC52]"
                                aria-label="Page 1"
                                aria-current="page"
                            >
                                <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">
                                    1
                                </Typography>
                            </button>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">
                                    2
                                </Typography>
                            </button>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">
                                    3
                                </Typography>
                            </button>
                            <Typography type="text12" fontWeight={600} className="shrink-0 px-1 text-[#0B0E05]">
                                ...
                            </Typography>
                            <button type="button" className="rounded-lg px-2 py-1 hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="whitespace-nowrap text-[#0B0E05]">
                                    285 pages
                                </Typography>
                            </button>
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05] shadow-none"
                                aria-label="Next page"
                            >
                                <span className="mb-0.5 block h-2 w-2 rotate-45 border-r border-t border-current" />
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
