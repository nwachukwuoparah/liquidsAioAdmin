/** Admin lots list endpoint. */
export const ADMIN_LOTS_PATH = "/lots";

export const ADMIN_INVENTORY_DEFAULT_PAGE_LIMIT = 25;

export const ADMIN_INVENTORY_DEFAULT_SORT = "date";
export const ADMIN_INVENTORY_DEFAULT_ORDER = "desc";

export type AdminInventoryTabId =
    | "All Lots"
    | "Pending approval"
    | "Reported"
    | "Suspended";

/** Maps inventory tab labels to GET /lots query params. */
export const INVENTORY_TAB_QUERY_PARAMS: Record<
    AdminInventoryTabId,
    Record<string, string>
> = {
    "All Lots": {},
    "Pending approval": { review_status: "pending" },
    Reported: { reported_lots: "true" },
    Suspended: { review_status: "suspended" },
};

/** Maps filter dropdown labels to API category codes. */
export const INVENTORY_CATEGORY_LABEL_TO_CODE: Record<string, string> = {
    Electronics: "elt",
    "Apparel & Footwear": "afw",
    "Home & Kitchen": "hkn",
    "Health & Beauty": "hby",
    "General Merchandise": "gml",
    "General Merchandise / Mixed Lots": "gml",
    "Toys & Baby": "tby",
};

/** Maps filter dropdown labels to API condition values. */
export const INVENTORY_CONDITION_LABEL_TO_VALUE: Record<string, string> = {
    New: "new",
    Refurbished: "refurbished",
    Mixed: "mixed",
    Overstock: "overstock",
};

/** Maps condition API values back to display labels. */
export const INVENTORY_CONDITION_VALUE_TO_LABEL: Record<string, string> = {
    new: "New",
    refurbished: "Refurbished",
    mixed: "Mixed",
    overstock: "Overstock",
};

/** Maps lot status filter labels to review_status API values. */
export const INVENTORY_STATUS_LABEL_TO_REVIEW_STATUS: Record<string, string> = {
    Active: "approved",
    Pending: "pending",
    "Pending approval": "pending",
    "In review": "in_review",
    Declined: "rejected",
    Rejected: "rejected",
    Suspended: "suspended",
};

/** Maps review_status API values back to display labels for filters. */
export const INVENTORY_REVIEW_STATUS_LABELS: Record<string, string> = {
    approved: "Active",
    pending: "Pending",
    in_review: "In review",
    rejected: "Declined",
    suspended: "Suspended",
};

/** Maps category API codes to display labels. */
export const INVENTORY_CATEGORY_CODE_TO_LABEL: Record<string, string> = {
    gml: "General Merchandise",
    elt: "Electronics",
    afw: "Apparel & Footwear",
    hkn: "Home & Kitchen",
    hby: "Health & Beauty",
    tby: "Toys & Baby",
};

/** Maps price range presets to min/max bounds. */
export const INVENTORY_PRICE_RANGE_BOUNDS: Record<string, { min_price: string; max_price?: string }> = {
    "$0-$500": { min_price: "0", max_price: "500" },
    "$0 - $500": { min_price: "0", max_price: "500" },
    "$500-$2000": { min_price: "500", max_price: "2000" },
    "$500 - $2,000": { min_price: "500", max_price: "2000" },
    "$2,000 - $10,000": { min_price: "2000", max_price: "10000" },
    "Over $10,000": { min_price: "10000" },
};
