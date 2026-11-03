/** Admin orders cursor-paginated endpoint: GET /v1/orders/admin */
export const ADMIN_ORDERS_API_PATH = "/orders/admin";

export const DEFAULT_ORDERS_LIMIT = 25;
export const DEFAULT_ORDERS_SORT_ORDER = "desc" as const;

/**
 * Maps the orders dashboard UI tab labels to the backend `order_status` query parameter.
 * active: awaiting shipment or in transit.
 * completed: delivered orders.
 * dispute_or_refunded: orders in dispute or with confirmed refund.
 * cancelled: cancelled orders.
 */
export const ORDER_TAB_TO_STATUS: Record<string, string | undefined> = {
    "All": undefined,
    "Active orders": "active",
    "Completed": "completed",
    "Dispute / Refunds": "dispute_or_refunded",
    "Cancelled": "cancelled",
};

/**
 * Maps dropdown payment status filter options to backend `payment_status` parameter values.
 */
export const PAYMENT_STATUS_FILTER_TO_API: Record<string, string | undefined> = {
    "All": undefined,
    "Pending": "processing",
    "In Escrow": "processing",
    "Released": "succeeded",
    "Refunded": "canceled",
    "processing": "processing",
    "succeeded": "succeeded",
    "canceled": "canceled",
    "requires_action": "requires_action",
    "requires_capture": "requires_capture",
    "requires_confirmation": "requires_confirmation",
    "requires_payment_method": "requires_payment_method",
};

/**
 * Maps dropdown order status filter options to backend `order_status` parameter values.
 */
export const ORDER_STATUS_FILTER_TO_API: Record<string, string | undefined> = {
    "All": undefined,
    "Active": "active",
    "Active orders": "active",
    "Awaiting shipment": "active",
    "In-transit": "active",
    "Awaiting shipment / In-transit": "active",
    "Delivered": "completed",
    "Completed": "completed",
    "Dispute": "dispute_or_refunded",
    "Dispute / Refunds": "dispute_or_refunded",
    "Order completed": "completed",
    "Cancelled": "cancelled",
    "active": "active",
    "completed": "completed",
    "dispute_or_refunded": "dispute_or_refunded",
};

/**
 * Converts a date range filter value (e.g. "This month", "Last 7 days") to ISO start and end strings.
 */
export function getOrdersFilterDateRange(filterValue?: string): { start?: string; end?: string } {
    if (!filterValue || filterValue === "All" || filterValue === "All time") {
        return {};
    }

    const now = new Date();

    if (filterValue === "This month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return { start: start.toISOString(), end: now.toISOString() };
    }

    if (filterValue === "Last 7 days") {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: start.toISOString(), end: now.toISOString() };
    }

    return {};
}

/** Path for fetching an admin order detail: GET /v1/orders/admin/{orderId} */
export function getAdminOrderDetailPath(orderId: string): string {
    const cleanId = orderId.replace(/^#/, "").trim();
    return `${ADMIN_ORDERS_API_PATH}/${encodeURIComponent(cleanId)}`;
}

/** Path for placing a payment hold: PATCH /v1/orders/admin/{orderId}/payment-hold */
export function getAdminOrderPaymentHoldPath(orderId: string): string {
    const cleanId = orderId.replace(/^#/, "").trim();
    return `${ADMIN_ORDERS_API_PATH}/${encodeURIComponent(cleanId)}/payment-hold`;
}

/** Path for releasing a payment hold: PATCH /v1/orders/admin/{orderId}/payment-hold/release */
export function getAdminOrderPaymentReleasePath(orderId: string): string {
    const cleanId = orderId.replace(/^#/, "").trim();
    return `${ADMIN_ORDERS_API_PATH}/${encodeURIComponent(cleanId)}/payment-hold/release`;
}

/** Path for refunding a buyer: POST /v1/orders/admin/{orderId}/refund */
export function getAdminOrderRefundPath(orderId: string): string {
    const cleanId = orderId.replace(/^#/, "").trim();
    return `${ADMIN_ORDERS_API_PATH}/${encodeURIComponent(cleanId)}/refund`;
}

