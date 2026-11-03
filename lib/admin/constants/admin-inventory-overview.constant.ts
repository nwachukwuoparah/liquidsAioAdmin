import type { PeriodOption } from "@/components/period-dropdown";

export interface AdminInventoryOverviewMetric {
    count: number;
    delta: number;
}

export interface AdminInventoryOverviewStats {
    allListings: AdminInventoryOverviewMetric;
    activeListings: AdminInventoryOverviewMetric;
    declinedListings: AdminInventoryOverviewMetric;
    suspendedListings: AdminInventoryOverviewMetric;
    start?: string;
    end?: string;
    previousStart?: string;
    previousEnd?: string;
}

export interface AdminInventoryOverviewStatCardConfig {
    key: keyof Pick<
        AdminInventoryOverviewStats,
        "allListings" | "activeListings" | "declinedListings" | "suspendedListings"
    >;
    label: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
    /** Controls whether an increase is good (green) or alert-style (red). */
    deltaTone?: "positiveGood" | "alert";
}

export const INVENTORY_OVERVIEW_STAT_CARDS: AdminInventoryOverviewStatCardConfig[] = [
    {
        key: "allListings",
        label: "All lot listings",
        iconKey: "storefront",
        iconBg: "bg-[#1A1AFF14]",
        iconColor: "text-[#1A1AFF]",
        deltaTone: "positiveGood",
    },
    {
        key: "activeListings",
        label: "Active listings",
        iconKey: "checkCircle",
        iconBg: "bg-[#00A34114]",
        iconColor: "text-[#00A341]",
        deltaTone: "positiveGood",
    },
    {
        key: "declinedListings",
        label: "Declined listings",
        iconKey: "xCircle",
        iconBg: "bg-[#CC292914]",
        iconColor: "text-[#CC2929]",
        deltaTone: "alert",
    },
    {
        key: "suspendedListings",
        label: "Suspended",
        iconKey: "flag",
        iconBg: "bg-[#CC292914]",
        iconColor: "text-[#CC2929]",
        deltaTone: "alert",
    },
];

/** Returns ISO `start` / `end` for the current calendar month. */
export function getInventoryOverviewDefaultRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

/**
 * Returns ISO `start` / `end` query params for the selected period option.
 */
export function getInventoryOverviewRange(period: PeriodOption): { start: string; end: string } {
    const now = new Date();

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

    if (period === "This month") {
        return getInventoryOverviewDefaultRange();
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

/** Formats a metric delta for display in overview cards. */
export function formatInventoryOverviewDelta(
    delta: number,
    tone: AdminInventoryOverviewStatCardConfig["deltaTone"] = "positiveGood",
): {
    text: string;
    className: string;
    trendDirection: "up" | "down" | "flat";
} {
    if (delta === 0) {
        return { text: "0", className: "text-[#0B0E05A3]", trendDirection: "flat" };
    }

    const text = delta > 0 ? `+${delta}` : String(delta);
    const trendDirection: "up" | "down" = delta > 0 ? "up" : "down";

    if (tone === "alert") {
        return { text, className: "text-[#CC2929]", trendDirection };
    }

    if (delta > 0) {
        return { text, className: "text-[#117346]", trendDirection };
    }

    return { text, className: "text-[#CC2929]", trendDirection };
}
