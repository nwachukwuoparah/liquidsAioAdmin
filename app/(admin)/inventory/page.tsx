"use client";

import React, { useState } from 'react';
import {
    CalendarDotsIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    FlagIcon,
    MapPinIcon,
    RadioButtonIcon,
    ShieldIcon,
    SlidersHorizontalIcon,
    StorefrontIcon,
    TagIcon,
    XCircleIcon,
} from "@/components/vector";
import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import InventoryActionMenu from "@/components/inventory-action-menu";
import { LotStatusBadge } from "@/components/inventory-status-badge";
import SearchInput from "@/components/search-input";
import { formatCount } from "@/lib/format-count";
import Typography from '@/components/typography';
import { CARD_BG_CLASS, LIST_CARD_CLASS, METRIC_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, SECTION_CARD_CLASS } from '@/lib/card-styles';

const FILTER_ICON_CLASS = "h-5 w-5 shrink-0 text-[#343330]";

// =========================================================================
// MAIN DASHBOARD CONTENT AREA
// =========================================================================
const PENDING_APPROVAL_COUNT = 154;
const REPORTED_COUNT = 32;

const MOCK_LOTS_DATA = [
    { id: "1.", title: "Mixed electronics pallet – headphones, speakers, chargers", seller: "John stockton", cat: "Electronics", qty: 50, price: "$200", cond: "Mixed", date: "05-07-2025", status: "Pending", img: "bg-amber-100" },
    { id: "2.", title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)", seller: "Wade Warren", cat: "Apparel & Footwear", qty: 286, price: "$1,500", cond: "New", date: "05-07-2025", status: "Active", img: "bg-blue-100", alert: true },
    { id: "3.", title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)", seller: "Kathryn Murphy", cat: "Home & Kitchen", qty: 61, price: "$800", cond: "Overstock", date: "05-07-2025", status: "Active", img: "bg-[#0B0E050A]" },
    { id: "4.", title: "Beauty & Cosmetics Lot – 500 Mixed Units", seller: "Ronald Richards", cat: "Health & Beauty", qty: 29, price: "$1,200", cond: "Shelf Pulls", date: "05-07-2025", status: "Pending", img: "bg-red-100" },
    { id: "5.", title: "Baby Products Pallet – Diapers, Toys, Accessories", seller: "Cameron Williamson", cat: "Toys & Baby", qty: 42, price: "$950", cond: "Customer returns", date: "05-07-2025", status: "Declined", img: "bg-purple-100" },
    { id: "6.", title: "Automotive Accessories – 150 Mixed Items", seller: "Marvin McKinney", cat: "Automotive", qty: 50, price: "$1,700", cond: "Like new", date: "05-07-2025", status: "Active", img: "bg-emerald-100" },
    { id: "7.", title: "Grocery Shelf Pulls – Snacks & Beverages", seller: "Robert Fox", cat: "Grocery & Household", qty: 50, price: "$600", cond: "Overstock", date: "05-07-2025", status: "Out-of-stock", img: "bg-amber-100", alert: true },
    { id: "8.", title: "Office Supplies Pallet – Printers, Paper, Toners", seller: "Savannah Nguyen", cat: "Office & Stationery", qty: 50, price: "$1,100", cond: "Mixed", date: "05-07-2025", status: "Suspended", img: "bg-indigo-100", alert: true },
];

export default function AllLotsContentSection() {
    const [activeTab, setActiveTab] = useState('All lots');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const filterBlueprints: FilterConfig[] = [
        { id: 'status', label: 'Lot Status', defaultValue: 'All statuses', options: ['All statuses', 'Active', 'Pending', 'Declined', 'Suspended', 'Out-of-Stock'], icon: <RadioButtonIcon className={FILTER_ICON_CLASS} /> },
        { id: 'sellerStatus', label: 'Seller status', defaultValue: 'All', options: ['All', 'Verified', 'Unverified'], icon: <ShieldIcon className="h-4 w-[15px] shrink-0 text-[#343330]" /> },
        { id: 'category', label: 'Category', defaultValue: 'All categories', options: ['All categories', 'Electronics', 'Apparel & Footwear', 'Home & Kitchen', 'Health & Beauty'], icon: <TagIcon className={FILTER_ICON_CLASS} /> },
        { id: 'condition', label: 'Condition', defaultValue: 'All conditions', options: ['All conditions', 'New', 'Mixed', 'Overstock'], icon: <RadioButtonIcon className={FILTER_ICON_CLASS} /> },
        { id: 'location', label: 'Location', defaultValue: 'All locations', isSearchable: true, searchPlaceholder: 'Search location...', options: ['All locations', 'California, USA', 'Texas, USA'], icon: <MapPinIcon className={FILTER_ICON_CLASS} /> },
        { id: 'datePosted', label: 'Date posted', defaultValue: 'All time', options: ['All time', 'Today', 'This week'], icon: <CalendarDotsIcon className={FILTER_ICON_CLASS} /> },
        { id: 'priceRange', label: 'Price range', defaultValue: 'All prices', options: ['All prices', '$0-$500', '$500-$2000'], icon: <CurrencyDollarIcon className={FILTER_ICON_CLASS} /> },
    ];

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

    const handleFilterUpdate = (filterId: string, value: string) => {
        setSelectedFilters(prev => ({ ...prev, [filterId]: value }));
    };

    const mobileTabs = [
        { id: 'All lots', label: 'All lots' },
        { id: 'Pending approval', label: `Pending approval (${formatCount(PENDING_APPROVAL_COUNT)})` },
        { id: 'Reported', label: `Reported (${formatCount(REPORTED_COUNT)})` },
        { id: 'Suspended', label: 'Suspended' },
    ] as const;

    return (
        <div className="w-full min-h-screen antialiased font-sans md:p-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">

            {/* OVERVIEW STATS ROW */}
            <div className="space-y-3 px-4 md:px-0">
                <Typography type="text14" fontWeight={700} className="text-[#0B0E05] block">
                    Overview
                </Typography>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                        { title: 'All lot listings', count: '0', icon: StorefrontIcon, iconBg: 'bg-[#BE02BE14]', iconColor: 'text-[#BE02BE]', iconClassName: 'h-5 w-5' },
                        { title: 'Active listings', count: '0', icon: CheckCircleIcon, iconBg: 'bg-[#00A34114]', iconColor: 'text-[#00A341]', iconClassName: 'h-5 w-5' },
                        { title: 'Declined listings', count: '0', icon: XCircleIcon, iconBg: 'bg-[#CC292914]', iconColor: 'text-[#CC2929]', iconClassName: 'h-5 w-5' },
                        { title: 'Suspended', count: '0', icon: FlagIcon, iconBg: 'bg-[#CC292914]', iconColor: 'text-[#CC2929]', iconClassName: 'h-4 w-[15px]' },
                    ].map((card, idx) => {
                        const Icon = card.icon;

                        return (
                            <div key={idx} className={`${METRIC_CARD_CLASS} p-4`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Typography type="text24" fontWeight={700} className="block tracking-tight text-[#0B0E05]">
                                            {card.count}
                                        </Typography>
                                    </div>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                                        <Icon className={`${card.iconClassName} ${card.iconColor}`} />
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
                                    {card.title}
                                </Typography>
                            </div>
                        );
                    })}
                </div>
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
                                    className={`shrink-0 rounded-full border px-4 py-2 transition-all ${
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
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card"
                    >
                        <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#CC2929] text-[11px] font-bold text-white">
                            1
                        </span>
                    </button>
                </div>

                <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
                    {MOCK_LOTS_DATA.map((lot) => (
                        <div
                            key={lot.id}
                            data-testid="mobile-lot-card"
                            className={`flex flex-col gap-3 p-4 ${LIST_CARD_CLASS} rounded-xl`}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#0B0E050A]">
                                    <div className={`absolute inset-0 ${lot.img} opacity-90`} />
                                    {lot.alert && (
                                        <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC2929]">
                                            <FlagIcon className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                    <Typography
                                        type="text14"
                                        fontWeight={700}
                                        truncate
                                        maxLength={42}
                                        lines={2}
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

                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] py-2.5 shadow-card transition-colors active:bg-[#0B0E050A]"
                    >
                        <Typography type="text12" fontWeight={700}>
                            Load more
                        </Typography>
                        <span className="mb-0.5 block h-1.5 w-1.5 rotate-45 border-b-2 border-r-2 border-[#0B0E0514]" />
                    </button>
                </div>
            </div>

            {/* DESKTOP LOTS PANEL */}
            <div className={`hidden md:block ${PANEL_CARD_SHELL_CLASS}`}>
                <div className={PANEL_CARD_CLASS}>

                {/* DESKTOP TABS BAR */}
                <div className="flex items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6">
                    {[
                        { id: 'All lots', label: 'All lots', count: null },
                        { id: 'Pending approval', label: 'Pending approval', count: PENDING_APPROVAL_COUNT },
                        { id: 'Reported', label: 'Reported', count: REPORTED_COUNT },
                        { id: 'Suspended', label: 'Suspended', count: null },
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
                            selectedValues={selectedFilters}
                            onFilterChange={handleFilterUpdate}
                        />
                    </div>
                </div>

                {/* DESKTOP SPREADSHEET LAYOUT TABLE */}
                <div className="w-full">
                    <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A] text-[#0B0E05A3]">
                                <th className="py-3.5 pl-6 pr-4 min-w-[280px] max-w-[340px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Lot title</Typography>
                                </th>
                                <th className="py-3.5 px-4 min-w-[140px] max-w-[180px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Seller</Typography>
                                </th>
                                <th className="py-3.5 px-4 min-w-[150px] max-w-[200px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Category</Typography>
                                </th>
                                <th className="py-3.5 px-4 text-center min-w-[80px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Quantity</Typography>
                                </th>
                                <th className="py-3.5 px-4 min-w-[90px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Price</Typography>
                                </th>
                                <th className="py-3.5 px-4 min-w-[110px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Condition</Typography>
                                </th>
                                <th className="py-3.5 px-4 min-w-[120px]">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Date posted</Typography>
                                </th>
                                <th className="min-w-[140px] py-3.5 px-4">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Status</Typography>
                                </th>
                                <th className="py-3.5 pr-6 pl-2 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B0E0514]  bg-[#FFFFFF]">
                            {MOCK_LOTS_DATA.map((lot) => (
                                <tr key={lot.id} className="transition-colors hover:bg-[#0B0E050A]">
                                    <td className="py-3.5 pl-6 pr-4 min-w-0 max-w-[340px]">
                                        <div className="flex items-center w-full min-w-0">
                                            <Typography type="text12" fontWeight={700} className="text-[#0B0E05A3] mr-2 shrink-0 w-5 text-left">
                                                {lot.id}
                                            </Typography>
                                            <div className={`h-8 w-8 rounded-lg ${lot.img} flex items-center justify-center shrink-0 relative mr-3`}>
                                                {lot.alert && <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-red-500 border border-white" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <Typography
                                                    type="text14"
                                                    fontWeight={700}
                                                    className=" block w-full"
                                                    truncate={true}
                                                    maxLength={40}
                                                    lines={1}
                                                >
                                                    {lot.title}
                                                </Typography>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 min-w-0 max-w-[180px]">
                                        <div className="block w-full min-w-0">
                                            <Typography type="text14" fontWeight={500} truncate={true} maxLength={22} className=" block w-full">
                                                {lot.seller}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 min-w-0 max-w-[200px]">
                                        <div className="block w-full min-w-0">
                                            <Typography type="text14" fontWeight={500} truncate={true} maxLength={24} className=" block w-full">
                                                {lot.cat}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <Typography type="text14" fontWeight={600} className="text-[#0B0E05CC]">{lot.qty}</Typography>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">{lot.price}</Typography>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Typography type="text14" fontWeight={500} className="">{lot.cond}</Typography>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">{lot.date}</Typography>
                                    </td>
                                    <td className="whitespace-nowrap py-3.5 px-4">
                                        <LotStatusBadge status={lot.status} />
                                    </td>
                                    <td className="relative py-3.5 pl-2 pr-6">
                                        <InventoryActionMenu
                                            isOpen={actionMenuId === lot.id}
                                            onToggle={() => setActionMenuId(actionMenuId === lot.id ? null : lot.id)}
                                            onClose={() => setActionMenuId(null)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    {/* DESKTOP FOOTER CONTROL AREA */}
                    <div className="flex items-center justify-between border-t border-[#0B0E0514] bg-[#FFFFFF] px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Typography type="text12" fontWeight={600} className="">Rows per page</Typography>
                            <div className="relative">
                                <select className="bg-[#FFFFFF] border border-[#0B0E0514] rounded-lg pl-2 pr-6 py-1 text-xs outline-none appearance-none cursor-pointer font-medium">
                                    <option>10</option>
                                    <option>25</option>
                                </select>
                                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3.5px] border-t-[#0B0E0514] absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                            <Typography type="text12" fontWeight={500} className="text-[#0B0E05A3] ml-2">
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
                                <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">1</Typography>
                            </button>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">2</Typography>
                            </button>
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">3</Typography>
                            </button>
                            <Typography type="text12" fontWeight={600} className="shrink-0 px-1 text-[#0B0E05]">
                                ...
                            </Typography>
                            <button type="button" className="rounded-lg px-2 py-1 hover:bg-[#0B0E050A]">
                                <Typography type="text12" fontWeight={600} className="whitespace-nowrap text-[#0B0E05]">285 pages</Typography>
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
        </div>
    );
}