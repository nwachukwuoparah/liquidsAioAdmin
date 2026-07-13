import type {
    AdminInventoryStatsRecord,
    AdminInventoryTabCounts,
} from "@/lib/admin/types/admin-api.types";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

export interface AdminInventoryStatsData {
    stats: AdminInventoryStatsRecord[];
    tabCounts: AdminInventoryTabCounts;
}

interface RawInventoryTabCounts {
    allLots?: number;
    all_lots?: number;
    total?: number;
    pendingApproval?: number;
    pending_approval?: number;
    reported?: number;
    suspended?: number;
    suspendedLots?: number;
    suspended_lots?: number;
}

interface RawInventoryStatsPayload {
    stats?: AdminInventoryStatsRecord[];
    tabCounts?: RawInventoryTabCounts;
    tab_counts?: RawInventoryTabCounts;
}

function toCount(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, value);
    }

    if (typeof value === "string") {
        const parsed = Number(value.replace(/,/g, "").trim());
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }

    return 0;
}

function countFromStatsLabel(
    stats: readonly AdminInventoryStatsRecord[],
    matchers: readonly string[],
): number {
    const match = stats.find((stat) => {
        const label = stat.label?.toLowerCase() ?? "";
        return matchers.some((matcher) => label.includes(matcher));
    });

    return toCount(match?.value);
}

/** Normalizes GET /inventory/stats into stats cards + tab badge counts. */
export function parseAdminInventoryStatsResponse(body: unknown): AdminInventoryStatsData {
    const payload = parseAdminApiResponseData<RawInventoryStatsPayload>(body);
    const stats = Array.isArray(payload.stats) ? payload.stats : [];
    const rawTabCounts = payload.tabCounts ?? payload.tab_counts ?? {};

    const pendingApproval =
        toCount(rawTabCounts.pendingApproval ?? rawTabCounts.pending_approval)
        || countFromStatsLabel(stats, ["pending approval", "pending"]);
    const reported =
        toCount(rawTabCounts.reported)
        || countFromStatsLabel(stats, ["reported"]);
    const suspended =
        toCount(
            rawTabCounts.suspended
            ?? rawTabCounts.suspendedLots
            ?? rawTabCounts.suspended_lots,
        )
        || countFromStatsLabel(stats, ["suspended"]);
    const allLots =
        toCount(rawTabCounts.allLots ?? rawTabCounts.all_lots ?? rawTabCounts.total)
        || countFromStatsLabel(stats, ["all lot", "total active", "total lot"]);

    return {
        stats,
        tabCounts: {
            allLots,
            pendingApproval,
            reported,
            suspended,
        },
    };
}
