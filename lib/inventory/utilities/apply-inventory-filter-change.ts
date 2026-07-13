import {
    INVENTORY_CATEGORY_LABEL_TO_CODE,
    INVENTORY_CONDITION_LABEL_TO_VALUE,
    INVENTORY_PRICE_RANGE_BOUNDS,
    INVENTORY_STATUS_LABEL_TO_REVIEW_STATUS,
} from "@/lib/inventory/constants/admin-inventory-api.constant";
import { resolveInventoryDateRange } from "@/lib/inventory/utilities/inventory-filter-params";

const DEFAULT_FILTER_VALUES = new Set([
    "",
    "all",
    "all statuses",
    "all status",
    "all sellers",
    "all categories",
    "all conditions",
    "all locations",
    "all location",
    "all time",
    "all prices",
]);

function isDefaultFilterValue(value: string): boolean {
    return DEFAULT_FILTER_VALUES.has(value.trim().toLowerCase());
}

/**
 * Applies a single filter field change onto the unified inventory filter object.
 * Used by both desktop immediate filters and the mobile filter modal draft state.
 */
export function applyInventoryFilterChange(
    previousParams: Record<string, string>,
    filterId: string,
    value: string,
): Record<string, string> {
    const updatedParams = { ...previousParams };
    const isDefaultValue = isDefaultFilterValue(value);

    if (filterId === "datePosted") {
        delete updatedParams.start;
        delete updatedParams.end;
        delete updatedParams.datePosted;

        if (!isDefaultValue) {
            updatedParams.datePosted = value;
            const { start, end } = resolveInventoryDateRange(value);

            if (start) {
                updatedParams.start = start;
            }

            if (end) {
                updatedParams.end = end;
            }
        }

        return updatedParams;
    }

    if (filterId === "priceRange") {
        delete updatedParams.min_price;
        delete updatedParams.max_price;
        delete updatedParams.priceRange;

        if (!isDefaultValue) {
            updatedParams.priceRange = value;
            const bounds = INVENTORY_PRICE_RANGE_BOUNDS[value];

            if (bounds) {
                updatedParams.min_price = bounds.min_price;

                if (bounds.max_price) {
                    updatedParams.max_price = bounds.max_price;
                }
            }
        }

        return updatedParams;
    }

    if (isDefaultValue) {
        if (filterId === "status") {
            delete updatedParams.review_status;
        } else {
            delete updatedParams[filterId];
        }

        return updatedParams;
    }

    if (filterId === "status") {
        const reviewStatus = INVENTORY_STATUS_LABEL_TO_REVIEW_STATUS[value];

        if (reviewStatus) {
            updatedParams.review_status = reviewStatus;
        }

        return updatedParams;
    }

    if (filterId === "category") {
        updatedParams.category = INVENTORY_CATEGORY_LABEL_TO_CODE[value] ?? value.toLowerCase();
        return updatedParams;
    }

    if (filterId === "condition") {
        updatedParams.condition = INVENTORY_CONDITION_LABEL_TO_VALUE[value] ?? value.toLowerCase();
        return updatedParams;
    }

    if (filterId === "location" || filterId === "sellerStatus") {
        updatedParams[filterId] = value;
        return updatedParams;
    }

    updatedParams[filterId] = value.toLowerCase().trim();
    return updatedParams;
}

/** Counts active inventory filters for the mobile badge. */
export function countActiveInventoryFilters(filterParams: Record<string, string>): number {
    let count = 0;

    if (filterParams.review_status) count++;
    if (filterParams.category) count++;
    if (filterParams.condition) count++;
    if (filterParams.start || filterParams.end) count++;
    if (filterParams.min_price || filterParams.max_price) count++;
    if (filterParams.location) count++;
    if (filterParams.sellerStatus) count++;

    return count;
}
