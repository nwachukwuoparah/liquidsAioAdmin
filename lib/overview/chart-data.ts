export type TrendRange = "30D" | "7D" | "1D";

export type TrendDataPoint = {
    date: string;
    gmv: number;
    orders: number;
};

export type CategoryGmvItem = {
    name: string;
    value: number;
    color: string;
};

export const TREND_RANGES: TrendRange[] = ["30D", "7D", "1D"];

export const CATEGORY_PERIODS = ["This month", "Last month", "Last 3 months"] as const;

export type CategoryPeriod = (typeof CATEGORY_PERIODS)[number];

const TREND_DATA_30D: TrendDataPoint[] = [
    { date: "Aug 26", gmv: 55000, orders: 42 },
    { date: "Aug 27", gmv: 72000, orders: 55 },
    { date: "Aug 28", gmv: 88000, orders: 62 },
    { date: "Aug 29", gmv: 105000, orders: 72 },
    { date: "Aug 30", gmv: 140000, orders: 90 },
    { date: "Sep 1", gmv: 128000, orders: 82 },
    { date: "Sep 2", gmv: 135000, orders: 86 },
    { date: "Sep 3", gmv: 148000, orders: 92 },
    { date: "Yesterday", gmv: 152000, orders: 94 },
    { date: "Today", gmv: 155000, orders: 95 },
];

export const CATEGORY_GMV_DATA: CategoryGmvItem[] = [
    { name: "Home & garden", value: 20, color: "#7C3AED" },
    { name: "Foods", value: 18, color: "#831843" },
    { name: "Fashion", value: 12, color: "#EC4899" },
    { name: "Clothing", value: 18, color: "#991B1B" },
    { name: "Electronics", value: 18, color: "#38BDF8" },
    { name: "Skin care", value: 8, color: "#059669" },
    { name: "Farm product", value: 6, color: "#EA580C" },
];

export function formatGmv(value: number): string {
    if (value >= 1000) {
        const thousands = value / 1000;
        const formatted = Number.isInteger(thousands)
            ? thousands.toString()
            : thousands.toFixed(1).replace(/\.0$/, "");
        return `$${formatted}k`;
    }
    return `$${value.toLocaleString()}`;
}

export function formatGmvFull(value: number): string {
    return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

export function getTrendDataForRange(range: TrendRange): TrendDataPoint[] {
    switch (range) {
        case "7D":
            return TREND_DATA_30D.slice(-7);
        case "1D":
            return TREND_DATA_30D.slice(-1);
        case "30D":
        default:
            return TREND_DATA_30D;
    }
}

export function getCategoryDataForPeriod(_period: CategoryPeriod): CategoryGmvItem[] {
    return CATEGORY_GMV_DATA;
}
