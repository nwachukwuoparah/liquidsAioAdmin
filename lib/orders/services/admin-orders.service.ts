import { apiClient } from "@/lib/api/api-client";
import {
    ADMIN_ORDERS_API_PATH,
    DEFAULT_ORDERS_LIMIT,
    DEFAULT_ORDERS_SORT_ORDER,
    ORDER_TAB_TO_STATUS,
    getAdminOrderDetailPath,
    getAdminOrderPaymentHoldPath,
    getAdminOrderPaymentReleasePath,
    getAdminOrderRefundPath,
} from "@/lib/orders/constants/admin-orders-api.constant";
import type {
    AdminOrdersMappedPage,
    FetchAdminOrdersPageParams,
} from "@/lib/orders/types/admin-orders-api.types";
import type { AdminOrderDetailMapped } from "@/lib/orders/types/admin-orders-detail-api.types";
import { parseAdminOrdersApiResponse } from "@/lib/orders/utilities/parse-admin-orders-api-response";
import { mapAdminOrderDetailApiRecord } from "@/lib/orders/utilities/map-admin-order-detail-api-record";

/**
 * Builds the query parameter dictionary matching the GET /v1/orders/admin Swagger specification.
 */
export function buildAdminOrdersQueryParams(
    params: FetchAdminOrdersPageParams = {},
): Record<string, string | undefined> {
    const orderStatus =
        params.order_status ||
        (params.tab ? ORDER_TAB_TO_STATUS[params.tab] : undefined);

    const searchQuery = params.q?.trim() || params.search?.trim() || undefined;

    return {
        cursor_id: params.cursor_id,
        cursor_sort_at: params.cursor_sort_at,
        cursor_search_rank:
            params.cursor_search_rank != null
                ? String(params.cursor_search_rank)
                : undefined,
        limit: params.limit != null ? String(params.limit) : String(DEFAULT_ORDERS_LIMIT),
        order: params.order || DEFAULT_ORDERS_SORT_ORDER,
        q: searchQuery,
        order_status: orderStatus,
        payment_status: params.payment_status,
        start: params.start,
        end: params.end,
    };
}

/**
 * Fetches a cursor-paginated page of admin orders from GET /v1/orders/admin.
 */
export async function fetchAdminOrdersPage(
    params: FetchAdminOrdersPageParams = {},
    pageOffset = 0,
): Promise<AdminOrdersMappedPage> {
    const queryParams = buildAdminOrdersQueryParams(params);

    try {
        const { body } = await apiClient.get<unknown>(ADMIN_ORDERS_API_PATH, queryParams);
        return parseAdminOrdersApiResponse(body, pageOffset);
    } catch (error) {
        // If dispute_or_refunded has not yet been implemented on the backend,
        // return an empty page instead of surfacing a fatal query error.
        if (
            params.order_status === "dispute_or_refunded" ||
            params.tab === "Dispute / Refunds" ||
            queryParams.order_status === "dispute_or_refunded"
        ) {
            return {
                orders: [],
                totalCount: 0,
                nextCursor: null,
                hasNext: false,
            };
        }

        throw error;
    }
}

/**
 * Fetches the list of orders for the active filters.
 */
export async function fetchAdminOrdersList(
    params: FetchAdminOrdersPageParams = {},
) {
    const page = await fetchAdminOrdersPage(params);
    return page.orders;
}

/**
 * Fetches the detail of an admin order from GET /v1/orders/admin/{orderId}.
 * Tries the order ID first. If the order ID is not working (fails with error),
 * automatically uses the UUID.
 */
export async function fetchAdminOrderDetail(
    orderId: string,
    fallbackUuid?: string,
): Promise<AdminOrderDetailMapped> {
    const cleanOrderId = orderId.replace(/^#/, "").trim();
    const cleanUuid = fallbackUuid ? fallbackUuid.replace(/^#/, "").trim() : undefined;

    // 1. Try order ID first
    try {
        const path = getAdminOrderDetailPath(cleanOrderId);
        const { body } = await apiClient.get<unknown>(path);
        return mapAdminOrderDetailApiRecord(body, cleanOrderId);
    } catch (orderIdError) {
        // 2. If the order ID is not working and a UUID is available, use the UUID
        if (cleanUuid && cleanUuid !== cleanOrderId) {
            try {
                const uuidPath = getAdminOrderDetailPath(cleanUuid);
                const { body } = await apiClient.get<unknown>(uuidPath);
                return mapAdminOrderDetailApiRecord(body, cleanOrderId);
            } catch {
                // If both fail, rethrow original error
                throw orderIdError;
            }
        }
        throw orderIdError;
    }
}

export interface AdminOrderPaymentHoldRequestBody {
    reason: string;
}

export interface AdminOrderPaymentReleaseRequestBody {
    reason?: string;
}

/**
 * Places a payment hold on an order: PATCH /v1/orders/admin/{orderId}/payment-hold
 */
export async function holdAdminOrderPayment(
    orderId: string,
    body: AdminOrderPaymentHoldRequestBody,
) {
    const path = getAdminOrderPaymentHoldPath(orderId);
    const { body: resBody } = await apiClient.patch<unknown>(path, body);
    return resBody;
}

/**
 * Releases a payment hold on an order: PATCH /v1/orders/admin/{orderId}/payment-hold/release
 */
export async function releaseAdminOrderPaymentHold(
    orderId: string,
    body: AdminOrderPaymentReleaseRequestBody = {},
) {
    const path = getAdminOrderPaymentReleasePath(orderId);
    const { body: resBody } = await apiClient.patch<unknown>(path, {
        reason: body.reason || "Payment hold released by admin",
    });
    return resBody;
}

export interface AdminOrderRefundRequestBody {
    reason: string;
}

/**
 * Starts a full buyer refund for an order: POST /v1/orders/admin/{orderId}/refund
 */
export async function refundAdminOrderBuyer(
    orderId: string,
    body: AdminOrderRefundRequestBody,
) {
    const path = getAdminOrderRefundPath(orderId);
    const { body: resBody } = await apiClient.post<unknown>(path, body);
    return resBody;
}
