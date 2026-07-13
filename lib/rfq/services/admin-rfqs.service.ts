import { apiClient } from "@/lib/api/api-client";
import { getAdminApiResponseMessage } from "@/lib/admin/utilities/parse-admin-api-response-data";
import {
    ADMIN_RFQ_DEFAULT_ORDER,
    ADMIN_RFQ_DEFAULT_PAGE_LIMIT,
    ADMIN_RFQS_ADMIN_PATH,
    getAdminRfqResolvePath,
} from "@/lib/rfq/constants/admin-rfqs-api.constant";
import type {
    AdminRfqsAdminApiPage,
    AdminRfqsAdminApiResponseBody,
    FetchAdminRfqsPageParams,
} from "@/lib/rfq/types/admin-rfqs-api.types";
import { parseAdminRfqsAdminApiResponse } from "@/lib/rfq/utilities/parse-admin-rfqs-admin-api-response";

function buildAdminRfqsQueryParams({
    status,
    limit = ADMIN_RFQ_DEFAULT_PAGE_LIMIT,
    order = ADMIN_RFQ_DEFAULT_ORDER,
    cursorId,
    cursorSortAt,
    minPrice,
    maxPrice,
}: FetchAdminRfqsPageParams): Record<string, string | undefined> {
    return {
        status,
        limit: String(limit),
        order,
        cursor_id: cursorId,
        cursor_sort_at: cursorSortAt,
        min_price: minPrice != null ? String(minPrice) : undefined,
        max_price: maxPrice != null ? String(maxPrice) : undefined,
    };
}

/** Fetches a cursor-paginated admin RFQ page for the selected status tab. */
export async function fetchAdminRfqsPage(
    params: FetchAdminRfqsPageParams,
): Promise<AdminRfqsAdminApiPage> {
    const { body } = await apiClient.get<AdminRfqsAdminApiResponseBody>(
        ADMIN_RFQS_ADMIN_PATH,
        buildAdminRfqsQueryParams(params),
    );

    return parseAdminRfqsAdminApiResponse(body);
}

/** Marks a buyer RFQ as resolved via POST /rfqs/{id}/resolve. */
export async function postAdminRfqResolve(rfqId: string) {
    // Same empty JSON body pattern as lot approve — docs list no parameters, but
    // a bare POST with Content-Length 0 is rejected by some API middleware.
    const response = await apiClient.post<unknown>(getAdminRfqResolvePath(rfqId), {});

    return {
        message: getAdminApiResponseMessage(response.body, "Request marked as resolved."),
    };
}
