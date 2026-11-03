"use client";

import Typography from "../typography";
import { ProfileAvatar } from "../profile-avatar";
import {
    ArrowLeftIcon,
    ArrowsClockwiseIcon,
    ComplianceIcon,
    ModalCloseIcon,
    NotificationBellIcon,
    OrdersIcon,
    TrendIcon,
} from "../vector";
import { useModal } from "@/context/modal-provider";
import { useAdminSuspendAccount, useAdminUserDetails } from "@/lib/admin/hooks/use-admin-users";
import {
    getUserAccountStatusStyles,
    getUserVerificationStatusStyles,
} from "@/lib/users/utilities/user-status-styles";
import SuspendAccountModal from "./suspend-account-modal";

export interface UserDetailsModalProps {
    details: {
        id: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        profilePicture?: string;
        avatarUrl?: string;
        email?: string;
        phone?: string;
        phoneNumber?: string;
        accountStatus?: string;
        status?: string;
        accountHealth?: string;
        health?: string;
        verification?: string;
        verificationStatus?: string;
        complianceReviewStatus?: string;
        lastActive?: string;
        joinedDate?: string;
        createdAt?: string;
        location?: string;
        role?: string;
        accountType?: string;
        segment?: string;
        totalOrders?: number | string;
        totalSpent?: number | string;
        avgOrderValue?: number | string;
        stats?: {
            totalOrders?: string | number;
            totalSpent?: string | number;
            avgOrderValue?: string | number;
        };
        activities?: Array<{
            id: string;
            title: string;
            timestamp?: string;
        }>;
    };
}

function isValidValue(val: unknown): boolean {
    if (val === undefined || val === null) return false;
    const str = String(val).trim();
    if (!str) return false;
    if (
        str === "---" ||
        str === "--" ||
        str === "—" ||
        str === "null" ||
        str === "undefined" ||
        str === "[object Object]"
    ) {
        return false;
    }
    return true;
}

export default function UserDetailsModal({ details }: UserDetailsModalProps) {
    const { closeModal, showModal } = useModal();
    const { mutate: restoreAccount, isPending: isRestoreAccountPending } = useAdminSuspendAccount(
        details.id,
        "restore",
        {
            onError: (error) => {
                console.error(error);
            },
        },
    );
    const { data: userDetailsData, isLoading } = useAdminUserDetails(details.id);

    const rawUser =
        (userDetailsData as any)?.data?.user ??
        (userDetailsData as any)?.data ??
        (userDetailsData as any)?.user ??
        userDetailsData;
    const user = (typeof rawUser === "object" && rawUser !== null && !Array.isArray(rawUser)) ? rawUser : {};

    // 1. Basic Identity
    const firstName = user.firstName ?? user.first_name ?? details?.firstName ?? "";
    const lastName = user.lastName ?? user.last_name ?? details?.lastName ?? "";
    const combinedName = `${firstName} ${lastName}`.trim();
    const rawName = combinedName || user.name || details?.name || "";
    const name = isValidValue(rawName) ? rawName : undefined;

    const email = isValidValue(user.email ?? details?.email)
        ? String(user.email ?? details?.email).trim()
        : undefined;

    const rawPhone =
        user.phone ??
        user.phoneNumber ??
        user.phone_number ??
        user.kyc?.phoneNumber ??
        user.kyc?.phone_number ??
        details?.phone ??
        details?.phoneNumber;
    const phone = isValidValue(rawPhone) ? String(rawPhone).trim() : undefined;

    const avatar =
        user.profilePicture ??
        user.profile_picture ??
        user.avatarUrl ??
        user.avatar_url ??
        user.image ??
        details?.profilePicture ??
        details?.avatarUrl;

    const rawRole =
        user.accountType ??
        user.account_type ??
        user.role ??
        details?.role ??
        details?.accountType ??
        details?.segment;
    const isSeller = Boolean(
        rawRole && String(rawRole).toLowerCase().includes("seller"),
    );
    const accountTypeLabel = isValidValue(rawRole)
        ? `${String(rawRole).replace(/_/g, " ").toUpperCase()} ACCOUNT`
        : undefined;

    // 2. Account Status & Verification
    const rawStatus =
        user.accountStatus ??
        user.account_status ??
        user.status ??
        details?.accountStatus ??
        details?.status;
    const status = isValidValue(rawStatus) ? String(rawStatus).trim() : undefined;

    const rawVerification =
        user.complianceReviewStatus ??
        user.compliance_review_status ??
        user.verificationStatus ??
        user.verification_status ??
        user.verification ??
        details?.complianceReviewStatus ??
        details?.verificationStatus ??
        details?.verification;
    const verification = isValidValue(rawVerification) ? String(rawVerification).trim() : undefined;

    // 3. Dates & Meta
    const rawJoined =
        user.createdAt ??
        user.created_at ??
        user.joinedDate ??
        user.joined_date ??
        details?.joinedDate ??
        details?.createdAt;
    let joined: string | undefined = undefined;
    if (isValidValue(rawJoined)) {
        const parsed = new Date(rawJoined);
        if (!Number.isNaN(parsed.getTime())) {
            joined = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } else {
            joined = String(rawJoined).trim();
        }
    }

    const rawHealth =
        user.accountHealth ??
        user.account_health ??
        user.health ??
        details?.accountHealth ??
        details?.health;
    const health = isValidValue(rawHealth) ? String(rawHealth).trim() : undefined;

    const rawLastActive =
        user.lastActive ??
        user.last_active ??
        user.lastActiveAt ??
        user.last_active_at ??
        user.lastLoginAt ??
        user.last_login_at ??
        details?.lastActive;
    let lastActive: string | undefined = undefined;
    if (isValidValue(rawLastActive)) {
        const parsed = new Date(rawLastActive);
        if (!Number.isNaN(parsed.getTime()) && String(rawLastActive).includes("T")) {
            lastActive = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } else {
            lastActive = String(rawLastActive).trim();
        }
    }

    const rawLocation =
        user.businessAddress?.location ??
        user.businessAddress?.city ??
        user.location ??
        user.address?.location ??
        user.address?.city ??
        details?.location;
    const location = isValidValue(rawLocation) ? String(rawLocation).trim() : undefined;

    // 4. Stats
    const rawTotalOrders =
        user.totalOrders ??
        user.total_orders ??
        user.ordersCount ??
        user.orderCount ??
        user.orders_count ??
        user.stats?.totalOrders ??
        user.stats?.total_orders ??
        details?.totalOrders ??
        details?.stats?.totalOrders;
    let totalOrders: string | undefined = undefined;
    if (isValidValue(rawTotalOrders)) {
        const num = Number(rawTotalOrders);
        if (!Number.isNaN(num)) {
            totalOrders = `${num} ${num === 1 ? "order" : "orders"}`;
        } else {
            totalOrders = String(rawTotalOrders).trim();
        }
    }

    const rawTotalSpent =
        user.totalSpent ??
        user.total_spent ??
        user.spent ??
        user.stats?.totalSpent ??
        user.stats?.total_spent ??
        details?.totalSpent ??
        details?.stats?.totalSpent;
    let totalSpent: string | undefined = undefined;
    if (isValidValue(rawTotalSpent)) {
        const str = String(rawTotalSpent).trim();
        if (str.startsWith("$")) {
            totalSpent = str;
        } else {
            const num = parseFloat(str.replace(/[^0-9.-]+/g, ""));
            if (!Number.isNaN(num)) {
                totalSpent = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
            } else {
                totalSpent = str;
            }
        }
    }

    const rawAvgOrderValue =
        user.avgOrderValue ??
        user.avg_order_value ??
        user.averageOrderValue ??
        user.average_order_value ??
        user.aov ??
        user.stats?.avgOrderValue ??
        user.stats?.averageOrderValue ??
        details?.avgOrderValue ??
        details?.stats?.avgOrderValue;
    let avgOrderValue: string | undefined = undefined;
    if (isValidValue(rawAvgOrderValue)) {
        const str = String(rawAvgOrderValue).trim();
        if (str.startsWith("$")) {
            avgOrderValue = str;
        } else {
            const num = parseFloat(str.replace(/[^0-9.-]+/g, ""));
            if (!Number.isNaN(num)) {
                avgOrderValue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
            } else {
                avgOrderValue = str;
            }
        }
    }

    // 5. Activities
    const rawActivities =
        user.activities ??
        user.recentActivities ??
        user.recent_activities ??
        user.activityLogs ??
        user.activity_logs ??
        details?.activities;
    const activities: Array<{ id: string; title: string; timestamp?: string }> = Array.isArray(rawActivities)
        ? rawActivities
        : [];

    // Compile dynamic status items for the info card
    const infoItems: Array<{ key: string; label: string; element: React.ReactNode }> = [];

    if (status) {
        infoItems.push({
            key: "status",
            label: "Account status",
            element: (
                <span className={`${getUserAccountStatusStyles(status)} rounded-[6px]`}>
                    {status}
                </span>
            ),
        });
    }

    if (verification) {
        infoItems.push({
            key: "verification",
            label: "Verification",
            element: (
                <span className={`${getUserVerificationStatusStyles(verification)} rounded-[6px]`}>
                    {verification}
                </span>
            ),
        });
    }

    if (joined) {
        infoItems.push({
            key: "joined",
            label: "Joined",
            element: (
                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">
                    {joined}
                </Typography>
            ),
        });
    }

    if (health) {
        infoItems.push({
            key: "health",
            label: "Account health",
            element: (
                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">
                    {health}
                </Typography>
            ),
        });
    }

    if (lastActive) {
        infoItems.push({
            key: "lastActive",
            label: "Last active",
            element: (
                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">
                    {lastActive}
                </Typography>
            ),
        });
    }

    if (location) {
        infoItems.push({
            key: "location",
            label: "Location",
            element: (
                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left max-w-[70%] sm:max-w-none break-words">
                    {location}
                </Typography>
            ),
        });
    }

    // Compile dynamic stat cards
    const statCards: Array<{
        key: string;
        label: string;
        value: string;
        Icon: React.ComponentType<{ className?: string }>;
    }> = [];

    if (totalOrders) {
        statCards.push({
            key: "totalOrders",
            label: "Total orders",
            value: totalOrders,
            Icon: OrdersIcon,
        });
    }

    if (totalSpent) {
        statCards.push({
            key: "totalSpent",
            label: isSeller ? "Total sales" : "Total spent",
            value: totalSpent,
            Icon: ComplianceIcon,
        });
    }

    if (avgOrderValue) {
        statCards.push({
            key: "avgOrderValue",
            label: "Average order value",
            value: avgOrderValue,
            Icon: TrendIcon,
        });
    }

    return (
        <div className="flex w-full flex-col bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[88vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#0B0E0514] px-4 py-4 md:px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={closeModal}
                        aria-label="Go back"
                        className="text-[#0B0E05] hover:opacity-70 transition-opacity p-1 -ml-1 sm:hidden"
                        type="button"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-[#0B0E05]" />
                    </button>

                    <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                        User details
                    </Typography>
                </div>

                <button
                    onClick={closeModal}
                    aria-label="Close modal"
                    className="hidden sm:block text-[#0B0E05A3] hover:text-[#0B0E05] transition-colors p-1"
                    type="button"
                >
                    <ModalCloseIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto text-left pb-8">
                {/* Profile Header Row */}
                <div className="flex flex-row items-center justify-between gap-4 border-b border-[#0B0E0514] pb-5">
                    <div className="flex gap-4 items-start sm:border-r sm:border-[#0B0E0514] sm:pr-20 min-w-0">
                        <div className="shrink-0">
                            <ProfileAvatar
                                size="xl"
                                name={name || email || "User"}
                                imageUrl={avatar}
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            {name && (
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05] leading-tight truncate">
                                    {name}
                                </Typography>
                            )}
                            {phone && (
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] mt-0.5 truncate">
                                    {phone}
                                </Typography>
                            )}
                            {email && (
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] truncate">
                                    {email}
                                </Typography>
                            )}
                            {accountTypeLabel && (
                                <Typography type="text12" fontWeight={700} className="text-[#518300] tracking-wider mt-1 truncate">
                                    {accountTypeLabel}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {status && (
                        <div className="hidden sm:flex items-center pl-6 h-16 shrink-0">
                            {status !== "suspended" ? (
                                <button
                                    onClick={() =>
                                        showModal({
                                            content: (
                                                <SuspendAccountModal
                                                    onClose={closeModal}
                                                    details={details}
                                                />
                                            ),
                                        })
                                    }
                                    type="button"
                                    className="flex items-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] px-4 py-2.5 rounded-[12px] hover:bg-red-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <Typography type="text14" fontWeight={400} className="text-[#D92D20]">
                                        Suspend account
                                    </Typography>
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        restoreAccount({});
                                    }}
                                    disabled={isRestoreAccountPending}
                                    type="button"
                                    className="flex items-center gap-2 border border-[#518300] bg-white text-[#518300] px-5 py-2 rounded-[10px] transition-all hover:bg-[#518300]/05 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowsClockwiseIcon
                                        className={`h-5 w-5 shrink-0 text-[#518300] ${isRestoreAccountPending ? "animate-spin" : ""}`}
                                    />
                                    <span className="text-[#518300] text-sm font-semibold">
                                        {isRestoreAccountPending ? "Restoring..." : "Restore account"}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Status / Metadata Grid Card - Only rendered if there is at least one valid item */}
                {infoItems.length > 0 && (
                    <div
                        className={`border border-[#0B0E0514] rounded-[14px] p-4 bg-[#0B0E0502] grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-x-12 sm:gap-y-4 transition-opacity duration-200 ${
                            isLoading ? "animate-pulse opacity-70" : ""
                        }`}
                    >
                        {infoItems.map((item) => (
                            <div
                                key={item.key}
                                className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-1"
                            >
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">
                                    {item.label}:
                                </Typography>
                                {item.element}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Section - Completely removed if no stats are present */}
                {statCards.length > 0 && (
                    <div className="space-y-3">
                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                            {isSeller ? "Seller stats:" : "Buyer stats:"}
                        </Typography>
                        <div
                            className={`grid grid-cols-1 ${
                                statCards.length === 1
                                    ? "sm:grid-cols-1"
                                    : statCards.length === 2
                                      ? "sm:grid-cols-2"
                                      : "sm:grid-cols-3"
                            } gap-3 transition-opacity duration-200 ${
                                isLoading ? "animate-pulse opacity-70" : ""
                            }`}
                        >
                            {statCards.map((card) => (
                                <div
                                    key={card.key}
                                    className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <card.Icon className="w-4 h-4 text-[#0B0E05A3]" />
                                        <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                            {card.label}
                                        </Typography>
                                    </div>
                                    <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">
                                        {card.value}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity Section - Completely removed if no activities are present */}
                {activities.length > 0 && (
                    <div className="space-y-3">
                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                            Recent activity
                        </Typography>
                        <div className="space-y-2.5">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3.5 bg-[#0B0E0505] rounded-[16px] px-4 py-3.5"
                                >
                                    <div className="shrink-0">
                                        <NotificationBellIcon className="w-5 h-5 text-[#518300]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <Typography type="text14" fontWeight={600} className="text-[#0B0E05] truncate">
                                            {activity.title}
                                        </Typography>
                                        {activity.timestamp && (
                                            <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3] mt-0.5">
                                                {activity.timestamp}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Suspend Button */}
                {status && status !== "suspended" && (
                    <div className="pt-2 sm:hidden">
                        <button
                            onClick={() =>
                                showModal({
                                    content: (
                                        <SuspendAccountModal
                                            onClose={closeModal}
                                            details={details}
                                        />
                                    ),
                                })
                            }
                            type="button"
                            className="w-full flex items-center justify-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] py-3 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-colors"
                        >
                            <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span className="text-[#D92D20] text-[15px] font-semibold">
                                Suspend account
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}