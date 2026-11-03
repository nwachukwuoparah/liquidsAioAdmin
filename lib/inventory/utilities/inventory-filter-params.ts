import {
    ADMIN_INVENTORY_DEFAULT_ORDER,
    ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
    ADMIN_INVENTORY_DEFAULT_SORT,
    INVENTORY_TAB_QUERY_PARAMS,
    type AdminInventoryTabId,
} from "@/lib/inventory/constants/admin-inventory-api.constant";

export { resolveComplianceDateRange as resolveInventoryDateRange } from "@/lib/admin/utilities/compliance-filter-params";

const UI_ONLY_FILTER_KEYS = new Set([
    "datePosted",
    "priceRange",
    "status",
    "location",
    "sellerStatus",
]);

export interface BuildInventoryLotsQueryParamsOptions {
    activeTab?: string;
    search?: string;
    page?: string | number;
    limit?: string | number;
    created_by?: string;
    createdBy?: string;
    sellerId?: string;
    seller_id?: string;
    draft_id?: string;
    draftId?: string;
    count_only?: boolean | string;
    reported_lots?: boolean | string;
    deleted_lots?: boolean | string;
    sort?: string;
    order?: string;
}

/** Builds GET /lots query params from unified filter state, tab, and search. */
export function buildInventoryLotsQueryParams(
    filterParams: Record<string, string> = {},
    {
        activeTab = "All Lots",
        search = "",
        page,
        limit = ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
        created_by,
        createdBy,
        sellerId,
        seller_id,
        draft_id,
        draftId,
        count_only,
        reported_lots,
        deleted_lots,
        sort,
        order,
    }: BuildInventoryLotsQueryParamsOptions = {},
): Record<string, string> {
    const apiParams: Record<string, string> = {};

    Object.entries(filterParams).forEach(([key, value]) => {
        if (!value || UI_ONLY_FILTER_KEYS.has(key)) {
            return;
        }

        if (key === "createdBy" || key === "sellerId" || key === "seller_id") {
            apiParams.created_by = value;
            return;
        }

        if (key === "draftId") {
            apiParams.draft_id = value;
            return;
        }

        apiParams[key] = value;
    });

    const tabParams =
        INVENTORY_TAB_QUERY_PARAMS[activeTab as AdminInventoryTabId] ?? {};

    Object.entries(tabParams).forEach(([key, value]) => {
        apiParams[key] = value;
    });

    const resolvedCreatedBy =
        created_by ?? createdBy ?? sellerId ?? seller_id ?? filterParams.created_by ?? filterParams.createdBy ?? filterParams.sellerId ?? filterParams.seller_id;
    if (resolvedCreatedBy) {
        apiParams.created_by = resolvedCreatedBy;
    }

    const resolvedDraftId = draft_id ?? draftId ?? filterParams.draft_id ?? filterParams.draftId;
    if (resolvedDraftId) {
        apiParams.draft_id = resolvedDraftId;
    }

    if (count_only != null || filterParams.count_only != null) {
        apiParams.count_only = String(count_only ?? filterParams.count_only);
    }

    if (reported_lots != null || filterParams.reported_lots != null) {
        apiParams.reported_lots = String(reported_lots ?? filterParams.reported_lots);
    }

    if (deleted_lots != null || filterParams.deleted_lots != null) {
        apiParams.deleted_lots = String(deleted_lots ?? filterParams.deleted_lots);
    }

    if (search) {
        apiParams.search = search;
    }

    if (page != null && String(page) !== "") {
        apiParams.page = String(page);
    }

    apiParams.limit = String(limit);
    apiParams.sort = sort ?? apiParams.sort ?? ADMIN_INVENTORY_DEFAULT_SORT;
    apiParams.order = order ?? apiParams.order ?? ADMIN_INVENTORY_DEFAULT_ORDER;

    return apiParams;
}
