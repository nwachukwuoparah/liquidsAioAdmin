import { resolveComplianceDateRange } from "@/lib/admin/utilities/compliance-filter-params";
import { isCustomDateRangeValue } from "@/lib/filters/custom-date-range";

export const USER_VERIFICATION_OPTIONS = [
    "All statuses",
    "Pending",
    "In Review",
    "Needs info",
    "Approved",
    "Rejected",
] as const;

export const USER_ACCOUNT_STATUS_OPTIONS = [
    "All",
    "Active",
    "Suspended",
] as const;

export const USER_DATE_OPTIONS = [
    "All time",
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "Custom range",
] as const;

/**
 * Normalizes compliance status option label into server API parameter value.
 * Server expects snake_case / lowercase (e.g. "pending", "in_review", "needs_info", "approved", "rejected").
 */
export function mapComplianceStatusParam(value?: string | null): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "" || trimmed === "all" || trimmed === "all statuses") {
        return undefined;
    }
    if (trimmed === "in review") return "in_review";
    if (trimmed === "needs info") return "needs_info";
    return trimmed.replace(/\s+/g, "_");
}

/**
 * Normalizes account status option label into server API parameter value.
 * Server expects lowercase (e.g. "active", "suspended").
 */
export function mapAccountStatusParam(value?: string | null): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "" || trimmed === "all" || trimmed === "all status" || trimmed === "all statuses") {
        return undefined;
    }
    return trimmed;
}

/**
 * Updates user filter state immutably when a filter value changes.
 * Only filters accounted for on the server are accepted.
 */
export function applyUserFilterChange(
    currentParams: Record<string, string>,
    filterId: string,
    value: string,
): Record<string, string> {
    const updatedParams = { ...currentParams };

    const isDefaultValue =
        value === "" ||
        value.toLowerCase() === "all" ||
        value.toLowerCase() === "all statuses" ||
        value.toLowerCase() === "all time";

    if (filterId === "joinedDate") {
        delete updatedParams.start;
        delete updatedParams.end;
        delete updatedParams.joinedDate;

        if (!isDefaultValue) {
            updatedParams.joinedDate = value;
            const { start, end } = resolveComplianceDateRange(value);

            if (start) {
                updatedParams.start = start;
            }
            if (end) {
                updatedParams.end = end;
            }
        }

        return updatedParams;
    }

    if (filterId === "complianceStatus") {
        if (isDefaultValue) {
            delete updatedParams.complianceStatus;
        } else {
            updatedParams.complianceStatus = value;
        }
        return updatedParams;
    }

    if (filterId === "accountStatus") {
        if (isDefaultValue) {
            delete updatedParams.accountStatus;
        } else {
            updatedParams.accountStatus = value;
        }
        return updatedParams;
    }

    // Filters not accounted for on the server (like "location" or "health") are dropped
    if (filterId in updatedParams) {
        delete updatedParams[filterId];
    }

    return updatedParams;
}

export interface BuildUserListQueryParamsOptions {
    activeSegmentTab: "buyer" | "seller" | "reported";
    searchQuery?: string;
    limit?: string | number;
    order?: string;
    cursor_id?: string;
    cursor_sort_at?: string;
}

/**
 * Maps unified UI filter state to backend GET /v1/users parameters.
 * - Tab "buyer" -> accountType=buyer
 * - Tab "seller" -> accountType=seller
 * - Tab "reported" -> reported_users=true (accountType omitted per OpenAPI spec)
 * - Search query -> q (prefix match on ciFirstName, ciLastName, email) + search
 * - Joined date -> start & end ISO timestamps
 * - Compliance status -> complianceStatus (in_review, pending, etc.)
 * - Account status -> accountStatus (active, suspended)
 */
export function buildUserListQueryParams(
    filterParams: Record<string, string> = {},
    {
        activeSegmentTab,
        searchQuery,
        limit,
        order,
        cursor_id,
        cursor_sort_at,
    }: BuildUserListQueryParamsOptions,
): Record<string, string> {
    const apiParams: Record<string, string> = {};

    // 1. Segment / Mode
    if (activeSegmentTab === "reported") {
        apiParams.reported_users = "true";
    } else {
        apiParams.accountType = activeSegmentTab;
    }

    // 2. Search query (OpenAPI spec specifies parameter `q`)
    const trimmedSearch = searchQuery?.trim();
    if (trimmedSearch) {
        apiParams.q = trimmedSearch;
        apiParams.search = trimmedSearch; // backwards compatibility
    }

    // 3. Compliance status filter
    const mappedCompliance = mapComplianceStatusParam(filterParams.complianceStatus);
    if (mappedCompliance) {
        apiParams.complianceStatus = mappedCompliance;
    }

    // 4. Account status filter
    const mappedAccountStatus = mapAccountStatusParam(filterParams.accountStatus);
    if (mappedAccountStatus) {
        apiParams.accountStatus = mappedAccountStatus;
    }

    // 5. Creation / Joined date range
    if (filterParams.start) {
        apiParams.start = filterParams.start;
    }
    if (filterParams.end) {
        apiParams.end = filterParams.end;
    }

    // 6. Pagination & ordering
    if (limit != null && String(limit) !== "") {
        apiParams.limit = String(limit);
    }
    if (order) {
        apiParams.order = order;
    }
    if (cursor_id) {
        apiParams.cursor_id = cursor_id;
    }
    if (cursor_sort_at) {
        apiParams.cursor_sort_at = cursor_sort_at;
    }

    return apiParams;
}

/**
 * Counts active filters (excluding default values and server-unsupported filters).
 */
export function countActiveUserFilters(filterParams: Record<string, string>): number {
    let count = 0;
    if (
        filterParams.complianceStatus &&
        filterParams.complianceStatus !== "All statuses" &&
        filterParams.complianceStatus !== "All"
    ) {
        count++;
    }
    if (
        filterParams.accountStatus &&
        filterParams.accountStatus !== "All"
    ) {
        count++;
    }
    if (
        filterParams.joinedDate &&
        filterParams.joinedDate !== "All time"
    ) {
        count++;
    } else if (filterParams.start || filterParams.end) {
        count++;
    }
    return count;
}
