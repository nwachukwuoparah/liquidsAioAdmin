export interface AdminInventoryLotCreatorProfile {
    firstName?: string;
    lastName?: string;
    businessName?: string;
}

export interface AdminInventoryLotImage {
    url?: string;
    position?: number;
}

export interface AdminInventoryLotApiRecord {
    id: string;
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    condition?: string;
    unitQuantity?: number;
    unit_quantity?: number;
    minimumOrderQuantity?: number;
    minimum_order_quantity?: number;
    price?: number;
    pricePerUnit?: number;
    price_per_unit?: number;
    reviewStatus?: string;
    review_status?: string;
    createdAt?: string;
    created_at?: string;
    creator?: AdminInventoryLotCreatorProfile;
    seller?: AdminInventoryLotCreatorProfile;
    images?: AdminInventoryLotImage[];
    reported?: boolean;
    isReported?: boolean;
    is_reported?: boolean;
}

export interface AdminInventoryLotsPage {
    lots: AdminInventoryLotApiRecord[];
    count?: number;
    hasNext: boolean;
}

export interface AdminInventoryLotsResponseBody {
    status?: string;
    message?: string;
    data?: {
        lots?: AdminInventoryLotApiRecord[];
        count?: number;
    };
    lots?: AdminInventoryLotApiRecord[];
    count?: number;
}

export interface FetchAdminInventoryLotsPageParams extends Record<string, string | undefined> {
    page?: string;
    limit?: string | number;
}

export interface AdminInventoryLotsMappedPage {
    results: import("@/lib/admin/types/admin-api.types").AdminInventoryLotRecord[];
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
