/** Standard success wrapper for sample admin API responses. */
export interface AdminApiSuccessResponse<TData> {
    status: "success";
    message?: string;
    data: TData;
}

export interface AdminOrderRecord {
    id: string;
    orderId: string;
    title: string;
    seller: string;
    buyer: string;
    amount: string;
    payStatus: string;
    orderStatus: string;
    date: string;
    colorBg: string;
}

export interface AdminOrderStatRecord {
    title: string;
    count: string;
    change: string;
    trendDirection: "up" | "down";
    isPositive: boolean;
    iconKey: string;
    iconBg: string;
    iconColor: string;
    iconClassName?: string;
}

export interface AdminUserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    location: string;
    status: string;
    health: string;
    verification: string;
    lastActive: string;
    avatarBg: string;
    avatarText: string;
    segment: "buyers" | "sellers" | "reported";
}

export interface AdminUserStatRecord {
    totalUsers: {
        count: number;
        delta: number;
    };
    activeBuyers: {
        count: number;
        delta: number;
    };
    activeSellers: {
        count: number;
        delta: number;
    };
    suspendedAccounts: {
        count: number;
        delta: number;
    };
}

export type AdminUserSegmentTab = "buyer" | "seller" | "reported";

export interface AdminUserTabCounts {
    buyers: number;
    sellers: number;
    reported: number;
}

export interface AdminInventoryLotRecord {
    id: string;
    slug?: string;
    title: string;
    seller: string;
    cat: string;
    qty: number;
    price: string;
    cond: string;
    date: string;
    status: string;
    img: string;
    alert?: boolean;
}

export interface AdminInventoryStatsRecord {
    label: string;
    value: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
}

export interface AdminInventoryTabCounts {
    allLots: number;
    pendingApproval: number;
    reported: number;
    suspended: number;
}

export interface AdminComplianceReviewRecord {
    id: string;
    sn: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    accountType: "Seller" | "Buyer";
    dateSubmitted: string;
    assignedTo: string;
    reviewStatus: "Pending" | "In Review" | "Approved" | "Rejected";
}

export interface AdminComplianceStatRecord {
    label: string;
    value: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
}

export interface AdminRfqRecord {
    id: string;
    sn: string;
    name: string;
    avatarUrl: string;
    avatarFallbackBg: string;
    avatarText: string;
    budget: string;
    category: string;
    date: string;
    mobileTime: string;
    description: string;
    status: "pending" | "resolved";
}

export interface AdminRfqTabCounts {
    pending: number;
    resolved: number;
}

export interface AdminOverviewStatRecord {
    label: string;
    value: string;
    change?: string;
    changeColor: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
}

export interface AdminOverviewActivityRecord {
    id: string;
    title: string;
    subtitle: string;
    time: string;
    iconKey: string;
    iconBg: string;
    iconColor: string;
}

export interface AdminOverviewDashboardData {
    quickStats: AdminOverviewStatRecord[];
    engagementStats: AdminOverviewStatRecord[];
    activityFeed: AdminOverviewActivityRecord[];
}

export interface AdminTeamMemberRecord {
    id?: string;
    sn: string;
    name: string;
    email: string;
    role: string;
    lastActive: string;
    status: "Active" | "Pending";
    initials: string;
    avatarBg?: string;
}

export interface AdminSettingsProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneNumberCountryCode?: string | null;
    timezone: string;
    profileImageUrl?: string | null;
}

export interface AdminSettingsGeneralData {
    contactEmail: string;
    phoneNumber: string;
    phoneNumberCountryCode: string;
}

export interface AdminOrderActionRequestBody {
    orderId: string;
    action: "flag" | "release_escrow" | "mark_complete";
}

export interface AdminInventoryActionRequestBody {
    lotId: string;
    action: "approve" | "decline" | "suspend";
}

export interface AdminComplianceActionRequestBody {
    reviewId: string;
    action: "approve" | "reject" | "request_update";
    documentId?: string;
}

export interface AdminSettingsProfileRequestBody {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    phoneNumberCountryCode: string;
    timezone: string;
}

export interface AdminSettingsGeneralRequestBody {
    contactEmail: string;
    phoneNumber?: string;
    phoneNumberCountryCode?: string;
}
