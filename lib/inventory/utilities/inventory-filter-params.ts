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
}

/** Builds GET /lots query params from unified filter state, tab, and search. */
export function buildInventoryLotsQueryParams(
    filterParams: Record<string, string> = {},
    {
        activeTab = "All Lots",
        search = "",
        page,
        limit = ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT,
    }: BuildInventoryLotsQueryParamsOptions = {},
): Record<string, string> {
    const apiParams: Record<string, string> = {};

    Object.entries(filterParams).forEach(([key, value]) => {
        if (!value || UI_ONLY_FILTER_KEYS.has(key)) {
            return;
        }

        apiParams[key] = value;
    });

    const tabParams =
        INVENTORY_TAB_QUERY_PARAMS[activeTab as AdminInventoryTabId] ?? {};

    Object.entries(tabParams).forEach(([key, value]) => {
        apiParams[key] = value;
    });

    if (search) {
        apiParams.search = search;
    }

    if (page != null && String(page) !== "") {
        apiParams.page = String(page);
    }

    apiParams.limit = String(limit);
    apiParams.sort = apiParams.sort ?? ADMIN_INVENTORY_DEFAULT_SORT;
    apiParams.order = apiParams.order ?? ADMIN_INVENTORY_DEFAULT_ORDER;

    return apiParams;
}
