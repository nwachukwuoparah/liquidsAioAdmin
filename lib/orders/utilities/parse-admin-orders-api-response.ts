import type {
    AdminOrderApiRecord,
    AdminOrdersMappedPage,
    AdminOrdersApiResponse,
} from "@/lib/orders/types/admin-orders-api.types";
import { mapAdminOrderApiRecord } from "@/lib/orders/utilities/map-admin-order-api-record";

/**
 * Normalizes the GET /v1/orders/admin response body into a mapped page of table records.
 */
export function parseAdminOrdersApiResponse(
    body: unknown,
    pageOffset = 0,
): AdminOrdersMappedPage {
    if (!body || typeof body !== "object") {
        return {
            orders: [],
            totalCount: 0,
            hasNext: false,
            nextCursor: null,
        };
    }

    const payload = body as AdminOrdersApiResponse;
    const inner = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;

    let rawOrders: AdminOrderApiRecord[] = [];
    if (Array.isArray(payload.data)) {
        rawOrders = payload.data;
    } else if (Array.isArray(inner.orders)) {
        rawOrders = inner.orders as AdminOrderApiRecord[];
    } else if (Array.isArray(inner.results)) {
        rawOrders = inner.results as AdminOrderApiRecord[];
    } else if (Array.isArray(payload.orders)) {
        rawOrders = payload.orders;
    } else if (Array.isArray(payload.results)) {
        rawOrders = payload.results;
    } else if (Array.isArray(body)) {
        rawOrders = body as AdminOrderApiRecord[];
    }

    const totalCount =
        typeof inner.totalCount === "number"
            ? inner.totalCount
            : typeof inner.total === "number"
              ? inner.total
              : typeof inner.count === "number"
                ? inner.count
                : typeof payload.totalCount === "number"
                  ? payload.totalCount
                  : rawOrders.length;

    const nextCursor =
        (inner.nextCursor as AdminOrdersMappedPage["nextCursor"]) ??
        (payload.nextCursor as AdminOrdersMappedPage["nextCursor"]) ??
        null;

    const hasNext = Boolean(inner.hasNext ?? payload.hasNext ?? nextCursor != null);

    const mappedOrders = rawOrders.map((record, index) =>
        mapAdminOrderApiRecord(record, index, pageOffset),
    );

    return {
        orders: mappedOrders,
        totalCount,
        hasNext,
        nextCursor,
    };
}
