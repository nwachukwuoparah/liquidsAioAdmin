import {
    ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
    ADMIN_LOTS_PATH,
} from "@/lib/inventory/constants/admin-inventory-api.constant";
import {
    getAdminLotApprovePath,
    getAdminLotDetailPath,
    getAdminLotRejectPath,
    getAdminLotSuspendPath,
    buildAdminLotSuspendReason,
} from "@/lib/inventory/constants/admin-inventory-review.constant";
import type { AdminInventoryLotsMappedPage } from "@/lib/inventory/types/admin-inventory-api.types";
import type {
    AdminInventoryLotDetailRecord,
    AdminLotReviewRequestBody,
} from "@/lib/inventory/types/admin-inventory-detail.types";
import { mapAdminInventoryLotDetailApiRecord } from "@/lib/inventory/utilities/map-admin-inventory-detail-api-record";
import { mapAdminInventoryLotApiRecord } from "@/lib/inventory/utilities/map-admin-inventory-lot-api-record";
import { parseAdminInventoryDetailResponse } from "@/lib/inventory/utilities/parse-admin-inventory-detail-response";
import { parseAdminInventoryLotsResponse } from "@/lib/inventory/utilities/parse-admin-inventory-lots-response";
import { getAdminApiResponseMessage } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { apiClient } from "@/lib/api/api-client";

/** Fetches a page of admin inventory lots from GET /lots. */
export async function fetchAdminInventoryLotsPage(
    params: Record<string, string> = {},
): Promise<AdminInventoryLotsMappedPage> {
    const { body } = await apiClient.get<unknown>(ADMIN_LOTS_PATH, params);
    console.log("[GET /lots] raw API response:", body);

    const parsedPage = parseAdminInventoryLotsResponse(body, params.limit);
    const requestedPage = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT);
    const results = parsedPage.lots.map((record, index) => mapAdminInventoryLotApiRecord(record, index));
    const totalCount = Math.max(0, Number(parsedPage.count ?? results.length) || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const page = Math.min(requestedPage, totalPages);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
        results,
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrevious,
    };
}

/** Fetches a single lot detail payload for the admin review modal. */
export async function fetchAdminInventoryLotDetail(lotIdentifier: string): Promise<AdminInventoryLotDetailRecord> {
    const { body } = await apiClient.get<unknown>(getAdminLotDetailPath(lotIdentifier));
    const record = parseAdminInventoryDetailResponse(body);

    return mapAdminInventoryLotDetailApiRecord(record);
}

/** Runs approve, reject, or suspend against the matching lot endpoint. */
export async function postAdminLotReview(requestBody: AdminLotReviewRequestBody) {
    const { lotId, action, rejectionReason, suspensionReason, note } = requestBody;

    const defaultMessage =
        action === "approve"
            ? "Listing approved."
            : action === "reject"
              ? "Listing declined."
              : "Listing suspended.";

    if (action === "approve") {
        const response = await apiClient.post<unknown>(getAdminLotApprovePath(lotId), {});
        return {
            message: getAdminApiResponseMessage(response.body, defaultMessage),
        };
    }

    if (action === "reject") {
        const response = await apiClient.post<unknown>(getAdminLotRejectPath(lotId), {
            reason: rejectionReason,
        });
        return {
            message: getAdminApiResponseMessage(response.body, defaultMessage),
        };
    }

    const response = await apiClient.post<unknown>(getAdminLotSuspendPath(lotId), {
        reason: buildAdminLotSuspendReason(suspensionReason ?? "", note),
    });

    return {
        message: getAdminApiResponseMessage(response.body, defaultMessage),
    };
}
