import type { PeriodOption } from "@/components/period-dropdown";

export interface AdminOrdersOverviewQueryParams {
    start?: string;
    end?: string;
}

export interface AdminOrdersOverviewMetric {
    count?: number;
    total?: number;
    amount?: number;
    value?: number | string;
    deltaPercentage?: number | null;
}

export interface AdminOrdersOverviewData {
    totalOrders?: AdminOrdersOverviewMetric | number;
    activeOrders?: AdminOrdersOverviewMetric | number;
    completedOrders?: AdminOrdersOverviewMetric | number;
    disputedOrders?: AdminOrdersOverviewMetric | number;
    allRefundsIssued?: AdminOrdersOverviewMetric | number;
    currentlyInEscrow?: AdminOrdersOverviewMetric | number;
    avgOrderValue?: AdminOrdersOverviewMetric | number;
    platformFees?: AdminOrdersOverviewMetric | number;
    start?: string;
    end?: string;
    previousStart?: string;
    previousEnd?: string;
}

export interface AdminOrdersOverviewCardConfig {
    key: string;
    title: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
    iconClassName?: string;
    isCurrency?: boolean;
    periodSuffix?: string;
    defaultChange?: string;
    deltaTone?: "positiveGood" | "alert";
}

export const ADMIN_ORDER_OVERVIEW_CARDS: AdminOrdersOverviewCardConfig[] = [
    {
        key: "totalOrders",
        title: "Total Orders (YTD)",
        iconKey: "truck",
        iconBg: "bg-[#BE02BE14]",
        iconColor: "text-[#BE02BE]",
        defaultChange: "—",
        periodSuffix: "",
        deltaTone: "positiveGood",
    },
    {
        key: "activeOrders",
        title: "Active Orders",
        iconKey: "thumbsUp",
        iconBg: "bg-[#00A34114]",
        iconColor: "text-[#00A341]",
        deltaTone: "positiveGood",
    },
    {
        key: "completedOrders",
        title: "Completed Orders",
        iconKey: "checkCircle",
        iconBg: "bg-[#00A34114]",
        iconColor: "text-[#00A341]",
        deltaTone: "positiveGood",
    },
    {
        key: "disputedOrders",
        title: "Disputed Orders",
        iconKey: "flag",
        iconBg: "bg-[#CC292914]",
        iconColor: "text-[#CC2929]",
        iconClassName: "h-4 w-[15px]",
        deltaTone: "alert",
    },
    {
        key: "allRefundsIssued",
        title: "All Refunds Issued",
        iconKey: "arrowUUpLeft",
        iconBg: "bg-[#CC292914]",
        iconColor: "text-[#CC2929]",
        deltaTone: "alert",
    },
    {
        key: "currentlyInEscrow",
        title: "Currently in Escrow",
        iconKey: "arrowsLeftRight",
        iconBg: "bg-[#BE02BE14]",
        iconColor: "text-[#BE02BE]",
        isCurrency: true,
        deltaTone: "positiveGood",
    },
    {
        key: "avgOrderValue",
        title: "Avg. Order Value",
        iconKey: "truck",
        iconBg: "bg-[#1A1AFF14]",
        iconColor: "text-[#1A1AFF]",
        isCurrency: true,
        deltaTone: "positiveGood",
    },
    {
        key: "platformFees",
        title: "Platform Fees Earning",
        iconKey: "handCoins",
        iconBg: "bg-[#DC680314]",
        iconColor: "text-[#DC6803]",
        isCurrency: true,
        deltaTone: "positiveGood",
    },
];

/**
 * Returns ISO `start` / `end` query params for the selected period option.
 * When 'This month' is selected, returns undefined so the server defaults to current calendar month.
 */
export function getAdminOrderOverviewRange(period: PeriodOption): { start?: string; end?: string } {
    const now = new Date();

    if (period === "This month") {
        return {};
    }

    if (period === "Today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    if (period === "This week") {
        const day = now.getDay();
        // Set to Monday of current week
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
        const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 3600000 + 59 * 60000 + 59999);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    if (period === "This year") {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    // "All time"
    const start = new Date(2020, 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}
