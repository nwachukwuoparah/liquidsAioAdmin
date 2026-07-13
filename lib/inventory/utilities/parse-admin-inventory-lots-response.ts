import type {
    AdminInventoryLotsPage,
    AdminInventoryLotsResponseBody,
} from "@/lib/inventory/types/admin-inventory-api.types";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT } from "@/lib/inventory/constants/admin-inventory-api.constant";

type NormalizedLotsPayload = {
    lots?: AdminInventoryLotsPage["lots"];
    count?: number;
    total?: number;
    totalCount?: number;
    total_count?: number;
};

function normalizeLotsPayload(payload: NormalizedLotsPayload): {
    lots: AdminInventoryLotsPage["lots"];
    count?: number;
} {
    const count =
        payload.count
        ?? payload.totalCount
        ?? payload.total_count
        ?? payload.total;

    if (Array.isArray(payload.lots)) {
        return {
            lots: payload.lots,
            count,
        };
    }

    if (count != null && payload.lots == null) {
        return { lots: [], count };
    }

    return {
        lots: [],
        count,
    };
}

/** Parses the lots list API body into a normalized page shape. */
export function parseAdminInventoryLotsResponse(
    responseBody: AdminInventoryLotsResponseBody | unknown,
    limit: number | string = ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
): AdminInventoryLotsPage {
    const parsedLimit = Number(limit) || ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT;

    if (
        responseBody &&
        typeof responseBody === "object" &&
        "status" in responseBody &&
        (responseBody as AdminInventoryLotsResponseBody).status === "failed"
    ) {
        throw new Error(
            (responseBody as AdminInventoryLotsResponseBody).message ??
                "Failed to fetch inventory lots.",
        );
    }

    const payload = parseAdminApiResponseData<NormalizedLotsPayload>(
        responseBody as AdminInventoryLotsResponseBody,
    );

    const { lots, count } = normalizeLotsPayload(payload);

    return {
        lots,
        count,
        hasNext: lots.length >= parsedLimit,
    };
}
