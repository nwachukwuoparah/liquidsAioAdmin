export interface AdminOrderDetailUserApi {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string;
    avatarUrl?: string;
    avatar_url?: string;
    profileImageUrl?: string;
    profile_image_url?: string;
    image?: string;
}

export interface AdminOrderSummaryApi {
    id?: string;
    orderId?: string;
    order_id?: string;
    orderNumber?: string;
    order_number?: string;
    title?: string;
    lotTitle?: string;
    lot_title?: string;
    status?: string;
    orderStatus?: string;
    order_status?: string;
    quantity?: number | string;
    orderQuantity?: number | string;
    order_quantity?: number | string;
    unit?: string;
    lotId?: string;
    lot_id?: string;
    createdAt?: string;
    created_at?: string;
}

export interface AdminPaymentSummaryApi {
    paymentDate?: string | null;
    payment_date?: string | null;
    paidAt?: string | null;
    paid_at?: string | null;
    amount?: number | string;
    paymentAmount?: number | string;
    payment_amount?: number | string;
    shippingFee?: number | string;
    shipping_fee?: number | string;
    platformFee?: number | string;
    platform_fee?: number | string;
    sellerNetPayout?: number | string;
    seller_net_payout?: number | string;
    payoutStatus?: string;
    payout_status?: string;
    payoutDate?: string | null;
    payout_date?: string | null;
    payoutHold?: {
        reason?: string;
        heldAt?: string;
        heldBy?: string;
    } | null | boolean;
    payout_hold?: {
        reason?: string;
        heldAt?: string;
        heldBy?: string;
    } | null | boolean;
}

export interface AdminShippingInformationApi {
    carrier?: string | null;
    trackingNumber?: string | null;
    tracking_number?: string | null;
    shippedOn?: string | null;
    shipped_on?: string | null;
    shippedAt?: string | null;
    shipped_at?: string | null;
    deliveredOn?: string | null;
    delivered_on?: string | null;
    deliveredAt?: string | null;
    delivered_at?: string | null;
}

export interface AdminShippingTimelineStepApi {
    stage?: string;
    title?: string;
    description?: string;
    timestamp?: string | null;
    completed?: boolean;
    current?: boolean;
}

export interface AdminShippingDetailsApi {
    status?: string;
    timeline?: AdminShippingTimelineStepApi[];
}

export interface AdminOrderDetailApiRecord {
    id?: string;
    orderId?: string;
    order_id?: string;
    orderSummary?: AdminOrderSummaryApi;
    paymentSummary?: AdminPaymentSummaryApi;
    shippingInformation?: AdminShippingInformationApi;
    shippingDetails?: AdminShippingDetailsApi;
    buyer?: AdminOrderDetailUserApi;
    buyerInformation?: AdminOrderDetailUserApi;
    seller?: AdminOrderDetailUserApi;
    sellerInformation?: AdminOrderDetailUserApi;
}

export interface AdminOrderDetailApiResponse {
    status?: string;
    message?: string;
    data?: AdminOrderDetailApiRecord;
    orderSummary?: AdminOrderSummaryApi;
    paymentSummary?: AdminPaymentSummaryApi;
    shippingInformation?: AdminShippingInformationApi;
    shippingDetails?: AdminShippingDetailsApi;
    buyer?: AdminOrderDetailUserApi;
    seller?: AdminOrderDetailUserApi;
}

export interface AdminOrderDetailTimelineStep {
    key: string;
    title: string;
    description: string;
    status: "completed" | "current" | "pending";
}

export interface AdminOrderDetailMapped {
    orderId: string;
    rawId: string;
    orderStatus: string;
    orderQuantity: string;
    lotTitle?: string;
    seller: {
        id?: string;
        name: string;
        phone: string;
        email: string;
        avatarUrl?: string;
    };
    buyer: {
        id?: string;
        name: string;
        phone: string;
        email: string;
        avatarUrl?: string;
    };
    payment: {
        date: string;
        rawDate?: string;
        amount: string;
        rawAmount?: number;
        shippingFee: string;
        platformFee: string;
        sellerNetPayout: string;
        payoutStatus: string;
        payoutDate: string;
        isHeld: boolean;
        holdReason?: string;
        holdDate?: string;
        holdBy?: {
            name: string;
            avatarUrl?: string;
        };
    };
    shipping: {
        carrier: string;
        trackingNumber: string;
        shippedOn: string;
        deliveredOn: string;
    };
    timeline: {
        currentStageIndex: number;
        stages: AdminOrderDetailTimelineStep[];
    };
}
