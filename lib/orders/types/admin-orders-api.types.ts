import type { AdminOrderRecord } from "@/lib/admin/types/admin-api.types";

export interface AdminOrderApiCursor {
    cursor_id?: string;
    cursor_sort_at?: string;
    cursor_search_rank?: number;
}

export type AdminOrderStatusParam =
    | "active"
    | "completed"
    | "dispute_or_refunded"
    | "cancelled";

export type AdminPaymentStatusParam =
    | "canceled"
    | "processing"
    | "requires_action"
    | "requires_capture"
    | "requires_confirmation"
    | "requires_payment_method"
    | "succeeded";

export interface FetchAdminOrdersPageParams {
    cursor_id?: string;
    cursor_sort_at?: string;
    cursor_search_rank?: number;
    limit?: number | string;
    order?: "asc" | "desc";
    q?: string;
    order_status?: AdminOrderStatusParam | string;
    payment_status?: AdminPaymentStatusParam | string;
    start?: string;
    end?: string;
    tab?: string;
    search?: string;
}

export interface AdminOrderApiUser {
    id?: string;
    pid?: string;
    name?: string;
    displayName?: string;
    display_name?: string;
    fullName?: string;
    full_name?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    businessName?: string;
    business_name?: string;
    companyName?: string;
    company_name?: string;
    storeName?: string;
    store_name?: string;
    username?: string;
    user_name?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string;
    avatarUrl?: string;
    avatar_url?: string;
    profilePicture?: string;
    profile_picture?: string;
}

export interface AdminOrderApiLot {
    id?: string;
    title?: string;
    name?: string;
    image?: string;
    imageUrl?: string;
    image_url?: string;
    images?: unknown[];
    thumbnailUrl?: string;
    thumbnail_url?: string;
    thumbnail?: string;
    primaryImage?: string;
    primary_image?: string;
    price?: number | string;
    pricePerUnit?: number | string;
    price_per_unit?: number | string;
    unitQuantity?: number;
    unit_quantity?: number;
    totalAmount?: number | string;
    total_amount?: number | string;
    amount?: number | string;
    total?: number | string;
    buyNowPrice?: number | string;
    buy_now_price?: number | string;
    creator?: AdminOrderApiUser;
    seller?: AdminOrderApiUser | string;
    sellerName?: string;
    seller_name?: string;
    sellerInformation?: AdminOrderApiUser;
    vendor?: AdminOrderApiUser | string;
    createdBy?: string;
    created_by?: string;
}

export interface AdminOrderApiRecord {
    id: string;
    orderId?: string;
    order_id?: string;
    orderNumber?: string;
    order_number?: string;
    title?: string;
    name?: string;
    lotTitle?: string;
    lot_title?: string;
    lot?: AdminOrderApiLot;
    seller?: AdminOrderApiUser | string;
    sellerName?: string;
    seller_name?: string;
    sellerInformation?: AdminOrderApiUser;
    seller_information?: AdminOrderApiUser;
    sellerProfile?: AdminOrderApiUser;
    seller_profile?: AdminOrderApiUser;
    sellerUser?: AdminOrderApiUser;
    seller_user?: AdminOrderApiUser;
    vendor?: AdminOrderApiUser | string;
    creator?: AdminOrderApiUser | string;
    buyer?: AdminOrderApiUser | string;
    buyerName?: string;
    buyer_name?: string;
    buyerInformation?: AdminOrderApiUser;
    buyer_information?: AdminOrderApiUser;
    buyerProfile?: AdminOrderApiUser;
    buyer_profile?: AdminOrderApiUser;
    buyerUser?: AdminOrderApiUser;
    buyer_user?: AdminOrderApiUser;
    customer?: AdminOrderApiUser | string;
    client?: AdminOrderApiUser | string;
    amount?: number | string;
    total?: number | string;
    totalAmount?: number | string;
    total_amount?: number | string;
    totalPrice?: number | string;
    total_price?: number | string;
    orderTotal?: number | string;
    order_total?: number | string;
    price?: number | string;
    pricePerUnit?: number | string;
    price_per_unit?: number | string;
    subtotal?: number | string;
    sub_total?: number | string;
    finalAmount?: number | string;
    final_amount?: number | string;
    paymentSummary?: {
        amount?: number | string;
        paymentAmount?: number | string;
        total?: number | string;
        payoutStatus?: string;
        status?: string;
        paymentDate?: string;
    };
    payment_summary?: {
        amount?: number | string;
        payment_amount?: number | string;
        total?: number | string;
        payout_status?: string;
        status?: string;
        payment_date?: string;
    };
    payment?: {
        amount?: number | string;
        total?: number | string;
        status?: string;
        paymentStatus?: string;
    };
    orderSummary?: {
        orderId?: string;
        order_id?: string;
        orderStatus?: string;
        status?: string;
        title?: string;
        amount?: number | string;
        total?: number | string;
        seller?: AdminOrderApiUser | string;
        sellerName?: string;
        buyer?: AdminOrderApiUser | string;
        buyerName?: string;
    };
    order_summary?: {
        order_id?: string;
        order_status?: string;
        status?: string;
        title?: string;
        amount?: number | string;
        total?: number | string;
        seller?: AdminOrderApiUser | string;
        seller_name?: string;
        buyer?: AdminOrderApiUser | string;
        buyer_name?: string;
    };
    payStatus?: string;
    paymentStatus?: string;
    payment_status?: string;
    orderStatus?: string;
    order_status?: string;
    fulfillmentStatus?: string;
    fulfillment_status?: string;
    shippingStatus?: string;
    shipping_status?: string;
    deliveryStatus?: string;
    delivery_status?: string;
    state?: string;
    orderState?: string;
    order_state?: string;
    status?: string;
    date?: string;
    orderDate?: string;
    order_date?: string;
    createdAt?: string;
    created_at?: string;
    thumbnailUrl?: string;
    thumbnail_url?: string;
    imageUrl?: string;
    image_url?: string;
    image?: string;
    colorBg?: string;
    alert?: boolean;
    hasDispute?: boolean;
    isDisputed?: boolean;
}

export interface AdminOrdersApiResponse {
    status?: string;
    message?: string;
    data?: {
        orders?: AdminOrderApiRecord[];
        results?: AdminOrderApiRecord[];
        totalCount?: number;
        total?: number;
        count?: number;
        hasNext?: boolean;
        nextCursor?: AdminOrderApiCursor | null;
    } | AdminOrderApiRecord[];
    orders?: AdminOrderApiRecord[];
    results?: AdminOrderApiRecord[];
    totalCount?: number;
    total?: number;
    count?: number;
    hasNext?: boolean;
    nextCursor?: AdminOrderApiCursor | null;
}

export interface AdminOrdersMappedPage {
    orders: AdminOrderRecord[];
    totalCount: number;
    hasNext: boolean;
    nextCursor?: AdminOrderApiCursor | null;
}
