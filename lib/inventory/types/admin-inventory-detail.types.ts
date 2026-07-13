export interface AdminInventoryLotImageRecord {
    id?: string;
    url: string;
    position?: number;
}

export interface AdminInventoryLotSellerRecord {
    id?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
    profilePicture?: string;
    rating?: number;
    averageRating?: number;
    accountHealth?: number;
    responseTime?: string;
    activeListings?: number;
    joinedAt?: string;
    createdAt?: string;
    location?: string;
    addressText?: string;
}

export interface AdminInventoryLotDetailApiRecord {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    condition?: string;
    skuType?: string;
    sku_type?: string;
    unitQuantity?: number;
    unit_quantity?: number;
    minimumOrderQuantity?: number;
    minimum_order_quantity?: number;
    price?: number;
    pricePerUnit?: number;
    price_per_unit?: number;
    totalPrice?: number;
    total_price?: number;
    reviewStatus?: string;
    review_status?: string;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
    views?: number;
    offers?: number;
    totalOrders?: number;
    total_orders?: number;
    listingUrl?: string;
    listing_url?: string;
    shippingFrom?: string;
    shipping_from?: string;
    shippingTerms?: string;
    shipping_terms?: string;
    shippingFeeEstimate?: string;
    shipping_fee_estimate?: string;
    reported?: boolean;
    isReported?: boolean;
    is_reported?: boolean;
    images?: AdminInventoryLotImageRecord[];
    creator?: AdminInventoryLotSellerRecord;
    seller?: AdminInventoryLotSellerRecord;
}

export interface AdminInventoryLotDetailRecord {
    id: string;
    title: string;
    description: string;
    status: string;
    reviewStatus: string;
    category: string;
    condition: string;
    skuType: string;
    unitQuantity: number;
    pricePerUnit: number;
    totalPrice: number;
    minimumOrderQuantity: number;
    shippingFrom: string;
    shippingTerms: string;
    shippingFeeEstimate: string;
    createdAt?: string;
    updatedAt?: string;
    views: number;
    offers: number;
    totalOrders: number;
    listingUrl?: string;
    reported: boolean;
    images: AdminInventoryLotImageRecord[];
    seller: {
        id?: string;
        name: string;
        email: string;
        phone: string;
        profileImageUrl?: string;
        rating?: number;
        accountHealth?: number;
        responseTime: string;
        activeListings?: number;
        joinedAt?: string;
        location: string;
    };
}

export interface AdminLotReviewRequestBody {
    lotId: string;
    action: import("@/lib/inventory/constants/admin-inventory-review.constant").AdminLotReviewAction;
    rejectionReason?: string;
    suspensionReason?: string;
    note?: string;
}
