/** Admin RFQ list endpoint (cursor pagination, status filter). */
export const ADMIN_RFQS_ADMIN_PATH = "/rfqs/admin";

export const ADMIN_RFQ_DEFAULT_PAGE_LIMIT = 25;

export const ADMIN_RFQ_DEFAULT_ORDER = "desc" as const;

export const ADMIN_RFQ_TAB_STATUSES = ["pending", "resolved"] as const;

export type AdminRfqTabStatus = (typeof ADMIN_RFQ_TAB_STATUSES)[number];

/** Returns the resolve path for a buyer RFQ: POST /rfqs/{id}/resolve. */
export function getAdminRfqResolvePath(rfqId: string): string {
    return `/rfqs/${encodeURIComponent(rfqId)}/resolve`;
}