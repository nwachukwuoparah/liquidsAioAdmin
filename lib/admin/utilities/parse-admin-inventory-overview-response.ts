import type { AdminInventoryOverviewStats } from "@/lib/admin/constants/admin-inventory-overview.constant";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

interface AdminInventoryOverviewDateRange {
    start?: string;
    end?: string;
}

interface AdminInventoryOverviewApiPayload {
    stats?: AdminInventoryOverviewStats;
    range?: AdminInventoryOverviewDateRange;
    previousRange?: AdminInventoryOverviewDateRange;
    allListings?: AdminInventoryOverviewStats["allListings"];
    activeListings?: AdminInventoryOverviewStats["activeListings"];
    declinedListings?: AdminInventoryOverviewStats["declinedListings"];
    suspendedListings?: AdminInventoryOverviewStats["suspendedListings"];
    start?: string;
    end?: string;
    previousStart?: string;
    previousEnd?: string;
}

/** Parses the lots admin overview API body into normalized overview stats. */
export function parseAdminInventoryOverviewResponse(body: unknown): AdminInventoryOverviewStats {
    const payload = parseAdminApiResponseData<AdminInventoryOverviewApiPayload>(body);
    const stats = payload.stats ?? payload;

    return {
        allListings: stats.allListings ?? { count: 0, delta: 0 },
        activeListings: stats.activeListings ?? { count: 0, delta: 0 },
        declinedListings: stats.declinedListings ?? { count: 0, delta: 0 },
        suspendedListings: stats.suspendedListings ?? { count: 0, delta: 0 },
        start: payload.range?.start ?? payload.start,
        end: payload.range?.end ?? payload.end,
        previousStart: payload.previousRange?.start ?? payload.previousStart,
        previousEnd: payload.previousRange?.end ?? payload.previousEnd,
    };
}
