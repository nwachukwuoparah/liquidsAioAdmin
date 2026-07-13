"use client";

import { useAdminComplianceOverview } from "@/lib/admin/hooks/use-admin-compliance";
import { useAdminInventoryTabCounts } from "@/lib/admin/hooks/use-admin-inventory";
import { useAdminRfqTabCounts } from "@/lib/admin/hooks/use-admin-rfqs";
import type { AdminNavBadgeKey } from "@/lib/admin-nav-items";
import { formatNavBadgeCount } from "@/lib/format-count";

export type AdminNavBadgeCounts = Record<AdminNavBadgeKey, string | null>;

/** Loads live pending counts for Compliance, Buyer RFQs, and All Lots nav badges. */
export function useAdminNavBadgeCounts(): AdminNavBadgeCounts {
    const complianceOverviewQuery = useAdminComplianceOverview();
    const rfqTabCounts = useAdminRfqTabCounts();
    const inventoryTabCounts = useAdminInventoryTabCounts();

    return {
        compliance: formatNavBadgeCount(complianceOverviewQuery.data?.overview?.pending),
        rfqs: formatNavBadgeCount(rfqTabCounts.pending),
        inventory: formatNavBadgeCount(inventoryTabCounts.tabCounts.pendingApproval),
    };
}
