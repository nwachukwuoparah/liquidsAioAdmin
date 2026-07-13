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
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
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
