import type { AdminOverviewDashboardData } from "@/lib/admin/types/admin-api.types";
import type { CategoryGmvItem, TrendDataPoint } from "@/lib/overview/chart-data";

export interface AdminComplianceOverviewStats {
    pending: number;
    approved: number;
    rejected: number;
}

export interface AdminOverviewStatCardConfig {
    key: keyof AdminComplianceOverviewStats;
    label: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
}

export const COMPLIANCE_OVERVIEW_STAT_CARDS: AdminOverviewStatCardConfig[] = [
    {
        key: "pending",
        label: "Pending reviews",
        iconKey: "hourglass",
        iconBg: "bg-[#DC680314]",
        iconColor: "text-[#DC6803]",
    },
    {
        key: "approved",
        label: "Approved today",
        iconKey: "checkCircle",
        iconBg: "bg-[#00A34114]",
        iconColor: "text-[#00A341]",
    },
    {
        key: "rejected",
        label: "Rejected today",
        iconKey: "xCircle",
        iconBg: "bg-[#CC292914]",
        iconColor: "text-[#CC2929]",
    },
];

export interface AdminOverviewResponse {
    dashboard: AdminOverviewDashboardData;
    charts: {
        period: string;
        trendData: TrendDataPoint[];
        categoryData: CategoryGmvItem[];
    };
    rfqTabCounts: {
        pending: number;
        resolved: number;
    };
}
